// --- UTILS ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

// --- BLOCK ---
class Block {
    constructor(shape, type) {
        this.shape = shape;
        this.type = type; // Dodaj typ do koloru
        this.rotationIndex = 0;
        this.position = { x: 3, y: 0 };
    }
    rotate() {
        this.shape = rotateMatrix(this.shape);
    }
    static getRandomBlock() {
        const shapes = [
            { shape: [[1, 1, 1, 1]], type: 'i' }, // I
            { shape: [[1, 1], [1, 1]], type: 'o' }, // O
            { shape: [[0, 1, 0], [1, 1, 1]], type: 't' }, // T
            { shape: [[1, 1, 0], [0, 1, 1]], type: 's' }, // S
            { shape: [[0, 1, 1], [1, 1, 0]], type: 'z' }, // Z
            { shape: [[1, 0, 0], [1, 1, 1]], type: 'l' }, // L
            { shape: [[0, 0, 1], [1, 1, 1]], type: 'j' }, // J
        ];
        const randomIndex = getRandomInt(0, shapes.length);
        const { shape, type } = shapes[randomIndex];
        return new Block(shape, type);
    }
}

// --- BOARD ---
class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
    }
    createGrid() {
        return Array.from({ length: this.height }, () => Array(this.width).fill(0));
    }
    placeBlock(block) {
        block.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const px = block.position.x + x;
                    const py = block.position.y + y;
                    if (py >= 0 && py < this.height && px >= 0 && px < this.width)
                        this.grid[py][px] = block.type; // <-- zapisz typ bloku zamiast 1
                }
            });
        });
    }
    clearLines() {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(v => v !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(0));
                linesCleared++;
                y++;
            }
        }
        return linesCleared;
    }
    isRowFilled(row) {
        return this.grid[row].every(value => value !== 0);
    }
    isPositionValid(block, pos) {
        return block.shape.every((row, y) => {
            return row.every((value, x) => {
                if (value === 0) return true;
                const newX = x + pos.x;
                const newY = y + pos.y;
                return (
                    newX >= 0 &&
                    newX < this.width &&
                    newY < this.height &&
                    newY >= 0 &&
                    this.grid[newY][newX] === 0
                );
            });
        });
    }
}

// --- SCORE ---
class Score {
    constructor() { this.score = 0; }
    addScore(linesCleared) {
        const points = [0, 100, 300, 500, 800][linesCleared] || 0;
        this.score += points;
    }
    getScore() { return this.score; }
    resetScore() { this.score = 0; }
}

// --- PREVIEW (uniwersalny dla next i hold) ---
class Preview {
    constructor(element) { this.element = element; }
    updatePreview(block) {
        this.element.innerHTML = '';
        if (!block) return;
        // Wyznacz rozmiar bloku
        const rows = block.shape.length;
        const cols = block.shape[0].length;
        // Szukaj minimalnych i maksymalnych wypełnionych wierszy/kolumn
        let minX = 4, minY = 4, maxX = 0, maxY = 0;
        block.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            });
        });
        const shapeWidth = maxX - minX + 1;
        const shapeHeight = maxY - minY + 1;
        const offsetX = Math.floor((4 - shapeWidth) / 2) - minX;
        const offsetY = Math.floor((4 - shapeHeight) / 2) - minY;

        block.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const div = document.createElement('div');
                    div.className = 'block ' + block.type;
                    div.style.gridRowStart = y + 1 + offsetY;
                    div.style.gridColumnStart = x + 1 + offsetX;
                    this.element.appendChild(div);
                }
            });
        });
    }
}

// --- HOLD ---
class Hold {
    constructor(preview) { this.heldBlock = null; this.preview = preview; }
    swap(currentBlock, nextBlock) {
        let outBlock;
        if (this.heldBlock) {
            outBlock = this.heldBlock;
            this.heldBlock = currentBlock;
        } else {
            this.heldBlock = currentBlock;
            outBlock = nextBlock;
        }
        this.preview.updatePreview(this.heldBlock);
        return outBlock;
    }
    reset() { }
}

// --- RENDERER (2D for simplicity) ---
class Renderer {
    constructor(canvas, board) {
        this.ctx = canvas.getContext('2d');
        this.board = board;
        this.blockSize = 30;
        canvas.width = board.width * this.blockSize;
        canvas.height = board.height * this.blockSize;
    }
    render(board, currentBlock) {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // Draw board
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const cell = board.grid[y][x];
                if (cell) {
                    this.ctx.save();
                    this.ctx.translate(x * this.blockSize, y * this.blockSize);
                    this.ctx.fillStyle = getBlockColor(cell); // <-- kolor na podstawie typu
                    this.ctx.strokeStyle = '#fff4';
                    this.ctx.lineWidth = 2;
                    this.ctx.globalAlpha = 0.95;
                    this.ctx.fillRect(0, 0, this.blockSize, this.blockSize);
                    this.ctx.strokeRect(0, 0, this.blockSize, this.blockSize);
                    this.ctx.restore();
                }
            }
        }
        // Draw current block
        if (currentBlock) {
            currentBlock.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const px = currentBlock.position.x + x;
                        const py = currentBlock.position.y + y;
                        this.ctx.save();
                        this.ctx.translate(px * this.blockSize, py * this.blockSize);
                        this.ctx.globalAlpha = 0.95;
                        this.ctx.fillStyle = getBlockColor(currentBlock.type);
                        this.ctx.strokeStyle = '#fff4';
                        this.ctx.lineWidth = 2;
                        this.ctx.fillRect(0, 0, this.blockSize, this.blockSize);
                        this.ctx.strokeRect(0, 0, this.blockSize, this.blockSize);
                        this.ctx.restore();
                    }
                });
            });
        }
        // Draw grid lines
        this.ctx.save();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= board.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, board.height * this.blockSize);
            this.ctx.stroke();
        }
        for (let y = 0; y <= board.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(board.width * this.blockSize, y * this.blockSize);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
}

