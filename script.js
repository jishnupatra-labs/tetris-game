const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

context.scale(20, 20);
nextContext.scale(20, 20);

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
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

function drawNext() {
  nextContext.fillStyle = '#000';
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(nextPiece, {x: 1, y: 1}, nextContext);
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

function collide(arena, player) {
  return player.matrix.some((row, y) => {
    return row.some((value, x) => {
      return value !== 0 &&
        (arena[y + player.pos.y] &&
         arena[y + player.pos.y][x + player.pos.x]) !== 0;
    });
  });
}

function sweepRows() {
  for (let y = arena.length - 1; y >= 0; --y) {
    if (arena[y].every(value => value !== 0)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
    }
  }
}

/* ✅ SPEED SYSTEM */
let baseDropInterval = 1000;
let speedMultiplier = 1;

function updateSpeed() {
  speedMultiplier = Math.floor(blocksPlaced / 15) + 1;

  dropInterval = baseDropInterval / speedMultiplier;

  document.getElementById('speed').innerText = speedMultiplier + "x";
}

/* DROP */
function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);

    blocksPlaced++;
    updateScore();
    updateSpeed(); // ✅ NEW

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
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
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
  nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  drawNext();

  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);

  if (collide(arena, player)) gameOver();
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

/* GAME LOOP */
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;

function update(time = 0) {
  if (isGameOver) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();

  draw();
  requestAnimationFrame(update);
}

/* CONTROLS */
document.addEventListener('keydown', event => {
  if (isGameOver) return;

  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'ArrowUp') playerRotate();
});

/* COLORS */
const colors = [
  null,
  '#FF0D72','#0DC2FF','#0DFF72',
  '#F538FF','#FF8E0D','#FFE138','#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null
};

const pieces = 'TJLOSZI';
let nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);

/* SCORE */
let blocksPlaced = 0;

function updateScore() {
  document.getElementById('score').innerText = blocksPlaced;
}

/* GAME OVER */
function gameOver() {
  isGameOver = true;
  document.getElementById('gameOver').classList.remove('hidden');
  document.getElementById('finalScore').innerText =
    "Blocks Placed: " + blocksPlaced;
}

/* RESTART */
function restartGame() {
  arena.forEach(row => row.fill(0));
  blocksPlaced = 0;

  updateScore();
  updateSpeed(); // ✅ reset speed

  isGameOver = false;
  document.getElementById('gameOver').classList.add('hidden');

  nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  playerReset();
  update();
}

/* START */
updateSpeed(); // ✅ initialize
playerReset();
drawNext();
update();