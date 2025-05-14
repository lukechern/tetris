const config = {
    // 音频相关配置
    audio: {
        defaultOn: true,
        path: 'resource/sounds/',
        files: {
            bgMusic: [
                    'bgm_1_Theme',
                    'bgm_2_Troika',
                    'bgm_3_Bradinsky',
                    'bgm_4_Loginska',
                    'bgm_5_Karinka',
                     ],
            soundEffects: {
                move: 'sde_Move',
                rotate: 'sde_Rotate',
                drop: 'sde_Drop',
                hardDrop: 'sde_HardDrop',
                landed: 'sde_Landed',
                lineClear: 'sde_LineClear',
                combo: 'sde_Combo',
                gameOver: 'sde_GameOver',
                levelUp: 'sde_LevelUp',
            }
        }
    },
    
    // 难度相关配置
    difficulty: {
        defaultSpeed: 1000,        // 默认下落速度（毫秒）
        initialStackLayers: 0,     // 初始叠加方块层数（0表示没有初始方块）
        speedFactor: 0.9,          // 每升一级速度变化系数
        
        // 预设难度配置
        presets: {
            easy: {
                defaultSpeed: 1200,
                initialStackLayers: 0,
                speedFactor: 0.95
            },
            normal: {
                defaultSpeed: 1000,
                initialStackLayers: 0,
                speedFactor: 0.9
            },
            hard: {
                defaultSpeed: 800,
                initialStackLayers: 8,
                speedFactor: 0.85
            },
            expert: {
                defaultSpeed: 500,
                initialStackLayers: 12,
                speedFactor: 0.5
            }
        }
    },
    
    // 方块颜色定义
    squareColor: [
        'transparent',     // 0: 空白
        '#00FFFF',         // 1: 青色 (I)
        '#4466FF',         // 2: 蓝色 (J) - 提亮
        '#FF9933',         // 3: 橙色 (L) - 提亮
        '#FFFF00',         // 4: 黄色 (O)
        '#33FF33',         // 5: 绿色 (S) - 提亮
        '#CC44CC',         // 6: 紫色 (T) - 提亮
        '#FF5555'          // 7: 红色 (Z) - 提亮
    ],

    // --- 新增：功能开关 ---
    features: {
        // 控制幽灵方块（辅助瞄准）功能默认是否开启
        ghostPieceDefaultOn: true, 
    },
    // ---------------------

    // debug调试选项
    debug: {
        // 控制是否显示console.log日志输出，设为false可禁用所有日志
        console_log: false,
        
        // 控制庆祝卡片是否始终显示不消失，设为true启用测试模式
        celebration_test: false,
    }
    
}