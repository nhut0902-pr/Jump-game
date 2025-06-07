document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    //  1. ĐỊNH NGHĨA DỮ LIỆU GAME (DATA-DRIVEN DESIGN)
    // =================================================================
    const MAPS = [
        { id: 0, name: 'Thành Phố', unlockLevel: 1, theme: 'map-city', speed: 3.0, spawnRate: 1200 },
        { id: 1, name: 'Rừng Rậm', unlockLevel: 2, theme: 'map-forest', speed: 2.8, spawnRate: 1100 },
        { id: 2, name: 'Sa Mạc', unlockLevel: 4, theme: 'map-desert', speed: 2.6, spawnRate: 1000 },
        { id: 3, name: 'Miền Băng Giá', unlockLevel: 6, theme: 'map-ice', speed: 2.5, spawnRate: 950 },
    ];

    const CHARACTERS = {
        'ninja': { name: 'Ninja', cost: 0, description: 'Nhân vật mặc định, không có kỹ năng đặc biệt.' },
        'explorer': { name: 'Nhà Thám Hiểm', cost: 1000, description: 'Tăng 10% số vàng nhặt được trong mỗi lượt chạy.' },
    };

    const ITEMS = {
        'revive': { name: 'Hồi Sinh', baseCost: 250, description: 'Sử dụng để tiếp tục chạy sau khi vấp ngã. (Chưa có chức năng)' },
        'shield': { name: 'Khiên', baseCost: 400, description: 'Bảo vệ bạn khỏi một va chạm. (Chưa có chức năng)'},
    };
    
    // Lấy các phần tử DOM
    const allScreens = document.querySelectorAll('.screen');
    const player = document.getElementById('player');
    const gameContainer = document.getElementById('game-container');
    const shopItemsContainer = document.getElementById('shop-items');
    const characterShopContainer = document.getElementById('character-shop-items');
    const ui = {
        goldDisplay: document.getElementById('gold-display'), scoreDisplay: document.getElementById('score-display'),
        homeGold: document.getElementById('home-gold'), homeHouseLevel: document.getElementById('home-house-level'),
        homeCharName: document.getElementById('home-char-name'),
        houseLevelDisplay: document.getElementById('house-level-display'), houseVisual: document.getElementById('house-visual'),
        houseBonus: document.getElementById('house-bonus'), houseCost: document.getElementById('house-cost'),
        finalScore: document.getElementById('final-score'), goldEarned: document.getElementById('gold-earned'),
    };
    const sounds = {
        music: document.getElementById('music'), coin: document.getElementById('coin-sound'),
        jump: document.getElementById('jump-sound'), crash: document.getElementById('crash-sound'),
        upgrade: document.getElementById('upgrade-sound'),
    };

    // TRẠNG THÁI GAME
    let state = {
        gold: 0, houseLevel: 1,
        unlockedCharacters: ['ninja'], selectedCharacter: 'ninja',
        consumables: { 'revive': 0, 'shield': 0 },
        score: 0, goldInRun: 0, gameSpeed: 3.0, spawnRate: 1200,
        playerLane: 1, isJumping: false, isGameOver: true,
    };
    const lanes = [60, 175, 290];
    let gameInterval, spawnInterval;

    // =================================================================
    //  2. QUẢN LÝ DỮ LIỆU & GIAO DIỆN
    // =================================================================
    
    function saveState() {
        const dataToSave = { gold: state.gold, houseLevel: state.houseLevel, unlockedCharacters: state.unlockedCharacters, selectedCharacter: state.selectedCharacter, consumables: state.consumables, };
        localStorage.setItem('ninjaRunnerState', JSON.stringify(dataToSave));
    }

    function loadState() {
        const savedData = JSON.parse(localStorage.getItem('ninjaRunnerState'));
        if (savedData) {
            state = { ...state, ...savedData };
        }
    }

    function updateAllUI() {
        // Màn hình chính & Nhà
        ui.homeGold.textContent = state.gold; ui.homeHouseLevel.textContent = state.houseLevel;
        ui.homeCharName.textContent = CHARACTERS[state.selectedCharacter].name;
        ui.houseLevelDisplay.textContent = state.houseLevel; ui.houseCost.textContent = 200 * state.houseLevel;
        ui.houseBonus.textContent = (state.houseLevel - 1) * 5;
        ui.houseVisual.className = `level-${Math.min(state.houseLevel, 4)}`;

        // Cửa hàng vật phẩm
        shopItemsContainer.innerHTML = '';
        for (const id in ITEMS) {
            const item = ITEMS[id]; const owned = state.consumables[id] || 0;
            shopItemsContainer.innerHTML += `<div class="item"><h3>${item.name} (Sở hữu: ${owned})</h3><p>${item.description}</p><button class="buy-button" data-item-type="consumable" data-item-id="${id}">Mua - ${item.baseCost} Vàng</button></div>`;
        }

        // Cửa hàng nhân vật
        characterShopContainer.innerHTML = '';
        for (const id in CHARACTERS) {
            const char = CHARACTERS[id]; const isUnlocked = state.unlockedCharacters.includes(id);
            const buttonHtml = isUnlocked ? `<button class="select-char-button" data-char-id="${id}" ${state.selectedCharacter === id ? 'disabled' : ''}>${state.selectedCharacter === id ? 'Đã Chọn' : 'Chọn'}</button>`
                : `<button class="buy-button" data-item-type="character" data-item-id="${id}">Mua - ${char.cost} Vàng</button>`;
            characterShopContainer.innerHTML += `<div class="item"><h3>${char.name}</h3><p>${char.description}</p>${buttonHtml}</div>`;
        }
    }

    function showScreen(screenId) {
        allScreens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function playSound(sound) { sound.currentTime = 0; sound.play().catch(e => {}); }

    // =================================================================
    //  3. LOGIC MUA BÁN & NÂNG CẤP
    // =================================================================

    function buyItem(type, id) {
        let cost = 0;
        if (type === 'consumable') cost = ITEMS[id].baseCost;
        else if (type === 'character') cost = CHARACTERS[id].cost;

        if (state.gold >= cost) {
            state.gold -= cost;
            if (type === 'consumable') state.consumables[id]++;
            else if (type === 'character') state.unlockedCharacters.push(id);
            playSound(sounds.upgrade);
        } else { alert("Không đủ vàng!"); }
        saveState(); updateAllUI();
    }

    function selectCharacter(id) {
        if (state.unlockedCharacters.includes(id)) {
            state.selectedCharacter = id;
            saveState(); updateAllUI();
        }
    }
    
    function upgradeHouse() {
        const cost = 200 * state.houseLevel;
        if (state.gold >= cost) {
            state.gold -= cost; state.houseLevel++; playSound(sounds.upgrade);
            saveState(); updateAllUI();
        } else { alert("Không đủ vàng!"); }
    }

    // =================================================================
    //  4. LOGIC GAMEPLAY
    // =================================================================

    function startGame() {
        state.isGameOver = false; state.score = 0; state.goldInRun = 0; state.playerLane = 1;

        const availableMaps = MAPS.filter(map => state.houseLevel >= map.unlockLevel);
        const currentMap = availableMaps[availableMaps.length - 1];
        state.gameSpeed = currentMap.speed; state.spawnRate = currentMap.spawnRate;
        gameContainer.className = `screen ${currentMap.theme}`;
        
        ui.goldDisplay.textContent = 0; ui.scoreDisplay.textContent = 0;
        updatePlayerPosition(); showScreen('game-container');
        sounds.music.volume = 0.3; playSound(sounds.music);
        gameInterval = setInterval(gameLoop, 1000 / 60);
        spawnInterval = setInterval(createItem, state.spawnRate);
    }

    function endGame() {
        state.isGameOver = true; clearInterval(gameInterval); clearInterval(spawnInterval);
        sounds.music.pause(); playSound(sounds.crash);

        state.gold += Math.floor(state.goldInRun);
        saveState(); updateAllUI();
        ui.finalScore.textContent = state.score; ui.goldEarned.textContent = Math.floor(state.goldInRun);
        showScreen('game-over-screen');
    }
    
    function createItem() {
        if (state.isGameOver) return;
        const isObstacle = Math.random() > 0.4;
        const item = document.createElement('div');
        const randomLane = Math.floor(Math.random() * 3);
        item.className = isObstacle ? 'obstacle' : 'coin';
        item.style.left = `${lanes[randomLane] - (isObstacle ? 40 : 15)}px`;
        item.style.animationDuration = `${state.gameSpeed}s`;
        gameContainer.appendChild(item);
        setTimeout(() => item.remove(), state.gameSpeed * 1000);
    }

    function gameLoop() {
        if (state.isGameOver) return;
        const houseBonus = 1 + ((state.houseLevel - 1) * 0.05);
        state.score = Math.floor(state.score + houseBonus);
        ui.scoreDisplay.textContent = state.score;

        const playerRect = player.getBoundingClientRect();
        document.querySelectorAll('.obstacle, .coin').forEach(item => {
            const itemRect = item.getBoundingClientRect();
            if (playerRect.left < itemRect.right && playerRect.right > itemRect.left && playerRect.top < itemRect.bottom && playerRect.bottom > itemRect.top) {
                if (item.classList.contains('obstacle') && !state.isJumping) {
                    endGame();
                } else if (item.classList.contains('coin')) {
                    item.remove();
                    let goldValue = 1;
                    if (state.selectedCharacter === 'explorer') goldValue *= 1.1;
                    state.goldInRun += goldValue;
                    ui.goldDisplay.textContent = Math.floor(state.goldInRun);
                    playSound(sounds.coin);
                }
            }
        });
    }

    // =================================================================
    //  5. ĐIỀU KHIỂN & SỰ KIỆN
    // =================================================================
    
    function movePlayerLeft() { if (!state.isGameOver && state.playerLane > 0) { state.playerLane--; updatePlayerPosition(); } }
    function movePlayerRight() { if (!state.isGameOver && state.playerLane < 2) { state.playerLane++; updatePlayerPosition(); } }
    function jumpPlayer() {
        if (!state.isGameOver && !state.isJumping) {
            state.isJumping = true; player.classList.add('jump'); playSound(sounds.jump);
            setTimeout(() => { player.classList.remove('jump'); state.isJumping = false; }, 600);
        }
    }
    function updatePlayerPosition() { player.style.left = `${lanes[state.playerLane] - player.offsetWidth / 2}px`; }

    // Điều khiển
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') movePlayerLeft();
        else if (e.key === 'ArrowRight') movePlayerRight();
        else if (e.key === 'ArrowUp') jumpPlayer();
    });

    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, false);
    document.addEventListener('touchend', e => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > 30) deltaX > 0 ? movePlayerRight() : movePlayerLeft();
        } else {
            if (Math.abs(deltaY) > 30) deltaY < 0 ? jumpPlayer() : null;
        }
    }, false); 

    // Các nút
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('shop-button').addEventListener('click', () => showScreen('shop-screen'));
    document.getElementById('house-button').addEventListener('click', () => showScreen('house-screen'));
    document.querySelectorAll('.back-button').forEach(btn => btn.addEventListener('click', () => showScreen(btn.dataset.target)));
    document.getElementById('upgrade-house-button').addEventListener('click', upgradeHouse);

    // Sự kiện cho các tab trong cửa hàng
    document.getElementById('shop-tabs').addEventListener('click', e => {
        if(e.target.classList.contains('tab-button')){
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        }
    });

    // Sự kiện cho các nút trong cửa hàng (event delegation)
    document.getElementById('shop-container').addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('buy-button')) {
            buyItem(target.dataset.itemType, target.dataset.itemId);
        } else if (target.classList.contains('select-char-button')) {
            selectCharacter(target.dataset.charId);
        }
    });
    
    // =================================================================
    //  6. KHỞI TẠO GAME
    // =================================================================
    loadState();
    updateAllUI();
    showScreen('home-screen');
});
