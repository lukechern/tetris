/**
 * 游戏工具函数 - 扩展 base_7ree.js 中定义的 Utils_7ree
 */

// 重写console.log方法，根据配置控制是否输出
(function() {
    // 保存原始的console.log方法
    const originalConsoleLog = console.log;
    
    // 重写console.log
    console.log = function() {
        // 检查配置是否允许输出日志
        if (typeof config !== 'undefined' && 
            config.debug && 
            config.debug.console_log === false) {
            // 如果配置为false，不输出任何日志
            return;
        }
        
        // 否则使用原始方法输出日志
        originalConsoleLog.apply(console, arguments);
    };
    
    // 同样处理console.warn和console.error，但这些通常应该始终显示
    const originalConsoleWarn = console.warn;
    console.warn = function() {
        // 即使禁用了普通日志，也允许警告显示（可选，取消注释以禁用警告）
        /*
        if (typeof config !== 'undefined' && 
            config.debug && 
            config.debug.console_log === false) {
            return;
        }
        */
        originalConsoleWarn.apply(console, arguments);
    };
    
    const originalConsoleError = console.error;
    console.error = function() {
        // 即使禁用了普通日志，也允许错误显示（可选，取消注释以禁用错误）
        /*
        if (typeof config !== 'undefined' && 
            config.debug && 
            config.debug.console_log === false) {
            return;
        }
        */
        originalConsoleError.apply(console, arguments);
    };
})();

/**
 * 游戏工具函数 - 扩展 base_7ree.js 中定义的 Utils_7ree
 */

// 扩展 Utils_7ree 对象，添加新方法
if (typeof Utils_7ree !== 'undefined') {
    // 添加音频设置相关方法
    Utils_7ree.resetAudioSettings = function() {
        try {
            // 清除音频相关的本地存储项
            localStorage.removeItem('tetris_muted_7ree');
            localStorage.removeItem('tetris_sound_on_7ree');
            
            console.log("[Utils] 已清除本地存储的音频设置，将在下次加载时使用配置默认值");
            
            // 获取配置默认值（如果有）
            const hasConfig = (typeof config !== 'undefined' && typeof config.audio !== 'undefined');
            const configDefaultOn = hasConfig ? config.audio.defaultOn : true;
            console.log("[Utils] 音频配置默认值: " + (hasConfig ? (configDefaultOn ? "开启" : "关闭") : "未找到配置，默认开启"));
            
            return true;
        } catch (e) {
            console.error("[Utils] 清除音频设置失败:", e);
            return false;
        }
    };
    
    /**
     * 重新加载页面，用于应用设置更改
     */
    Utils_7ree.reloadPage = function() {
        window.location.reload();
    };
    
    /**
     * 重置音频设置并重新加载页面
     */
    Utils_7ree.resetAudioAndReload = function() {
        if (this.resetAudioSettings()) {
            setTimeout(() => this.reloadPage(), 500);
        }
    };

    // 在控制台中暴露这些方法，便于调试
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.log("调试工具已加载。可以使用以下命令重置音频设置：");
        console.log("Utils_7ree.resetAudioSettings() - 重置音频设置");
        console.log("Utils_7ree.resetAudioAndReload() - 重置音频设置并重新加载页面");
    }
} else {
    console.error("[Utils] 错误：Utils_7ree 对象未定义，请确保先加载 base_7ree.js");
} 