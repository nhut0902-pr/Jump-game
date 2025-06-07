document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM (giữ nguyên)
    const player = document.getElementById('player');
    const gameContainer = document.getElementById('game-container');
    const allScreens = document.querySelectorAll('.screen');
    const ui = {
        goldDisplay: document.getElementById('gold-display'),
        scoreDisplay: document.getElementById('score-display'),
        homeGold: document.getElementById('home-gold'),
        homeHouseLevel: document.getElementById('home-house-level'),
        shieldLevel: document.getElementById('shield-level'),
        shieldCost: document.getElementById('shield-cost'),
        magnetLevel: document.getElementById('magnet-level'),
        magnetCost: document.getElementById('magnet-cost'),
        houseLevelDisplay: document.getElementById('house-level-display'),
        houseVisual: document.getElementById('house-visual'),
        houseBonus: document.getElementById('house-bonus'),
        houseCost: document.getElementById('house-cost'),
        finalScore: document.getElementById('final-score'),
        goldEarned: document.getElementById('gold-earned'),
    };
    
    // Âm thanh (giữ nguyên)
    const sounds = {
        music: document.getElementById('music'),
        coin: document.getElementById('coin-sound'),
        jump: document.getElementById('jump-sound'),
        crash: document.getElementById('crash-sound'),
        upgrade: document.getElementById('upgrade-sound'),
    };

    // TRẠNG THÁI GAME (giữ nguyên)
    let state = {
        gold: 0,
        highScore: 0,
        upgrades: { shield: 1, magnet: 1 },
        houseLevel: 1,
        score: 0,
        goldInRun: 0,
        gameSpeed: 3,
        playerLane: 1,
        isJumping: false,
        isGameOver: true,
    };
    const lanes = [60, 175, 290];
    let gameInterval, spawnInterval;

    // --- QUẢN LÝ DỮ LIỆU & GIAO DIỆN (giữ nguyên) ---
    function saveState() {
        const dataToSave = { gold: state.gold, highScore: state.highScore, upgrades: state.upgrades, houseLevel: state.houseLevel };
        localStorage.setItem('ninjaRunnerState', JSON.stringify(dataToSave));
    }

    function loadState() {
        const savedData = JSON.parse(localStorage.getItem('ninjaRunnerState'));
        if (savedData) {
            state = { ...state, ...savedData };
        }
    }

    function updateAllUI() {
        ui.homeGold.textContent = state.gold;
        ui.homeHouseLevel.textContent = state.houseLevel;
        ui.shieldLevel.textContent = state.upgrades.shield;
        ui.shieldCost.textContent = 100 * state.upgrades.shield;
        ui.magnetLevel.textContent = state.upgrades.magnet;
        ui.magnetCost.textContent = 100 * state.upgrades.magnet;
        ui.houseLevelDisplay.textContent = state.houseLevel;
        ui.houseCost.textContent = 200 * state.houseLevel;
        ui.houseBonus.textContent = (state.houseLevel - 1) * 10;
        ui.houseVisual.className = `level-${Math.min(state.houseLevel, 4)}`;
    }

    function showScreen(screenId) {
        allScreens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {});
    }

    // --- LOGIC CỬA HÀNG & NHÀ (giữ nguyên) ---
    function buyUpgrade(item) {
        const cost = 100 * state.upgrades[item];
        if (state.gold >= cost) {
            state.gold -= cost;
            state.upgrades[item]++;
            playSound(sounds.upgrade);
            saveState();
            updateAllUI();
        } else {
            alert("Không đủ vàng!");
        }
    }

    function upgradeHouse() {
        const cost = 200 * state.houseLevel;
        if (state.gold >= cost) {
            state.gold -= cost;
            state.houseLevel++;
            playSound(sounds.upgrade);
            saveState();
            updateAllUI();
        } else {
            alert("Không đủ vàng!");
        }
    }

    // --- LOGIC GAME (giữ nguyên) ---
    function startGame() {
        state.isGameOver = false; state.score = 0; state.goldInRun = 0; state.gameSpeed = 3; state.playerLane = 1;
        ui.goldDisplay.textContent = state.goldInRun; ui.scoreDisplay.textContent = state.score;
        gameContainer.className = "screen map-city";
        if (state.houseLevel >= 3) { gameContainer.className = "screen map-forest"; }
        updatePlayerPosition(); showScreen('game-container'); sounds.music.volume = 0.3; playSound(sounds.music);
        gameInterval = setInterval(gameLoop, 1000 / 60); spawnInterval = setInterval(createItem, 1200);
    }
    
    function endGame() {
        state.isGameOver = true; clearInterval(gameInterval); clearInterval(spawnInterval); sounds.music.pause(); playSound(sounds.crash);
        state.gold += state.goldInRun;
        if(state.score > state.highScore) state.highScore = state.score;
        saveState(); updateAllUI();
        ui.finalScore.textContent = state.score; ui.goldEarned.textContent = state.goldInRun; showScreen('game-over-screen');
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
        state.score++; ui.scoreDisplay.textContent = state.score;
        const playerRect = player.getBoundingClientRect();
        document.querySelectorAll('.obstacle, .coin').forEach(item => {
            const itemRect = item.getBoundingClientRect();
            if (playerRect.left < itemRect.right && playerRect.right > itemRect.left && playerRect.top < itemRect.bottom && playerRect.bottom > itemRect.top) {
                if (item.classList.contains('obstacle') && !state.isJumping) { endGame(); } 
                else if (item.classList.contains('coin')) {
                    item.remove(); state.goldInRun++; ui.goldDisplay.textContent = state.goldInRun; playSound(sounds.coin);
                }
            }
        });
    }

    function updatePlayerPosition() {
        player.style.left = `${lanes[state.playerLane] - player.offsetWidth / 2}px`;
    }

    // --- TÁCH CÁC HÀNH ĐỘNG CỦA NGƯỜI CHƠI RA THÀNH CÁC HÀM RIÊNG ---
    // Điều này giúp cả bàn phím và cảm ứng có thể gọi chung một hành động
    function movePlayerLeft() {
        if (state.isGameOver || state.playerLane <= 0) return;
        state.playerLane--;
        updatePlayerPosition();
    }

    function movePlayerRight() {
        if (state.isGameOver || state.playerLane >= 2) return;
        state.playerLane++;
        updatePlayerPosition();
    }

    function jumpPlayer() {
        if (state.isGameOver || state.isJumping) return;
        state.isJumping = true;
        player.classList.add('jump');
        playSound(sounds.jump);
        setTimeout(() => {
            player.classList.remove('jump');
            state.isJumping = false;
        }, 600); // Thời gian nhảy
    }

    // --- GÁN SỰ KIỆN ---
    // 1. Điều khiển bằng Bàn phím (cho máy tính)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') movePlayerLeft();
        else if (e.key === 'ArrowRight') movePlayerRight();
        else if (e.key === 'ArrowUp') jumpPlayer();
    });

    // 2. *** MỚI: ĐIỀU KHIỂN BẰNG CẢM ỨNG (cho điện thoại/máy tính bảng) ***
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    // Lắng nghe sự kiện khi người dùng bắt đầu chạm vào màn hình
    document.addEventListener('touchstart', (e) => {
        // Chỉ xử lý khi đang trong màn chơi
        if (state.isGameOver) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    // Lắng nghe sự kiện khi người dùng nhấc ngón tay ra
    document.addEventListener('touchend', (e) => {
        if (state.isGameOver) return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false); 

    function handleSwipe() {
        const swipeThreshold = 50; // Độ dài vuốt tối thiểu (px) để tính là một hành động
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Ưu tiên vuốt ngang hay dọc?
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Vuốt ngang
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    movePlayerRight();
                } else {
                    movePlayerLeft();
                }
            }
        } else {
            // Vuốt dọc
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY < 0) {
                    // Vuốt lên (tọa độ Y giảm)
                    jumpPlayer();
                }
                // Bạn có thể thêm hành động cho vuốt xuống (deltaY > 0) ở đây, ví dụ: trượt
            }
        }
    }


    // Các nút điều hướng (giữ nguyên)
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', startGame);
    document.getElementById('shop-button').addEventListener('click', () => showScreen('shop-screen'));
    document.getElementById('house-button').addEventListener('click', () => showScreen('house-screen'));
    document.querySelectorAll('.back-button').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.target));
    });

    // Các nút nâng cấp (giữ nguyên)
    document.querySelector('.buy-button[data-item="shield"]').addEventListener('click', () => buyUpgrade('shield'));
    document.querySelector('.buy-button[data-item="magnet"]').addEventListener('click', () => buyUpgrade('magnet'));
    document.getElementById('upgrade-house-button').addEventListener('click', upgradeHouse);

    // --- KHỞI TẠO GAME ---
    loadState();
    updateAllUI();
    showScreen('home-screen');
});