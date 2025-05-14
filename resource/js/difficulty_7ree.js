/**
 * 难度管理器 - 管理游戏难度相关的功能
 */
const DifficultyManager_7ree = {
    // 当前难度设置
    currentDifficulty: 'normal',
    
    // 当前配置
    settings: null,
    
    // 难度名称映射（用于显示）
    difficultyNames: {
        'easy': '菜鸟难度',
        'normal': '老手难度',
        'hard': '专家难度',
        'expert': '大师难度'
    },
    
    /**
     * 初始化难度管理器
     */
    init: function() {
        // 从本地存储加载难度设置
        const savedDifficulty = localStorage.getItem('tetris_difficulty_7ree');
        if (savedDifficulty) {
            this.currentDifficulty = savedDifficulty;
        }
        
        // 加载难度设置
        this.loadDifficultySettings();
        
        // 更新UI上的难度显示
        this.updateDifficultyDisplay();
        
        // 监听select元素变化
        this.setupSelectChangeListener();
        
        console.log("[DifficultyManager] 初始化完成，当前难度：" + this.currentDifficulty);
    },
    
    /**
     * 设置下拉框变更监听器
     */
    setupSelectChangeListener: function() {
        const difficultySelect = document.getElementById('difficulty_select_7ree');
        if (difficultySelect) {
            console.log("[DifficultyManager Debug] 设置难度选择器事件监听器");
            
            // 初始设置select的值属性，用于伪元素显示
            difficultySelect.setAttribute('value', this.currentDifficulty);
            // 确保select的实际值与当前难度一致
            difficultySelect.value = this.currentDifficulty;
            
            // 先移除可能已存在的事件监听器（避免重复）
            const newDiffSelect = difficultySelect.cloneNode(true);
            difficultySelect.parentNode.replaceChild(newDiffSelect, difficultySelect);
            
            // 为新的select元素添加事件监听器
            newDiffSelect.addEventListener('change', (event) => {
                const newDifficulty = event.target.value;
                console.log("[DifficultyManager Debug] 难度选择改变:", newDifficulty);
                
                // 设置select元素的value属性，以便CSS伪元素能够显示正确的文本
                newDiffSelect.setAttribute('value', newDifficulty);
                
                // 确保下拉框值与选择一致
                setTimeout(() => {
                    newDiffSelect.value = newDifficulty;
                    console.log("[DifficultyManager] 下拉框值已更新为: " + newDifficulty);
                }, 50);
                
                // 更新难度设置
                this.setDifficulty(newDifficulty);
            });
        } else {
            console.error("[DifficultyManager Debug] 无法找到难度选择器元素");
        }
    },
    
    /**
     * 更新UI上的难度显示
     */
    updateDifficultyDisplay: function() {
        const displayName = this.getCurrentDifficultyDisplayName();
        const text = getText_7ree('displayDifficulty', { difficulty: displayName });
        
        const pcDisplay = document.getElementById('difficulty_value_pc');
        const mobileDisplay = document.getElementById('difficulty_value_mobile');
        const finalDisplay = document.getElementById('final_difficulty_7ree');
        
        if (pcDisplay) pcDisplay.textContent = text;
        if (mobileDisplay) mobileDisplay.textContent = displayName;
        if (finalDisplay) finalDisplay.textContent = displayName;
        
        // 更新欢迎界面 select 的 data-text (如果存在)
        const selectorContainer = document.querySelector('.difficulty_selector_7ree');
        if (selectorContainer) {
            selectorContainer.dataset.text = displayName;
        }
        
        // 同时更新欢迎界面 select 的 value (如果存在)
        const difficultySelect = document.getElementById('difficulty_select_7ree');
        if (difficultySelect) {
            difficultySelect.value = this.currentDifficulty;
            difficultySelect.setAttribute('value', this.currentDifficulty);
        }
        
        console.log(getText_7ree('logDiffManagerInit', { difficulty: displayName }));
        console.log(getText_7ree('logDiffInitialStack', { layers: this.getInitialStackLayers() }));
        console.log(getText_7ree('logDiffSpeedFactor', { factor: this.getSpeedFactor() }));
    },
    
    /**
     * 加载难度设置
     */
    loadDifficultySettings: function() {
        const hardcodedDefaults_7ree = { // 硬编码的最终后备默认值
            defaultSpeed: 1000,
            initialStackLayers: 0,
            speedFactor: 0.9
        };

        let effectiveBaseSettings_7ree = { ...hardcodedDefaults_7ree };

        if (typeof config !== 'undefined' && config.difficulty) {
            // 使用 config.difficulty 中的顶层默认值（如果存在）
            if (config.difficulty.defaultSpeed !== undefined) {
                effectiveBaseSettings_7ree.defaultSpeed = config.difficulty.defaultSpeed;
            }
            if (config.difficulty.initialStackLayers !== undefined) {
                effectiveBaseSettings_7ree.initialStackLayers = config.difficulty.initialStackLayers;
            }
            if (config.difficulty.speedFactor !== undefined) {
                effectiveBaseSettings_7ree.speedFactor = config.difficulty.speedFactor;
            }
            console.log("[DifficultyManager] Applied top-level defaults from config_system_7ree.js:", effectiveBaseSettings_7ree);
        } else {
            console.error("[DifficultyManager] 系统配置文件 config_system_7ree.js 中的 'config.difficulty' 未找到。将使用硬编码的默认基础设置。");
        }

        let presetSpecificSettings_7ree = {};
        if (typeof config !== 'undefined' && config.difficulty && config.difficulty.presets && config.difficulty.presets[this.currentDifficulty]) {
            presetSpecificSettings_7ree = config.difficulty.presets[this.currentDifficulty];
            console.log(`[DifficultyManager] 已加载难度预设 '${this.currentDifficulty}':`, presetSpecificSettings_7ree);
        } else {
            console.warn(`[DifficultyManager] 未找到难度预设 '${this.currentDifficulty}'。难度设置可能不准确，将仅依赖基础设置和用户设置。`);
        }

        let userSpecificSettings_7ree = {};
        if (typeof user_config !== 'undefined' && user_config.difficulty && Object.keys(user_config.difficulty).length > 0) {
            // 检查用户配置中是否有针对当前难度的特定设置，或者全局的用户难度设置
            if (user_config.difficulty[this.currentDifficulty]) {
                 userSpecificSettings_7ree = user_config.difficulty[this.currentDifficulty];
                 console.log(getText_7ree('logDiffLoadUserSpecificPreset', { difficulty: this.currentDifficulty }), userSpecificSettings_7ree);
            } else {
                // 如果没有针对特定难度的用户配置，则检查是否有全局的用户难度设置（例如直接在 user_config.difficulty 下的 defaultSpeed）
                // 但要小心，不要意外地把所有用户预设都合并进来
                const globalUserSettings = {};
                if (user_config.difficulty.defaultSpeed !== undefined) globalUserSettings.defaultSpeed = user_config.difficulty.defaultSpeed;
                if (user_config.difficulty.initialStackLayers !== undefined) globalUserSettings.initialStackLayers = user_config.difficulty.initialStackLayers;
                if (user_config.difficulty.speedFactor !== undefined) globalUserSettings.speedFactor = user_config.difficulty.speedFactor;

                if (Object.keys(globalUserSettings).length > 0) {
                    userSpecificSettings_7ree = globalUserSettings;
                    console.log(getText_7ree('logDiffLoadUserGlobal'), userSpecificSettings_7ree);
                } else {
                     console.log(getText_7ree('logDiffLoadUserNoSpecific', { difficulty: this.currentDifficulty }));
                }
            }
        } else {
            console.log(getText_7ree('logDiffLoadUserNone'));
        }

        // 合并设置：以基础设置为起点，然后叠加上预设特定设置，最后叠加上用户特定设置。
        this.settings = { 
            ...effectiveBaseSettings_7ree, 
            ...presetSpecificSettings_7ree, 
            ...userSpecificSettings_7ree 
        };
        
        console.log(getText_7ree('logDiffManagerLoaded'), this.settings);
    },
    
    /**
     * 设置难度级别
     * @param {string} difficulty - 难度级别名称 ('easy', 'normal', 'hard', 'expert')
     */
    setDifficulty: function(difficulty) {
        // 验证难度级别是否有效
        if (typeof config !== 'undefined' && 
            config.difficulty && 
            config.difficulty.presets && 
            config.difficulty.presets[difficulty]) {
            
            // 检查难度是否真的改变了
            if (this.currentDifficulty === difficulty) {
                console.log("[DifficultyManager] 难度未改变，无需操作");
                return false; // 难度未变，返回false
            }
            
            const previousDifficulty = this.currentDifficulty;
            this.currentDifficulty = difficulty;
            this.loadDifficultySettings();
            
            // 保存到本地存储
            localStorage.setItem('tetris_difficulty_7ree', difficulty);
            
            // 更新UI显示
            this.updateDifficultyDisplay();
            
            // 如果游戏实例存在且正在进行中，才询问是否重置
            if (typeof window.tetrisGame_7ree !== 'undefined' && window.tetrisGame_7ree.isPlaying) {
                console.log("[DifficultyManager] 游戏进行中，检测到难度更改...");
                if (window.confirm(getText_7ree('confirmDifficultyChange', { oldDifficulty: this.difficultyNames[previousDifficulty], newDifficulty: this.difficultyNames[this.currentDifficulty] }))) {
                    console.log(getText_7ree('logUserConfirmRestart'));
                    // 重置游戏并应用新设置
                    window.tetrisGame_7ree.resetGameWithDifficulty(this.settings);
                } else {
                    console.log(getText_7ree('logUserCancelRestart'));
                    // 用户不立即重开，恢复之前的难度设置（避免显示与实际不符）
                    this.currentDifficulty = previousDifficulty;
                    this.loadDifficultySettings();
                    localStorage.setItem('tetris_difficulty_7ree', this.currentDifficulty);
                    this.updateDifficultyDisplay(); // 恢复UI显示
                    return false; // 操作被用户取消
                }
            } else {
                 console.log(getText_7ree('logDiffGameNotPlaying'));
                 // 如果游戏未开始，不需要执行重置，startGame时会处理
            }
            
            console.log(getText_7ree('logDiffSetSuccess', { difficulty: difficulty }));
            return true;
        } else {
            console.error(getText_7ree('errorInvalidDifficulty', { difficulty: difficulty }));
            return false;
        }
    },
    
    /**
     * 获取当前速度因子
     * @returns {number} 速度因子
     */
    getSpeedFactor: function() {
        return this.settings.speedFactor;
    },
    
    /**
     * 获取默认下落速度
     * @returns {number} 默认下落速度（毫秒）
     */
    getDefaultSpeed: function() {
        return this.settings.defaultSpeed;
    },
    
    /**
     * 获取初始叠加方块层数
     * @returns {number} 初始叠加方块层数
     */
    getInitialStackLayers: function() {
        return this.settings.initialStackLayers;
    },
    
    /**
     * 根据等级计算下落速度
     * @param {number} level - 当前游戏等级
     * @returns {number} 计算后的下落速度（毫秒）
     */
    calculateSpeedByLevel: function(level) {
        // 使用指数减速，每升一级减少按speedFactor比例
        return Math.floor(this.settings.defaultSpeed * Math.pow(this.settings.speedFactor, level - 1));
    },
    
    /**
     * 创建初始叠加方块
     * @param {object} gameBoard - 游戏面板二维数组
     * @param {number} cols - 游戏面板列数
     * @param {number} rows - 游戏面板行数
     * @returns {object} 修改后的游戏面板
     */
    createInitialStack: function(gameBoard, cols, rows) {
        const layers = this.settings.initialStackLayers;
        
        // 如果没有初始叠加层，直接返回原面板
        if (layers <= 0) {
            return gameBoard;
        }
        
        // 创建指定层数的初始方块
        for (let layer = 0; layer < layers; layer++) {
            const rowIndex = rows - 1 - layer;
            if (rowIndex < 0) break; // 防止溢出
            
            // 根据难度层级创建不同的方块分布
            let emptySpaces = 0; // 跟踪当前行的空位数量
            
            // 预先计算每行至少需要的空位数
            let minEmptySpaces;
            switch (this.currentDifficulty) {
                case 'expert':
                    minEmptySpaces = Math.max(3, Math.floor(cols * 0.3)); // 至少3个空位或30%的列数
                    break;
                case 'hard':
                    minEmptySpaces = Math.max(2, Math.floor(cols * 0.2)); // 至少2个空位或20%的列数
                    break;
                default:
                    minEmptySpaces = Math.max(1, Math.floor(cols * 0.1)); // 至少1个空位或10%的列数
            }
            
            // 为每行创建方块
            for (let col = 0; col < cols; col++) {
                // 随机决定是否放置方块，难度越高空隙越多(更不规则的形状)
                let emptyThreshold;
                switch (this.currentDifficulty) {
                    case 'expert':
                        emptyThreshold = 0.4; // 40%的空隙
                        break;
                    case 'hard':
                        emptyThreshold = 0.3; // 30%的空隙
                        break;
                    default:
                        emptyThreshold = 0.2; // 20%的空隙
                }
                
                // 如果已经接近行尾，且尚未创建足够的空位，强制创建空位
                if (col >= cols - (minEmptySpaces - emptySpaces) && emptySpaces < minEmptySpaces) {
                    // 不放方块，留空
                    emptySpaces++;
                    continue;
                }
                
                if (Math.random() < emptyThreshold) {
                    // 留空
                    emptySpaces++;
                } else {
                    // 放置一个随机颜色的方块
                    const colorIndex = Math.floor(Math.random() * 7) + 1; // 1-7之间的随机颜色
                    gameBoard[rowIndex][col] = colorIndex;
                }
            }
            
            // 如果整行都满了，强制添加随机空位
            if (emptySpaces === 0) {
                console.log(getText_7ree('logDiffRandomGap'));
                for (let i = 0; i < minEmptySpaces; i++) {
                    const randomCol = Math.floor(Math.random() * cols);
                    gameBoard[rowIndex][randomCol] = 0; // 清空随机位置
                }
            }
        }
        
        return gameBoard;
    },
    
    /**
     * 获取所有可用的难度预设
     * @returns {object} 难度预设对象
     */
    getAvailablePresets: function() {
        if (typeof config !== 'undefined' && config.difficulty && config.difficulty.presets) {
            return config.difficulty.presets;
        }
        return {
            easy: { defaultSpeed: 1200, initialStackLayers: 0, speedFactor: 0.95 },
            normal: { defaultSpeed: 1000, initialStackLayers: 0, speedFactor: 0.9 },
            hard: { defaultSpeed: 800, initialStackLayers: 3, speedFactor: 0.85 },
            expert: { defaultSpeed: 600, initialStackLayers: 5, speedFactor: 0.8 }
        };
    },
    
    /**
     * 获取当前难度名称
     * @returns {string} 当前难度名称
     */
    getCurrentDifficultyName: function() {
        return this.currentDifficulty;
    },
    
    /**
     * 获取当前难度的显示名称（中文）
     * @returns {string} 当前难度的显示名称
     */
    getCurrentDifficultyDisplayName: function() {
        switch(this.currentDifficulty) {
            case 'easy': return getText_7ree('diffEasy');
            case 'normal': return getText_7ree('diffNormal');
            case 'hard': return getText_7ree('diffHard');
            case 'expert': return getText_7ree('diffExpert');
            default: return this.currentDifficulty;
        }
    }
};

// 文档加载完成后自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // DifficultyManager_7ree.init(); // Initialization moved to tetris_7ree.js
}); 