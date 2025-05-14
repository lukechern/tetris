// PC端特定功能和处理

// PC 键盘操作处理器
const PCKeyboardHandler_7ree = {
    // 键盘按键映射
    keyMap: {
        'ArrowLeft': 'moveLeft',  // 左移
        'ArrowRight': 'moveRight', // 右移
        'ArrowDown': 'moveDown',   // 下移
        'ArrowUp': 'rotate',       // 旋转
        ' ': 'hardDrop',           // 落到底
        'Space': 'hardDrop',       // 落到底（兼容性）
        'KeyP': 'togglePause',     // 暂停/继续
        'Escape': 'togglePause',   // 暂停/继续
        'KeyR': 'restart',         // 重新开始
        'KeyM': 'toggleSound',      // 切换声音
        'KeyF': 'toggleGhostPiece' // 新增：切换辅助瞄准 (F)
    },
    
    // 游戏实例引用
    game: null,
    
    // 初始化键盘事件监听
    init: function(gameInstance) {
        this.game = gameInstance;
        
        // 仅监听特殊按键，不干扰主游戏操作
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 确保向上键等基本操作正常工作
        console.log(getText_7ree('logPCKeyboardInit'));
    },
    
    // 处理键盘按下事件
    handleKeyDown: function(event) {
        // 如果设备是移动端，则不处理键盘事件
        if (DeviceHandler_7ree.isMobile()) return;
        
        const action = this.keyMap[event.code];
        
        // 防止空格键等特殊按键导致页面滚动
        if (action) {
            event.preventDefault();
        } else {
            return; // 不是我们关心的按键
        }
        
        // 主要游戏操作（方向键和空格）由主游戏类处理
        // 这里只处理辅助功能键
        switch (action) {
            case 'togglePause':
                if (this.game.isPlaying) {
                    this.game.togglePause();
                    this.game.triggerButtonFeedback(this.game.pauseButton);
                }
                break;
            case 'restart':
                this.game.startGame();
                this.game.triggerButtonFeedback(this.game.startButton);
                break;
            case 'toggleSound':
                this.game.toggleSound();
                this.game.triggerButtonFeedback(this.game.soundButton);
                break;
            case 'toggleGhostPiece':
                this.game.toggleGhostPiece();
                this.game.triggerButtonFeedback(this.game.ghostToggleButton);
                break;
            // 不再处理主要游戏操作，避免冲突
        }
    }
};

// PC端游戏增强功能
const PCGameEnhancer_7ree = {
    game: null,
    
    init: function(gameInstance) {
        this.game = gameInstance;
        
        // 注册视图模式变化事件监听器
        document.addEventListener('viewModeChanged', this.handleViewModeChanged.bind(this));
        
        // 如果不是移动端，则应用PC增强功能
        if (!DeviceHandler_7ree.isMobile()) {
            this.applyPCEnhancements();
        }
    },
    
    // 处理视图模式变化
    handleViewModeChanged: function(event) {
        if (!event.detail.isMobile) {
            // 从移动端切换到PC端
            this.applyPCEnhancements();
        } else {
            // 从PC端切换到移动端
            this.removePCEnhancements();
        }
    },
    
    // 应用PC端增强功能
    applyPCEnhancements: function() {
        // 应用PC风格到用户操作按钮容器
        const userControls = document.querySelector('.user_controls_7ree');
        if (userControls) {
            userControls.classList.add('pc_style_controls_7ree');
        }
        
        // 显示主控制按钮
        const mainControls = document.querySelector('.main_controls_7ree');
        if (mainControls) {
            mainControls.style.display = 'flex';
        }

        // 适应PC布局
        this.adjustForPCLayout();
    },
    
    // 移除PC端增强功能（当切换到移动端时）
    removePCEnhancements: function() {
        // 移除用户操作按钮的PC风格
        const userControls = document.querySelector('.user_controls_7ree');
        if (userControls) {
            userControls.classList.remove('pc_style_controls_7ree');
        }
        
        // 隐藏主控制按钮 (移动端CSS会处理，但以防万一)
        const mainControls = document.querySelector('.main_controls_7ree');
        if (mainControls) {
            mainControls.style.display = 'none';
        }
    },
    
    // 适应PC布局
    adjustForPCLayout: function() {
        // 可以添加更多特定于PC的UI调整
    }
};

// 页面加载后初始化PC特定功能
document.addEventListener('DOMContentLoaded', function() {
    // 使用事件监听器等待游戏实例创建
    document.addEventListener('tetrisGameInitialized', function(e) {
        if (!DeviceHandler_7ree.isMobile()) {
            // 初始化PC特定处理器
            PCKeyboardHandler_7ree.init(e.detail.gameInstance);
            PCGameEnhancer_7ree.init(e.detail.gameInstance);
        }
    });
});
