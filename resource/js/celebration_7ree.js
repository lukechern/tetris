/**
 * 游戏庆祝通知模块
 * 用于在特定游戏事件时显示庆祝动画和提示
 */

const CelebrationManager_7ree = {
    container: null,
    textElement: null,
    iconElement: null,
    timeoutId: null,
    isInitialized: false,
    testMode: false, // 测试模式标志
    
    /**
     * 初始化庆祝通知模块
     */
    init: function() {
        if (this.isInitialized) return;
        
        // 获取预设的庆祝元素
        this.container = document.querySelector('.celebration_7ree');
        
        if (!this.container) {
            console.error("[庆祝] 未找到预设的庆祝容器元素");
            return;
        }
        
        // 创建内部元素
        this.iconElement = document.createElement('div');
        this.iconElement.className = 'thumb_icon_7ree';
        this.iconElement.textContent = '👍';
        
        this.textElement = document.createElement('div');
        this.textElement.className = 'celebration_text_7ree';
        
        // 组装DOM结构
        this.container.appendChild(this.iconElement);
        this.container.appendChild(this.textElement);
        
        // 检查全局配置中的测试模式设置
        if (typeof config !== 'undefined' && 
            config.debug && 
            config.debug.celebration_test === true) {
            this.enableTestMode();
            console.log("[庆祝] 根据全局配置启用了测试模式");
        }
        
        this.isInitialized = true;
        console.log("[庆祝] 庆祝通知模块已初始化");
    },
    
    /**
     * 显示庆祝通知
     * @param {string} text - 显示的文本
     * @param {string} type - 通知类型 ('line2', 'line3', 'line4', 'levelUp')
     * @param {Function} soundCallback - 播放音效的回调函数
     */
    show: function(text, type, soundCallback) {
        if (!this.isInitialized) this.init();
        
        if (!this.container) {
            console.error("[庆祝] 庆祝容器未初始化");
            return;
        }
        
        // 如果有正在显示的通知，清除它
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.hide();
        }
        
        // 设置文本
        this.textElement.textContent = text;
        
        // 根据类型设置样式
        this.container.classList.remove('multi_line_7ree', 'level_up_7ree');
        
        if (type === 'levelUp') {
            this.container.classList.add('level_up_7ree');
        } else if (type === 'line3' || type === 'line4') {
            this.container.classList.add('multi_line_7ree');
        }
        
        // 显示通知
        setTimeout(() => {
            this.container.classList.add('show_7ree');
            
            // 播放音效
            if (typeof soundCallback === 'function') {
                soundCallback();
            }
            
            // 非测试模式时，4秒后隐藏
            if (!this.testMode) {
                this.timeoutId = setTimeout(() => {
                    this.hide();
                }, 4000);
            } else {
                console.log("[庆祝测试] 测试模式已启用，通知不会自动消失");
            }
        }, 10);
    },
    
    /**
     * 隐藏庆祝通知
     */
    hide: function() {
        if (!this.isInitialized || !this.container) return;
        
        this.container.classList.remove('show_7ree');
        this.timeoutId = null;
    },
    
    /**
     * 启用测试模式
     */
    enableTestMode: function() {
        this.testMode = true;
        console.log("[庆祝测试] 测试模式已启用，通知将不会自动消失");
        
        // 立即显示测试通知
        setTimeout(() => {
            this.show("测试通知 - 测试模式已启用", "line4");
        }, 1000);
    },
    
    /**
     * 禁用测试模式
     */
    disableTestMode: function() {
        this.testMode = false;
        console.log("[庆祝测试] 测试模式已禁用");
        this.hide();
    },
    
    /**
     * 显示消除行的庆祝通知
     * @param {number} lines - 消除的行数
     * @param {Function} soundCallback - 播放音效的回调函数
     */
    celebrateLines: function(lines, soundCallback) {
        if (lines < 2) return; // 只庆祝2行及以上
        
        let text = '';
        let type = '';
        
        switch(lines) {
            case 2:
                text = '消两行';
                type = 'line2';
                break;
            case 3:
                text = '消三行';
                type = 'line3';
                break;
            case 4:
                text = '消四行';
                type = 'line4';
                break;
            default:
                text = `消除${lines}行`;
                type = 'line4';
        }
        
        // 使用旧的显示方法，确保大拇指特效显示
        this.show(text, type, soundCallback);
        
        // 这里不再调用 showCelebrationMessage 方法，因为它使用不同的动画效果
    },
    
    /**
     * 显示升级的庆祝通知
     * @param {number} level - 新的等级
     * @param {Function} soundCallback - 播放音效的回调函数
     */
    celebrateLevelUp: function(level, soundCallback) {
        this.show(`恭喜过关`, 'levelUp', soundCallback);
    },

    // 显示庆祝信息
    showCelebrationMessage(linesCleared, message) {
        const celebrationElement = document.querySelector('.celebration_7ree');
        if (!celebrationElement) return;
        
        // 清除旧的动画类
        celebrationElement.classList.remove('fade-in-out_7ree');
        void celebrationElement.offsetWidth; // 强制重绘以重启动画
        
        // 构建消息内容
        let lineText = getText_7ree('celebrateLines', { lines: linesCleared }); // Use getText_7ree
        let mainMessage = message;
        if (!message) { // 如果没有传入特定消息，根据行数选择
            switch (linesCleared) {
                case 2: mainMessage = getText_7ree('celebrateImpressive'); break; // Use getText_7ree
                case 3: mainMessage = getText_7ree('celebrateAwesome'); break; // Use getText_7ree
                case 4: mainMessage = getText_7ree('celebrateUnbelievable'); break; // Use getText_7ree
                default: mainMessage = ''; // 单行不显示额外消息
            }
        }
        
        // 设置文本内容
        celebrationElement.innerHTML = `<span>${lineText}</span>` + (mainMessage ? `<br><span>${mainMessage}</span>` : '');
        
        // 添加动画类
        celebrationElement.classList.add('fade-in-out_7ree');
        
        // 可以在这里添加额外的动画效果或声音
    },
    
    // 庆祝等级提升
    celebrateLevelUp(level, callback) {
         const celebrationElement = document.querySelector('.celebration_7ree');
        if (!celebrationElement) return;
        
        // 清除旧的动画类
        celebrationElement.classList.remove('fade-in-out_7ree');
        void celebrationElement.offsetWidth; // 强制重绘
        
        // 设置文本内容
        celebrationElement.innerHTML = `<span>${getText_7ree('celebrateLevelUp')}</span><br><span>${getText_7ree('celebrateLevelNum', { level: level })}</span>`; // Use getText_7ree
        
        // 添加动画类
        celebrationElement.classList.add('fade-in-out_7ree');
        
        // 执行回调（例如播放音效）
        if (typeof callback === 'function') {
            // 稍微延迟回调以匹配动画
            setTimeout(callback, 100);
        }
    }
};

// 文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    CelebrationManager_7ree.init();
    
    // 添加控制台命令，方便开发人员使用
    window.testCelebration = function(type) {
        switch(type) {
            case 'line2':
                CelebrationManager_7ree.celebrateLines(2);
                break;
            case 'line3':
                CelebrationManager_7ree.celebrateLines(3);
                break;
            case 'line4':
                CelebrationManager_7ree.celebrateLines(4);
                break;
            case 'level':
                CelebrationManager_7ree.celebrateLevelUp(2);
                break;
            case 'test':
                CelebrationManager_7ree.enableTestMode();
                break;
            case 'hide':
                CelebrationManager_7ree.hide();
                break;
            default:
                console.log("可用的测试类型: line2, line3, line4, level, test, hide");
        }
    };
}); 