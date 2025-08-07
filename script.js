// Initialize EmailJS
emailjs.init("A_1HTz8Jl59--CiyL"); // You need to get this from EmailJS dashboard

// Gift data with images
let gifts = [];

// Firestore DB (compat API)
const db = firebase.firestore();
const giftsCollection = db.collection('gifts'); // your collection that has docs "1", "2", ... "12"


let currentUser = null;
let selectedGift = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    //loadRegistryData();
    // Real-time sync: when Firestore gifts change, update availability live
    try {
        // Build the gifts array DIRECTLY from Firestore on every change
        giftsCollection.onSnapshot((snapshot) => {
            gifts = snapshot.docs
                .map((doc) => {
                    const data = doc.data() || {};
                    const id = (data.id !== undefined) ? data.id : Number(doc.id);
                    const claimed = data.claimed === true;
                    // available unless explicitly unavailable or claimed
                    const available = !(claimed || data.available === false);

                    return {
                        id,
                        name: data.name || "",
                        link: data.link || "#",
                        image: data.image || "",
                        available,
                        isCustom: !!data.isCustom
                    };
                })
                .sort((a, b) => (a.id || 0) - (b.id || 0));

            // Only re-render after the user enters
            if (document.getElementById('mainContent').style.display === 'block') {
                displayGifts();
            }
        });
    } catch (e) {
        console.warn('Realtime listener error:', e);
    }

    
    // Handle guest form submission
    document.getElementById('guestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        
        currentUser = { name, email };
        document.getElementById('welcomeModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `Please select the gift option you would like to bring to the bridal shower on September 27th, 2025 @ 1pm. `;
        document.getElementById('welcomeMessage2').textContent = `However, if you wish to help us celebrate with a different gift, a monetary contribution towards our home will be warmly received. `;
        
        displayGifts();
    });
});

// Load registry data from Firestore, fallback to localStorage
async function loadRegistryData() {
    try {
        // 1) Start with all gifts available
        gifts.forEach(g => { if (!g.isCustom) g.available = true; });

        // 2) Pull claimed/available from Firestore 'gifts' collection
        const snap = await giftsCollection.get();
        snap.forEach(doc => {
            const data = doc.data() || {};
            const idFromDoc = data.id ?? Number(doc.id);
            const gift = gifts.find(g => g.id === idFromDoc);
            if (gift) {
                // If doc has claimed=true → hide it. If not present, fall back to "available" field or default true.
                const claimed = data.claimed === true;
                const available = data.hasOwnProperty('claimed') ? !claimed : (data.available !== false);
                gift.available = available;

                // Optional: keep meta (name/link/image) in sync with Firestore if you want
                if (data.name)  gift.name  = data.name;
                if (data.link)  gift.link  = data.link;
                if (data.image) gift.image = data.image;
            }
        });

        // 3) Fallback: also apply any localStorage claims (keeps backward-compat)
        const savedData = localStorage.getItem('registryData');
        if (savedData) {
            const data = JSON.parse(savedData);
            data.claimed.forEach(claim => {
                const gift = gifts.find(g => g.id === claim.giftId);
                if (gift && !gift.isCustom) gift.available = false;
            });
        }
    } catch (error) {
        console.error('Error loading registry data:', error);
    }
}


// Display gifts
function displayGifts() {
    const giftList = document.getElementById('giftList');
    giftList.innerHTML = '';
    
    gifts.filter(gift => gift.available || gift.isCustom).forEach(gift => {
        const giftElement = document.createElement('div');
        giftElement.className = gift.isCustom ? 'gift-item custom-gift' : 'gift-item';
        giftElement.innerHTML = `
            <div class="checkbox" id="checkbox-${gift.id}"></div>
            <img src="${gift.image}" alt="${gift.name}" class="gift-image">
            <h3>${gift.name}</h3>
            ${gift.link !== '#' ? `<a href="${gift.link}" target="_blank" class="gift-link">View Item Details →</a>` : ''}
        `;
        
        giftElement.addEventListener('click', function(e) {
            if (!e.target.classList.contains('gift-link')) {
                selectGift(gift);
            }
        });
        
        giftList.appendChild(giftElement);
    });
}

