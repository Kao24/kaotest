// Variabile globale pentru a ține evidența itemelor
const inventoryItems = document.getElementById('inventory-items');
const tradeUpButton = document.getElementById('executa-trade-up');
const selectedSlots = document.getElementById('selected-items-slots').children;
const rezultatText = document.getElementById('rezultat-text');
const animationPlaceholder = document.getElementById('animation-placeholder');

// Variabile NOU pentru Pop-up (ASIGURĂ-TE CĂ SUNT LA ÎNCEPUTUL FIȘIERULUI!)
const rewardModal = document.getElementById('reward-modal');
const rewardItemDisplay = document.getElementById('reward-item');
const rewardNameDisplay = document.getElementById('reward-name');
const closeModalBtn = document.getElementById('close-modal-btn');

let selectedItems = []; // Array pentru itemele din zona de trade-up
const requiredItems = 5;

// Lista de rezultate GALBENE (Cutite/Manusi) pentru simularea 100%
const goldResults = [
    "Cutit Karambit | Doppler", "Manusi Sport | Omega", "Cutit Bayonet | Gamma Doppler",
    "Manusi Moto | Transport", "Cutit M9 Bayonet | Fade", "Manusi Driver | Lunar Weave"
];

// --- 1. LOGICA DE SELECTARE A ITEMELOR ---

// Funcție pentru a actualiza starea butonului de Trade Up
function updateTradeUpButton() {
    tradeUpButton.disabled = selectedItems.length !== requiredItems;
}

// Funcție pentru a afișa itemele în sloturile de Trade Up
function renderSelectedItems() {
    for (let i = 0; i < selectedSlots.length; i++) {
        const slot = selectedSlots[i];
        slot.innerHTML = ''; // Golește slotul

        if (i < selectedItems.length) {
            // Dacă există un item selectat, copiază elementul și stilurile
            const originalItem = document.querySelector(`.item[data-id="${selectedItems[i]}"]`);
            if (originalItem) {
                const itemClone = originalItem.cloneNode(true);
                itemClone.classList.remove('selected'); // Nu vrem clasa de selecție pe clonă
                itemClone.classList.add('in-slot'); // Clasă pentru stilizare specifică slotului
                
                // Păstrăm funcția de deselectare pe clonă
                itemClone.onclick = () => deselectItem(selectedItems[i]); 
                
                // Asigurăm că imaginea se vede pe clonă
                const nameOverlay = itemClone.querySelector('.item-name-overlay');
                if(nameOverlay) {
                    // În slot, facem numele vizibil ca text de control
                    nameOverlay.style.opacity = '1'; 
                    nameOverlay.style.fontSize = '12px';
                    nameOverlay.style.pointerEvents = 'auto'; 
                }

                slot.appendChild(itemClone);
            }
        } else {
            // Slot gol
            slot.classList.add('empty-slot');
        }
    }
}

// Funcție apelată la click pe un item din inventar
function selectItem(itemElement) {
    const itemId = itemElement.dataset.id;
    
    // Verifică dacă itemul e deja selectat SAU dacă s-a atins limita
    if (itemElement.classList.contains('selected')) {
        deselectItem(itemId);
        return;
    }

    if (selectedItems.length < requiredItems) {
        selectedItems.push(itemId);
        itemElement.classList.add('selected');
        itemElement.style.opacity = '0.5'; // Estompează itemul selectat din inventar
        renderSelectedItems();
        updateTradeUpButton();
    } else {
        alert("Ai selectat deja 5 iteme. Apasă Trade Up sau deselectează un item.");
    }
}

// Funcție apelată la deselectarea unui item
function deselectItem(itemId) {
    // Scoate itemul din array-ul de selectate
    selectedItems = selectedItems.filter(id => id !== itemId);
    
    // Elimină stilurile de selecție de pe itemul original din inventar
    const originalItem = document.querySelector(`.item[data-id="${itemId}"]`);
    if (originalItem) {
        originalItem.classList.remove('selected');
        originalItem.style.opacity = '1';
    }
    
    renderSelectedItems();
    updateTradeUpButton();
}


// --- 2. LOGICA DE TRADE UP ȘI ANIMAȚIE (NOU PENTRU POP-UP) ---

// Funcție pentru a rula Trade Up-ul și a afișa recompensa
function runTradeUp() {
    if (selectedItems.length !== requiredItems) return;

    tradeUpButton.disabled = true;

    // 1. Elimină itemele folosite din DOM și din inventarul virtual
    selectedItems.forEach(itemId => {
        const item = document.querySelector(`.item[data-id="${itemId}"]`);
        if (item) {
            item.remove();
        }
    });

    // 2. Golește sloturile și array-ul
    selectedItems = [];
    renderSelectedItems();

    // 3. Afișează animația de rulare (text simplu, dar stilizat)
    animationPlaceholder.innerHTML = `<p id="rezultat-text" class="roll-animation">Trade Up în curs...</p>`;
    rezultatText.textContent = "Trade Up în curs...";
    
    // Alege un rezultat aleatoriu garantat (100% Cutit/Manusa)
    const finalResult = goldResults[Math.floor(Math.random() * goldResults.length)];
    
    // Creează numele fișierului imagine (înlocuiește spațiile/barele cu underscore și trece la litere mici)
    const imageName = finalResult.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.png';
    
    // Setează un timeout pentru a simula durata animației
    setTimeout(() => {
        // 4. Afișează rezultatul în pop-up
        
        // Curățăm vechiul rezultat de animație
        animationPlaceholder.innerHTML = ''; 
        rezultatText.textContent = 'Trade Up finalizat!';

        // Setează imaginea și numele în pop-up
        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Recompensă: ${finalResult}`;

        // Deschide pop-up-ul
        rewardModal.style.display = 'block';

        tradeUpButton.disabled = false; // Permite un nou Trade Up
    }, 3000); // 3 secunde pentru animație
}

// Funcție pentru a închide pop-up-ul
function closeModal() {
    rewardModal.style.display = 'none';
    // Opțional: resetează stilul imaginii (nu este strict necesar, dar e curat)
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
