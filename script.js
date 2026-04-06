// ===== CONFIG =====
const COLS = 12;
const ROWS = 25;
const BLOCK_SIZE = 24;

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

const pauseBtn = document.getElementById('pauseBtn');

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;


// ===== TEXTURES =====
const blockTexture = new Image();
blockTexture.src = "assets/squaretile-block.png";

const arenaTexture = new Image();
arenaTexture.src = "assets/arena-background.jpg";


// ===== GAME STATE =====
const arena = createMatrix(COLS, ROWS);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null
};

const pieces = 'TJLOSZI';
let nextPiece = createPiece(randomPiece());

let score = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;


// ===== MATRIX =====
function createMatrix(w, h) {
    return Array.from({ length: h }, () => Array(w).fill(0));
}

function randomPiece() {
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function createPiece(type) {
    switch (type) {
        case 'T': return [[0,1,0],[1,1,1],[0,0,0]];
        case 'O': return [[2,2],[2,2]];
        case 'L': return [[0,3,0],[0,3,0],[0,3,3]];
        case 'J': return [[0,4,0],[0,4,0],[4,4,0]];
        case 'I': return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
        case 'S': return [[0,6,6],[6,6,0],[0,0,0]];
        case 'Z': return [[7,7,0],[0,7,7],[0,0,0]];
    }
}


// ===== DRAW =====
function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.drawImage(
                    blockTexture,
                    (x + offset.x) * BLOCK_SIZE,
                    (y + offset.y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Arena background
    if (arenaTexture.complete) {
        context.drawImage(
            arenaTexture,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function drawNext() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece, { x: 1, y: 1 }, nextContext);
}


// ===== COLLISION =====
function collide(arena, player) {
    return player.matrix.some((row, y) => {
        return row.some((value, x) => {
            return value !== 0 &&
                (arena[y + player.pos.y] &&
                arena[y + player.pos.y][x + player.pos.x]) !== 0;
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


// ===== ROW CLEAR =====
function sweepRows() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) continue outer;
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y--;

        score++;
        dropInterval *= 0.9;
    }

    updateScore();
}


// ===== PLAYER =====
function playerDrop() {
    player.pos.y++;

    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        sweepRows();
        playerReset();
    }

    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function rotate(matrix) {
    return matrix[0].map((_, i) =>
        matrix.map(row => row[i])
    ).reverse();
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;

    player.matrix = rotate(player.matrix);

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            player.matrix = rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    player.matrix = nextPiece;
    nextPiece = createPiece(randomPiece());
    drawNext();

    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) -
        (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        isGameOver = true;
        pauseBtn.innerText = "Pause Game";
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').innerText = "Score: " + score;
    }
}


// ===== LOOP =====
function update(time = 0) {
    if (isGameOver || isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}


// ===== UI =====
function updateScore() {
    document.getElementById('score').innerText = score;
}

document.addEventListener('keydown', event => {
    if (isGameOver || isPaused) return;

    if (event.key === 'ArrowLeft') playerMove(-1);
    else if (event.key === 'ArrowRight') playerMove(1);
    else if (event.key === 'ArrowDown') playerDrop();
    else if (event.key === 'ArrowUp') playerRotate();
});

pauseBtn.onclick = () => {
    if (isGameOver) return;

    isPaused = !isPaused;

    if (isPaused) {
        pauseBtn.innerText = "Resume Game";
    } else {
        pauseBtn.innerText = "Pause Game";
        update();
    }
};

document.getElementById('retryBtn').onclick = () => {
    location.reload();
};

document.getElementById('startGameBtn').onclick = () => {
    document.getElementById('startOverlay').classList.add('hidden');
    playerReset();
    update();
};