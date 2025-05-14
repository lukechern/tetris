// Tetris游戏核心逻辑
class TetrisGame_7ree {
    constructor() {
        // 游戏配置
        this.rows = 20;
        this.cols = 11;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameEnded = false;
        this.isSoundOn = true;
        this.isGhostPieceEnabled = true; // 新增：幽灵方块状态
        this.gameTime = 0;
        this.timeInterval = null;
        this.gameInterval = null;
        
        // 方块下落速度（毫秒），从难度设置获取
        this.speed = this.getInitialSpeed();
        
        // 当前方块和下一个方块
        this.currentPiece = null;
        this.nextPiece = null;
        
        // 游戏面板状态，0表示空，非0表示已填充方块（值对应颜色索引）
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // 方块形状定义（7种标准俄罗斯方块）
        this.shapes = [
            // I形
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            // J形
            [
                [2, 0, 0],
                [2, 2, 2],
                [0, 0, 0]
            ],
            // L形
            [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0]
            ],
            // O形
            [
                [4, 4],
                [4, 4]
            ],
            // S形
            [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0]
            ],
            // T形
            [
                [0, 6, 0],
                [6, 6, 6],
                [0, 0, 0]
            ],
            // Z形
            [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ]
        ];
        
        // 方块颜色 - 从配置文件读取
        const hasColorConfig = (typeof config !== 'undefined' && typeof config.squareColor !== 'undefined');
        
        // 如果配置文件中有颜色定义，则使用配置文件中的值，否则使用默认值
        this.colors = hasColorConfig ? config.squareColor : [
            'transparent',     // 0: 空白
            '#00FFFF',         // 1: 青色 (I)
            '#0000FF',         // 2: 蓝色 (J)
            '#FF7F00',         // 3: 橙色 (L)
            '#FFFF00',         // 4: 黄色 (O)
            '#00FF00',         // 5: 绿色 (S)
            '#800080',         // 6: 紫色 (T)
            '#FF0000'          // 7: 红色 (Z)
        ];
        
        console.log(getText_7ree('logColorSource') + (hasColorConfig ? getText_7ree('configProfile') : getText_7ree('defaultValue')));
        
        // --- 更新配置读取逻辑：用户配置 > 系统配置 > 默认值 ---
        
        // 声音状态
        let soundDefaultOn = true; // 硬编码默认值
        if (typeof config !== 'undefined' && config.audio && config.audio.defaultOn !== undefined) {
            soundDefaultOn = config.audio.defaultOn; // 从系统配置读取
        }
        if (typeof user_config !== 'undefined' && user_config.audio && user_config.audio.defaultOn !== undefined) {
            soundDefaultOn = user_config.audio.defaultOn; // 优先从用户配置读取
        }
        this.isSoundOn = soundDefaultOn;
        console.log(getText_7ree('logConfigSoundDefault') + this.isSoundOn); // Use getText_7ree
        
        // 幽灵方块状态
        let ghostDefaultOn = true; // 硬编码默认值
        if (typeof config !== 'undefined' && config.features && config.features.ghostPieceDefaultOn !== undefined) {
            ghostDefaultOn = config.features.ghostPieceDefaultOn; // 从系统配置读取
        }
        if (typeof user_config !== 'undefined' && user_config.features && user_config.features.ghostPieceDefaultOn !== undefined) {
            ghostDefaultOn = user_config.features.ghostPieceDefaultOn; // 优先从用户配置读取
        }
        this.isGhostPieceEnabled = ghostDefaultOn;
        console.log(getText_7ree('logConfigGhostDefault') + this.isGhostPieceEnabled); // Use getText_7ree

        // --- 本地存储 (用户偏好) 仍然具有最高优先级 ---
        
        // 读取本地存储的声音状态
        const savedSoundState = localStorage.getItem('tetris_sound_on_7ree');
        if (savedSoundState !== null) {
            this.isSoundOn = savedSoundState === 'true';
            console.log(getText_7ree('logLoadSoundStateLocal') + this.isSoundOn); // Use getText_7ree
        } else {
            // 如果本地没有，则将最终确定的配置值存入本地
            localStorage.setItem('tetris_sound_on_7ree', this.isSoundOn);
            // 确保静音状态也同步更新
            localStorage.setItem('tetris_muted_7ree', !this.isSoundOn);
        }

        // 读取本地存储的幽灵方块状态
        const savedGhostState = localStorage.getItem('tetris_ghost_on_7ree');
        if (savedGhostState !== null) {
            this.isGhostPieceEnabled = savedGhostState === 'true';
            console.log(getText_7ree('logLoadGhostStateLocal') + this.isGhostPieceEnabled); // Use getText_7ree
        } else {
            // 如果本地没有，则将最终确定的配置值存入本地
            localStorage.setItem('tetris_ghost_on_7ree', this.isGhostPieceEnabled);
        }
        
        // 初始化DOM元素引用
        this.initDomElements();
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 初始化音效
        this.initSounds();
    }
    
    // 初始化DOM元素引用
    initDomElements() {
        this.gameBoardElement = document.getElementById('game_board_7ree');
        this.nextPieceElement = document.getElementById('next_piece_7ree');
        this.scoreElement = document.getElementById('score_7ree');
        this.levelElement = document.getElementById('level_7ree');
        this.linesElement = document.getElementById('lines_7ree');
        this.timeElement = document.getElementById('time_7ree');
        
        // 移动端元素
        this.mobileScoreElement = document.getElementById('mobile_score_7ree');
        this.mobileLevelElement = document.getElementById('mobile_level_7ree');
        this.mobileLinesElement = document.getElementById('mobile_lines_7ree');
        this.mobileTimeElement = document.getElementById('mobile_time_7ree');
        
        // 按钮元素
        this.startButton = document.getElementById('start_btn_7ree');
        this.pauseButton = document.getElementById('pause_btn_7ree');
        this.soundButton = document.getElementById('sound_btn_7ree');
        this.leftButton = document.getElementById('left_btn_7ree');
        this.rightButton = document.getElementById('right_btn_7ree');
        this.downButton = document.getElementById('down_btn_7ree');
        this.rotateButton = document.getElementById('rotate_btn_7ree');
        this.dropButton = document.getElementById('drop_btn_7ree');
        this.ghostToggleButton = document.getElementById('ghost_toggle_btn_7ree'); // 新增按钮引用
        
        // 卡片元素
        this.welcomeCardElement = document.getElementById('welcome_card_7ree');
        this.gameoverCardElement = document.getElementById('gameover_card_7ree');
        this.pauseCardElement = document.getElementById('pause_card_7ree');
        this.resumeGameButton = document.getElementById('resume_game_btn_7ree');
        
        // 新增：帮助卡片和按钮引用
        this.helpCardElement = document.getElementById('help_card_7ree');
        this.helpButton = document.getElementById('help_btn_7ree');
        this.closeHelpButton = document.getElementById('close_help_btn_7ree');
        
        // 创建游戏面板
        this.createGameBoard();
        this.createNextPieceBoard();
        
        // 设置声音按钮的初始状态
        if (this.soundButton) {
            this.soundButton.textContent = this.isSoundOn ? '🔊' : '🔇';
        }
        // 设置幽灵方块按钮的初始状态
        this.updateGhostButtonVisuals();
    }
    
    // 初始化音效
    initSounds() {
        // 获取音频元素
        this.rotateSound = document.getElementById('rotate_sound_7ree');
        this.moveSound = document.getElementById('move_sound_7ree');
        this.dropSound = document.getElementById('drop_sound_7ree');
        this.clearSound = document.getElementById('clear_sound_7ree');
        this.gameoverSound = document.getElementById('gameover_sound_7ree');
        this.levelupSound = document.getElementById('levelup_sound_7ree');
        this.landedSound = document.getElementById('landed_sound_7ree');
        this.harddropSound = document.getElementById('harddrop_sound_7ree');
        this.comboSound = document.getElementById('combo_sound_7ree');
        
        // 设置音频源路径
        const audioPath = (typeof config !== 'undefined' && config.audio && config.audio.path) 
            ? ((config.audio.path.endsWith('/')) ? config.audio.path : config.audio.path + '/') 
            : 'resource/sounds/';
            
        // 检查配置文件中是否有音效定义
        const hasSoundEffects = (
            typeof config !== 'undefined' && 
            config.audio && 
            config.audio.files && 
            config.audio.files.soundEffects
        );
        
        // 设置音频源，优先使用配置文件中的音效定义
        if (this.rotateSound && this.rotateSound.querySelector('source')) {
            const rotateFile = hasSoundEffects ? `${config.audio.files.soundEffects.rotate}_7ree.mp3` : 'rotate.mp3';
            this.rotateSound.querySelector('source').src = audioPath + rotateFile;
            this.rotateSound.load();
        }
        
        if (this.moveSound && this.moveSound.querySelector('source')) {
            const moveFile = hasSoundEffects ? `${config.audio.files.soundEffects.move}_7ree.mp3` : 'move.mp3';
            this.moveSound.querySelector('source').src = audioPath + moveFile;
            this.moveSound.load();
        }
        
        if (this.dropSound && this.dropSound.querySelector('source')) {
            const dropFile = hasSoundEffects ? `${config.audio.files.soundEffects.drop}_7ree.mp3` : 'drop.mp3';
            this.dropSound.querySelector('source').src = audioPath + dropFile;
            this.dropSound.load();
        }
        
        if (this.clearSound && this.clearSound.querySelector('source')) {
            const clearFile = hasSoundEffects ? `${config.audio.files.soundEffects.lineClear}_7ree.mp3` : 'clear.mp3';
            this.clearSound.querySelector('source').src = audioPath + clearFile;
            this.clearSound.load();
        }
        
        if (this.gameoverSound && this.gameoverSound.querySelector('source')) {
            const gameoverFile = hasSoundEffects ? `${config.audio.files.soundEffects.gameOver}_7ree.mp3` : 'gameover.mp3';
            this.gameoverSound.querySelector('source').src = audioPath + gameoverFile;
            this.gameoverSound.load();
        }
        
        if (this.levelupSound && this.levelupSound.querySelector('source')) {
            const levelupFile = hasSoundEffects ? `${config.audio.files.soundEffects.levelUp}_7ree.mp3` : 'levelup.mp3';
            this.levelupSound.querySelector('source').src = audioPath + levelupFile;
            this.levelupSound.load();
        }
        
        if (this.landedSound && this.landedSound.querySelector('source')) {
            const landedFile = hasSoundEffects ? `${config.audio.files.soundEffects.landed}_7ree.mp3` : 'landed.mp3';
            this.landedSound.querySelector('source').src = audioPath + landedFile;
            this.landedSound.load();
        }
        
        if (this.harddropSound && this.harddropSound.querySelector('source')) {
            const harddropFile = hasSoundEffects ? `${config.audio.files.soundEffects.hardDrop}_7ree.mp3` : 'harddrop.mp3';
            this.harddropSound.querySelector('source').src = audioPath + harddropFile;
            this.harddropSound.load();
        }
        
        if (this.comboSound && this.comboSound.querySelector('source')) {
            const comboFile = hasSoundEffects ? `${config.audio.files.soundEffects.combo}_7ree.mp3` : 'combo.mp3';
            this.comboSound.querySelector('source').src = audioPath + comboFile;
            this.comboSound.load();
        }
        
        console.log("[游戏] 音效文件来源: " + (hasSoundEffects ? "配置文件" : "默认值"));
    }
    
    // 播放音效
    playSound(sound) {
        if (!this.isSoundOn) return;
        
        // 处理直接传入字符串的情况（用于移动端调用）
        if (typeof sound === 'string') {
            const soundName = sound; // Keep original name for logs
            switch(sound) {
                case 'rotate':
                    sound = this.rotateSound;
                    break;
                case 'move':
                    sound = this.moveSound;
                    break;
                case 'drop':
                    sound = this.dropSound;
                    break;
                case 'clear':
                    sound = this.clearSound;
                    break;
                case 'gameover':
                    sound = this.gameoverSound;
                    break;
                case 'levelup':
                    sound = this.levelupSound;
                    break;
                case 'landed':
                    sound = this.landedSound;
                    break;
                case 'harddrop':
                    sound = this.harddropSound;
                    break;
                case 'combo':
                    sound = this.comboSound;
                    break;
                default:
                    console.warn(getText_7ree('logUnknownSoundType'), soundName); // Use getText_7ree
                    return;
            }
        }
        
        // 确保是有效的音频元素
        if (!sound || typeof sound.play !== 'function') {
            console.warn(getText_7ree('logInvalidSoundElement')); // Use getText_7ree
            return;
        }
        
        try {
            sound.currentTime = 0;
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn(getText_7ree('logSoundPlayFail'), e); // Use getText_7ree
                    
                    // 如果是移动端，尝试在下一次用户交互时播放
                    if (DeviceHandler_7ree && DeviceHandler_7ree.isMobile()) {
                        // 这里不需要额外处理，因为移动端的音频问题已在SoundManager中处理
                    }
                });
            }
        } catch (e) {
            console.warn(getText_7ree('logSoundPlayError'), e); // Use getText_7ree
        }
    }
    
    // 创建游戏面板
    createGameBoard() {
        this.gameBoardElement.innerHTML = '';
        this.gameBoardElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        this.gameBoardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // 创建游戏面板的3D效果元素
        const sideEffect = document.createElement('div');
        sideEffect.className = 'game_board_side_effect';
        this.gameBoardElement.appendChild(sideEffect);
        
        // 创建扫光动画效果元素
        const lightSweep = document.createElement('div');
        lightSweep.className = 'game_board_light_sweep';
        this.gameBoardElement.appendChild(lightSweep);
        
        // 在动态创建单元格之前添加CSS Class以确保布局正确
        this.gameBoardElement.classList.add('game_board_grid_7ree');
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell_7ree';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.gameBoardElement.appendChild(cell);
            }
        }
    }
    
    // 创建下一个方块预览窗口
    createNextPieceBoard() {
        this.nextPieceElement.innerHTML = '';
        this.nextPieceElement.style.gridTemplateRows = 'repeat(4, 1fr)';
        this.nextPieceElement.style.gridTemplateColumns = 'repeat(4, 1fr)';
        
        // 添加CSS Class以确保预览窗口布局正确
        this.nextPieceElement.classList.add('next_piece_grid_7ree');
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'preview_cell_7ree';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.nextPieceElement.appendChild(cell);
            }
        }
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // --- 改为与操作按钮一致的鼠标事件处理，添加视觉反馈 ---
        // 定义控制按钮的处理
        const controlButtons = [
            { btn: this.startButton, action: () => this.startGame() },
            { btn: this.pauseButton, action: () => this.togglePause() },
            { btn: this.soundButton, action: () => this.toggleSound() },
            { btn: this.ghostToggleButton, action: () => this.toggleGhostPiece() } // 新增：绑定切换方法
        ];

        // 为控制按钮应用与操作按钮相同的视觉反馈处理
        controlButtons.forEach(({ btn, action }) => {
            if (btn) {
                let activeTimeoutId = null; // 用于存储延迟移除类的计时器ID

                // 按下时添加激活样式
                btn.addEventListener('mousedown', () => {
                    // 如果有正在等待移除的计时器，先清除它
                    if (activeTimeoutId) {
                        clearTimeout(activeTimeoutId);
                        activeTimeoutId = null;
                    }
                    btn.classList.add('btn_active_7ree');
                });

                // 松开时启动延迟移除并执行动作
                btn.addEventListener('mouseup', () => {
                    // 清除可能存在的旧计时器
                    if (activeTimeoutId) {
                        clearTimeout(activeTimeoutId);
                    }
                    // 启动新的延迟移除计时器
                    activeTimeoutId = setTimeout(() => {
                        btn.classList.remove('btn_active_7ree');
                        activeTimeoutId = null;
                    }, 400); // 与操作按钮一致，使用0.4秒
                    
                    // 触发视觉反馈
                    this.triggerButtonFeedback(btn);
                    
                    // 执行按钮动作 (控制按钮不需要检查游戏状态)
                    action();
                });

                // 鼠标移开时立即移除激活样式
                btn.addEventListener('mouseout', () => {
                    if (btn.classList.contains('btn_active_7ree')) {
                        if (activeTimeoutId) {
                            clearTimeout(activeTimeoutId);
                            activeTimeoutId = null;
                        }
                        btn.classList.remove('btn_active_7ree');
                    }
                });

                // 为兼容性保留click事件，但不添加视觉效果
                // 因为mouseup已经执行了action，这里不再重复执行
                btn.addEventListener('click', (e) => {
                    e.preventDefault(); // 防止重复触发
                });
            }
        });
        
        // --- 修改移动/旋转/下落按钮的监听器以添加视觉反馈 ---
        const buttonsToAnimate = [
            { btn: this.leftButton, action: () => this.moveLeft() },
            { btn: this.rightButton, action: () => this.moveRight() },
            { btn: this.downButton, action: () => this.moveDown(true) }, // 传递true表示是用户操作
            { btn: this.rotateButton, action: () => this.rotate() },
            { btn: this.dropButton, action: () => this.hardDrop() }
        ];

        buttonsToAnimate.forEach(({ btn, action }) => {
            if (btn) {
                let activeTimeoutId = null; // 用于存储延迟移除类的计时器ID

                // 按下时添加激活样式 (鼠标)
                btn.addEventListener('mousedown', () => {
                    // 如果有正在等待移除的计时器，先清除它
                    if (activeTimeoutId) {
                        clearTimeout(activeTimeoutId);
                        activeTimeoutId = null;
                    }
                    btn.classList.add('btn_active_7ree');
                });

                // 松开时启动延迟移除并执行动作 (鼠标)
                btn.addEventListener('mouseup', () => {
                    // 清除可能存在的旧计时器（以防万一）
                    if (activeTimeoutId) {
                        clearTimeout(activeTimeoutId);
                    }
                    // 启动新的延迟移除计时器
                    activeTimeoutId = setTimeout(() => {
                        btn.classList.remove('btn_active_7ree');
                        activeTimeoutId = null; // 清除计时器ID
                    }, 400); // 修改为 0.4秒
                    
                    // 触发视觉反馈
                    this.triggerButtonFeedback(btn);
                    
                    // 执行按钮动作
                    if (this.isPlaying && !this.isPaused) {
                        action();
                    }
                });

                // 鼠标移开时立即移除激活样式 (鼠标) (同样移除反馈逻辑)
                btn.addEventListener('mouseout', () => {
                    // 只有在按钮当前是激活状态（表示鼠标可能还按着）时才处理
                    if (btn.classList.contains('btn_active_7ree')) {
                        // 如果有延迟移除计时器，清除它
                        if (activeTimeoutId) {
                            clearTimeout(activeTimeoutId);
                            activeTimeoutId = null;
                        }
                        // 立即移除样式
                        btn.classList.remove('btn_active_7ree');
                    }
                });

                // 在PC端处理点击事件，但移动端不添加（因为移动端在mo_7ree.js中通过触摸事件处理）
                if (!DeviceHandler_7ree.isMobile()) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault(); // 防止重复触发
                        if (this.isPlaying && !this.isPaused) {
                            action();
                        }
                    });
                }
            }
        });
        
        // 难度选择控制
        this.initDifficultySelector();
        
        // 移除窗口大小变化时JS设置高度的逻辑
        window.addEventListener('resize', () => {
            // 只需重绘，大小由CSS处理
            this.draw();
        });
        
        // 初始化暂停卡片的继续按钮
        if (this.resumeGameButton) {
            this.resumeGameButton.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // 新增：帮助按钮事件监听
        if (this.helpButton) {
            this.helpButton.addEventListener('click', () => {
                this.showHelpCard();
            });
        }

        // 新增：关闭帮助按钮事件监听
        if (this.closeHelpButton) {
            this.closeHelpButton.addEventListener('click', () => {
                this.hideHelpCard();
            });
        }

        // 新增：Esc键关闭帮助卡片
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.helpCardElement && this.helpCardElement.classList.contains('show_7ree')) {
                this.hideHelpCard();
            }
        });
    }
    
    // --- 新增：触发按钮视觉反馈的辅助方法 ---
    triggerButtonFeedback(buttonElement) {
        if (!buttonElement) return;
        
        // 立即添加激活类
        buttonElement.classList.add('btn_active_7ree');
        
        // 设置延时移除 (与鼠标/触摸事件的延迟保持一致，例如 400ms)
        setTimeout(() => {
            buttonElement.classList.remove('btn_active_7ree');
        }, 400); 
    }
    
    // 初始化难度选择器
    initDifficultySelector() {
        // 获取欢迎界面上的难度选择器
        const difficultySelect = document.getElementById('difficulty_select_7ree');
        if (!difficultySelect) return;
        
        if (typeof DifficultyManager_7ree !== 'undefined') {
            // 从难度管理器获取当前难度
            const currentDifficulty = DifficultyManager_7ree.getCurrentDifficultyName();
            
            // 设置选择器的当前值
            difficultySelect.value = currentDifficulty;
            
            // 设置select元素的value属性，以便CSS伪元素能正确显示
            difficultySelect.setAttribute('value', currentDifficulty);
            
            // 添加变更事件
            difficultySelect.addEventListener('change', (event) => {
                console.log("[Log] Difficulty 'change' event triggered."); // 日志1
                const newDifficulty = event.target.value;
                difficultySelect.setAttribute('value', newDifficulty);
                
                console.log("[Log] Calling DifficultyManager.setDifficulty with:", newDifficulty); // 日志2
                DifficultyManager_7ree.setDifficulty(newDifficulty);
                console.log("[Log] Difficulty 'change' event finished."); // 日志3
            });
        }
    }
    
    // 处理键盘按键
    handleKeyPress(event) {
        if (!this.isPlaying || this.isPaused) return;
        
        // 防止方向键导致页面滚动
        const relevantKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
        if (relevantKeys.includes(event.code)) {
            event.preventDefault();
        }
        
        let targetButton = null;
        
        switch (event.code) {
            case 'ArrowLeft':
                if (this.moveLeft()) {
                    targetButton = this.leftButton;
                }
                break;
            case 'ArrowRight':
                if (this.moveRight()) {
                    targetButton = this.rightButton;
                }
                break;
            case 'ArrowDown':
                if (this.moveDown(true)) { // 传递true表示是用户操作
                    targetButton = this.downButton;
                }
                break;
            case 'ArrowUp':
                if (this.rotate()) {
                    targetButton = this.rotateButton;
                }
                break;
            case 'Space':
                // 落到底会立即结束当前回合，反馈时间太短可能看不清
                this.hardDrop();
                targetButton = this.dropButton;
                break;
        }
        
        // 应用视觉反馈
        if (targetButton) {
            // targetButton.classList.add('btn_active_7ree');
            // setTimeout(() => {
            //    targetButton.classList.remove('btn_active_7ree');
            // }, 400); // 修改为 0.4秒
            this.triggerButtonFeedback(targetButton); // 使用新的辅助方法
        }
    }
    
    // 开始游戏
    startGame(fromSoundManager = false) {
        console.log("[Log] startGame() called. Source:", fromSoundManager ? "SoundManager" : "Direct"); // 日志4
        
        // 重置游戏状态
        console.log("[Log] startGame() calling resetGame()."); // 日志5
        this.resetGame();
        console.log("[Log] startGame() returned from resetGame()."); // 日志6
        
        this.isPlaying = true;
        this.isPaused = false;
        this.gameEnded = false;
        
        // 生成第一个方块
        this.currentPiece = this.generatePiece();
        
        // 生成下一个方块
        this.generateNextPiece();
        
        // 更新游戏显示
        this.draw();
        this.drawNextPiece();
        
        // 开始游戏循环
        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
        
        // 开始计时
        this.timeInterval = setInterval(() => {
            this.gameTime++;
            this.updateTimeDisplay();
        }, 1000);
        
        // 启用暂停按钮
        this.pauseButton.disabled = false;
        
        // 更新按钮文本
        this.startButton.textContent = '🔄'; // 重新开始图标
        this.pauseButton.textContent = '⏸️'; // 暂停图标
        
        // 播放背景音乐 - 只有在不是从声音管理器调用时才需要这样做
        if (!fromSoundManager && typeof SoundManager_7ree !== 'undefined' && !SoundManager_7ree.isMuted && !SoundManager_7ree.currentBgm) {
            console.log("[游戏] 启动背景音乐播放");
            SoundManager_7ree.playBgmDirect();
        } else {
            console.log("[游戏] 跳过背景音乐播放初始化 - " + (fromSoundManager ? "从声音管理器调用" : "其他原因"));
        }
        console.log("[Log] startGame() finished."); // 日志7
    }
    
    // 重置游戏状态
    resetGame() {
        console.log("[Log] resetGame() called."); // 日志8
        this.resetGameWithDifficulty();
        this.gameEnded = false; 
        console.log("[Log] resetGame() finished."); // 日志9
    }
    
    // 根据难度设置重置游戏
    resetGameWithDifficulty(difficultySettings = null) {
        console.log("[Log] resetGameWithDifficulty() called. Passed settings:", difficultySettings); // 日志10
        
        // 重置游戏状态
        this.isPlaying = false;
        this.isPaused = false;
        this.gameEnded = false;
        
        // 清除所有计时器
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        
        // 重置游戏状态
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameTime = 0;
        
        // 应用难度设置
        if (difficultySettings) {
            console.log("[Log] Applying passed difficulty settings in resetGameWithDifficulty."); // 日志11
            this.speed = difficultySettings.defaultSpeed;
        } else if (typeof DifficultyManager_7ree !== 'undefined') {
            console.log("[Log] Getting difficulty settings from DifficultyManager in resetGameWithDifficulty."); // 日志12
            this.speed = DifficultyManager_7ree.getDefaultSpeed();
        } else {
            console.log("[Log] Using fallback default speed in resetGameWithDifficulty."); // 日志13
        this.speed = 1000;
        }
        
        // 清空游戏面板
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // 如果存在难度管理器，应用初始方块叠加
        if (typeof DifficultyManager_7ree !== 'undefined') {
            console.log("[Log] Checking and applying initial stack in resetGameWithDifficulty."); // 日志14
            this.board = DifficultyManager_7ree.createInitialStack(this.board, this.cols, this.rows);
        } else {
             console.log("[Log] DifficultyManager not found, skipping initial stack."); // 日志15
        }
        
        // 重置当前和下一个方块
        this.currentPiece = null;
        this.nextPiece = null;
        
        // 更新显示
        this.updateScoreDisplay();
        this.updateTimeDisplay();
        
        // 绘制空面板
        this.draw();
        console.log("[Log] resetGameWithDifficulty() finished."); // 日志16
    }
    
    // 获取初始下落速度
    getInitialSpeed() {
        if (typeof DifficultyManager_7ree !== 'undefined' && DifficultyManager_7ree.settings) {
            return DifficultyManager_7ree.getDefaultSpeed();
        } else if (typeof config !== 'undefined' && config.difficulty && config.difficulty.defaultSpeed) {
            return config.difficulty.defaultSpeed;
        }
        return 1000; // 默认1000毫秒
    }
    
    // 根据关卡计算下落速度
    getSpeedByLevel(level) {
        // 如果存在难度管理器，使用其计算方法
        if (typeof DifficultyManager_7ree !== 'undefined') {
            return DifficultyManager_7ree.calculateSpeedByLevel(level);
        }
        
        // 否则使用默认计算方法
        // 获取配置中的速度因子，默认为0.9
        const speedFactor = (typeof config !== 'undefined' && 
                              config.difficulty && 
                              config.difficulty.speedFactor) 
                            ? config.difficulty.speedFactor 
                            : 0.9;
        
        // 基础速度，每升一级减少指定比例
        return Math.floor(this.speed * Math.pow(speedFactor, level - 1));
    }
    
    // 游戏主循环
    gameLoop() {
        if (!this.moveDown(false)) { // 传递false表示是游戏自动下落，非用户操作
            // 无法下落，固定当前方块
            this.placePiece();
            // 检查行消除
            const clearedLines = this.clearLines();
            if (clearedLines > 0) {
                this.playSound(this.clearSound);
                // 更新分数
                this.updateScore(clearedLines);
            }
            
            // 生成新方块
            this.currentPiece = this.nextPiece;
            this.generateNextPiece();
            
            // 绘制下一个方块预览
            this.drawNextPiece();
            
            // 检查游戏结束
            if (this.checkCollision(0, 0)) {
                console.log("检测到碰撞，游戏结束...");
                this.endGame();
            }
        }
        
        // 重绘游戏面板
        this.draw();
    }
    
    // 生成随机方块
    generatePiece() {
        const randomIndex = Math.floor(Math.random() * this.shapes.length);
        const shape = this.shapes[randomIndex];
        
        return {
            shape: shape,
            color: randomIndex + 1,
            row: 0,
            col: Math.floor((this.cols - shape[0].length) / 2)
        };
    }
    
    // 生成下一个方块
    generateNextPiece() {
        this.nextPiece = this.generatePiece();
        return this.nextPiece;
    }
    
    // 检查碰撞
    checkCollision(rowOffset, colOffset, rotatedShape = null) {
        // 如果当前没有活动方块，则返回false
        if (!this.currentPiece) {
            return false;
        }
        
        const shape = rotatedShape || this.currentPiece.shape;
        const row = this.currentPiece.row + rowOffset;
        const col = this.currentPiece.col + colOffset;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    const newRow = row + r;
                    const newCol = col + c;
                    
                    // 检查边界
                    if (newRow >= this.rows || newCol < 0 || newCol >= this.cols) {
                        return true;
                    }
                    
                    // 检查是否与已有方块重叠（且不是边界外）
                    if (newRow >= 0 && this.board[newRow][newCol] !== 0) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 左移
    moveLeft() {
        if (!this.isPlaying || this.isPaused) return false;
        
        // 先记录当前方块的位置
        const oldPositions = this.getCurrentPiecePositions();
        
        if (!this.checkCollision(0, -1)) {
            // 先清除旧位置的绘制
            this.clearPieceFromBoard(oldPositions);
            
            // 更新方块位置
            this.currentPiece.col--;
            
            this.playSound(this.moveSound);
            this.draw();
            return true;
        }
        return false;
    }
    
    // 右移
    moveRight() {
        if (!this.isPlaying || this.isPaused) return false;
        
        // 先记录当前方块的位置
        const oldPositions = this.getCurrentPiecePositions();
        
        if (!this.checkCollision(0, 1)) {
            // 先清除旧位置的绘制
            this.clearPieceFromBoard(oldPositions);
            
            // 更新方块位置
            this.currentPiece.col++;
            
            this.playSound(this.moveSound);
            this.draw();
            return true;
        }
        return false;
    }
    
    // 下移
    moveDown(isUserAction = false) {
        if (!this.isPlaying || this.isPaused) return false;
        
        // 先记录当前方块的位置
        const oldPositions = this.getCurrentPiecePositions();
        
        if (!this.checkCollision(1, 0)) {
            // 先清除旧位置的绘制
            this.clearPieceFromBoard(oldPositions);
            
            // 更新方块位置
            this.currentPiece.row++;
            
            // 只有用户操作时才播放下落音效
            if (isUserAction) {
                this.playSound(this.dropSound);
            }
            this.draw();
            return true;
        }
        return false;
    }
    
    // 旋转
    rotate() {
        if (!this.isPlaying || this.isPaused) return false;
        
        // 先记录当前方块的位置
        const oldPositions = this.getCurrentPiecePositions();
        
        // 添加日志以便调试
        console.log(getText_7ree('logTryRotate')); // Use getText_7ree
        
        const rotatedShape = this.getRotatedShape();
        
        if (!this.checkCollision(0, 0, rotatedShape)) {
            // 先清除旧位置的绘制
            this.clearPieceFromBoard(oldPositions);
            
            this.currentPiece.shape = rotatedShape;
            this.playSound(this.rotateSound);
            this.draw();
            console.log(getText_7ree('logRotateSuccess')); // Use getText_7ree
            return true;
        }
        
        // 尝试踢墙旋转（贴边时尝试偏移一格再旋转）
        const kickOffsets = [
            [0, 1], [0, -1], [1, 0], [-1, 0], // 右、左、下、上
            [0, 2], [0, -2] // 更远距离尝试
        ];
        
        for (const [rowOffset, colOffset] of kickOffsets) {
            if (!this.checkCollision(rowOffset, colOffset, rotatedShape)) {
                // 先清除旧位置的绘制
                this.clearPieceFromBoard(oldPositions);
                
                this.currentPiece.row += rowOffset;
                this.currentPiece.col += colOffset;
                this.currentPiece.shape = rotatedShape;
                this.playSound(this.rotateSound);
                this.draw();
                console.log(getText_7ree('logKickRotateSuccess')); // Use getText_7ree
                return true;
            }
        }
        
        console.log(getText_7ree('logRotateFail')); // Use getText_7ree
        return false;
    }
    
    // 获取当前方块所在的位置
    getCurrentPiecePositions() {
        if (!this.currentPiece) return [];
        
        const { shape, row, col } = this.currentPiece;
        const positions = [];
        
        // 找出方块占用的所有位置
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    const boardRow = row + r;
                    const boardCol = col + c;
                    
                    if (boardRow >= 0 && boardRow < this.rows && boardCol >= 0 && boardCol < this.cols) {
                        positions.push({
                            row: boardRow,
                            col: boardCol,
                            index: boardRow * this.cols + boardCol
                        });
                    }
                }
            }
        }
        
        // 移动设备上特别处理：找出所有可能有残影的单元格
        if (DeviceHandler_7ree && DeviceHandler_7ree.isMobile()) {
            // 获取所有活动单元格
            const activeCells = this.gameBoardElement.querySelectorAll('.cell_7ree.active_7ree');
            activeCells.forEach(cell => {
                const cellRow = parseInt(cell.dataset.row);
                const cellCol = parseInt(cell.dataset.col);
                const index = cellRow * this.cols + cellCol;
                
                // 如果这个活动单元格不在当前方块的位置列表中，添加它（可能是残影）
                if (!positions.some(pos => pos.index === index)) {
                    positions.push({
                        row: cellRow,
                        col: cellCol,
                        index: index
                    });
                }
            });
        }
        
        return positions;
    }
    
    // 从游戏面板清除指定位置的方块（用于方块移动前）
    clearPieceFromBoard(positions) {
        if (!positions || positions.length === 0) return;
        
        const cells = this.gameBoardElement.querySelectorAll('.cell_7ree');
        
        // 设置透明背景和移除活动样式
        positions.forEach(pos => {
            if (pos.index >= 0 && pos.index < cells.length) {
                const cell = cells[pos.index];
                cell.style.backgroundColor = this.colors[0]; // 透明
                cell.classList.remove('active_7ree');
                
                // 移除所有子元素（移除四角连接线）
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }
            }
        });
    }
    
    // 获取旋转后的形状（顺时针90度）
    getRotatedShape() {
        const shape = this.currentPiece.shape;
        const size = shape.length;
        const rotated = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                rotated[col][size - 1 - row] = shape[row][col];
            }
        }
        
        return rotated;
    }
    
    // 落到底（直接落到底部）
    hardDrop() {
        if (!this.isPlaying || this.isPaused) return;
        
        // 先记录当前方块的位置
        const oldPositions = this.getCurrentPiecePositions();
        
        let dropDistance = 0;
        while (!this.checkCollision(dropDistance + 1, 0)) {
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            // 先清除旧位置的绘制
            this.clearPieceFromBoard(oldPositions);
            
            // 更新位置
        this.currentPiece.row += dropDistance;
        }
        
        // 使用专门的落到底音效
        this.playSound(this.harddropSound);
        
        // 立即放置方块并处理后续逻辑
        this.placePiece(true); // 传递参数表示是落到底，不播放落地音效
        const clearedLines = this.clearLines();
        if (clearedLines > 0) {
            this.playSound(this.clearSound);
            this.updateScore(clearedLines);
        }
        
        // 生成新方块
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        this.drawNextPiece();
        
        if (this.checkCollision(0, 0)) {
            this.endGame();
        }
        
        this.draw();
    }
    
    // 将当前方块固定到游戏面板
    placePiece(skipLandedSound = false) {
        const { shape, row, col, color } = this.currentPiece;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    const boardRow = row + r;
                    const boardCol = col + c;
                    
                    // 确保在有效范围内
                    if (boardRow >= 0 && boardRow < this.rows && boardCol >= 0 && boardCol < this.cols) {
                        this.board[boardRow][boardCol] = color;
                    }
                }
            }
        }
        
        // 播放方块落地固定的音效，除非指定跳过（落到底时已经播放了其他音效）
        if (!skipLandedSound) {
            this.playSound(this.landedSound);
        }
    }
    
    // 清除已填满的行
    clearLines() {
        let linesCleared = 0;
        const rowsToClearIndices = [];
        
        // 1. 找出所有已填满的行
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                rowsToClearIndices.push(row);
                linesCleared++;
            }
        }
        
        // 2. 如果有需要清除的行
        if (linesCleared > 0) {
            // 立即更新统计数据和播放声音/庆祝
            this.lines += linesCleared;
            
            if (linesCleared >= 2) {
                const playComboSound = () => this.playSound('combo');
                if (typeof CelebrationManager_7ree !== 'undefined') {
                    CelebrationManager_7ree.celebrateLines(linesCleared, playComboSound);
                } else {
                    playComboSound();
                }
            } else {
                this.playSound(this.clearSound);
            }
            
            // 立即处理升级逻辑
            if (Math.floor(this.lines / 10) > Math.floor((this.lines - linesCleared) / 10)) {
                this.levelUp(); // levelUp 会处理速度和显示更新
            }
            this.updateScoreDisplay(); // 更新分数、行数、等级显示
            
            // 3. 创建粒子容器（如果不存在）
            let particlesContainer = document.querySelector('.particles-container_7ree');
            if (!particlesContainer) {
                particlesContainer = document.createElement('div');
                particlesContainer.className = 'particles-container_7ree';
                this.gameBoardElement.appendChild(particlesContainer);
            }
            
            // 4. 为每个要消除的行创建特效
            const cells = this.gameBoardElement.querySelectorAll('.cell_7ree');
            
            rowsToClearIndices.forEach((rowIndex, rowArrayIndex) => {
                // 添加水平光束效果
                const beamElement = document.createElement('div');
                beamElement.className = 'beam-horizontal_7ree';
                beamElement.style.top = `${rowIndex * 100 / this.rows}%`;
                beamElement.style.height = `${100 / this.rows}%`;
                beamElement.style.animation = `horizontal-beam_7ree 0.8s ease-out ${rowArrayIndex * 0.1}s forwards`;
                particlesContainer.appendChild(beamElement);
                
                // 为每个单元格添加效果
                for (let col = 0; col < this.cols; col++) {
                    const cellIndex = rowIndex * this.cols + col;
                    if (cells[cellIndex]) {
                        // 添加单元格清除动画类
                        cells[cellIndex].classList.add('line-clearing_7ree');
                        
                        // 获取单元格位置信息用于粒子定位
                        const cellRect = cells[cellIndex].getBoundingClientRect();
                        const gameBoardRect = this.gameBoardElement.getBoundingClientRect();
                        const cellX = cellRect.left + cellRect.width / 2 - gameBoardRect.left;
                        const cellY = cellRect.top + cellRect.height / 2 - gameBoardRect.top;
                        
                        // 添加中心光效
                        const centerGlow = document.createElement('div');
                        centerGlow.className = 'center-glow_7ree';
                        centerGlow.style.left = `${cellX}px`;
                        centerGlow.style.top = `${cellY}px`;
                        centerGlow.style.animation = `center-glow_7ree 0.8s ease-out ${rowArrayIndex * 0.1 + col * 0.02}s forwards`;
                        particlesContainer.appendChild(centerGlow);
                        
                        // 为每个单元格创建多个粒子
                        this.createParticles(particlesContainer, cellX, cellY, 10, rowArrayIndex * 0.1 + col * 0.02);
                    }
                }
            });
            
            // 5. 延迟执行实际的清除和重绘
            setTimeout(() => {
                // 创建一个新board
                const newBoard = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
                let newBoardRow = this.rows - 1;
                for (let oldRow = this.rows - 1; oldRow >= 0; oldRow--) {
                    // 如果当前行不是要清除的行，则复制到新板的对应位置
                    if (!rowsToClearIndices.includes(oldRow)) {
                        newBoard[newBoardRow] = this.board[oldRow];
                        newBoardRow--;
                    }
                }
                this.board = newBoard;
                
                // 移除动画类
                const clearingCells = this.gameBoardElement.querySelectorAll('.line-clearing_7ree');
                clearingCells.forEach(cell => cell.classList.remove('line-clearing_7ree'));
                
                // 重绘游戏面板，让上方的方块掉落
                this.draw(); 
                
                // 清理特效元素（延迟一点，确保动画完成）
                setTimeout(() => {
                    // 移除所有特效元素
                    while (particlesContainer.firstChild) {
                        particlesContainer.removeChild(particlesContainer.firstChild);
                    }
                }, 1000);
                
            }, 1000); // 延迟1秒
        }
        
        // 返回本次清除的行数
        return linesCleared;
    }
    
    // 创建粒子爆炸效果
    createParticles(container, x, y, count, delay) {
        // 增加粒子种类
        const particleColors = ['blue', 'cyan', 'purple', 'white'];
        const particleShapes = ['blue', 'cyan', 'purple', 'white', 'triangle', 'diamond'];
        const animationTypes = ['particle-explosion1_7ree', 'particle-explosion2_7ree', 'particle-explosion3_7ree'];
        
        // 增加粒子数量
        const particleCount = count * 1.5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // 随机确定粒子特性
            const size = Math.random() * 8 + 2; // 2-10px
            // 选择粒子形状
            const shapeType = particleShapes[Math.floor(Math.random() * particleShapes.length)];
            const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
            
            // 随机确定粒子运动方向 - 增加发散距离
            const angle = Math.random() * Math.PI * 2; // 0-2π
            const distance = Math.random() * 100 + 30; // 30-130px
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // 随机旋转和缩放 - 增加不规则性
            const rotate = Math.random() * 360 - 180; // -180° to 180°
            const endScale = Math.random() * 0.5; // 0-0.5
            
            // 设置粒子样式
            particle.className = `particle_7ree particle-${shapeType}_7ree`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // 使用CSS变量传递动画参数
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.setProperty('--rotate', `${rotate}deg`);
            particle.style.setProperty('--scale', `${endScale}`);
            
            // 为特殊形状设置尺寸变量
            if (shapeType === 'triangle' || shapeType === 'diamond') {
                particle.style.setProperty('--size', `${size/2}px`);
            }
            
            // 设置动画，添加一点随机延迟使爆炸效果更自然
            const particleDelay = delay + Math.random() * 0.4;
            const duration = Math.random() * 0.8 + 0.8; // 0.8-1.6s
            particle.style.animation = `${animationType} ${duration}s ease-out ${particleDelay}s forwards`;
            
            // 添加到容器
            container.appendChild(particle);
        }
        
        // 添加一些更小、更快的粒子 - 增强爆炸感
        for (let i = 0; i < particleCount / 2; i++) {
            const sparkle = document.createElement('div');
            const size = Math.random() * 3 + 1; // 1-4px
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50; // 50-200px
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            sparkle.className = 'particle_7ree particle-white_7ree';
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            sparkle.style.setProperty('--tx', `${tx}px`);
            sparkle.style.setProperty('--ty', `${ty}px`);
            sparkle.style.setProperty('--rotate', `${Math.random() * 360}deg`);
            sparkle.style.setProperty('--scale', `0`);
            
            const sparkleDelay = delay + Math.random() * 0.2;
            const duration = Math.random() * 0.4 + 0.4; // 0.4-0.8s - 更快
            sparkle.style.animation = `particle-explosion1_7ree ${duration}s ease-out ${sparkleDelay}s forwards`;
            sparkle.style.opacity = '0.6';
            sparkle.style.filter = 'blur(0.5px)';
            
            container.appendChild(sparkle);
        }
    }
    
    // 升级
    levelUp() {
        this.level++;
        // 使用getSpeedByLevel计算新速度
        const newSpeed = this.getSpeedByLevel(this.level);
        
        // 显示升级庆祝通知
        if (typeof CelebrationManager_7ree !== 'undefined') {
            const playLevelUpSound = () => this.playSound(this.levelupSound);
            CelebrationManager_7ree.celebrateLevelUp(this.level, playLevelUpSound);
        } else {
            // 播放升级音效
            this.playSound(this.levelupSound);
        }
        
        console.log(getText_7ree('logPlayLevelUpSound')); // Use getText_7ree
        
        // 更新当前速度
        if (this.speed !== newSpeed) {
            console.log(getText_7ree('logLevelUpSpeedChange', {level: this.level, speed: this.speed, newSpeed: newSpeed})); // Use getText_7ree with placeholders
            this.speed = newSpeed;
        
        // 更新游戏循环的间隔
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
        }
    }
    
    // 更新分数
    updateScore(linesCleared) {
        // 基础分数：每行5分
        let baseScore = linesCleared * 5;
        
        // 额外奖励分数
        let bonusScore = 0;
        switch (linesCleared) {
            case 2:
                bonusScore = 1;
                break;
            case 3:
                bonusScore = 4;
                break;
            case 4:
                bonusScore = 8;
                break;
        }
        
        this.score += baseScore + bonusScore;
        this.updateScoreDisplay();
    }
    
    // 更新分数显示
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
        
        // 更新移动端显示
        this.mobileScoreElement.textContent = this.score;
        this.mobileLevelElement.textContent = this.level;
        this.mobileLinesElement.textContent = this.lines;
    }
    
    // 更新时间显示
    updateTimeDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timeElement.textContent = timeText;
        this.mobileTimeElement.textContent = timeText;
    }
    
    // 绘制游戏面板
    draw() {
        // --- 幽灵方块处理 ---
        // 检查处理器是否已初始化并调用更新
        if (typeof ghostPieceHandler_7ree !== 'undefined' && ghostPieceHandler_7ree.game) {
            ghostPieceHandler_7ree.updateDisplay();
        }
        // ---------------------
        
        const cells = this.gameBoardElement.querySelectorAll('.cell_7ree');
        
        // 先标记当前活动方块的位置和颜色，避免清除和重绘之间的闪烁
        let activeCellsInfo = []; // 重命名以区分
        if (this.currentPiece) {
            const { shape, row, col, color } = this.currentPiece;
            
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] !== 0) {
                        const boardRow = row + r;
                        const boardCol = col + c;
                        
                        // 确保在有效范围内
                        if (boardRow >= 0 && boardRow < this.rows && boardCol >= 0 && boardCol < this.cols) {
                            activeCellsInfo.push({ // 使用新名称
                                index: boardRow * this.cols + boardCol,
                                color: this.colors[color]
                            });
                        }
                    }
                }
            }
        }
        
        // 创建一个映射，标记哪些单元格是活动的
        const activeIndices = new Set(activeCellsInfo.map(cell => cell.index)); // 使用新名称
        
        // 一次性处理所有单元格，避免闪烁
        cells.forEach((cell, index) => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // --- 检查是否为幽灵单元格 ---
            const isGhost = cell.classList.contains('ghost_cell_7ree');
            
            // 如果是活动方块的一部分
            if (activeIndices.has(index)) {
                // 如果同时也是幽灵单元格，活动方块优先，移除 return
                // if (isGhost) return; 
                
                // 确保移除幽灵样式，让活动样式优先
                if (isGhost) {
                    cell.classList.remove('ghost_cell_7ree');
                }
                
                const activeCell = activeCellsInfo.find(ac => ac.index === index); // 使用新名称
                cell.style.backgroundColor = activeCell.color;
                cell.classList.add('active_7ree');
                cell.classList.remove('landed_7ree');
                
                // 添加四个span元素作为四角连接线
                cell.innerHTML = '';
                for (let i = 0; i < 4; i++) {
                    const span = document.createElement('span');
                    cell.appendChild(span);
                }
            }
            // 如果是已落地的方块
            else if (this.board[row][col] !== 0) {
                 // 如果同时也是幽灵单元格，幽灵样式优先
                if (isGhost) return; 
                
                cell.style.backgroundColor = '#777'; // 灰色
                cell.classList.add('landed_7ree');
                cell.classList.remove('active_7ree');
                
                // 移除所有子元素（移除四角连接线）
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }
            }
            // 空白单元格
            else {
                // 如果是幽灵单元格，样式已由CSS处理，无需额外操作
                if (isGhost) return;
                
                cell.style.backgroundColor = this.colors[0]; // 透明
                cell.classList.remove('active_7ree');
                cell.classList.remove('landed_7ree');
                
                // 移除所有子元素（移除四角连接线）
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }
            }
        });
        
        // 绘制下一个方块预览 (这个逻辑不需要改动)
        this.drawNextPiece();
    }
    
    // 绘制下一个方块预览
    drawNextPiece() {
        const previewCells = this.nextPieceElement.querySelectorAll('.preview_cell_7ree');
        
        // 清空预览区域
        previewCells.forEach(cell => {
            cell.style.backgroundColor = 'transparent';
            cell.classList.remove('active_preview_7ree'); 
            
            // 移除所有子元素（移除四角连接线）
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
        });
        
        if (this.nextPiece) {
            const { shape, color } = this.nextPiece;

            // 计算偏移量以居中方块
            let offsetRow = Math.floor((4 - shape.length) / 2);
            const offsetCol = Math.floor((4 - shape[0].length) / 2);
            
            // 特殊调整：对于 3x3 的形状 (J, L, S, T, Z)，向下移动一行以改善视觉居中
            if (shape.length === 3) {
                offsetRow += 1;
            }
            
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] !== 0) {
                        const previewRow = offsetRow + r;
                        const previewCol = offsetCol + c;
                        
                        // 确保在 4x4 网格内
                        if (previewRow >= 0 && previewRow < 4 && previewCol >= 0 && previewCol < 4) {
                            const cellIndex = previewRow * 4 + previewCol;
                        if (previewCells[cellIndex]) { 
                           previewCells[cellIndex].style.backgroundColor = this.colors[color];
                           previewCells[cellIndex].classList.add('active_preview_7ree'); 
                               
                               // 添加四个span元素作为四角连接线
                               previewCells[cellIndex].innerHTML = '';
                               for (let i = 0; i < 4; i++) {
                                   const span = document.createElement('span');
                                   previewCells[cellIndex].appendChild(span);
                               }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 暂停/继续游戏
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? getText_7ree('logGamePaused') : getText_7ree('logGameResumed')); // Use getText_7ree
        
        if (this.isPaused) {
            // 暂停游戏
            clearInterval(this.gameInterval);
            clearInterval(this.timeInterval);
            
            // 显示暂停卡片
            if (this.pauseCardElement) {
                this.pauseCardElement.style.display = 'flex';
            }
            
            // 暂停背景音乐
            if (typeof SoundManager_7ree !== 'undefined' && !SoundManager_7ree.isMuted) {
                console.log(getText_7ree('logPauseBGM')); // Use getText_7ree
                SoundManager_7ree.stopBgm();
            }
            
            // 更新按钮显示
            if (this.pauseButton) {
                this.pauseButton.textContent = '▶️';
            }
        } else {
            // 继续游戏
            this.gameInterval = setInterval(() => this.gameLoop(), this.getSpeedByLevel(this.level));
            this.timeInterval = setInterval(() => {
                this.gameTime++;
                this.updateTimeDisplay();
            }, 1000);
            
            // 隐藏暂停卡片
            if (this.pauseCardElement) {
                this.pauseCardElement.style.display = 'none';
            }
            
            // 继续背景音乐 - 只在非静音状态才恢复
            if (typeof SoundManager_7ree !== 'undefined' && !SoundManager_7ree.isMuted) {
                console.log(getText_7ree('logResumeBGM')); // Use getText_7ree
                // 使用短延迟确保游戏状态更新后再播放音乐
                setTimeout(() => {
                    SoundManager_7ree.playBgmDirect();
                }, 100);
            }
            
            // 更新按钮显示
            if (this.pauseButton) {
                this.pauseButton.textContent = '⏸️';
            }
        }
    }
    
    // 切换音效
    toggleSound() {
        this.isSoundOn = !this.isSoundOn;
        this.soundButton.textContent = this.isSoundOn ? '🔊' : '🔇'; // 声音开/关图标
        
        // 保存到本地存储
        localStorage.setItem('tetris_sound_on_7ree', this.isSoundOn);
        
        // 与SoundManager_7ree同步
        if (typeof SoundManager_7ree !== 'undefined') {
            // 检查状态是否需要同步
            const shouldBeMuted = !this.isSoundOn;
            if (SoundManager_7ree.isMuted !== shouldBeMuted) {
                console.log(getText_7ree('logSyncSoundStateToggle') + this.isSoundOn + ", SoundManager.isMuted=" + SoundManager_7ree.isMuted + " -> " + shouldBeMuted); // Use getText_7ree
                
                // 直接设置SoundManager的isMuted属性
                SoundManager_7ree.isMuted = shouldBeMuted;
                
                // 保存到本地存储
                localStorage.setItem('tetris_muted_7ree', shouldBeMuted);
                
                // 更新声音管理器的UI
                if (typeof SoundManager_7ree.updateButtonIcon === 'function') {
                    SoundManager_7ree.updateButtonIcon();
                }
                
                // 根据新状态控制BGM
                if (shouldBeMuted) {
                    if (typeof SoundManager_7ree.stopBgm === 'function') {
                        SoundManager_7ree.stopBgm();
                    }
                } else if (this.isPlaying && !this.isPaused) {
                    if (typeof SoundManager_7ree.playBgmDirect === 'function') {
                        SoundManager_7ree.playBgmDirect();
                    }
                }
            }
        }
    }
    
    // 确保在游戏结束后BGM停止
    forceStopBGM() {
        // 使用多种方式尝试停止BGM
        if (typeof SoundManager_7ree !== 'undefined') {
            console.log(getText_7ree('logForceStopBGM')); // Use getText_7ree
            // 1. 使用标准方法
            SoundManager_7ree.stopBgm();
            
            // 2. 如果仍有BGM，直接操作BGM对象
            if (SoundManager_7ree.currentBgm) {
                console.log(getText_7ree('logBGMStillPlaying')); // Use getText_7ree
                try {
                    if (typeof SoundManager_7ree.currentBgm.pause === 'function') {
                        SoundManager_7ree.currentBgm.pause();
                        SoundManager_7ree.currentBgm.currentTime = 0;
                    }
                } catch (e) {
                    console.error(getText_7ree('logDirectBGMError'), e); // Use getText_7ree
                }
                
                // 强制清除引用
                SoundManager_7ree.currentBgm = null;
            }
            
            // 3. 尝试暂停AudioContext
            if (SoundManager_7ree.audioContext && SoundManager_7ree.audioContext.state === 'running') {
                try {
                    console.log(getText_7ree('logTryPauseAudioContext')); // Use getText_7ree
                    SoundManager_7ree.audioContext.suspend().then(() => {
                        console.log(getText_7ree('logPauseAudioContextSuccess')); // Use getText_7ree
                    }).catch(e => {
                        console.error(getText_7ree('logPauseAudioContextFail'), e); // Use getText_7ree
                    });
                } catch (e) {
                    console.error(getText_7ree('logPauseAudioContextError'), e); // Use getText_7ree
                }
            }
        }
    }
    
    // 游戏结束
    endGame() {
        console.log(getText_7ree('logEndGameStart')); // Use getText_7ree
        this.isPlaying = false;
        this.gameEnded = true;
        clearInterval(this.gameInterval);
        clearInterval(this.timeInterval);
        
        // 播放游戏结束音效
        this.playSound(this.gameoverSound);
        
        // 停止背景音乐
        this.forceStopBGM();
        
        this.startButton.textContent = '▶️'; // 变回开始图标
        this.pauseButton.disabled = true;
        this.pauseButton.textContent = '⏸️'; // 保持暂停图标
        
        // 更新结算卡片上的统计数据
        document.getElementById('final_score_7ree').textContent = this.score;
        document.getElementById('final_lines_7ree').textContent = this.lines;
        document.getElementById('final_level_7ree').textContent = this.level;
        
        // 格式化时间显示
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('final_time_7ree').textContent = timeText;
        
        // 更新难度显示
        if (typeof DifficultyManager_7ree !== 'undefined') {
            const difficultyName = DifficultyManager_7ree.getCurrentDifficultyDisplayName();
            document.getElementById('final_difficulty_7ree').textContent = difficultyName;
        } else {
            document.getElementById('final_difficulty_7ree').textContent = getText_7ree('unknown'); // Use getText_7ree
        }
        
        // 显示结算卡片
        const gameoverCard = document.getElementById('gameover_card_7ree');
        if (gameoverCard) {
            gameoverCard.style.display = 'flex';
            
            // 添加"重新开始"按钮事件
            const restartButton = document.getElementById('restart_game_btn_7ree');
            if (restartButton) {
                // 移除旧的事件监听器（避免重复）
                const newRestartButton = restartButton.cloneNode(true);
                restartButton.parentNode.replaceChild(newRestartButton, restartButton);
                
                // 添加新的事件监听器
                newRestartButton.addEventListener('click', () => {
                    // 隐藏结算卡片
                    gameoverCard.style.display = 'none';
                    
                    // 重新开始游戏
                    this.startGame();
                });
            }
            
            // 添加"重选难度"按钮事件
            const changeDifficultyButton = document.getElementById('change_difficulty_btn_7ree');
            if (changeDifficultyButton) {
                // 移除旧的事件监听器
                const newChangeDifficultyButton = changeDifficultyButton.cloneNode(true);
                changeDifficultyButton.parentNode.replaceChild(newChangeDifficultyButton, changeDifficultyButton);
                
                // 添加新的事件监听器 - 点击刷新页面
                newChangeDifficultyButton.addEventListener('click', () => {
                    location.reload();
                });
            }
        } else {
            // 如果找不到结算卡片元素，仍然显示传统的弹窗
            alert(getText_7ree('alertGameOverStats', {score: this.score, lines: this.lines, level: this.level})); // Use getText_7ree with placeholders
        }
    }
    
    // --- 新增：切换幽灵方块功能 ---
    toggleGhostPiece() {
        this.isGhostPieceEnabled = !this.isGhostPieceEnabled;
        console.log(getText_7ree('logToggleGhostState') + this.isGhostPieceEnabled); // Use getText_7ree
        localStorage.setItem('tetris_ghost_on_7ree', this.isGhostPieceEnabled);
        this.updateGhostButtonVisuals();
        
        // 立即更新幽灵方块显示
        if (typeof ghostPieceHandler_7ree !== 'undefined' && ghostPieceHandler_7ree.game) {
             ghostPieceHandler_7ree.updateDisplay();
        }
    }
    
    // --- 新增：更新幽灵按钮视觉效果 ---
    updateGhostButtonVisuals() {
        if (this.ghostToggleButton) {
             if (this.isGhostPieceEnabled) {
                 this.ghostToggleButton.textContent = '🔍'; // 设置为"开"的图标
                 this.ghostToggleButton.setAttribute('data-tooltip', getText_7ree('tooltipGhostOn')); // Use getText_7ree
             } else {
                 this.ghostToggleButton.textContent = '🔍︎'; // 设置为"关"的图标 (带变体选择符)
                 this.ghostToggleButton.setAttribute('data-tooltip', getText_7ree('tooltipGhostOff')); // Use getText_7ree
             }
        }
    }

    // --- 新增：显示帮助卡片 ---
    showHelpCard() {
        if (this.helpCardElement) {
            this.helpCardElement.classList.add('show_7ree');
            // 可选：暂停游戏
            if (this.isPlaying && !this.isPaused) {
                 this.togglePause();
            }
        }
    }

    // --- 新增：隐藏帮助卡片 ---
    hideHelpCard() {
        if (this.helpCardElement) {
            this.helpCardElement.classList.remove('show_7ree');
            // 可选：如果游戏因打开帮助卡片而暂停，则恢复游戏
            // 但要注意，如果游戏本来就暂停，隐藏帮助卡片不应该恢复游戏
            // 更安全的做法是只在打开帮助卡片时记录游戏状态，并在关闭时恢复
            // 目前简单处理：如果游戏是isPlaying状态且当前是暂停，则恢复
            if (this.isPlaying && this.isPaused) {
                 // 确保暂停卡片隐藏
                 if (this.pauseCardElement && this.pauseCardElement.classList.contains('show_7ree')) {
                     // 如果暂停卡片可见，说明游戏是手动暂停的，不自动恢复
                 } else {
                     // 否则，认为是打开帮助卡片导致的暂停，恢复游戏
                     this.togglePause();
                 }
            }
        }
    }
}

