// resource/js/ghost_piece_7ree.js

class GhostPieceHandler_7ree {
    constructor() {
        this.game = null;
        console.log("[GhostPiece] Handler created.");
    }

    /**
     * 初始化处理器并关联游戏实例
     * @param {TetrisGame_7ree} gameInstance 
     */
    init(gameInstance) {
        this.game = gameInstance;
        if (!this.game) {
            console.error("[GhostPiece] Game instance is required for initialization.");
            return;
        }
        console.log("[GhostPiece] Handler initialized with game instance.");
    }

    /**
     * 计算当前活动方块的幽灵位置（最终下落位置）
     * @returns {object|null} 包含 shape, row, col 的对象，如果无法计算则返回 null
     */
    calculateGhostPosition() {
        if (!this.game || !this.game.currentPiece || !this.game.isPlaying || this.game.isPaused || this.game.gameEnded) {
            return null; // 没有活动方块或游戏未运行/已结束
        }

        const piece = this.game.currentPiece;
        let ghostRow = piece.row;

        // 向下检查碰撞，直到找到最低的非碰撞行
        // 使用 this.game.checkCollision 检查
        while (!this.game.checkCollision(ghostRow - piece.row + 1, 0)) {
            ghostRow++;
        }

        // 如果幽灵位置与当前方块位置相同（即方块已落地或无法下移），则不显示幽灵
        if (ghostRow === piece.row) {
            return null;
        }

        return {
            shape: piece.shape,
            row: ghostRow,
            col: piece.col
        };
    }

    /**
     * 清除游戏面板上所有旧的幽灵方块样式
     */
    clearGhostPiece() {
        if (!this.game || !this.game.gameBoardElement) return;

        const ghostElements = this.game.gameBoardElement.querySelectorAll('.ghost_cell_7ree');
        ghostElements.forEach(cell => cell.classList.remove('ghost_cell_7ree'));
    }

    /**
     * 在游戏面板上绘制幽灵方块
     * @param {object} ghostPosition - calculateGhostPosition 返回的对象
     */
    drawGhostPiece(ghostPosition) {
        if (!this.game || !this.game.gameBoardElement || !ghostPosition) return;

        const { shape, row, col } = ghostPosition;
        const cells = this.game.gameBoardElement.querySelectorAll('.cell_7ree');

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    const boardRow = row + r;
                    const boardCol = col + c;

                    // 确保在边界内
                    if (boardRow >= 0 && boardRow < this.game.rows && boardCol >= 0 && boardCol < this.game.cols) {
                        const cellIndex = boardRow * this.game.cols + boardCol;
                        // 只在空白或已经是幽灵的单元格上绘制幽灵，不覆盖已落地的方块
                        if (cells[cellIndex] && this.game.board[boardRow][boardCol] === 0) { 
                            cells[cellIndex].classList.add('ghost_cell_7ree');
                        }
                    }
                }
            }
        }
    }

    /**
     * 更新幽灵方块的显示（清除旧的，计算并绘制新的）
     */
    updateDisplay() {
        // --- 新增检查：仅在功能开启时执行 ---
        if (!this.game || !this.game.isGhostPieceEnabled) {
            this.clearGhostPiece(); // 如果功能关闭，确保清除幽灵
            return; 
        }
        // -------------------------------------
        
        if (!this.game.isPlaying || this.game.isPaused || this.game.gameEnded) {
             this.clearGhostPiece(); // 确保游戏暂停或结束时清除幽灵
            return;
        }
        this.clearGhostPiece(); // 清除上一次的幽灵方块
        const ghostPosition = this.calculateGhostPosition(); // 计算新位置
        if (ghostPosition) {
            this.drawGhostPiece(ghostPosition); // 绘制新的幽灵方块
        }
    }
}

// 创建幽灵方块处理器的实例
const ghostPieceHandler_7ree = new GhostPieceHandler_7ree();

// 监听游戏初始化事件，以便将游戏实例传递给处理器
document.addEventListener('tetrisGameInitialized', (e) => {
    console.log("[GhostPiece] Received tetrisGameInitialized event.");
    if (e.detail && e.detail.gameInstance) {
        ghostPieceHandler_7ree.init(e.detail.gameInstance);
    } else {
        console.error("[GhostPiece] tetrisGameInitialized event missing gameInstance detail.");
    }
}); 