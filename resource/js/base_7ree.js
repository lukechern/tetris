// 基础工具函数和通用功能

// 处理不同设备的功能
const DeviceHandler_7ree = {
    isMobile: function() {
        return window.innerWidth < 768;
    },
    
    setupEventListeners: function() {
        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    handleResize: function() {
        // 检测是否在移动/PC视图之间转换，可能需要调整界面
        const wasMobile = this.wasMobile;
        this.wasMobile = this.isMobile();
        
        if (wasMobile !== this.wasMobile) {
            // 视图模式已更改，触发重新布局
            document.dispatchEvent(new CustomEvent('viewModeChanged', {
                detail: { isMobile: this.wasMobile }
            }));
        }
    },
    
    init: function() {
        this.wasMobile = this.isMobile();
        this.setupEventListeners();
    }
};

// 通用工具函数
const Utils_7ree = {
    // 格式化时间为 MM:SS 格式
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 生成随机整数 (min <= n <= max)
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 深拷贝对象
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // 加载资源并返回Promise
    loadResource: function(src, type = 'image') {
        return new Promise((resolve, reject) => {
            if (type === 'image') {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            } else if (type === 'audio') {
                const audio = new Audio();
                audio.oncanplaythrough = () => resolve(audio);
                audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
                audio.src = src;
            } else {
                reject(new Error(`Unsupported resource type: ${type}`));
            }
        });
    }
};

// 加载字体 (如果使用了自定义字体)
function loadFonts_7ree() {
    if ("fonts" in document) {
        const font = new FontFace(
            'Press Start 2P', 
            'url(resource/fonts/PressStart2P.woff2) format("woff2")'
        );
        
        font.load().then(function(loadedFont) {
            document.fonts.add(loadedFont);
            document.body.classList.add('fonts-loaded');
        }).catch(function(error) {
            console.error(getText_7ree('fontLoadError'), error);
        });
    }
}

// 检测浏览器兼容性
function checkBrowserCompatibility_7ree() {
    const issues = [];
    
    // 检查ES6特性
    try {
        new Function('() => {}')();
    } catch (e) {
        issues.push(getText_7ree('compatArrowFunc'));
    }
    
    // 检查requestAnimationFrame
    if (!window.requestAnimationFrame) {
        issues.push(getText_7ree('compatRAF'));
    }
    
    // 检查Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
        issues.push(getText_7ree('compatWebAudio'));
    }
    
    return {
        isCompatible: issues.length === 0,
        issues: issues
    };
}

// 添加浏览器前缀
function addVendorPrefix_7ree(obj, prop, value) {
    const prefixes = ['', 'webkit', 'moz', 'ms', 'o'];
    prefixes.forEach(prefix => {
        const p = prefix ? prefix + prop[0].toUpperCase() + prop.slice(1) : prop;
        obj[p] = value;
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查浏览器兼容性
    const compatibility = checkBrowserCompatibility_7ree();
    if (!compatibility.isCompatible) {
        console.warn(getText_7ree('compatIssueTitle'), compatibility.issues);
    }
    
    // 加载自定义字体
    loadFonts_7ree();
    
    // 初始化设备处理器
    DeviceHandler_7ree.init();
    
    // 防止移动设备上的触摸事件导致页面滚动
    document.addEventListener('touchmove', function(e) {
        if (e.target.classList.contains('btn_7ree') || 
            e.target.closest('#game_board_7ree')) {
            e.preventDefault();
        }
    }, { passive: false });
});

// --- 新增：处理欢迎卡片 Enter 键快捷方式 ---
document.addEventListener('keydown', function(event) {
    const welcomeCard = document.getElementById('welcome_card_7ree');
    const startButton = document.getElementById('welcome_start_btn_7ree');

    // 检查按键是否为 Enter，欢迎卡片是否存在且可见，并且开始按钮存在
    if (event.key === 'Enter' && welcomeCard && startButton && getComputedStyle(welcomeCard).display !== 'none') {
        event.preventDefault(); // 阻止可能的默认行为
        console.log(getText_7ree('logEnterWelcome'));
        startButton.click(); // 触发开始按钮的点击事件
    }
});

// --- 新增：处理暂停卡片 Enter 键快捷方式 ---
document.addEventListener('keydown', function(event) {
    const pauseCard = document.getElementById('pause_card_7ree');
    const resumeButton = document.getElementById('resume_game_btn_7ree');

    // 检查按键是否为 Enter，暂停卡片是否存在且可见，并且继续按钮存在
    if (event.key === 'Enter' && pauseCard && resumeButton && getComputedStyle(pauseCard).display !== 'none') {
        event.preventDefault(); // 阻止可能的默认行为
        console.log(getText_7ree('logEnterPause'));
        resumeButton.click(); // 触发继续按钮的点击事件
    }
});

// --- 新增：处理游戏结束卡片 Enter 键快捷方式 (再来一次) ---
document.addEventListener('keydown', function(event) {
    const gameoverCard = document.getElementById('gameover_card_7ree');
    const restartButton = document.getElementById('restart_game_btn_7ree');

    // 检查按键是否为 Enter，游戏结束卡片是否存在且可见，并且重新开始按钮存在
    if (event.key === 'Enter' && gameoverCard && restartButton && getComputedStyle(gameoverCard).display !== 'none') {
        event.preventDefault(); // 阻止可能的默认行为
        console.log(getText_7ree('logEnterGameover'));
        restartButton.click(); // 触发重新开始按钮的点击事件
    }
});
