// 移动端特定功能和处理

// 移动端触摸操作处理器
const MobileTouchHandler_7ree = {
    // 游戏实例引用
    game: null,
    
    // 长按间隔（毫秒）
    longPressInterval: 100,
    
    // 长按定时器
    longPressTimers: {},
    
    // 初始化触摸事件
    init: function(gameInstance) {
        this.game = gameInstance;
        this.setupTouchControls();
        
        // 增强移动端渲染性能
        this.optimizeMobileRendering();
    },
    
    // 设置触摸控制
    setupTouchControls: function() {
        // 方向按钮的触摸控制
        const leftBtn = document.getElementById('left_btn_7ree');
        const rightBtn = document.getElementById('right_btn_7ree');
        const downBtn = document.getElementById('down_btn_7ree');
        
        // 旋转和落到底按钮
        const rotateBtn = document.getElementById('rotate_btn_7ree');
        const dropBtn = document.getElementById('drop_btn_7ree');
        
        // --- 修改单次点击按钮的事件监听 ---
        const setupSingleTapButton = (button, actionFn) => {
            if (!button) return;
            
            // 移除可能已存在的事件监听器，避免重复绑定
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            newButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newButton.classList.add('btn_active_7ree'); // 添加激活样式
                if (this.game.isPlaying && !this.game.isPaused) {
                    actionFn(); // 保持touchstart时触发动作
                }
            }, { passive: false });

            const removeActiveClass = (e) => {
                 e.preventDefault();
                 // 延迟移除激活样式，让效果更明显
                 setTimeout(() => {
                    newButton.classList.remove('btn_active_7ree'); 
                 }, 250); // 延迟增加到250毫秒
            };
            
            newButton.addEventListener('touchend', removeActiveClass);
            newButton.addEventListener('touchcancel', removeActiveClass);
            
            return newButton;
        };

        // 使用setupSingleTapButton为旋转和落到底按钮添加事件处理
        setupSingleTapButton(rotateBtn, () => this.game.rotate());
        setupSingleTapButton(dropBtn, () => this.game.hardDrop());

        // 为方向按钮添加长按支持 (修改setupLongPress内部)
        this.setupLongPress(leftBtn, 'moveLeft');
        this.setupLongPress(rightBtn, 'moveRight');
        this.setupLongPress(downBtn, 'moveDown');
        
        // 游戏控制按钮 (开始/暂停/声音)
        const startBtn = document.getElementById('start_btn_7ree');
        const pauseBtn = document.getElementById('pause_btn_7ree');
        const soundBtn = document.getElementById('sound_btn_7ree'); // 获取声音按钮
        const ghostToggleBtn = document.getElementById('ghost_toggle_btn_7ree'); // 获取幽灵方块开关按钮
        const helpBtn = document.getElementById('help_btn_7ree'); // 获取帮助按钮
        
        // --- 使用 setupSingleTapButton 为主要控制按钮添加视觉反馈 ---
        // Start/Reset Button
        setupSingleTapButton(startBtn, () => {
            // 游戏已经由欢迎页面开始，这里仅处理重新开始
            this.game.startGame();
        });

        // Pause/Resume Button
        setupSingleTapButton(pauseBtn, () => {
            this.game.togglePause();
        });

        // Sound Button
        setupSingleTapButton(soundBtn, () => {
            if (this.game && typeof this.game.toggleSound === 'function') {
                this.game.toggleSound();
            }
        });
        
        // Ghost Toggle Button
        setupSingleTapButton(ghostToggleBtn, () => {
            if (this.game && typeof this.game.toggleGhostPiece === 'function') {
                this.game.toggleGhostPiece();
            }
        });
        
        // Help Button
        setupSingleTapButton(helpBtn, () => {
            if (this.game && typeof this.game.showHelpCard === 'function') {
                this.game.showHelpCard();
            }
        });
        
        // 添加手势滑动控制（可选）
        this.setupSwipeControls();
    },
    
    // 优化移动端渲染性能
    optimizeMobileRendering: function() {
        if (!this.game) return;
        
        // 增强移动端渲染性能，覆盖默认的clearPieceFromBoard方法
        const originalClearPieceFromBoard = this.game.clearPieceFromBoard;
        
        this.game.clearPieceFromBoard = function(positions) {
            if (!positions || positions.length === 0) return;
            
            const cells = this.gameBoardElement.querySelectorAll('.cell_7ree');
            
            // 设置透明背景和移除活动样式，移动端特殊优化处理
            positions.forEach(pos => {
                if (pos.index >= 0 && pos.index < cells.length) {
                    const cell = cells[pos.index];
                    
                    // 立即完全清除单元格，避免残影
                    if (!cell.classList.contains('landed_7ree')) {
                        // 先移除所有子元素（连接线）
                        while (cell.firstChild) {
                            cell.removeChild(cell.firstChild);
                        }
                        
                        // 彻底重置单元格状态
                        cell.classList.remove('active_7ree');
                        cell.removeAttribute('style');  // 移除所有内联样式
                        cell.style.backgroundColor = this.colors[0]; // 设置透明背景
                    }
                }
            });
        };
        
        // 优化draw方法的性能，但不使用requestAnimationFrame以避免残影
        const originalDraw = this.game.draw;
        this.game.draw = function() {
            // 直接调用原始方法，不延迟渲染
            originalDraw.call(this);
        };
        
        console.log(getText_7ree('logMobileRenderOptimized'));
    },
    
    // 设置长按控制
    setupLongPress: function(element, action) {
        if (!element) return;
        
        // 移除可能已存在的事件监听器，避免重复绑定
        const newElement = element.cloneNode(true);
        if (element.parentNode) {
            element.parentNode.replaceChild(newElement, element);
        }
        
        // 触摸开始
        newElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            newElement.classList.add('btn_active_7ree'); // 添加激活样式
            
            // 立即执行一次动作
            this.executeAction(action);
            
            // 设置长按重复执行
            this.longPressTimers[action] = setInterval(() => {
                this.executeAction(action);
            }, this.longPressInterval);
        }, { passive: false });
        
        // 触摸结束或取消时清除定时器并延迟移除样式
        const endTouch = (e) => {
            e.preventDefault();
            // 延迟移除激活样式
            setTimeout(() => {
                newElement.classList.remove('btn_active_7ree');
            }, 250); // 延迟增加到250毫秒
            
            if (this.longPressTimers[action]) {
                clearInterval(this.longPressTimers[action]);
                this.longPressTimers[action] = null;
            }
        };
        
        newElement.addEventListener('touchend', endTouch);
        newElement.addEventListener('touchcancel', endTouch);
        
        // 触摸移出元素区域时也清除 (立即清除，无需延迟)
        newElement.addEventListener('touchleave', (e) => {
            e.preventDefault();
            newElement.classList.remove('btn_active_7ree');
            if (this.longPressTimers[action]) {
                clearInterval(this.longPressTimers[action]);
                this.longPressTimers[action] = null;
            }
        });
        
        return newElement;
    },
    
    // 执行游戏动作
    executeAction: function(action) {
        if (!this.game.isPlaying || this.game.isPaused) return;
        
        switch (action) {
            case 'moveLeft':
                this.game.moveLeft();
                break;
            case 'moveRight':
                this.game.moveRight();
                break;
            case 'moveDown':
                this.game.moveDown();
                break;
        }
    },
    
    // 设置滑动控制（可选功能）
    setupSwipeControls: function() {
        const gameBoard = document.getElementById('game_board_7ree');
        if (!gameBoard) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30; // 最小滑动距离，小于这个距离不触发
        
        gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (!this.game.isPlaying || this.game.isPaused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 确定是水平滑动还是垂直滑动
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) >= minSwipeDistance) {
                    if (deltaX > 0) {
                        // 向右滑动
                        this.game.moveRight();
                    } else {
                        // 向左滑动
                        this.game.moveLeft();
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) >= minSwipeDistance) {
                    if (deltaY > 0) {
                        // 向下滑动
                        this.game.moveDown();
                    } else {
                        // 向上滑动 - 旋转
                        this.game.rotate();
                    }
                } else {
                    // 轻点 - 旋转
                    this.game.rotate();
                }
            }
        });
    }
};

