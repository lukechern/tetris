const SoundManager_7ree = {
    bgmTracks: [],
    soundEffects: {}, // 添加音效映射对象
    currentBgm: null,
    currentBgmIndex: 0, // 添加当前播放的BGM索引
    isMuted: false,
    soundButton: null,
    audioUnlocked: false,
    firstTouch: true, // 记录第一次点击
    audioContext: null, // AudioContext 实例
    welcomeCard: null, // 欢迎卡片引用
    welcomeStartButton: null, // 欢迎页面开始按钮引用
    isInitialized: false,
    _bgmPlaybackIntentionallyStopped: false, // 新增：标记BGM是否被故意停止
    bgmPath: '',
    sfxPath: '',
    volume: 0.5,

    init: function() {
        console.log(getText_7ree('logSoundManagerInitStart'));
        this.isInitialized = true;
        
        // 先获取DOM元素引用
        this.welcomeCard = document.getElementById('welcome_card_7ree');
        this.welcomeStartButton = document.getElementById('welcome_start_btn_7ree');
        this.soundButton = document.getElementById('sound_btn_7ree');

        // 检查配置是否存在
        const hasConfig = (typeof config !== 'undefined' && typeof config.audio !== 'undefined');
        const configDefaultOn = hasConfig ? config.audio.defaultOn : true;
        console.log(getText_7ree('logSMConfigDefaultSound') + (hasConfig ? (configDefaultOn ? getText_7ree('enabled') : getText_7ree('disabled')) : "Default:" + getText_7ree('enabled')));
        
        // 获取本地存储的静音状态
        const hasSavedMutedState = localStorage.getItem('tetris_muted_7ree') !== null;
        const savedMutedState = localStorage.getItem('tetris_muted_7ree');
        
        // 如果本地存储中有值且不是首次运行，使用本地存储的值
        if (hasSavedMutedState) {
            this.isMuted = savedMutedState === 'true';
            console.log(getText_7ree('logSMLoadMuteLocal') + this.isMuted);
        } else {
            // 否则使用配置中的默认值
            this.isMuted = !configDefaultOn;
            console.log(getText_7ree('logSMUseConfigDefaultMute') + this.isMuted + getText_7ree('logSMConfigDefaultOn', {defaultOn: configDefaultOn}));
            
            // 保存到本地存储
            localStorage.setItem('tetris_muted_7ree', this.isMuted);
            localStorage.setItem('tetris_sound_on_7ree', !this.isMuted);
        }
        
        // 同步声音状态到游戏实例（如果游戏实例已初始化）
        if (window.tetrisGame_7ree) {
            // 如果游戏实例已存在，确保声音状态一致
            if (window.tetrisGame_7ree.isSoundOn !== !this.isMuted) {
                console.log(getText_7ree('logSMSyncGameInstance') + this.isMuted);
                window.tetrisGame_7ree.isSoundOn = !this.isMuted;
                // 保存到本地存储
                localStorage.setItem('tetris_sound_on_7ree', window.tetrisGame_7ree.isSoundOn);
                // 更新UI
                if (window.tetrisGame_7ree.soundButton) {
                    window.tetrisGame_7ree.soundButton.textContent = window.tetrisGame_7ree.isSoundOn ? '🔊' : '🔇';
                }
            }
        }
        
        // 初始化音效和BGM路径
        this.loadSoundEffectsFromConfig();
        this.loadBgmFromConfig();
        
        // 创建音频上下文
        this.createAudioContext();
        
        // 设置欢迎界面的事件监听
        this.setupWelcomeEvents();
        
        // 初始化按钮图标
        this.updateButtonIcon();
        
        console.log(getText_7ree('logSMInitComplete') + this.isMuted);
    },
    
    // 从配置文件加载音效名称映射
    loadSoundEffectsFromConfig: function() {
        // 默认音效映射
        this.soundEffects = {
            move: 'se_Move',
            rotate: 'se_Rotate',
            drop: 'se_Drop',
            lineClear: 'se_LineClear',
            combo: 'se_Combo',
            tSpin: 'se_TSpin',
            mini: 'se_Mini',
            gameOver: 'se_GameOver',
            levelUp: 'se_LevelUp',
            pause: 'se_Pause',
            resume: 'se_Resume'
        };
        
        // 检查配置文件中是否有音效定义
        if (typeof config !== 'undefined' && 
            config.audio && 
            config.audio.files && 
            config.audio.files.soundEffects) {
            // 使用配置文件中的音效定义
            this.soundEffects = config.audio.files.soundEffects;
            console.log(getText_7ree('logSoundEffectsLoaded'));
        } else {
            console.warn(getText_7ree('warnSoundEffectsNotFound'));
        }
    },
    
    // 获取音效文件路径
    getSoundEffectPath: function(effectKey) {
        if (!this.soundEffects || !this.soundEffects[effectKey]) {
            console.warn(getText_7ree('warnSFXPathNotFound', { effectKey: effectKey }));
            return '';
        }
        
        // 获取音频基础路径（带有结尾斜杠）
        const audioPath = (typeof config !== 'undefined' && config.audio && config.audio.path) 
            ? ((config.audio.path.endsWith('/')) ? config.audio.path : config.audio.path + '/') 
            : 'resource/sounds/';
            
        return `${audioPath}${this.soundEffects[effectKey]}_7ree.mp3`;
    },
    
    // 从配置文件加载BGM列表
    loadBgmFromConfig: function() {
        this.bgmTracks = [];
        
        // 检查配置是否存在
        if (typeof config === 'undefined' || 
            !config.audio || 
            !config.audio.files || 
            !config.audio.files.bgMusic || 
            !Array.isArray(config.audio.files.bgMusic) || 
            config.audio.files.bgMusic.length === 0) {
            console.warn(getText_7ree('warnBGMListNotFound'));
            // 使用默认BGM（硬编码的后备选项）
            this.bgmTracks = ['resource/sounds/bgm_1_7ree.mp3'];
            return;
        }
        
        // 获取音频基础路径（带有结尾斜杠）
        const audioPath = (config.audio.path || 'resource/sounds/').endsWith('/') 
            ? config.audio.path 
            : config.audio.path + '/';
            
        // 构建完整的BGM路径列表
        config.audio.files.bgMusic.forEach(bgm => {
            // 检查bgm是否已经包含后缀
            let fileName = bgm;
            if (!fileName.endsWith('.mp3')) {
                fileName += '_7ree.mp3';
            }
            this.bgmTracks.push(`${audioPath}${fileName}`);
        });
        
        // 随机打乱BGM顺序，增加播放随机性
        this.shuffleBgmTracks();
        
        console.log(getText_7ree('logBGMLoaded'), this.bgmTracks);
    },
    
    // 随机打乱BGM列表顺序
    shuffleBgmTracks: function() {
        for (let i = this.bgmTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bgmTracks[i], this.bgmTracks[j]] = [this.bgmTracks[j], this.bgmTracks[i]];
        }
        this.currentBgmIndex = 0; // 重置索引
    },
    
    // 创建AudioContext
    createAudioContext: function() {
        if (!this.audioContext) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                console.log(getText_7ree('logAudioContextCreated'));
            } catch (e) {
                console.error(getText_7ree('errorAudioContextCreateFail'), e);
            }
        }
        return this.audioContext;
    },
    
    // 设置欢迎页面事件处理
    setupWelcomeEvents: function() {
        if (!this.welcomeStartButton || !this.welcomeCard) {
            console.error(getText_7ree('errorWelcomeElementsNotFound'));
            return;
        }
        
        // 监听欢迎页面的开始按钮点击
        if (DeviceHandler_7ree && DeviceHandler_7ree.isMobile()) {
            // 在移动设备上使用 touchstart 事件
            this.welcomeStartButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                
                // 创建AudioContext（如果尚未创建）
                this.createAudioContext();
                
                // 在用户交互中解锁音频上下文
                this.unlockAudioContext();
                
                // 创建并播放一个短暂的空声音以解锁音频
                this.playEmptySoundForUnlock();
                
                // 增加延迟时间，确保移动设备上有足够时间解锁音频
                setTimeout(() => this.handleGameStart(), 500);
            });
        } else {
            // PC 上使用 click 事件
            this.welcomeStartButton.addEventListener('click', () => {
                // 确保AudioContext已创建
                this.createAudioContext();
                this.handleGameStart();
            });
        }
    },
    
    // 播放空声音解锁音频
    playEmptySoundForUnlock: function() {
        try {
            // 创建一个短暂的空声音
            const audio = new Audio();
            audio.play().catch(e => console.warn(getText_7ree('warnEmptySoundPlayFail'), e));
            
            // 同时尝试使用 AudioContext
            if (this.audioContext) {
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
                this.audioUnlocked = true;
                console.log(getText_7ree('logEmptyBufferPlayed'));
            }
        } catch (e) {
            console.warn(getText_7ree('warnEmptySoundUnlockFail'), e);
        }
    },
    
    // 处理游戏开始逻辑
    handleGameStart: function() {
        console.log(getText_7ree('logGameStartUnlockAudio'));
        
        // 解锁音频上下文
        this.unlockAudioContext();
        
        // 确保静音状态与游戏实例同步
        if (window.tetrisGame_7ree) {
            // 如果游戏实例存在，确保声音状态一致
            if (window.tetrisGame_7ree.isSoundOn !== !this.isMuted) {
                console.log(getText_7ree('logGameStartSyncSound') + this.isMuted);
                window.tetrisGame_7ree.isSoundOn = !this.isMuted;
                // 更新游戏实例UI
                if (window.tetrisGame_7ree.soundButton) {
                    window.tetrisGame_7ree.soundButton.textContent = window.tetrisGame_7ree.isSoundOn ? '🔊' : '🔇';
                }
            }
        }
        
        // 隐藏欢迎卡片
        if (this.welcomeCard) {
            this.welcomeCard.classList.add('card_hidden');
            
            // 一秒后完全移除欢迎卡片（为了动画效果）
            setTimeout(() => {
                this.welcomeCard.style.display = 'none';
                
                // 在欢迎卡片隐藏后触发游戏开始
                if (window.tetrisGame_7ree) {
                    // 调用游戏开始方法，传递true表示从声音管理器调用
                    window.tetrisGame_7ree.startGame(true);
                    
                    // 延迟一段时间后再播放BGM，确保游戏状态已更新
                    setTimeout(() => {
                        // 开始播放背景音乐(仅当非静音状态)
                        if (!this.isMuted && window.tetrisGame_7ree.isPlaying) {
                            console.log(getText_7ree('logGameStartTryPlayBGM'));
                            // 停止可能已存在的BGM
                            if (this.currentBgm) {
                                console.log(getText_7ree('logGameStartStopCurrentBGM'));
                                this.stopBgm();
                            }
                            
                            // 使用创建新 Audio 元素的方式播放
                            this.playBgmWithNewAudio();
                        } else {
                            console.log(getText_7ree('logGameStartMutedNoBGM'));
                        }
                    }, 300);
                } else {
                    console.error(getText_7ree('errorGameInstanceNotFound'));
                }
            }, 500);
        } else {
            console.log(getText_7ree('logGameStartWelcomeNotFound'));
            // 如果找不到欢迎卡片，直接开始游戏
            if (window.tetrisGame_7ree) {
                window.tetrisGame_7ree.startGame(true);
                
                // 同样需要延迟BGM播放
                setTimeout(() => {
                    if (!this.isMuted && window.tetrisGame_7ree.isPlaying) {
                        this.playBgmWithNewAudio();
                    }
                }, 300);
            } else {
                console.error(getText_7ree('errorGameInstanceNotFound'));
            }
        }
    },
    
    // 使用新 Audio 元素方式播放 BGM（避免 fetch）
    playBgmWithNewAudio: function() {
        try {
            // 如果已经有BGM或处于静音状态，则不进行操作
            if (this.isMuted) {
                console.log(getText_7ree('logPlayBGMNotMuted'));
                return;
            }
            
            if (this.currentBgm && typeof this.currentBgm.paused !== 'undefined' && !this.currentBgm.paused) {
                console.log(getText_7ree('logPlayBGMPlaying'));
                return;
            }
            
            if (this.bgmTracks.length === 0) {
                console.log(getText_7ree('logPlayBGMNoTracks'));
                return;
            }
            
            // 如果已有 Audio 对象但是处于暂停状态，则尝试恢复播放
            if (this.currentBgm && typeof this.currentBgm.play === 'function' && this.currentBgm.paused) {
                console.log(getText_7ree('logPlayBGMResume'));
                try {
                    const playPromise = this.currentBgm.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log(getText_7ree('logPlayBGMResumeSuccess'));
                        }).catch(error => {
                            console.error(getText_7ree('logPlayBGMResumeFail'), error);
                            // 出错时重新创建
                            this.currentBgm = null;
                            this.createAndPlayNewBgm();
                        });
                    }
                    return;
                } catch (e) {
                    console.error(getText_7ree('logPlayBGMResumeError'), e);
                    this.currentBgm = null;
                }
            }
            
            // 创建新的BGM
            this.createAndPlayNewBgm();
            
        } catch (e) {
            console.error(getText_7ree('errorPlayBGMGeneric'), e);
            this.currentBgm = null;
        }
    },
    
    // 创建并播放新的BGM
    createAndPlayNewBgm: function() {
        console.log(getText_7ree('logPlayBGMCreateNew'));
        
        // 重置故意停止标志
        this._bgmPlaybackIntentionallyStopped = false;
        
        // 如果游戏已结束或处于静音状态，则不创建新BGM
        if (this.isMuted) {
            console.log(getText_7ree('logPlayBGMNotMuted'));
            return;
        }
        
        // 修改游戏状态检查逻辑，避免过早判断游戏状态
        if (window.tetrisGame_7ree && window.tetrisGame_7ree.isPlaying === false && window.tetrisGame_7ree.gameEnded === true) {
            console.log(getText_7ree('logPlayBGMGameEnded'));
            return;
        }
        
        try {
            // 使用当前索引选择BGM，而不是随机选择
            if (this.currentBgmIndex >= this.bgmTracks.length) {
                this.currentBgmIndex = 0; // 循环播放
            }
            
            const trackSrc = this.bgmTracks[this.currentBgmIndex];
            console.log(getText_7ree('logPlayBGMTrackInfo', { index: this.currentBgmIndex + 1, total: this.bgmTracks.length, src: trackSrc }));
            
            // 使用普通的 Audio 元素播放
            const audio = new Audio(trackSrc);
            audio.loop = false; // 不循环单曲，改为播放完后切换到下一首
            audio.volume = 0.3;
            
            // 记录BGM元素，即使播放尚未开始
            this.currentBgm = audio;
            
            // 添加播放结束事件处理，切换到下一首
            audio.addEventListener('ended', () => {
                console.log(getText_7ree('logPlayBGMEndedNext'));
                this.playNextBgm();
            });
            
            // 播放前添加事件监听
            audio.addEventListener('canplaythrough', () => {
                console.log(getText_7ree('logPlayBGMLoadedTryPlay'));
                
                // 检查是否已被故意停止
                if (this._bgmPlaybackIntentionallyStopped) {
                    console.log(getText_7ree('logPlayBGMStoppedCancel'));
                    return;
                }
                
                // 再次检查游戏状态和静音状态
                if (this.isMuted || (window.tetrisGame_7ree && window.tetrisGame_7ree.isPlaying === false && window.tetrisGame_7ree.gameEnded === true)) {
                    console.log(getText_7ree('logPlayBGMNotMuted'));
                    return;
                }
                
                // 尝试播放
                if (audio) {
                    const playPromise = audio.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log(getText_7ree('logPlayBGMSuccess'));
                        }).catch(error => {
                            console.error(getText_7ree('errorPlayBGMFail'), error);
                            // 移动端可能需要等待用户下一次交互
                            this.setupBgmPlayOnNextInteraction(audio);
                        });
                    }
                }
            });
            
            audio.addEventListener('error', (e) => {
                console.error(getText_7ree('errorPlayBGMLoad'), e);
                this.currentBgm = null;
                // 出现错误时尝试播放下一首
                setTimeout(() => this.playNextBgm(), 1000);
            });
            
            // 加载音频
            audio.load();
        } catch (e) {
            console.error(getText_7ree('errorPlayBGMGeneric'), e);
            this.currentBgm = null;
            // 发生异常时尝试播放下一首
            setTimeout(() => this.playNextBgm(), 1000); 
        }
    },
    
    // 播放下一首BGM
    playNextBgm: function() {
        // 如果已静音或游戏已结束，不继续播放
        if (this.isMuted || (window.tetrisGame_7ree && 
            (window.tetrisGame_7ree.isPlaying === false || window.tetrisGame_7ree.gameEnded === true || window.tetrisGame_7ree.isPaused === true))) {
            console.log("[Sound] 已静音或游戏未运行，不播放下一首BGM");
            return;
        }
        
        // 切换到下一首
        this.currentBgmIndex++;
        if (this.currentBgmIndex >= this.bgmTracks.length) {
            console.log(getText_7ree('logBGMShuffled'));
            this.shuffleBgmTracks(); // 播放完所有曲目后重新洗牌
        }
        
        // 停止当前BGM
        if (this.currentBgm) {
            this.stopBgm();
        }
        
        // 延迟一会儿再播放下一首，避免立即切换
        setTimeout(() => {
            console.log(getText_7ree('logPlayBGMPlayNext'));
            this.createAndPlayNewBgm();
        }, 500);
    },
    
    // 设置在下一次用户交互时播放 BGM
    setupBgmPlayOnNextInteraction: function(audioElement) {
        console.log(getText_7ree('logPlayBGMInteractionSetup'));
        
        // 保存音频元素引用，以便后续播放
        const audio = audioElement || (this.currentBgm && typeof this.currentBgm.play === 'function' ? this.currentBgm : null);
        
        if (!audio) {
            console.error(getText_7ree('errorPlayBGMNoElement'));
            return;
        }
        
        // 监听文档上的点击或触摸事件
        const playOnInteraction = (e) => {
            if (!this.isMuted && !(window.tetrisGame_7ree && !window.tetrisGame_7ree.isPlaying)) {
                // 确保用户交互中解锁音频
                this.unlockAudioContext();
                
                try {
                    const playPromise = audio.play();
                    playPromise.then(() => {
                        console.log(getText_7ree('logPlayBGMInteractionSuccess'));
                        // 确保设置 currentBgm
                        this.currentBgm = audio;
                    }).catch(e => {
                        console.error(getText_7ree('errorPlayBGMInteractionFail'), e);
                    });
                } catch (e) {
                    console.error(getText_7ree('errorPlayBGMGeneric'), e);
                }
            } else {
                console.log("[Sound] 已静音或游戏已结束，不播放BGM");
            }
            
            // 移除事件监听
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
    },
    
    // 解锁 AudioContext
    unlockAudioContext: function() {
        if (this.audioUnlocked || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            console.log(getText_7ree('logAudioContextTryResume'));
            this.audioContext.resume().then(() => {
                console.log(getText_7ree('logAudioContextResumed'));
                this.audioUnlocked = true;
            }).catch(e => {
                console.error(getText_7ree('errorAudioContextResumeFail'), e);
            });
        } else {
            console.log(getText_7ree('logAudioContextState') + this.audioContext.state);
            if (this.audioContext.state === 'running') {
                this.audioUnlocked = true;
            }
        }
        
        // 创建一个空的音频缓冲区并播放，这也可以帮助解锁
        if (!this.audioUnlocked && this.audioContext) {
            try {
                console.log(getText_7ree('logAudioContextEmptyBuffer'));
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
                this.audioUnlocked = true;
                console.log(getText_7ree('logAudioContextEmptyBufferSuccess'));
            } catch (e) {
                console.warn(getText_7ree('warnAudioContextEmptyBufferFail'), e);
            }
        }
    },
    
    // 直接播放背景音乐
    playBgmDirect: function() {
        if (!this.audioContext) {
            console.error(getText_7ree('errorAudioContextNotInit'));
            return;
        }
        if (this.isMuted) return; 
        
        if (!this.bgmTracks || this.bgmTracks.length === 0) {
            console.error(getText_7ree('errorBGMListEmpty'));
            return;
        }
        
        // 如果当前没有BGM或播放结束，选择下一首
        if (!this.currentBgm || this.currentBgm.ended || this.currentBgm.paused) {
            this.currentBgmIndex = (this.currentBgmIndex + 1) % this.bgmTracks.length;
            const bgmName = this.bgmTracks[this.currentBgmIndex];
            const bgmSrc = `${this.bgmPath}${bgmName}`; 
            
            console.log(getText_7ree('logTryLoadBGM', { bgmName: bgmName }));
            
            if (!this.currentBgm) {
                this.currentBgm = new Audio();
                this.currentBgm.loop = false;
                this.currentBgm.volume = this.volume; 
                 this.currentBgm.onended = () => {
                    console.log(getText_7ree('logBGMEndedNext'));
                    this.playBgmDirect(); // 自动播放下一首
                 };
            }
            
            this.currentBgm.src = bgmSrc;
            this.currentBgm.load();
            
            // 加载完成后尝试播放
            this.currentBgm.oncanplaythrough = () => {
                if (this.isMuted) return; // 再次检查静音状态
                const playPromise = this.currentBgm.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log(getText_7ree('logStartPlayBGM', { src: bgmSrc }));
                    }).catch(error => {
                        console.error(getText_7ree('errorPlayBGM', { error: error }));
                    });
                }
            };
            this.currentBgm.onerror = (e) => {
                console.error(getText_7ree('errorLoadBGM', { bgmName: bgmName, error: e }));
            };
        }
        // 如果当前BGM已加载但暂停，则继续播放
        else if (this.currentBgm && this.currentBgm.paused) {
             if (this.isMuted) return; // 再次检查静音状态
             const playPromise = this.currentBgm.play();
             if (playPromise !== undefined) {
                 playPromise.catch(error => {
                     console.error(getText_7ree('errorPlayBGM', { error: error }));
                 });
             }
        }
    },
    
    // 直接切换静音状态
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('tetris_muted_7ree', this.isMuted);
        console.log(getText_7ree('logToggleMute', { mutedState: (this.isMuted ? getText_7ree('muted') : getText_7ree('unmuted')) }));
        
        if (this.isMuted) {
            this.stopBgm(); // 静音时停止BGM
            // 无需停止音效，因为播放前会检查 isMuted
        } else {
            // 如果之前有BGM在播放（但被暂停了），尝试恢复
            // 注意：如果之前没有BGM在播放，则不自动开始
            this.resumeSuspendedContext(); // 确保上下文活跃
             // 如果游戏正在进行中，恢复BGM
            if (window.tetrisGame_7ree && window.tetrisGame_7ree.isPlaying && !window.tetrisGame_7ree.isPaused) {
                 this.playBgmDirect();
            }
        }
        this.updateButtonIcon();
        
        // 同步游戏实例的状态
        if (window.tetrisGame_7ree) {
             const gameShouldBeSoundOn = !this.isMuted;
             if (window.tetrisGame_7ree.isSoundOn !== gameShouldBeSoundOn) {
                 window.tetrisGame_7ree.isSoundOn = gameShouldBeSoundOn;
                 localStorage.setItem('tetris_sound_on_7ree', gameShouldBeSoundOn);
             }
        }
    },
    
    // 增强的停止BGM方法
    stopBgm: function() {
        console.log(getText_7ree('logStopBGMStart'));
        
        if (this.currentBgm) {
            console.log(getText_7ree('logStopBGMFound') + (typeof this.currentBgm) + ", 实例: " + (this.currentBgm instanceof HTMLAudioElement ? getText_7ree('htmlElement') : getText_7ree('other')));
            
            // 设置故意停止标志
            this._bgmPlaybackIntentionallyStopped = true;
            console.log(getText_7ree('logStopBGMSetFlag'));
            
            try {
                // 先移除事件监听器，防止异步事件后续触发播放
                if (this.currentBgm instanceof HTMLAudioElement) {
                    console.log(getText_7ree('logStopBGMRemoveListeners'));
                    this.currentBgm.oncanplaythrough = null;
                    this.currentBgm.onloadeddata = null;
                    this.currentBgm.onplaying = null;
                    this.currentBgm.onerror = null;
                    this.currentBgm.onended = null;
                }
                
                // 检测是音频元素还是AudioBuffer
                if (this.currentBgm instanceof HTMLAudioElement) {
                    console.log(getText_7ree('logStopBGMTryStopHTML'));
                    this.currentBgm.pause();
                    this.currentBgm.currentTime = 0;
                    console.log(getText_7ree('logStopBGMHTMLStopped'));
                } else if (this.currentBgm.stop && typeof this.currentBgm.stop === 'function') {
                    console.log(getText_7ree('logStopBGMTryStopContext'));
                    this.currentBgm.stop(0);
                    console.log(getText_7ree('logStopBGMContextStopped'));
                } else {
                    console.warn(getText_7ree('warnStopBGMUnknownType'));
                    if (typeof this.currentBgm.pause === 'function') {
                        this.currentBgm.pause();
                        console.log("[Sound] 通用 pause() 已调用");
                    } else {
                        console.warn(getText_7ree('warnStopBGMPauseNotFound'));
                    }
                }
                
                // 记录更多信息并确保清除引用
                console.log(getText_7ree('logStopBGMCleared'));
                this.currentBgm = null;
                
            } catch (e) {
                console.error(getText_7ree('errorStopBGM'), e);
                // 强制清除引用，防止出错后无法继续播放新音乐
                this.currentBgm = null;
            }
        } else {
            console.log(getText_7ree('logStopBGMNotFound'));
            // 即使没有 BGM，也标记为故意停止，防止旧的异步事件触发
            this._bgmPlaybackIntentionallyStopped = true;
            console.log(getText_7ree('logStopBGMSetFlagNoBGM'));
        }
        console.log(getText_7ree('logStopBGMEnd'));
    },
    
    // 以下为向后兼容的方法
    
    unlockAudio: function() {
        this.createAudioContext();
        this.unlockAudioContext();
        return Promise.resolve(this.audioUnlocked);
    },
    
    playBgm: function() {
        if (this.isMuted) {
            return Promise.resolve();
        }
        
        // 调用新方法
        this.createAudioContext();
        this.unlockAudioContext();
        this.playBgmWithNewAudio();
        return Promise.resolve();
    },
    
    updateButtonIcon: function() {
        if (this.soundButton) {
            this.soundButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
    },
    
    playBgmOnGameStart: function() {
        console.log(getText_7ree('logGameStartUnlockAudio'));
        
        // 检查静音状态
        if (this.isMuted) {
            console.log(getText_7ree('logGameStartMutedNoBGM'));
            return Promise.resolve();
        }
        
        // 确保音频上下文已创建并解锁
        this.createAudioContext();
        this.unlockAudioContext();
        
        // 停止现有BGM（如果有）
        if (this.currentBgm) {
            console.log(getText_7ree('logGameStartStopCurrentBGM'));
            this.stopBgm();
        }
        
        // 使用延迟确保音频上下文就绪
        setTimeout(() => {
            if (!this.isMuted && !this.currentBgm) {
                console.log(getText_7ree('logGameStartDelayPlayBGM'));
                this.playBgmWithNewAudio();
            }
        }, 100);
        
        return Promise.resolve();
    },

    // 修复：确保音频上下文在需要时被创建
    ensureAudioContext: function() {
        return this.createAudioContext();
    },

    resumeSuspendedContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log(getText_7ree('logAudioContextResumed'));
            }).catch(e => console.error(getText_7ree('errorResumeAudioContext', { error: e })));
        }
    },
    
    setupAutoResume() {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
             console.warn(getText_7ree('warnAudioContextSuspended'));
             const resumeHandler = () => {
                this.resumeSuspendedContext();
                 document.body.removeEventListener('click', resumeHandler, true);
                 document.body.removeEventListener('touchstart', resumeHandler, true);
                 document.body.removeEventListener('keydown', resumeHandler, true);
             };
             document.body.addEventListener('click', resumeHandler, { once: true, capture: true });
             document.body.addEventListener('touchstart', resumeHandler, { once: true, capture: true });
             document.body.addEventListener('keydown', resumeHandler, { once: true, capture: true });
        }
    },

    setVolume(volumeLevel) {
        this.volume = Math.max(0, Math.min(1, volumeLevel));
        console.log(getText_7ree('logSetVolume', { volume: this.volume }));
        if (this.currentBgm) {
            this.currentBgm.volume = this.volume;
        }
        // 更新所有音效的音量
        for (const effectName in this.soundEffects) {
            if (this.soundEffects[effectName]) {
                this.soundEffects[effectName].volume = this.volume;
            }
        }
    },
    
    loadSoundEffect(effectName, fileName) {
        const filePath = `${this.sfxPath}${fileName}_7ree.mp3`;
        console.log(getText_7ree('logTryLoadSFX', { effectName: effectName }));
        const audio = new Audio(filePath);
        audio.preload = 'auto';
        audio.volume = this.volume;
        // 不自动播放，仅加载
        audio.load();
        audio.onerror = (e) => {
            console.error(getText_7ree('errorLoadSFX', { effectName: effectName, error: e }));
        };
        this.soundEffects[effectName] = audio;
    },

    playSoundEffect(name) {
        if (this.isMuted) return;
        
        const sound = this.soundEffects[name];
        if (sound) {
            if (sound.readyState >= 2) { // HAVE_CURRENT_DATA or more
                sound.currentTime = 0;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        // console.log(`播放音效: ${name}`);
                    }).catch(error => {
                        console.error(getText_7ree('errorPlaySFX', { name: name, error: error }));
                    });
                }
            } else {
                // 如果音频未加载完成，尝试在 canplaythrough 事件中播放
                console.warn(getText_7ree('logPlaySFXWarnNotReady'));
                // 可以添加一个临时监听器来播放，但不推荐，可能导致延迟
                // sound.addEventListener('canplaythrough', () => sound.play(), { once: true });
            }
        } else {
            console.warn(getText_7ree('warnSFXNotFoundOrLoaded', { name: name }));
        }
    },
};

// 如果页面已加载完成，则初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // 页面已加载，延迟初始化以确保其他脚本已就绪
    setTimeout(() => {
        if (!SoundManager_7ree.isInitialized) {
            console.log(getText_7ree('logSMDelayedInit'));
            SoundManager_7ree.init();
        }
    }, 300);  // 增加延迟时间
} else {
    // 监听DOM加载完成事件
    document.addEventListener('DOMContentLoaded', () => {
        // 延迟初始化，以确保游戏实例已创建
        setTimeout(() => {
            if (!SoundManager_7ree.isInitialized) {
                console.log(getText_7ree('logSMDOMContentLoadedInit'));
                SoundManager_7ree.init();
            }
        }, 300);  // 增加延迟时间
    });
} 