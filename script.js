document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    //  1. ĐỊNH NGHĨA DỮ LIỆU GAME
    // =================================================================
    const MAPS = [
        { id: 0, name: 'Thành Phố', unlockLevel: 1, theme: 'map-city', speed: 3.0, spawnRate: 1200 },
        { id: 1, name: 'Rừng Rậm', unlockLevel: 2, theme: 'map-forest', speed: 2.8, spawnRate: 1100 },
        { id: 2, name: 'Sa Mạc', unlockLevel: 4, theme: 'map-desert', speed: 2.6, spawnRate: 1000 },
        { id: 3, name: 'Miền Băng Giá', unlockLevel: 6, theme: 'map-ice', speed: 2.5, spawnRate: 950 },
        { id: 4, name: 'Núi Lửa', unlockLevel: 8, theme: 'map-volcano', speed: 2.4, spawnRate: 900 },
        { id: 5, name: 'Vùng Đất Kẹo', unlockLevel: 10, theme: 'map-candy', speed: 2.3, spawnRate: 880 },
        { id: 6, name: 'Thành Phố Neon', unlockLevel: 12, theme: 'map-neon', speed: 2.2, spawnRate: 850 },
        { id: 7, 'name': 'Đáy Biển', unlockLevel: 15, theme: 'map-ocean', speed: 2.1, spawnRate: 820 },
        { id: 8, 'name': 'Lâu Đài Ma', unlockLevel: 18, theme: 'map-haunted', speed: 2.0, spawnRate: 800 },
        { id: 9, 'name': 'Không Gian', unlockLevel: 20, theme: 'map-space', speed: 1.8, spawnRate: 750 },
    ];
    const CHARACTERS = {
        'ninja': { name: 'Ninja', cost: 0, description: 'Nhân vật mặc định, cân bằng.' },
        'explorer': { name: 'Nhà Thám Hiểm', cost: 1000, description: 'Tăng 10% số vàng nhặt được.' },
        'ranger': { name: 'Kiểm Lâm', cost: 1500, description: 'Bắt đầu mỗi lượt chạy với một chiếc khiên.' },
        'athlete': { name: 'Vận Động Viên', cost: 5000, description: 'Chạy nhanh hơn, nhận nhiều điểm hơn 15%.' },
        'ghost': { name: 'Bóng Ma', cost: 4000, description: 'Có 10% cơ hội đi xuyên qua chướng ngại vật.' },
        'alchemist': { name: 'Nhà Giả Kim', cost: 2500, description: 'Có 5% cơ hội nhân đôi giá trị đồng vàng. (Chưa có chức năng)' },
        'sorcerer': { name: 'Phù Thủy', cost: 6500, description: 'Các vật phẩm hỗ trợ kéo dài hơn 20%. (Chưa có chức năng)' },
        'billionaire': { name: 'Tỷ Phú', cost: 8000, description: 'Bắt đầu mỗi lượt chạy với 50 vàng miễn phí. (Chưa có chức năng)' },
        'robot': { name: 'Robot', cost: 10000, description: 'Miễn nhiễm với các bẫy điện trên đường. (Chưa có chức năng)' },
        'angel': { name: 'Thiên Sứ', cost: 15000, description: 'Tự động hồi sinh miễn phí một lần mỗi ngày. (Chưa có chức năng)' }
    };
    const ITEMS = {
        'revive': { name: 'Hồi Sinh', baseCost: 250, description: 'Tiếp tục chạy sau khi vấp ngã.' },
        'shield_consumable': { name: 'Khiên Dùng Một Lần', baseCost: 100, description: 'Bắt đầu lượt chạy với một chiếc khiên. (Chưa có chức năng)' },
        'headstart_500': { name: 'Khởi Đầu Nhanh 500m', baseCost: 300, description: 'Bỏ qua 500m đầu. (Chưa có chức năng)' },
        'score_booster': { name: 'Tăng Điểm x2', baseCost: 200, description: 'Nhân đôi số điểm trong 30 giây. (Chưa có chức năng)' },
        'mystery_box': { name: 'Hộp Bí Ẩn', baseCost: 500, description: 'Mở ra một phần thưởng ngẫu nhiên. (Chưa có chức năng)' },
        'key': { name: 'Chìa Khóa Vàng', baseCost: 150, description: 'Dùng để mở các rương kho báu. (Chưa có chức năng)' },
    };

    // DOM Elements & Sounds
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
        reviveButton: document.getElementById('revive-button'), reviveCount: document.getElementById('revive-count')
    };
    const sounds = {
        music: document.getElementById('music'), coin: document.getElementById('coin-sound'),
        jump: document.getElementById('jump-sound'), crash: document.getElementById('crash-sound'),
        upgrade: document.getElementById('upgrade-sound'), shield_break: document.getElementById('shield-break-sound')
    };

    // GAME STATE
    let state = {
        gold: 0, houseLevel: 1, unlockedCharacters: ['ninja'], selectedCharacter: 'ninja',
        consumables: { 'revive': 0, 'shield_consumable': 0 }, score: 0, goldInRun: 0, 
        gameSpeed: 3.0, spawnRate: 1200, playerLane: 1, isJumping: false, isGameOver: true,
        hasShield: false, revivesUsedThisRun: 0,
    };
    const lanes = [60, 175, 290];
    let gameInterval, spawnInterval;

    // =================================================================
    //  2. QUẢN LÝ DỮ LIỆU & GIAO DIỆN
    // =================================================================
    function saveState() {
        const dataToSave = { gold: state.gold, houseLevel: state.houseLevel, unlockedCharacters: state.unlockedCharacters, selectedCharacter: state.selectedCharacter, consumables: state.consumables };
        localStorage.setItem('ninjaRunnerState', JSON.stringify(dataToSave));
    }
    function loadState() {
        const savedData = JSON.parse(localStorage.getItem('ninjaRunnerState'));
        if (savedData) { state = { ...state, ...savedData }; }
    }
    function updateAllUI() {
        ui.homeGold.textContent = state.gold; ui.homeHouseLevel.textContent = state.houseLevel;
        ui.homeCharName.textContent = CHARACTERS[state.selectedCharacter].name;
        ui.houseLevelDisplay.textContent = state.houseLevel; ui.houseCost.textContent = 200 * state.houseLevel;
        ui.houseBonus.textContent = (state.houseLevel - 1) * 5;
        ui.houseVisual.className = `level-${Math.min(state.houseLevel, 4)}`;
        shopItemsContainer.innerHTML = '';
        for (const id in ITEMS) { const item = ITEMS[id]; const owned = state.consumables[id] || 0; shopItemsContainer.innerHTML += `<div class="item"><h3>${item.name} (Sở hữu: ${owned})</h3><p>${item.description}</p><button class="buy-button" data-item-type="consumable" data-item-id="${id}">Mua - ${item.baseCost} Vàng</button></div>`; }
        characterShopContainer.innerHTML = '';
        for (const id in CHARACTERS) { const char = CHARACTERS[id]; const isUnlocked = state.unlockedCharacters.includes(id); const btn = isUnlocked ? `<button class="select-char-button" data-char-id="${id}" ${state.selectedCharacter === id ? 'disabled' : ''}>${state.selectedCharacter === id ? 'Đã Chọn' : 'Chọn'}</button>` : `<button class="buy-button" data-item-type="character" data-item-id="${id}">Mua - ${char.cost} Vàng</button>`; characterShopContainer.innerHTML += `<div class="item"><h3>${char.name}</h3><p>${char.description}</p>${btn}</div>`; }
    }
    function showScreen(screenId) { allScreens.forEach(s => s.classList.remove('active')); document.getElementById(screenId).classList.add('active'); }
    function playSound(sound) { if(sound) { sound.currentTime = 0; sound.play().catch(e => {}); }}

    // =================================================================
    //  3. LOGIC MUA BÁN & NÂNG CẤP
    // =================================================================
    function buyItem(type, id) {
        let cost = 0;
        if (type === 'consumable') cost = ITEMS[id].baseCost;
        else if (type === 'character') cost = CHARACTERS[id].cost;
        if (state.gold >= cost) { state.gold -= cost; if (type === 'consumable') state.consumables[id]++; else if (type === 'character') state.unlockedCharacters.push(id); playSound(sounds.upgrade); } 
        else { alert("Không đủ vàng!"); }
        saveState(); updateAllUI();
    }
    function selectCharacter(id) { if (state.unlockedCharacters.includes(id)) { state.selectedCharacter = id; saveState(); updateAllUI(); }}
    function upgradeHouse() { const cost = 200 * state.houseLevel; if (state.gold >= cost) { state.gold -= cost; state.houseLevel++; playSound(sounds.upgrade); saveState(); updateAllUI(); } else { alert("Không đủ vàng!"); }}

    // =================================================================
    //  4. LOGIC GAMEPLAY
    // =================================================================
    function startGame() {
        state = { ...state, isGameOver: false, score: 0, goldInRun: 0, playerLane: 1, hasShield: false, revivesUsedThisRun: 0 };
        const availableMaps = MAPS.filter(map => state.houseLevel >= map.unlockLevel);
        const currentMap = availableMaps[availableMaps.length - 1];
        state.gameSpeed = currentMap.speed; state.spawnRate = currentMap.spawnRate;
        if (state.selectedCharacter === 'athlete') { state.gameSpeed *= 0.9; }
        gameContainer.className = `screen ${currentMap.theme}`;
        if (state.selectedCharacter === 'ranger') { state.hasShield = true; }
        updateShieldUI();
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
        if (state.consumables.revive > 0 && state.revivesUsedThisRun < 1) {
            ui.reviveButton.style.display = 'block';
            ui.reviveCount.textContent = state.consumables.revive;
        } else {
            ui.reviveButton.style.display = 'none';
        }
        showScreen('game-over-screen');
    }
    function useRevive() {
        if (state.consumables.revive <= 0) return;
        state.consumables.revive--;
        state.revivesUsedThisRun++;
        saveState(); updateAllUI();
        document.querySelectorAll('.obstacle, .coin').forEach(item => item.remove());
        state.isGameOver = false;
        state.hasShield = true; // Tặng khiên sau khi hồi sinh
        updateShieldUI();
        showScreen('game-container');
        playSound(sounds.music);
        gameInterval = setInterval(gameLoop, 1000 / 60);
        spawnInterval = setInterval(createItem, state.spawnRate);
    }
    function createItem() { if (state.isGameOver) return; const isObstacle = Math.random() > 0.4; const item = document.createElement('div'); const randomLane = Math.floor(Math.random() * 3); item.className = isObstacle ? 'obstacle' : 'coin'; item.style.left = `${lanes[randomLane] - (isObstacle ? 40 : 15)}px`; item.style.animationDuration = `${state.gameSpeed}s`; gameContainer.appendChild(item); setTimeout(() => item.remove(), state.gameSpeed * 1000); }
    function gameLoop() {
        if (state.isGameOver) return;
        let scoreBonus = 1 + ((state.houseLevel - 1) * 0.05);
        if (state.selectedCharacter === 'athlete') { scoreBonus *= 1.15; }
        state.score = Math.floor(state.score + scoreBonus);
        ui.scoreDisplay.textContent = state.score;
        const playerRect = player.getBoundingClientRect();
        document.querySelectorAll('.obstacle, .coin').forEach(item => {
            if (!item.parentElement) return; // Bỏ qua nếu vật phẩm đã bị xóa
            const itemRect = item.getBoundingClientRect();
            if (playerRect.left < itemRect.right && playerRect.right > itemRect.left && playerRect.top < itemRect.bottom && playerRect.bottom > itemRect.top) {
                if (item.classList.contains('obstacle') && !state.isJumping) {
                    if (state.hasShield) {
                        state.hasShield = false;
                        updateShieldUI();
                        playSound(sounds.shield_break);
                        item.remove();
                        return;
                    }
                    if (state.selectedCharacter === 'ghost' && Math.random() < 0.10) {
                        return; // Đi xuyên qua
                    }
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
    function updateShieldUI() { player.classList.toggle('shielded', state.hasShield); }

    // =================================================================
    //  5. ĐIỀU KHIỂN & SỰ KIỆN
    // =================================================================
    function movePlayerLeft() { if (!state.isGameOver && state.playerLane > 0) { state.playerLane--; updatePlayerPosition(); } }
    function movePlayerRight() { if (!state.isGameOver && state.playerLane < 2) { state.playerLane++; updatePlayerPosition(); } }
    function jumpPlayer() { if (!state.isGameOver && !state.isJumping) { state.isJumping = true; player.classList.add('jump'); playSound(sounds.jump); setTimeout(() => { player.classList.remove('jump'); state.isJumping = false; }, 600); } }
    function updatePlayerPosition() { player.style.left = `${lanes[state.playerLane] - player.offsetWidth / 2}px`; }

    document.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') movePlayerLeft(); else if (e.key === 'ArrowRight') movePlayerRight(); else if (e.key === 'ArrowUp') jumpPlayer(); });
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, false);
    document.addEventListener('touchend', e => { const deltaX = e.changedTouches[0].screenX - touchStartX; const deltaY = e.changedTouches[0].screenY - touchStartY; if(state.isGameOver) return; if (Math.abs(deltaX) > Math.abs(deltaY)) { if (Math.abs(deltaX) > 30) deltaX > 0 ? movePlayerRight() : movePlayerLeft(); } else { if (Math.abs(deltaY) > 30) deltaY < 0 ? jumpPlayer() : null; } }, false); 
    
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('shop-button').addEventListener('click', () => showScreen('shop-screen'));
    document.getElementById('house-button').addEventListener('click', () => showScreen('house-screen'));
    document.querySelectorAll('.back-button').forEach(btn => btn.addEventListener('click', () => showScreen(btn.dataset.target)));
    document.getElementById('upgrade-house-button').addEventListener('click', upgradeHouse);
    document.getElementById('revive-button').addEventListener('click', useRevive);
    document.getElementById('shop-tabs').addEventListener('click', e => { if(e.target.classList.contains('tab-button')){ document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab).classList.add('active'); } });
    document.getElementById('shop-container').addEventListener('click', e => { const t = e.target; if (t.classList.contains('buy-button')) buyItem(t.dataset.itemType, t.dataset.itemId); else if (t.classList.contains('select-char-button')) selectCharacter(t.dataset.charId); });
    
    // =================================================================
    //  6. KHỞI TẠO GAME
    // =================================================================
    loadState();
    updateAllUI();
    showScreen('home-screen');
});
