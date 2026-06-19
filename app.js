const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scale = 24;
const cols = 10;
const rows = 20;
canvas.width = cols * scale;
canvas.height = rows * scale;

const colors = [null, '#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [ [0,1,0], [1,1,1], [0,0,0] ];
    case 'O': return [ [2,2], [2,2] ];
    case 'L': return [ [0,0,3], [3,3,3], [0,0,0] ];
    case 'J': return [ [4,0,0], [4,4,4], [0,0,0] ];
    case 'I': return [ [0,5,0,0], [0,5,0,0], [0,5,0,0], [0,5,0,0] ];
    case 'S': return [ [0,6,6], [6,6,0], [0,0,0] ];
    case 'Z': return [ [7,7,0], [0,7,7], [0,0,0] ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect((x + offset.x) * scale, (y + offset.y) * scale, scale - 1, scale - 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#041116';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
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
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    updateScore();
  }
}

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    rowCount++;
  }
  if (rowCount > 0) {
    player.score += rowCount * rowCount * 100;
    player.lines += rowCount;
    player.level = Math.floor(player.lines / 5) + 1;
    updateScore();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

let dropCounter = 0;
let dropInterval = 700;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').textContent = player.score;
  document.getElementById('lines').textContent = player.lines;
  document.getElementById('level').textContent = player.level;
  dropInterval = Math.max(100, 700 - (player.level - 1) * 60);
}

const arena = createMatrix(cols, rows);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
  lines: 0,
  level: 1,
};

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  }
});

document.getElementById('restart').addEventListener('click', () => {
  arena.forEach(row => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.level = 1;
  playerReset();
  updateScore();
});

playerReset();
updateScore();
update();