// Select gift
function selectGift(gift) {
    // If clicking the same gift, deselect it
    if (selectedGift && selectedGift.id === gift.id) {
        // Deselect
        document.querySelectorAll('.gift-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.checkbox').forEach(cb => {
            cb.classList.remove('checked');
        });
        
        selectedGift = null;
        document.getElementById('confirmSection').style.display = 'none';
        document.getElementById('customGiftSection').style.display = 'none';
        return;
    }
    
    // Clear previous selections
    document.querySelectorAll('.gift-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.checkbox').forEach(cb => {
        cb.classList.remove('checked');
    });
    
    // Select current gift
    selectedGift = gift;
    const giftElement = document.querySelector(`#checkbox-${gift.id}`).parentElement;
    giftElement.classList.add('selected');
    document.querySelector(`#checkbox-${gift.id}`).classList.add('checked');
    
    // Show/hide custom gift input
    if (gift.isCustom) {
        document.getElementById('customGiftSection').style.display = 'block';
        document.getElementById('customGiftInput').focus();
    } else {
        document.getElementById('customGiftSection').style.display = 'none';
    }
    
    // Show confirm button
    document.getElementById('confirmSection').style.display = 'block';
    
    // Scroll to confirm button
    document.getElementById('confirmSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show warning modal
function showWarning() {
    if (!selectedGift) return;
    
    // If custom gift, check if input has value
    if (selectedGift.isCustom) {
        const customInput = document.getElementById('customGiftInput').value.trim();
        if (!customInput) {
            alert('Please describe your custom gift idea!');
            document.getElementById('customGiftInput').focus();
            return;
        }
    }
    
    document.getElementById('warningModal').style.display = 'flex';
}

// Cancel warning
function cancelWarning() {
    document.getElementById('warningModal').style.display = 'none';
}

// Confirm gift selection
// Confirm gift selection
async function confirmGift() {
    if (!selectedGift || !currentUser) return;
    
    // Get custom gift description if applicable
    let giftName = selectedGift.name;
    if (selectedGift.isCustom) {
        const customDescription = document.getElementById('customGiftInput').value.trim();
        giftName = `Custom Gift: ${customDescription}`;
    }
    
    // Hide warning modal
    document.getElementById('warningModal').style.display = 'none';
    
    // Save to registry object
    const registryEntry = {
        giftId: selectedGift.id,
        giftName: giftName,
        giftLink: selectedGift.link,
        claimedBy: currentUser.name,
        claimedByEmail: currentUser.email,
        claimedAt: new Date().toISOString()
    };

    // 1) Write to Firestore (source of truth)
    try {
        await giftsCollection.doc(String(selectedGift.id)).set({
            id: selectedGift.id,
            name: selectedGift.name,
            link: selectedGift.link,
            image: selectedGift.image,
            claimed: true,
            claimedBy: currentUser.name,
            claimedByEmail: currentUser.email,
            claimedAt: registryEntry.claimedAt,
            available: false
        }, { merge: true });
    } catch (err) {
        console.error('Firestore write failed:', err);
        alert('There was an issue saving your selection. Please try again.');
        return;
    }

    // 2) Also keep your localStorage behavior (unchanged)
    let registryData = JSON.parse(localStorage.getItem('registryData') || '{"claimed":[]}');
    registryData.claimed.push(registryEntry);
    localStorage.setItem('registryData', JSON.stringify(registryData));
    
    // 3) Send email notifications (your original function call)
    await sendEmailNotifications(registryEntry);
    
    // 4) Update UI exactly as before
    if (!selectedGift.isCustom) {
        selectedGift.available = false;
    }
    document.getElementById('customGiftInput').value = '';
    document.getElementById('confirmSection').style.display = 'none';
    document.getElementById('customGiftSection').style.display = 'none';
    displayGifts();
    
    alert(`Thank you! You have successfully selected "${giftName}". A confirmation email will be sent to ${currentUser.email}.`);
    selectedGift = null;
}


// Send email notifications
async function sendEmailNotifications(registryEntry) {
    try {
        // Send notification to Anna (bride)
        await emailjs.send("service_kcjagl8", "template_q7wztlk", {
            user_name: registryEntry.claimedBy,
            user_email: registryEntry.claimedByEmail,
            gift_name: registryEntry.giftName,
            gift_link: registryEntry.giftLink
        });
        
        // Send confirmation to guest
        await emailjs.send("service_kcjagl8", "template_pozvmrk", {
            user_name: registryEntry.claimedBy,
            user_email: registryEntry.claimedByEmail,
            gift_name: registryEntry.giftName,
            gift_link: registryEntry.giftLink
        });
        
        console.log("Emails sent successfully!");
    } catch (error) {
        console.error("Email error:", error);
        alert("Gift selected successfully, but there was an issue sending the confirmation email. Please contact Anna directly.");
    }
}

// Admin functions
function showAdminPrompt() {
    const password = prompt("Enter admin password:");
    if (password === "anna2024") {
        showAdminPanel();
    } else if (password) {
        alert("Incorrect password");
    }
}

function showAdminPanel() {
    const registryData = JSON.parse(localStorage.getItem('registryData') || '{"claimed":[]}');
    
    let adminHTML = '<h2>Admin Panel - Claimed Gifts</h2>';
    adminHTML += '<div style="max-height: 400px; overflow-y: auto;">';
    
    if (registryData.claimed.length === 0) {
        adminHTML += '<p>No gifts claimed yet.</p>';
    } else {
        registryData.claimed.forEach((claim, index) => {
            const gift = gifts.find(g => g.id === claim.giftId);
            adminHTML += `
                <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <strong>${claim.giftName}</strong><br>
                    Claimed by: ${claim.claimedBy} (${claim.claimedByEmail})<br>
                    Date: ${new Date(claim.claimedAt).toLocaleString()}<br>
                    ${!gift?.isCustom ? `<button onclick="removeClaimedGift(${index}, ${claim.giftId})" style="margin-top: 5px; background: #ff6b6b;">Remove Claim</button>` : ''}
                </div>
            `;
        });
    }
    
    adminHTML += '</div>';
    adminHTML += '<button onclick="closeAdminPanel()" style="margin-top: 10px;">Close</button>';
    
    // Create admin modal
    const adminModal = document.createElement('div');
    adminModal.id = 'adminModal';
    adminModal.className = 'modal';
    adminModal.style.display = 'flex';
    adminModal.innerHTML = `<div class="modal-content">${adminHTML}</div>`;
    document.body.appendChild(adminModal);
}

function removeClaimedGift(claimIndex, giftId) {
    if (confirm("Are you sure you want to make this gift available again?")) {
        // Update registry data
        let registryData = JSON.parse(localStorage.getItem('registryData') || '{"claimed":[]}');
        registryData.claimed.splice(claimIndex, 1);
        localStorage.setItem('registryData', JSON.stringify(registryData));
        
        // Make gift available again
        const gift = gifts.find(g => g.id === giftId);
        if (gift) {
            gift.available = true;
        }
        
        // Refresh admin panel and main display
        closeAdminPanel();
        showAdminPanel();
        displayGifts();
    }
}

function closeAdminPanel() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.remove();
    }
}

