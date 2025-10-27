// Variabile globale pentru a ține evidența itemelor
const inventoryItems = document.getElementById('inventory-items');
const tradeUpButton = document.getElementById('executa-trade-up');
const selectedSlots = document.getElementById('selected-items-slots').children;
const rezultatText = document.getElementById('rezultat-text');
const animationPlaceholder = document.getElementById('animation-placeholder');

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
                itemClone.onclick = () => deselectItem(selectedItems[i]); // Adaugă funcția de deselectare
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


// --- 2. LOGICA DE TRADE UP ȘI ANIMAȚIE ---

// Funcție pentru a rula animația și a afișa rezultatul
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

    // 2. Golește sloturile de selecție și array-ul
    selectedItems = [];
    renderSelectedItems();

    // 3. Afișează animația de rulare (text simplu, dar stilizat)
    animationPlaceholder.innerHTML = `<p id="rezultat-text" class="roll-animation">Trade Up în curs...</p>`;
    rezultatText.textContent = "Trade Up în curs...";
    
    // Alege un rezultat aleatoriu garantat (100% Cutit/Manusa)
    const finalResult = goldResults[Math.floor(Math.random() * goldResults.length)];

    // Setează un timeout pentru a simula durata animației
    setTimeout(() => {
        // 4. Afișează rezultatul final
        animationPlaceholder.innerHTML = `
            <div class="gold-result">
                🎉 **FELICITĂRI!** 🎉
                <p>Ai primit:</p>
                <p><strong>${finalResult}</strong></p>
                <p>Simulare 100% succes!</p>
            </div>
        `;
        tradeUpButton.disabled = false; // Permite un nou Trade Up
    }, 3000); // 3 secunde pentru animație
}

// Adaugă event listener la butonul de Trade Up
tradeUpButton.addEventListener('click', runTradeUp);

// --- INIȚIALIZARE LA ÎNCĂRCAREA PAGINII (MODIFICAT) ---

function initializeSimulator() {
    // Adaugă event listener și afișează numele itemului pe fiecare cutie
    inventoryItems.querySelectorAll('.item').forEach(item => {
        // Obține numele itemului din atributul data-name
        const itemName = item.dataset.name;
        // Adaugă numele skin-ului în interiorul div-ului item
        item.innerHTML = `<span>${itemName}</span>`; 
        
        // Adaugă event listener
        item.addEventListener('click', () => selectItem(item));
    });

    updateTradeUpButton();
    renderSelectedItems();
}

initializeSimulator(); // Apelez noua funcție de inițializare