// 移动端游戏界面增强器
const MobileUIEnhancer_7ree = {
    game: null,
    
    init: function(gameInstance) {
        this.game = gameInstance;
        
        // 注册视图模式变化事件监听器
        document.addEventListener('viewModeChanged', this.handleViewModeChanged.bind(this));
        
        // 监听窗口大小变化，动态调整布局
        window.addEventListener('resize', this.adjustLayoutForScreenSize.bind(this));
        
        // 如果是移动端，则应用移动端增强功能
        if (DeviceHandler_7ree.isMobile()) {
            this.applyMobileEnhancements();
        }
        
        // 初始调整一次
        setTimeout(() => this.adjustLayoutForScreenSize(), 100);
    },
    
    // 处理视图模式变化
    handleViewModeChanged: function(event) {
        if (event.detail.isMobile) {
            // PC端切换到移动端
            this.applyMobileEnhancements();
        } else {
            // 移动端切换到PC端
            this.removeMobileEnhancements();
        }
    },
    
    // 应用移动端增强功能
    applyMobileEnhancements: function() {
        // 显示移动控制按钮
        const mobileControls = document.querySelector('.mobile_controls_7ree');
        if (mobileControls) {
            mobileControls.style.display = 'flex';
        }
        
        // 显示移动端标题和数据区
        const mobileTitle = document.querySelector('.mobile_title_7ree');
        const mobileStats = document.querySelector('.mobile_stats_7ree');
        
        if (mobileTitle) mobileTitle.style.display = 'block';
        if (mobileStats) mobileStats.style.display = 'flex';
        
        // 隐藏左侧状态栏
        const sidebarLeft = document.querySelector('.sidebar_left_7ree');
        if (sidebarLeft) {
            sidebarLeft.style.display = 'none';
        }
        
        // 调整游戏面板的布局
        this.adjustGameBoardForMobile();
        this.adjustLayoutForScreenSize();
        
        // 添加移动端振动反馈
        this.setupVibrationFeedback();
    },
    
    // 移除移动端增强功能
    removeMobileEnhancements: function() {
        // 隐藏移动控制按钮
        const mobileControls = document.querySelector('.mobile_controls_7ree');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
        
        // 隐藏移动端标题和数据区
        const mobileTitle = document.querySelector('.mobile_title_7ree');
        const mobileStats = document.querySelector('.mobile_stats_7ree');
        
        if (mobileTitle) mobileTitle.style.display = 'none';
        if (mobileStats) mobileStats.style.display = 'none';
        
        // 显示左侧状态栏
        const sidebarLeft = document.querySelector('.sidebar_left_7ree');
        if (sidebarLeft) {
            sidebarLeft.style.display = 'flex';
        }
    },
    
    // 调整游戏面板布局以适应移动端
    adjustGameBoardForMobile: function() {
        const gameBoard = document.getElementById('game_board_7ree');
        if (!gameBoard) return;
        
        // 调整游戏面板到合适的大小
        const container = document.querySelector('.container_7ree');
        const windowWidth = window.innerWidth;
        // 减少边距计算，增加硬上限
        const maxWidth = Math.min(windowWidth - 10, 400);
        
        gameBoard.style.maxWidth = `${maxWidth}px`;
        
        // 确保下一个方块预览区在合适的位置
        const nextPiece = document.getElementById('next_piece_7ree');
        if (nextPiece) {
            nextPiece.style.width = '80px'; // 保持预览大小或按比例调整
            nextPiece.style.height = '80px';
        }
    },
    
    // 设置振动反馈
    setupVibrationFeedback: function() {
        // 检查是否支持振动API
        if ('vibrate' in navigator) {
            // 保存原始方法引用
            const originalRotate = this.game.rotate;
            const originalHardDrop = this.game.hardDrop;
            const originalClearLines = this.game.clearLines;
            const game = this.game; // 保存游戏引用，避免this指向问题
            
            // 旋转时短振动
            this.game.rotate = function() {
                const result = originalRotate.apply(this, arguments);
                if (result) {
                    navigator.vibrate(20);
                    // 确保旋转声音播放
                    if (typeof this.playSound === 'function') {
                        this.playSound(this.rotateSound);
                    }
                }
                return result;
            };
            
            // 落到底时中等振动
            this.game.hardDrop = function() {
                const result = originalHardDrop.apply(this, arguments);
                navigator.vibrate(40);
                // 确保落到底声音播放
                if (typeof this.playSound === 'function') {
                    this.playSound(this.dropSound);
                }
                return result;
            };
            
            // 消除行时根据消除的行数振动
            this.game.clearLines = function() {
                const linesCleared = originalClearLines.apply(this, arguments);
                if (linesCleared > 0) {
                    navigator.vibrate(linesCleared * 30);
                    // 确保消除行声音播放
                    if (typeof this.playSound === 'function' && linesCleared > 0) {
                        this.playSound(this.clearSound);
                    }
                }
                return linesCleared;
            };
            
            console.log(getText_7ree('logMobileVibrateSet'));
        } else {
            console.log(getText_7ree('logMobileVibrateNotSupported'));
        }
    },
    
    // 根据屏幕大小调整整体布局
    adjustLayoutForScreenSize: function() {
        if (!DeviceHandler_7ree.isMobile()) return;
        
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const container = document.querySelector('.container_7ree');
        const gameBoard = document.getElementById('game_board_7ree');
        const mobileTitle = document.querySelector('.mobile_title_7ree');
        const mobileStats = document.querySelector('.mobile_stats_7ree');
        const controlsArea = document.querySelector('.controls_7ree');
        const mobileControls = document.querySelector('.mobile_controls_7ree');
        
        // 计算可用高度
        let availableHeight = windowHeight;
        
        if (container) {
            // 减去容器内边距
            availableHeight -= parseInt(getComputedStyle(container).paddingTop);
            availableHeight -= parseInt(getComputedStyle(container).paddingBottom);
        }
        
        if (mobileTitle) {
            // 减去标题高度
            availableHeight -= mobileTitle.offsetHeight;
        }
        
        if (mobileStats) {
            // 减去统计区域高度
            availableHeight -= mobileStats.offsetHeight;
        }
        
        if (controlsArea) {
            // 减去控制区域高度
            availableHeight -= controlsArea.offsetHeight;
        }
        
        if (mobileControls) {
            // 减去移动控制区域高度
            availableHeight -= mobileControls.offsetHeight;
        }
        
        // 减去安全边距
        availableHeight -= 20;
        
        // 计算游戏面板的最佳高度
        if (gameBoard) {
            // 计算宽度限制 - 减少边距计算
            const maxWidth = Math.min(windowWidth - 10, windowHeight / 2); // 调整边距
            const aspectRatio = 10 / 20; // 列/行 (注意: 原始是11列，确认是否是10或11)
            
            // 根据宽高比计算高度
            let boardHeight = maxWidth / aspectRatio;
            
            // 确保高度不超过可用高度
            if (boardHeight > availableHeight) {
                boardHeight = availableHeight;
                // 根据高度反算宽度
                const boardWidth = boardHeight * aspectRatio;
                gameBoard.style.width = `${boardWidth}px`;
            } else {
                gameBoard.style.width = `${maxWidth}px`;
            }
            
            // 确保高度也不超过CSS的最大高度限制 (vh单位)
            // gameBoard.style.height = `${boardHeight}px`; // 由CSS的max-height控制更好
            gameBoard.style.height = 'auto'; // 让CSS的max-height和aspect-ratio生效

        }
        
        // 调整控制按钮大小
        this.adjustButtonSizeForMobile();
    },
    
    // 调整按钮大小以适应移动屏幕
    adjustButtonSizeForMobile: function() {
        const windowWidth = window.innerWidth;
        const dirButtons = document.querySelectorAll('.direction_controls_7ree .btn_7ree');
        const actionButtons = document.querySelectorAll('.action_controls_7ree .btn_7ree');
        
        // 计算按钮大小
        const buttonSize = Math.min(45, windowWidth / 8);
        
        // 设置方向按钮大小
        dirButtons.forEach(button => {
            button.style.width = `${buttonSize}px`;
            button.style.height = `${buttonSize}px`;
            button.style.fontSize = `${buttonSize / 2.5}px`;
        });
        
        // 设置操作按钮大小
        actionButtons.forEach(button => {
            button.style.fontSize = `${Math.max(12, buttonSize / 3)}px`;
            button.style.padding = `${Math.max(5, buttonSize / 8)}px`;
        });
    }
};

// 页面加载后初始化移动端特定功能
document.addEventListener('DOMContentLoaded', function() {
    // 使用事件监听器等待游戏实例创建
    document.addEventListener('tetrisGameInitialized', function(e) {
        if (DeviceHandler_7ree.isMobile()) {
            // 初始化移动端处理器
            MobileTouchHandler_7ree.init(e.detail.gameInstance);
            MobileUIEnhancer_7ree.init(e.detail.gameInstance);
        }
    });
});
