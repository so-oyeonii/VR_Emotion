/**
 * tetris.js
 * 테트리스 게임 로직
 */

class Tetris {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 게임 설정
        this.blockSize = 30;
        this.rows = 20;
        this.cols = 10;
        this.canvas.width = this.cols * this.blockSize;
        this.canvas.height = this.rows * this.blockSize;
        
        // 게임 상태
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        
        // 테트로미노 정의
        this.pieces = {
            'I': [[1, 1, 1, 1]],
            'O': [[1, 1], [1, 1]],
            'T': [[0, 1, 0], [1, 1, 1]],
            'S': [[0, 1, 1], [1, 1, 0]],
            'Z': [[1, 1, 0], [0, 1, 1]],
            'J': [[1, 0, 0], [1, 1, 1]],
            'L': [[0, 0, 1], [1, 1, 1]]
        };
        
        // 색상
        this.colors = {
            'I': '#00f0f0',
            'O': '#f0f000',
            'T': '#a000f0',
            'S': '#00f000',
            'Z': '#f00000',
            'J': '#0000f0',
            'L': '#f0a000'
        };
        
        this.setupControls();
    }
    
    /**
     * 빈 보드 생성
     */
    createEmptyBoard() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    }
    
    /**
     * 랜덤 피스 생성
     */
    createRandomPiece() {
        const pieceKeys = Object.keys(this.pieces);
        const randomKey = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
        return {
            shape: this.pieces[randomKey],
            type: randomKey,
            color: this.colors[randomKey]
        };
    }
    
    /**
     * 새 피스 스폰
     */
    spawnPiece() {
        this.currentPiece = this.createRandomPiece();
        this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        
        if (!this.canMove(this.currentPiece.shape, this.currentX, this.currentY)) {
            this.gameOver();
        }
    }
    
    /**
     * 게임 시작
     */
    start() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.updateScoreDisplay();
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), this.getSpeed());
    }
    
    /**
     * 게임 업데이트
     */
    update() {
        if (this.isPaused || this.isGameOver) return;
        
        if (this.canMove(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
            this.currentY++;
        } else {
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
        }
        
        this.draw();
    }
    
    /**
     * 이동 가능 여부 확인
     */
    canMove(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }
                    
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    /**
     * 피스 고정
     */
    lockPiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = this.currentX + col;
                    const y = this.currentY + row;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    /**
     * 라인 클리어
     */
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                row++; // 같은 행 다시 확인
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScoreDisplay();
            
            // 속도 조정
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.getSpeed());
        }
    }
    
    /**
     * 점수 계산
     */
    calculateScore(linesCleared) {
        const baseScore = [0, 100, 300, 500, 800];
        return baseScore[linesCleared] * this.level;
    }
    
    /**
     * 속도 계산
     */
    getSpeed() {
        return Math.max(100, 1000 - (this.level - 1) * 100);
    }
    
    /**
     * 피스 회전
     */
    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (this.canMove(rotated, this.currentX, this.currentY)) {
            this.currentPiece.shape = rotated;
            this.draw();
        }
    }
    
    /**
     * 좌우 이동
     */
    moveHorizontal(dir) {
        if (this.canMove(this.currentPiece.shape, this.currentX + dir, this.currentY)) {
            this.currentX += dir;
            this.draw();
        }
    }
    
    /**
     * 빠른 낙하
     */
    moveDown() {
        if (this.canMove(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
            this.currentY++;
            this.score += 1;
            this.updateScoreDisplay();
            this.draw();
        }
    }
    
    /**
     * 즉시 낙하
     */
    hardDrop() {
        while (this.canMove(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
            this.currentY++;
            this.score += 2;
        }
        this.updateScoreDisplay();
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
        this.draw();
    }
    
    /**
     * 그리기
     */
    draw() {
        // 배경 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 보드 그리기
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.board[row][col]);
                }
            }
        }
        
        // 현재 피스 그리기
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.drawBlock(
                            this.currentX + col,
                            this.currentY + row,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // 그리드 그리기
        this.drawGrid();
    }
    
    /**
     * 블록 그리기
     */
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.blockSize + 1,
            y * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize - 2
        );
        
        // 하이라이트
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * this.blockSize + 1,
            y * this.blockSize + 1,
            this.blockSize - 2,
            this.blockSize / 3
        );
    }
    
    /**
     * 그리드 그리기
     */
    drawGrid() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row <= this.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.blockSize);
            this.ctx.lineTo(this.canvas.width, row * this.blockSize);
            this.ctx.stroke();
        }
        
        for (let col = 0; col <= this.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.blockSize, 0);
            this.ctx.lineTo(col * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    /**
     * 점수 표시 업데이트
     */
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    /**
     * 일시정지
     */
    pause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-game').textContent = 
            this.isPaused ? '계속하기' : '일시정지';
    }
    
    /**
     * 게임 오버
     */
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        
        // 게임 오버 메시지
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, this.canvas.height / 2 - 50, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('게임 오버!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`점수: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    /**
     * 컨트롤 설정
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver || this.isPaused || !this.currentPiece) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.moveHorizontal(-1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.moveHorizontal(1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    e.preventDefault();
                    break;
                case ' ':
                    this.hardDrop();
                    e.preventDefault();
                    break;
            }
        });
    }
}

// 전역 인스턴스 생성은 main.js에서 처리
