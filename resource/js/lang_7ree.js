const lang_7ree = {
    "en": {
        // TODO: Add English translations later
    },
    "zh": {
        // base_7ree.js
        "fontLoadError": "字体加载失败:",
        "compatArrowFunc": "浏览器不支持箭头函数（ES6）。请升级您的浏览器。",
        "compatRAF": "浏览器不支持requestAnimationFrame。游戏可能无法流畅运行。",
        "compatWebAudio": "浏览器不支持Web Audio API。游戏可能没有声音。",
        "compatIssueTitle": "浏览器兼容性问题:",
        "logEnterWelcome": "[Base] Enter key pressed on visible welcome card. Clicking start button.",
        "logEnterPause": "[Base] Enter key pressed on visible pause card. Clicking resume button.",
        "logEnterGameover": "[Base] Enter key pressed on visible gameover card. Clicking restart button.",
        
        // tetris_7ree.js
        "logColorSource": "[游戏] 方块颜色来源: ",
        "configProfile": "配置文件",
        "defaultValue": "默认值",
        "logConfigSoundDefault": "[游戏] 配置默认声音状态 (用户 > 系统 > 默认): ",
        "enabled": "开启",
        "disabled": "关闭",
        "logInitSoundState": "[游戏] 初始化声音状态: ",
        "logLoadSoundStateLocal": "[游戏] 从本地存储加载声音状态 (覆盖配置): ",
        "logUseSoundManagerState": "[游戏] 使用声音管理器状态: ",
        "logSyncSoundStateInit": "[游戏初始化] 同步声音状态：游戏isSoundOn=",
        "logConfigGhostDefault": "[游戏] 配置默认幽灵方块状态 (用户 > 系统 > 默认): ",
        "logLoadGhostStateLocal": "[游戏] 从本地存储加载幽灵方块状态 (覆盖配置): ",
        "logUnknownSoundType": "[Sound] 未知的音效类型:",
        "logInvalidSoundElement": "[Sound] 无效的音效元素",
        "logSoundPlayFail": "[Sound] 音效播放失败:",
        "logSoundPlayError": "[Sound] 音效播放异常:",
        "logTryRotate": "尝试旋转方块",
        "logRotateSuccess": "旋转成功",
        "logKickRotateSuccess": "踢墙旋转成功",
        "logRotateFail": "无法旋转方块",
        "logPlayLevelUpSound": "[游戏] 播放升级音效",
        "logLevelUpSpeedChange": "[游戏] 等级提升到{level}，速度从{speed}ms更新为{newSpeed}ms",
        "logGamePaused": "[游戏] 暂停游戏",
        "logGameResumed": "[游戏] 恢复游戏",
        "logPauseBGM": "[游戏] 暂停背景音乐",
        "logResumeBGM": "[游戏] 恢复背景音乐",
        "logSyncSoundStateToggle": "[游戏] 同步声音状态：游戏isSoundOn=",
        "logForceStopBGM": "强制停止BGM...",
        "logBGMStillPlaying": "BGM仍在播放，尝试直接操作...",
        "logDirectBGMError": "直接操作BGM失败:",
        "logTryPauseAudioContext": "尝试暂停AudioContext...",
        "logPauseAudioContextSuccess": "AudioContext暂停成功",
        "logPauseAudioContextFail": "AudioContext暂停失败:",
        "logPauseAudioContextError": "尝试暂停AudioContext出错:",
        "logEndGameStart": "游戏结束函数开始执行...",
        "unknown": "未知",
        "alertGameOverStats": "游戏结束！\n最终分数：{score}\n总行数：{lines}\n最终等级：{level}",
        "logDOMLoadedInit": "DOM加载完成，初始化Tetris游戏组件",
        "logInitSoundManager": "初始化声音管理器...",
        "errorSoundManagerUndefined": "SoundManager_7ree is not defined. Make sure sound_7ree.js is loaded correctly.",
        "logInitDifficultyManager": "初始化难度管理器...",
        "warnDifficultyManagerUndefined": "DifficultyManager_7ree is not defined. Using default difficulty settings.",
        "logInitGameInstance": "初始化游戏实例...",
        "logGameInitializedWaitWelcome": "Tetris Game Initialized, waiting for welcome screen interaction",
        "logToggleGhostState": "[游戏] 切换幽灵方块状态为: ",
        "tooltipGhostOn": "辅助瞄准 开 / 关 (当前: 开)",
        "tooltipGhostOff": "辅助瞄准 开 / 关 (当前: 关)",

        // pc_7ree.js
        "logPCKeyboardInit": "PC键盘处理器初始化完成",

        // mo_7ree.js
        "logMobileRenderOptimized": "[Mobile] 已应用移动端渲染优化",
        "logMobileVibrateSet": "[Mobile] 振动反馈已设置",
        "logMobileVibrateNotSupported": "[Mobile] 设备不支持振动API",

        // difficulty_7ree.js
        "logDiffLoadUser": "难度配置加载: 优先使用用户配置",
        "logDiffLoadSystem": "难度配置加载: 使用系统配置",
        "logDiffLoadDefault": "难度配置加载: 无法加载用户或系统配置, 使用默认值",
        "logDiffSetDifficulty": "设置难度为: {difficulty}",
        "warnDiffPresetNotFound": "难度 '{difficulty}' 在预设中未找到，使用当前设置",
        "logDiffInitialStack": "初始叠加方块层数: {layers}",
        "logDiffSpeedFactor": "速度因子: {factor}",
        "logDiffManagerInit": "难度管理器已初始化，当前难度: {difficulty}",
        "diffEasy": "菜鸟难度",
        "diffNormal": "老手难度",
        "diffHard": "专家难度",
        "diffExpert": "大师难度",
        "displayDifficulty": "{difficulty}",
        "logDiffSetDifficultyCall": "[Log] Calling DifficultyManager.setDifficulty with:",
        "logDiffApplyingPassed": "[Log] Applying passed difficulty settings in resetGameWithDifficulty.",
        "logDiffGettingFromManager": "[Log] Getting difficulty settings from DifficultyManager in resetGameWithDifficulty.",
        "logDiffFallbackSpeed": "[Log] Using fallback default speed in resetGameWithDifficulty.",
        "logDiffCheckingStack": "[Log] Checking and applying initial stack in resetGameWithDifficulty.",
        "logDiffManagerNotFoundStack": "[Log] DifficultyManager not found, skipping initial stack.",
        "confirmDifficultyChange": "难度已从 {oldDifficulty} 更改为 {newDifficulty}，需要重新开始游戏才能生效。是否立即重新开始？",
        "logUserConfirmRestart": "[DifficultyManager] 用户确认重新开始以应用新难度",
        "logUserCancelRestart": "[DifficultyManager] 用户选择不立即重新开始，新难度将在下一局生效",
        "logDiffGameNotPlaying": "[DifficultyManager] 游戏未在进行中，仅更新难度设置",
        "logDiffSetSuccess": "[DifficultyManager] 难度已成功设置为：{difficulty}",
        "errorInvalidDifficulty": "[DifficultyManager] 无效的难度级别：{difficulty}",
        "logDiffManagerLoaded": "[DifficultyManager] 加载难度设置：",
        "logDiffRandomGap": "[DifficultyManager] 检测到满行，添加随机空位",

        // sound_7ree.js
        "logSoundManagerInitStart": "[SoundManager] 初始化",
        "logSMConfigDefaultSound": "[SoundManager] 配置默认声音状态: ",
        "logSMLoadMuteLocal": "[SoundManager] 从本地存储加载静音状态: ",
        "logSMUseConfigDefaultMute": "[SoundManager] 使用配置默认值设置静音状态: ",
        "logSMConfigDefaultOn": " (配置defaultOn={defaultOn})",
        "logSMSyncGameInstance": "[SoundManager] 同步声音状态到游戏实例: isMuted=",
        "logSMInitComplete": "[SoundManager] 初始化完成，当前静音状态: ",
        "logSoundEffectsLoaded": "[Sound] 已从配置加载音效定义",
        "warnSoundEffectsNotFound": "[Sound] 配置文件中未找到音效定义，使用默认值",
        "warnSFXPathNotFound": "[Sound] 未找到音效定义: {effectKey}",
        "warnBGMListNotFound": "[Sound] 配置文件中未找到BGM列表或格式不正确，使用默认BGM",
        "logBGMLoaded": "[Sound] 已从配置加载BGM列表:",
        "logBGMShuffled": "[Sound] BGM列表播放完毕，重新洗牌",
        "logAudioContextCreated": "[Sound] AudioContext 创建成功",
        "errorAudioContextCreateFail": "[Sound] 创建 AudioContext 失败:",
        "errorWelcomeElementsNotFound": "[Sound] 欢迎页面元素未找到!",
        "warnEmptySoundPlayFail": "[Sound] 空声音播放失败:",
        "logEmptyBufferPlayed": "[Sound] 空音频缓冲区播放成功!",
        "warnEmptySoundUnlockFail": "[Sound] 播放空声音解锁失败:",
        "logGameStartUnlockAudio": "[Sound] 游戏开始按钮点击，尝试解锁音频...",
        "logGameStartSyncSound": "[Sound] 开始游戏前同步声音状态: isMuted=",
        "logGameStartTryPlayBGM": "[Sound] 游戏开始时尝试播放背景音乐",
        "logGameStartStopCurrentBGM": "[Sound] 停止当前BGM并创建新的",
        "logGameStartMutedNoBGM": "[Sound] 游戏开始但处于静音状态或游戏未运行，不播放BGM",
        "errorGameInstanceNotFound": "[Sound] 游戏实例未找到!",
        "logGameStartWelcomeNotFound": "[Sound] 欢迎卡片元素未找到，直接开始游戏",
        "logPlayBGMNotMuted": "[Sound] 当前为静音状态，不播放BGM",
        "logPlayBGMPlaying": "[Sound] BGM已在播放中，不需要重新创建",
        "logPlayBGMNoTracks": "[Sound] 没有可用的BGM曲目",
        "logPlayBGMResume": "[Sound] 尝试恢复已有BGM播放...",
        "logPlayBGMResumeSuccess": "[Sound] BGM恢复播放成功!",
        "logPlayBGMResumeFail": "[Sound] BGM恢复播放失败:",
        "logPlayBGMResumeError": "[Sound] 恢复BGM播放出错:",
        "logPlayBGMCreateNew": "[Sound] 创建新的BGM...",
        "logPlayBGMGameEnded": "[Sound] 游戏已确认结束，不创建BGM",
        "logPlayBGMTrackInfo": "[Sound] 播放BGM[{index}/{total}]：{src}",
        "logPlayBGMEndedNext": "[Sound] 当前BGM播放结束，切换到下一首",
        "logPlayBGMLoadedTryPlay": "[Sound] BGM 已加载，尝试播放...",
        "logPlayBGMStoppedCancel": "[Sound] BGM已被故意停止，取消播放请求。",
        "logPlayBGMSuccess": "[Sound] BGM 播放成功!",
        "errorPlayBGMFail": "[Sound] BGM 播放失败:",
        "logPlayBGMInteractionSetup": "[Sound] 设置在下一次用户交互时播放 BGM",
        "errorPlayBGMLoad": "[Sound] BGM 加载错误:",
        "logPlayBGMPlayNext": "[Sound] 开始播放下一首BGM",
        "errorPlayBGMNoElement": "[Sound] 没有有效的音频元素可以播放",
        "logPlayBGMInteractionSuccess": "[Sound] 用户交互后 BGM 播放成功",
        "errorPlayBGMInteractionFail": "[Sound] 用户交互后 BGM 播放仍然失败:",
        "errorPlayBGMGeneric": "[Sound] 尝试播放 BGM 时出错:",
        "logAudioContextTryResume": "[Sound] 尝试恢复 AudioContext 状态...",
        "logAudioContextResumed": "[Sound] AudioContext 已恢复!",
        "errorAudioContextResumeFail": "[Sound] 恢复 AudioContext 失败:",
        "logAudioContextState": "[Sound] AudioContext 状态已是:",
        "logAudioContextEmptyBuffer": "[Sound] 尝试播放空音频缓冲区解锁...",
        "logAudioContextEmptyBufferSuccess": "[Sound] 空音频缓冲区播放成功!",
        "warnAudioContextEmptyBufferFail": "[Sound] 播放空音频缓冲区失败:",
        "logStopBGMStart": "[Sound] stopBgm方法开始执行，检查 currentBgm...",
        "logStopBGMFound": "[Sound] 发现 currentBgm 对象，类型:",
        "htmlElement": "HTMLAudioElement",
        "other": "其他",
        "logStopBGMSetFlag": "[Sound] 设置 _bgmPlaybackIntentionallyStopped = true",
        "logStopBGMRemoveListeners": "[Sound] 移除 HTMLAudioElement 事件监听器",
        "logStopBGMTryStopHTML": "[Sound] 尝试停止 HTML Audio 元素 BGM...",
        "logStopBGMHTMLStopped": "[Sound] HTML Audio 元素已调用 pause() 和设置 currentTime = 0",
        "logStopBGMTryStopContext": "[Sound] 尝试停止 AudioContext BGM...",
        "logStopBGMContextStopped": "[Sound] AudioContext BGM 已调用 stop(0)",
        "warnStopBGMUnknownType": "[Sound] 未知 BGM 类型，尝试通用 pause()",
        "warnStopBGMPauseNotFound": "[Sound] 未找到 pause 方法",
        "logStopBGMCleared": "[Sound] BGM 已停止，清除 currentBgm 引用",
        "errorStopBGM": "[Sound] 停止 BGM 时出错:",
        "logStopBGMNotFound": "[Sound] 没有发现正在播放的 BGM (currentBgm is null or undefined)，无需停止",
        "logStopBGMSetFlagNoBGM": "[Sound] 设置 _bgmPlaybackIntentionallyStopped = true (无 BGM)",
        "logStopBGMEnd": "[Sound] stopBgm方法执行完毕",
        "logPlaySFXWarnNotReady": "[Sound] 如果音频未加载完成，尝试在 canplaythrough 事件中播放",
        "warnSFXNotFoundOrLoaded": "音效 '{name}' 未找到或未加载。",
        "logSMDelayedInit": "[SoundManager] 延迟初始化",
        "logSMDOMContentLoadedInit": "[SoundManager] DOM加载完成后初始化",
        "logSetVolume": "音量设置为: {volume}",
        "logTryLoadSFX": "尝试加载音效: {effectName}",
        "errorLoadSFX": "加载音效 '{effectName}' 失败: {error}",
        "errorPlaySFX": "音效播放错误 ({name}): {error}",
        "logToggleMute": "切换静音状态为: {mutedState}",
        "muted": "静音",
        "unmuted": "取消静音",
        "warnAudioContextSuspended": "因浏览器策略，音频上下文已暂停。将在首次用户交互后恢复。",
        "errorResumeAudioContext": "恢复音频上下文失败: {error}",

        // celebration_7ree.js
        "errorCelebrationContainerNotFound": "[庆祝] 未找到预设的庆祝容器元素",
        "logCelebrationTestEnabled": "[庆祝] 根据全局配置启用了测试模式",
        "logCelebrationInit": "[庆祝] 庆祝通知模块已初始化",
        "errorCelebrationNotInit": "[庆祝] 庆祝容器未初始化",
        "logCelebrationTestNoAutoHide": "[庆祝测试] 测试模式已启用，通知不会自动消失",
        "logCelebrationTestEnabledConsole": "[庆祝测试] 测试模式已启用，通知将不会自动消失",
        "logCelebrationTestDisabled": "[庆祝测试] 测试模式已禁用",
        "testNotificationMessage": "测试通知 - 测试模式已启用",
        "clear2Lines": "消两行",
        "clear3Lines": "消三行",
        "clear4Lines": "消四行",
        "clearNLines": "消除{lines}行",
        "celebrateLevelUpMessage": "恭喜过关",
        "testConsoleHelp": "可用的测试类型: line2, line3, line4, level, test, hide",
        "celebrateLines": "清除 {lines} 行",
        "celebrateImpressive": "厉害!",
        "celebrateAwesome": "太棒了!",
        "celebrateUnbelievable": "不可思议!",
        "celebrateLevelUp": "等级提升!",
        "celebrateLevelNum": "等级 {level}"
    }
}