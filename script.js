// Initialize EmailJS
emailjs.init("A_1HTz8Jl59--CiyL"); // You need to get this from EmailJS dashboard

// Gift data with images
const gifts = [
    {
        id: 1,
        name: "Cuisinart 50th Anniversary Food Processor",
        link: "https://www.cuisinart.ca/en/50th-anniversary-edition---custom-14-14-cup-food-processor/DFP-14SENYC.html",
        image: "assets/1.png",
        available: true
    },
    {
        id: 2,
        name: "Le Creuset Round Dutch Oven - Flamme Doree",
        link: "https://www.lecreuset.ca/en_CA/round-dutch-oven/CA-21177.html",
        image: "assets/2.png",
        available: true
    },
    {
        id: 3,
        name: "Caraway Cookware Set - Cream & Gold",
        link: "https://www.crateandbarrel.ca/caraway-home-cream-12-piece-ceramic-non-stick-cookware-set-with-gold-hardware/s401207",
        image: "assets/3.png",
        available: true
    },
    {
        id: 4,
        name: "Bath Towel - Ivory",
        link: "https://www.crateandbarrel.ca/organic-turkish-cotton-ivory-bath-towel/s586851",
        image: "assets/4.png",
        available: true
    },
    {
        id: 5,
        name: "Cuisinart 15-piece Cutlery Set",
        link: "https://www.crateandbarrel.ca/cuisinart-15-piece-stainless-steel-hollow-handle-cutlery-block-set-with-acacia-block/s638758",
        image: "assets/5.png",
        available: true
    },
    {
        id: 6,
        name: "AISIPRIN 24 Pcs Glass Spice Jars - Square",
        link: "https://a.co/d/87JuGhF",
        image: "assets/6.png",
        available: true
    },
    {
        id: 7,
        name: "Diptyque Feu de Bois Candle",
        link: "https://www.diptyqueparis.com/en_us/p/home-fragrances/scented-candles/colored-scented-candles/feu-de-bois-wood-fire-candle-300g.html",
        image: "assets/7.png",
        available: true
    },
    {
        id: 8,
        name: "Aesop - Resurrection Hand Purifying Duet",
        link: "https://www.aesop.ca/en/hand-and-body/hand-and-body-care-kits/resurrection-hand-purifying-duet/AEOAPB256.html",
        image: "assets/8.png",
        available: true
    },
    {
        id: 9,
        name: "OUAI Hand Wash",
        link: "https://a.co/d/4Lp0JmP",
        image: "assets/9.png",
        available: true
    },
    {
        id: 10,
        name: "Breville Juicer - Silver",
        link: "https://a.co/d/hqqDzVh",
        image: "assets/10.png",
        available: true
    },
    {
        id: 11,
        name: "WORHE Marble Coaster - Beige",
        link: "https://a.co/d/45VK50r",
        image: "assets/11.png",
        available: true
    },
    {
        id: 12,
        name: "The Key Three Jumbo Canister Set",
        link: "https://www.thebreakfastpantry.com/products/the-breakfast-pantry-key-three-jumbo-canister-set-with-acacia-wood-lids?utm_medium=paid&utm_id=120223270172860766&utm_content=120228346663620766&utm_term=120226353523040766&utm_campaign=120223270172860766&utm_source=facebook",
        image: "assets/12.png",
        available: true
    }
];

let currentUser = null;
let selectedGift = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadRegistryData();
    
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

// Load registry data from localStorage
async function loadRegistryData() {
    try {
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
    
    // Save to registry
    const registryEntry = {
        giftId: selectedGift.id,
        giftName: giftName,
        giftLink: selectedGift.link,
        claimedBy: currentUser.name,
        claimedByEmail: currentUser.email,
        claimedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    let registryData = JSON.parse(localStorage.getItem('registryData') || '{"claimed":[]}');
    registryData.claimed.push(registryEntry);
    localStorage.setItem('registryData', JSON.stringify(registryData));
    
    // Send email notifications
    await sendEmailNotifications(registryEntry);
    
    // Update UI
    if (!selectedGift.isCustom) {
        selectedGift.available = false;
    }
    
    // Clear custom input
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
    if (password === "anna2024") { // Change this password!
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