// --- TETRIS GAME ---
class Tetris {
    constructor(canvas, hudElement, previewElement, holdElement) {
        this.board = new Board(10, 20);
        this.score = new Score();
        this.preview = new Preview(previewElement);
        this.holdPreview = new Preview(holdElement);
        this.hold = new Hold(this.holdPreview);
        this.hud = new HUD(hudElement);
        this.renderer = new Renderer(canvas, this.board);
        this.currentBlock = Block.getRandomBlock();
        this.nextBlock = Block.getRandomBlock();
        this.isGameOver = false;
        this.dropInterval = 500;
        this.lastDrop = Date.now();
        this.canHold = true;
        this.updatePreviews();
        this.initControls();
        this.loop();
    }
    updatePreviews() {
        this.preview.updatePreview(this.nextBlock);
        this.holdPreview.updatePreview(this.hold.heldBlock);
    }
    spawnNewBlock() {
        this.currentBlock = this.nextBlock;
        this.currentBlock.position = { x: 3, y: 0 };
        this.nextBlock = Block.getRandomBlock();
        this.canHold = true; // reset po każdym locku
        this.updatePreviews();
        if (!this.board.isPositionValid(this.currentBlock, this.currentBlock.position)) {
            this.isGameOver = true;
            alert('Game Over! Score: ' + this.score.getScore());
        }
    }
    moveBlock(dx, dy) {
        const newPos = { x: this.currentBlock.position.x + dx, y: this.currentBlock.position.y + dy };
        if (this.board.isPositionValid(this.currentBlock, newPos)) {
            this.currentBlock.position = newPos;
            return true;
        }
        return false;
    }
    rotateBlock() {
        const oldShape = JSON.parse(JSON.stringify(this.currentBlock.shape));
        this.currentBlock.rotate();
        if (!this.board.isPositionValid(this.currentBlock, this.currentBlock.position)) {
            this.currentBlock.shape = oldShape;
        }
    }
    holdBlock() {
        if (!this.canHold) return; // tylko raz na blok
        this.canHold = false;
        if (this.hold.heldBlock) {
            // Zamiana: current <-> hold
            const temp = this.hold.heldBlock;
            this.hold.heldBlock = this.currentBlock;
            this.currentBlock = temp;
            this.currentBlock.position = { x: 3, y: 0 };
        } else {
            this.hold.heldBlock = this.currentBlock;
            this.currentBlock = this.nextBlock;
            this.currentBlock.position = { x: 3, y: 0 };
            this.nextBlock = Block.getRandomBlock();
        }
        this.updatePreviews();
    }
    dropBlock() {
        while (this.moveBlock(0, 1)) { }
        this.lockBlock();
    }
    lockBlock() {
        this.board.placeBlock(this.currentBlock);
        const lines = this.board.clearLines();
        this.score.addScore(lines);
        this.hud.update(this.score.getScore());
        this.spawnNewBlock();
    }
    loop() {
        if (this.isGameOver) return;
        const now = Date.now();
        if (now - this.lastDrop > this.dropInterval) {
            if (!this.moveBlock(0, 1)) {
                this.lockBlock();
            }
            this.lastDrop = now;
        }
        this.renderer.render(this.board, this.currentBlock);
        requestAnimationFrame(() => this.loop());
    }
    initControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            switch (e.key) {
                case 'ArrowLeft':
                    this.moveBlock(-1, 0);
                    break;
                case 'ArrowRight':
                    this.moveBlock(1, 0);
                    break;
                case 'ArrowDown':
                    this.moveBlock(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotateBlock();
                    break;
                case ' ':
                    this.dropBlock();
                    break;
                case 'c':
                case 'C':
                    this.holdBlock();
                    break;
            }
        });
    }
}

// --- HUD ---
class HUD {
    constructor(element) { this.element = element; }
    update(score) { this.element.innerText = `Score: ${score}`; }
}

// --- UTILS ---
function getBlockColor(type) {
    switch (type) {
        case 'i': return '#00eaff';
        case 'o': return '#ffd60a';
        case 't': return '#a259ff';
        case 's': return '#00ff66';
        case 'z': return '#ff1744';
        case 'l': return '#ff9100';
        case 'j': return '#2979ff';
        default: return '#0ff';
    }
}

// --- INIT ---
let tetrisGame = null;

window.onload = function () {
    const canvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const preview = document.getElementById('next-block-preview');
    const hold = document.getElementById('hold-block-preview');
    tetrisGame = new Tetris(canvas, hud, preview, hold);

    document.getElementById('reset-btn').onclick = function () {
        tetrisGame = new Tetris(canvas, hud, preview, hold);
    };
};