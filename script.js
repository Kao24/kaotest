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

// NOU: Variabile pentru Spin
const spinButton = document.getElementById('spin-button');
const rouletteTrack = document.getElementById('roulette-track');
const itemWidth = 126; // Lățimea itemului (120px item + 6px border)
const totalItemsInView = 50; // Numărul de iteme unice în inventarul inițial

let selectedItems = []; // Array pentru itemele din zona de trade-up
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

// Array de chei pentru a alege un rezultat aleatoriu
const goldResultNames = Object.keys(goldResultsMap);

// --- 1. LOGICA DE SELECTARE ȘI INVENTAR ---

function updateTradeUpButton() {
    tradeUpButton.disabled = selectedItems.length !== requiredItems;
}

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
                
                // Atribuie funcția de deselectare clonei în slot
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


// --- 2. LOGICA TRADE UP (EXISTENTĂ) ---

function runTradeUp() {
    if (selectedItems.length !== requiredItems) return;

    tradeUpButton.disabled = true;

    // Elimină itemele folosite din DOM și din inventarul virtual
    selectedItems.forEach(itemId => {
        const item = document.querySelector(`.item[data-id="${itemId}"]`);
        if (item) {
            item.remove();
        }
    });

    selectedItems = [];
    renderSelectedItems();

    // Afișează animația
    animationPlaceholder.innerHTML = `<p id="rezultat-text" class="roll-animation">Trade Up în curs...</p>`;
    
    // Alege rezultatul și numele fișierului
    const finalResultName = goldResultNames[Math.floor(Math.random() * goldResultNames.length)];
    const imageName = goldResultsMap[finalResultName]; 
    
    setTimeout(() => {
        animationPlaceholder.innerHTML = ''; 
        rezultatText.textContent = 'Trade Up finalizat!';

        // Setează imaginea și numele în pop-up
        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Recompensă: ${finalResultName}`;
        rewardModal.style.display = 'block';

        tradeUpButton.disabled = false;
    }, 3000); 
}


// --- 3. LOGICA SPIN (NOU) ---

// Funcție pentru a adăuga un item la inventar
function addItemToInventory(itemName) {
    // Creează un ID unic pentru noul item (folosind timestamp)
    const uniqueId = Date.now() + Math.random(); 
    
    const itemContainer = document.createElement('div');
    itemContainer.className = `item covert`; 
    itemContainer.dataset.name = itemName;
    itemContainer.dataset.id = uniqueId; 

    // Reconstruiește structura internă și stilul de fundal
    itemContainer.innerHTML = `<span class="item-name-overlay">${itemName}</span>`;
    
    // Aplică stilul de fundal din CSS (similar cu initializeSimulator)
    // Căutăm item-ul original (pentru a-i prelua stilul)
    const originalItem = document.querySelector(`.item[data-name="${itemName}"]`);
    if(originalItem) {
        // Copiem background-image de pe item-ul original
        itemContainer.style.backgroundImage = originalItem.style.backgroundImage;
    }

    // Adaugă funcția de selectare
    itemContainer.addEventListener('click', () => selectItem(itemContainer));

    inventoryItems.appendChild(itemContainer);

    // Nu e necesară re-inițializarea completă, doar asigură-te că funcțiile sunt atașate
    // Și că se aplică stilurile din CSS care folosesc [data-name*="..."]
}

// Funcție pentru a crea itemele pentru ruletă
function populateRoulette() {
    // Golește track-ul înainte de a adăuga noi iteme
    rouletteTrack.innerHTML = '';
    
    // Ia toate itemele din inventarul INIȚIAL (din HTML)
    const originalItems = document.querySelectorAll('#inventory-items > .item');
    
    // Repetăm lista de 3 ori pentru a asigura o tranziție lină
    for (let i = 0; i < 3; i++) {
        originalItems.forEach(item => {
            const itemClone = item.cloneNode(true);
            // Ștergem ID-ul pentru a nu intra în conflict cu funcția de selecție
            itemClone.removeAttribute('data-id');
            itemClone.classList.remove('selected');
            rouletteTrack.appendChild(itemClone);
        });
    }
}


function runSpin() {
    // 1. Verifică costul: Începem cu 1 item
    if (inventoryItems.childElementCount <= 0) {
        alert("Inventarul este gol! Nu poți face Spin.");
        return;
    }
    
    // Ia un item de la finalul inventarului și îl elimină
    const itemsArray = Array.from(inventoryItems.querySelectorAll('.item'));
    const itemToConsume = itemsArray[itemsArray.length - 1]; 
    const itemToConsumeName = itemToConsume.dataset.name;
    
    itemToConsume.remove(); // Consumă 1 item
    
    
    spinButton.disabled = true; 
    tradeUpButton.disabled = true;

    // 2. Alege un item roșu random ca rezultat (din inventarul original)
    const originalCovertItems = Array.from(document.querySelectorAll('#inventory-items > .item')).map(item => item.dataset.name);
    
    // Rezultatul este un item din lista originală, pe care îl vom adăuga înapoi
    const finalResultName = originalCovertItems[Math.floor(Math.random() * originalCovertItems.length)];
    
    const clonesPerCycle = originalCovertItems.length;

    // 3. Calculează mișcarea
    
    // Găsește indexul itemului ales în ultima treime a ruletei
    let targetIndex = -1;
    rouletteTrack.querySelectorAll('.item').forEach((item, index) => {
        if (item.dataset.name === finalResultName && index >= clonesPerCycle * 2) { 
            targetIndex = index;
        }
    });

    if (targetIndex === -1) {
        // Recalculăm mișcarea dacă nu găsim itemul (nu ar trebui să se întâmple)
        targetIndex = clonesPerCycle * 2 + Math.floor(Math.random() * clonesPerCycle);
    }
    
    // Calculăm poziția finală la care markerul se aliniază cu itemul ales
    const randomOffset = Math.random() * (itemWidth * 0.5) - (itemWidth * 0.25); // Offset mic
    const stopPosition = (targetIndex * itemWidth) - (rouletteTrack.clientWidth / 2) + (itemWidth / 2) + randomOffset;
    
    // 4. Aplică animația
    rouletteTrack.style.transition = 'none';
    rouletteTrack.style.transform = 'translateX(0)';
    
    rouletteTrack.offsetHeight; // Forțează reflow-ul
    
    rouletteTrack.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.5, 1)';
    rouletteTrack.style.transform = `translateX(-${stopPosition}px)`;

    // 5. La finalul animației (5 secunde)
    setTimeout(() => {
        // Adaugă itemul câștigat în inventar (cu un ID unic)
        addItemToInventory(finalResultName);

        // Afișează pop-up-ul de recompensă
        const imageName = finalResultName.toLowerCase().replace(/[^a-z0-9|]+/g, '_') + '.png'; // Folosim aceeași logică de imagine ca la inventar
        
        rewardItemDisplay.style.backgroundImage = `url('${imageName}')`;
        rewardNameDisplay.textContent = `Ai Câștigat: ${finalResultName}`;
        rewardModal.style.display = 'block';

        // Resetare butoane
        spinButton.disabled = false;
        tradeUpButton.disabled = false;
        
        // Asigură-te că ruleta este gata pentru următorul spin
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

// Adaugă event listener la butonul de Trade Up și Spin
tradeUpButton.addEventListener('click', runTradeUp);
spinButton.addEventListener('click', runSpin);


function initializeSimulator() {
    // 1. Ataşează event listeners la itemele INIȚIALE
    inventoryItems.querySelectorAll('.item').forEach(item => {
        const itemName = item.dataset.name;
        item.innerHTML = `<span class="item-name-overlay">${itemName}</span>`; 

        // Aplică stilul de fundal direct pentru ca addItemToInventory să poată copia
        // Asta rezolvă problema ca itemele noi să nu aibă imagine
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
