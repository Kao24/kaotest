// Variabile globale pentru a ține evidența itemelor
const inventoryItems = document.getElementById('inventory-items');
const tradeUpButton = document.getElementById('executa-trade-up');
const selectedSlots = document.getElementById('selected-items-slots').children;
const rezultatText = document.getElementById('rezultat-text');
const animationPlaceholder = document.getElementById('animation-placeholder');

// Variabile NOU pentru Pop-up
const rewardModal = document.getElementById('reward-modal');
const rewardItemDisplay = document.getElementById('reward-item');
const rewardNameDisplay = document.getElementById('reward-name');
const closeModalBtn = document.getElementById('close-modal-btn');

let selectedItems = []; // Array pentru itemele din zona de trade-up
const requiredItems = 5;

// NOU: Obiect de mapare pentru a garanta că numele de fișier se potrivește
const goldResultsMap = {
    "Cutit Karambit | Doppler": "cutit_karambit_doppler.png",
    "Manusi Sport | Omega": "manusi_sport_omega.png",
    "Cutit Bayonet | Gamma Doppler": "cutit_bayonet_gamma_doppler.png",
    "Manusi Moto | Transport": "manusi_moto_transport.png",
    "Cutit M9 Bayonet | Fade": "cutit_m9_bayonet_fade.png",
    "Manusi Driver | Lunar Weave": "manusi_driver_lunar_weave.png"
};

// Array de chei pentru a alege un rezultat aleatoriu
const goldResultNames = Object.keys(goldResultsMap);

// --- 1. LOGICA DE SELECTARE A ITEMELOR (Rămâne neschimbată) ---

// Funcție pentru a actualiza starea butonului de Trade Up
function updateTradeUpButton() {
    tradeUpButton.disabled = selectedItems.length !== requiredItems;
}

// Funcție pentru a afișa itemele în sloturile de Trade Up
function renderSelectedItems() {
    for (let i = 0; i < selectedSlots.length; i++) {
        const slot = selectedSlots[i];
        slot.innerHTML = ''; 

        if (i < selectedItems.length) {
            const originalItem = document.querySelector(`.item[data-id="${selectedItems[i]}"]`);
            if (originalItem) {
                const itemClone = originalItem.cloneNode(true);
                itemClone.classList.remove('selected');
                itemClone.classList.add('in-slot');
                
                itemClone.onclick = () => deselectItem(selectedItems[i]); 
                
                const nameOverlay = itemClone.querySelector('.item-name-overlay');
                if(nameOverlay) {
                    nameOverlay.style.opacity = '1'; 
                    nameOverlay.style.fontSize = '12px';
                    nameOverlay.style.pointerEvents = 'auto'; 
                }

                slot.appendChild(itemClone);
            }
        } else {
            slot.classList.add('empty-slot');
        }
    }
}

// Funcție apelată la click pe un item din inventar
function selectItem(itemElement) {
    const itemId = itemElement.dataset.id;
    
    if (itemElement.classList.contains('selected')) {
        deselectItem(itemId);
        return;
    }

    if (selectedItems.length < requiredItems) {
        selectedItems.push(itemId);
        itemElement.classList.add('selected');
        itemElement.style.opacity = '0.5';
        renderSelectedItems();
        updateTradeUpButton();
    } else {
        alert("Ai selectat deja 5 iteme. Apasă Trade Up sau deselectează un item.");
    }
}

// Funcție apelată la deselectarea unui item
function deselectItem(itemId) {
    selectedItems = selectedItems.filter(id => id !== itemId);
    
    const originalItem = document.querySelector(`.item[data-id="${itemId}"]`);
    if (originalItem) {
        originalItem.classList.remove('selected');
        originalItem.style.opacity = '1';
    }
    
    renderSelectedItems();
    updateTradeUpButton();
}


// --- 2. LOGICA DE TRADE UP ȘI ANIMAȚIE (ACTUALIZATĂ) ---

function runTradeUp() {
    if (selectedItems.length !== requiredItems) return;

    tradeUpButton.disabled = true;

    // 1. Elimină itemele folosite
    selectedItems.forEach(itemId => {
        const item = document.querySelector(`.item[data-id="${itemId}"]`);
        if (item) {
            item.remove();
        }
    });

    // 2. Golește sloturile și array-ul
    selectedItems = [];
    renderSelectedItems();

    // 3. Afișează animația
    animationPlaceholder.innerHTML = `<p id="rezultat-text" class="roll-animation">Trade Up în curs...</p>`;
    rezultatText.textContent = "Trade Up în curs...";
    
    // NOU: Alege un nume de rezultat din chei
    const finalResultName = goldResultNames[Math.floor(Math.random() * goldResultNames.length)];
    
    // NOU: Ia numele fișierului garantat din mapare
    const imageName = goldResultsMap[finalResultName]; 
    
    // Setează un timeout pentru a simula durata animației
    setTimeout(() => {
        // 4. Afișează rezultatul în pop-up
        
        animationPlaceholder.innerHTML = ''; 
        rezultatText.textContent = 'Trade Up finalizat!';

        // Setează imaginea și numele în pop-up
        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Recompensă: ${finalResultName}`;

        // Deschide pop-up-ul
        rewardModal.style.display = 'block';

        tradeUpButton.disabled = false;
    }, 3000); // 3 secunde pentru animație
}

// Funcție pentru a închide pop-up-ul
function closeModal() {
    rewardModal.style.display = 'none';
    rewardItemDisplay.style.backgroundImage = '';
}

// --- 3. INIȚIALIZARE ȘI EVENT LISTENERS ---

// Adaugă event listeners la butonul de Trade Up și la pop-up
tradeUpButton.addEventListener('click', runTradeUp);
closeModalBtn.addEventListener('click', closeModal); 
// Permite închiderea la click pe fundalul întunecat
rewardModal.addEventListener('click', (e) => {
    if (e.target === rewardModal) {
        closeModal();
    }
});

function initializeSimulator() {
    // Adaugă event listener la toate itemele din inventar
    inventoryItems.querySelectorAll('.item').forEach(item => {
        
        // RE-ADĂUGĂM NUMELE ÎN HTML PENTRU A MENȚINE ZONA DE CLICK ACTIVĂ
        const itemName = item.dataset.name;
        item.innerHTML = `<span class="item-name-overlay">${itemName}</span>`; 

        // Adaugă event listener
        item.addEventListener('click', () => selectItem(item));
    });

    updateTradeUpButton();
    renderSelectedItems();
}

initializeSimulator();
