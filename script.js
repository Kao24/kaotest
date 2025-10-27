// Variabile globale pentru a ține evidența itemelor
const inventoryItems = document.getElementById('inventory-items');
const tradeUpButton = document.getElementById('executa-trade-up');
const selectedSlots = document.getElementById('selected-items-slots').children;
const rezultatText = document.getElementById('rezultat-text');
const animationPlaceholder = document.getElementById('animation-placeholder');

// Variabile pentru Pop-up
const rewardModal = document.getElementById('reward-modal');
const rewardItemDisplay = document.getElementById('reward-item');
const rewardNameDisplay = document.getElementById('reward-name');
const closeModalBtn = document.getElementById('close-modal-btn');

// Variabile pentru Spin
const spinButton = document.getElementById('spin-button');
const rouletteTrack = document.getElementById('roulette-track');
const itemWidth = 126; // Lățimea itemului (120px item + 6px border)

let selectedItems = []; // Array pentru ID-urile itemelor selectate
const requiredItems = 5;

// Obiect de mapare pentru a garanta că numele de fișier se potrivește
const goldResultsMap = {
    "Cutit Karambit | Doppler": "cutit_karambit_doppler.png",
    "Manusi Sport | Omega": "manusi_sport_omega.png",
    "Cutit Bayonet | Gamma Doppler": "cutit_bayonet_gamma_doppler.png",
    "Manusi Moto | Transport": "manusi_moto_transport.png",
    "Cutit M9 Bayonet | Fade": "cutit_m9_bayonet_fade.png",
    "Manusi Driver | Lunar Weave": "manusi_driver_lunar_weave.png"
};

const goldResultNames = Object.keys(goldResultsMap);

// --- 1. LOGICA DE SELECȚIE ȘI INVENTAR ---

function updateTradeUpButton() {
    tradeUpButton.disabled = selectedItems.length !== requiredItems;
}

