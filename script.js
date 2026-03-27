// ===== BOARD CONFIGURATION =====

const COLS = 12;
const ROWS = 25;
const BLOCK_SIZE = 15;
const NEXT_BLOCK_SIZE = BLOCK_SIZE / 2;

const MAX_SCALE = 1;
const MIN_SCALE = 0.65;

// ===== CANVAS SETUP =====

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

nextCanvas.width = 4 * NEXT_BLOCK_SIZE;
nextCanvas.height = 4 * NEXT_BLOCK_SIZE;

context.scale(BLOCK_SIZE, BLOCK_SIZE);
nextContext.scale(NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE);

// ===== RESPONSIVE SCALING =====

function scaleGame() {
  const container = document.getElementById("gameContainer");

  const availableHeight = window.innerHeight * 0.9;
  const baseHeight = ROWS * BLOCK_SIZE;

  let scale = availableHeight / baseHeight;

  if (scale > MAX_SCALE) scale = MAX_SCALE;
  if (scale < MIN_SCALE) scale = MIN_SCALE;

  container.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", scaleGame);
window.addEventListener("load", scaleGame);

// ===== COLORS =====

const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];

// ===== GAME STATE =====

const arena = createMatrix(COLS, ROWS);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

const pieces = "TJLOSZI";
let nextPiece = createPiece(randomPiece());

let score = 0;
let totalLines = 0;

let dropCounter = 0;
let baseDropInterval = 1000;
let dropInterval = baseDropInterval;
let lastTime = 0;

let speedMultiplier = 1;

let isGameOver = false;
let isPaused = false;

// ===== MATRIX HELPERS =====

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function randomPiece() {
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function createPiece(type) {
  switch (type) {
    case "T":
      return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
    case "O":
      return [
        [2, 2],
        [2, 2],
      ];
    case "L":
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    case "J":
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    case "I":
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    case "S":
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case "Z":
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
  }
}

// ===== DRAWING =====

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(nextPiece, { x: 1, y: 1 }, nextContext);
}

// ===== COLLISION =====

function collide(arena, player) {
  const { matrix, pos } = player;

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (
        matrix[y][x] !== 0 &&
        (!arena[y + pos.y] ||
          arena[y + pos.y][x + pos.x] !== 0)
      ) {
        return true;
      }
    }
  }
  return false;
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
  let linesCleared = 0;

  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    linesCleared++;
  }

  if (linesCleared > 0) {
    score += linesCleared;
    totalLines += linesCleared;

    updateScore();

    speedMultiplier = Math.floor(totalLines / 5) + 1;
    dropInterval = baseDropInterval / speedMultiplier;
  }
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
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] =
        [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;

  rotate(player.matrix, 1);

  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -1);
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
  player.pos.x =
    ((arena[0].length / 2) | 0) -
    ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    gameOver();
  }
}

// ===== GAME LOOP =====

function update(time = 0) {
  if (isGameOver) return;

  if (isPaused) {
    requestAnimationFrame(update);
    return;
  }

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
  document.getElementById("score").innerText = score;
}

function gameOver() {
  isGameOver = true;
  document.getElementById("finalScore").innerText =
    "Score: " + score;
  document.getElementById("gameOver").classList.remove("hidden");
}

// ===== CONTROLS =====

document.addEventListener("keydown", (event) => {
  if (isGameOver || isPaused) return;

  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === "ArrowUp") playerRotate();
});

// ===== BUTTONS =====

document
  .getElementById("pauseBtn")
  .addEventListener("click", () => {
    if (isGameOver) return;

    isPaused = !isPaused;

    document.getElementById("pauseBtn").innerText =
      isPaused ? "Resume Game" : "Pause Game";
  });

document
  .getElementById("retryBtn")
  .addEventListener("click", () => {
    document
      .getElementById("gameOver")
      .classList.add("hidden");
    document
      .getElementById("startOverlay")
      .classList.remove("hidden");
  });

document
  .getElementById("startGameBtn")
  .addEventListener("click", () => {
    document
      .getElementById("startOverlay")
      .classList.add("hidden");

    arena.forEach((row) => row.fill(0));

    score = 0;
    totalLines = 0;
    speedMultiplier = 1;
    dropInterval = baseDropInterval;

    isGameOver = false;
    isPaused = false;
    lastTime = 0;

    updateScore();
    playerReset();
    update();
  });

// ===== INITIAL STATE =====

drawNext();
document
  .getElementById("startOverlay")
  .classList.remove("hidden");