// 等待DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log(getText_7ree('logDOMLoadedInit')); // Use getText_7ree
    
    // 初始化声音管理器（优先，为游戏提供声音状态）
    if (typeof SoundManager_7ree !== 'undefined' && !SoundManager_7ree.isInitialized) {
        console.log(getText_7ree('logInitSoundManager')); // Use getText_7ree
        SoundManager_7ree.init();
    } else if (typeof SoundManager_7ree === 'undefined') {
        console.error(getText_7ree('errorSoundManagerUndefined')); // Use getText_7ree
    }
    
    // 初始化难度管理器
    if (typeof DifficultyManager_7ree !== 'undefined') {
        console.log(getText_7ree('logInitDifficultyManager')); // Use getText_7ree
        DifficultyManager_7ree.init();
    } else {
        console.warn(getText_7ree('warnDifficultyManagerUndefined')); // Use getText_7ree
    }
    
    // 初始化游戏实例
    console.log(getText_7ree('logInitGameInstance')); // Use getText_7ree
    const game = new TetrisGame_7ree();
    window.tetrisGame_7ree = game; // 将游戏实例暴露到全局，方便调试或其他模块访问
    
    // 不自动开始游戏，等待欢迎页面的开始按钮点击
    console.log(getText_7ree('logGameInitializedWaitWelcome')); // Use getText_7ree
    
    // 派发一个自定义事件，表明游戏已初始化（如果其他模块需要知道）
    // 这个事件现在也会被 ghost_piece_7ree.js 监听
    document.dispatchEvent(new CustomEvent('tetrisGameInitialized', {
        detail: { gameInstance: game }
    }));
}); 