function renderSelectedItems() {
    for (let i = 0; i < selectedSlots.length; i++) {
        const slot = selectedSlots[i];
        slot.innerHTML = '';

        if (i < selectedItems.length) {
            // Căutăm itemul după ID-ul selectat
            const originalItem = document.querySelector(`.item[data-id="${selectedItems[i]}"]`);
            if (originalItem) {
                const itemClone = originalItem.cloneNode(true);
                itemClone.classList.remove('selected');
                itemClone.classList.add('in-slot');
                
                // Eliminăm contorul din slot
                const countOverlay = itemClone.querySelector('.count-overlay');
                if (countOverlay) countOverlay.remove();
                
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

// NOU: Funcție pentru a elimina un singur item (decrementare count)
function removeItemFromInventory(itemId) {
    const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
    if (!itemElement) return;

    let count = parseInt(itemElement.dataset.count) || 1;
    
    if (count > 1) {
        // Dacă sunt mai multe, decrementăm count-ul
        count--;
        itemElement.dataset.count = count;
        itemElement.querySelector('.count-overlay').textContent = count;
        // Asigură-te că selectorul CSS actualizează vizibilitatea
    } else {
        // Dacă e ultimul, îl eliminăm din DOM
        itemElement.remove();
    }
}

function selectItem(itemElement) {
    const itemId = itemElement.dataset.id;
    
    // Verifică dacă acest ID temporar este deja în selectedItems
    if (selectedItems.includes(itemId)) {
        // Dacă itemul (tipul) este deja în slot, nu mai selectăm același element
        alert("Acest tip de item este deja selectat.");
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

// --- 2. LOGICA TRADE UP ---

function runTradeUp() {
    if (selectedItems.length !== requiredItems) return;

    tradeUpButton.disabled = true;

    // Elimină itemele folosite (prin decrementare)
    selectedItems.forEach(itemId => {
        removeItemFromInventory(itemId); // Folosim noua funcție
    });

    selectedItems = [];
    renderSelectedItems(); // Golește sloturile de selecție

    // Afișează animația
    animationPlaceholder.innerHTML = `<p id="rezultat-text" class="roll-animation">Trade Up în curs...</p>`;
    
    const finalResultName = goldResultNames[Math.floor(Math.random() * goldResultNames.length)];
    const imageName = goldResultsMap[finalResultName]; 
    
    setTimeout(() => {
        animationPlaceholder.innerHTML = ''; 
        rezultatText.textContent = 'Trade Up finalizat!';

        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Recompensă: ${finalResultName}`;
        rewardModal.style.display = 'block';

        tradeUpButton.disabled = false;
    }, 3000); 
}


// --- 3. LOGICA SPIN ---

// NOU: Funcție pentru a adăuga un item la inventar și a actualiza count-ul (STACKING)
function addItemToInventory(itemName) {
    const existingItem = inventoryItems.querySelector(`.item[data-name="${itemName}"]`);

    if (existingItem) {
        // Itemul există: mărește count-ul
        let count = parseInt(existingItem.dataset.count) || 1;
        count++;
        existingItem.dataset.count = count;
        existingItem.querySelector('.count-overlay').textContent = count;
    } else {
        // Itemul nu există: creează-l
        const uniqueId = Date.now() + Math.random(); 
        
        const itemContainer = document.createElement('div');
        itemContainer.className = `item covert`; 
        itemContainer.dataset.name = itemName;
        itemContainer.dataset.id = uniqueId; 
        itemContainer.dataset.count = 1;

        itemContainer.innerHTML = `
            <span class="item-name-overlay">${itemName}</span>
            <span class="count-overlay">1</span>
        `;
        
        // Copiază stilul de fundal
        const originalItemStyle = document.querySelector(`.item[data-name="${itemName}"]`);
        if(originalItemStyle) {
            itemContainer.style.backgroundImage = originalItemStyle.style.backgroundImage;
        }

        itemContainer.addEventListener('click', () => selectItem(itemContainer));
        inventoryItems.appendChild(itemContainer);
    }
    
    populateRoulette();
}

// Funcție pentru a crea itemele pentru ruletă
function populateRoulette() {
    rouletteTrack.innerHTML = '';
    
    // Obține toate itemele roșii disponibile în inventar (stack-uite sau nu)
    const availableItems = Array.from(inventoryItems.querySelectorAll('.item')).map(item => item.dataset.name);

    // Adaugă iteme în ruletă doar dacă inventarul nu e gol
    if (availableItems.length > 0) {
        // Repetăm lista de 3 ori (pentru o animație lină)
        for (let i = 0; i < 3; i++) {
            availableItems.forEach(itemName => {
                const originalItem = document.querySelector(`.item[data-name="${itemName}"]`);
                if (originalItem) {
                    const itemClone = originalItem.cloneNode(true);
                    itemClone.removeAttribute('data-id');
                    itemClone.classList.remove('selected');
                    // Elimină count-ul de pe clonele din ruletă
                    const countOverlay = itemClone.querySelector('.count-overlay');
                    if (countOverlay) countOverlay.remove();

                    rouletteTrack.appendChild(itemClone);
                }
            });
        }
    }
}


function runSpin() {
    // 1. Verifică costul: Consumă 1 item din inventar (tipul contează mai puțin)
    const allAvailableItems = Array.from(inventoryItems.querySelectorAll('.item'));
    if (allAvailableItems.length === 0) {
        alert("Inventarul este gol! Nu poți face Spin.");
        return;
    }

    spinButton.disabled = true; 
    tradeUpButton.disabled = true;

    // Consumă 1 item (cel din capătul listei, spre exemplu)
    const itemToConsumeId = allAvailableItems[allAvailableItems.length - 1].dataset.id;
    removeItemFromInventory(itemToConsumeId); // Folosim noua funcție de decrementare/eliminare

    // 2. Alege un item roșu random ca rezultat (din lista inițială de 50, pentru a garanta că are imagine)
    const originalCovertItems = Array.from(document.querySelectorAll('#inventory-items > .item')).map(item => item.dataset.name);
    
    const finalResultName = originalCovertItems[Math.floor(Math.random() * originalCovertItems.length)];
    const clonesPerCycle = originalCovertItems.length;

    // 3. Calculează mișcarea
    
    let targetIndex = -1;
    rouletteTrack.querySelectorAll('.item').forEach((item, index) => {
        // Găsim itemul în ultima treime a ruletei (index >= clonesPerCycle * 2)
        if (item.dataset.name === finalResultName && index >= clonesPerCycle * 2) { 
            targetIndex = index;
        }
    });

    if (targetIndex === -1) {
        targetIndex = clonesPerCycle * 2 + Math.floor(Math.random() * clonesPerCycle);
    }
    
    const randomOffset = Math.random() * (itemWidth * 0.5) - (itemWidth * 0.25); 
    const stopPosition = (targetIndex * itemWidth) - (rouletteTrack.clientWidth / 2) + (itemWidth / 2) + randomOffset;
    
    // 4. Aplică animația
    rouletteTrack.style.transition = 'none';
    rouletteTrack.style.transform = 'translateX(0)';
    
    rouletteTrack.offsetHeight; 
    
    rouletteTrack.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.5, 1)';
    rouletteTrack.style.transform = `translateX(-${stopPosition}px)`;

    // 5. La finalul animației
    setTimeout(() => {
        // Adaugă itemul câștigat în inventar
        addItemToInventory(finalResultName);

        // Afișează pop-up-ul de recompensă
        const imageName = finalResultName.toLowerCase().replace(/[^a-z0-9|]+/g, '_') + '.png'; 
        
        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Ai Câștigat: ${finalResultName}`;
        rewardModal.style.display = 'block';

        // Resetare butoane
        spinButton.disabled = false;
        tradeUpButton.disabled = false;
        
        populateRoulette(); 
    }, 5100); 
}


// Funcție pentru a închide pop-up-ul
function closeModal() {
    rewardModal.style.display = 'none';
    rewardItemDisplay.style.backgroundImage = '';
}

// --- 4. INIȚIALIZARE ȘI EVENT LISTENERS ---

closeModalBtn.addEventListener('click', closeModal); 
rewardModal.addEventListener('click', (e) => {
    if (e.target === rewardModal) {
        closeModal();
    }
});

tradeUpButton.addEventListener('click', runTradeUp);
spinButton.addEventListener('click', runSpin);


function initializeSimulator() {
    // 1. Ataşează event listeners la itemele INIȚIALE (și le pregătește pentru stacking)
    inventoryItems.querySelectorAll('.item').forEach(item => {
        const itemName = item.dataset.name;
        // Reconstruim conținutul pentru a include count-overlay inițial
        item.innerHTML = `
            <span class="item-name-overlay">${itemName}</span>
            <span class="count-overlay">1</span>
        `; 
        item.dataset.count = 1; // Setăm count-ul la 1

        const cssStyle = window.getComputedStyle(item);
        item.style.backgroundImage = cssStyle.backgroundImage;

        item.addEventListener('click', () => selectItem(item));
    });

    updateTradeUpButton();
    renderSelectedItems();
    
    // 2. Populează ruleta cu itemele roșii
    populateRoulette(); 
}

initializeSimulator();
