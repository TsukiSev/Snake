// 🐍 Snake Avanzado: Menú + Obstáculos + Borde Continuo + Sonidos + Manzanas con Tiempo

// --- ACCESO AL DOM ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("startMenu");
const gameContainer = document.getElementById("gameContainer");
const appleCountInput = document.getElementById("appleCount");
const startButton = document.getElementById("startButton");

// 🎵 Sonidos
const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const loseSound = document.getElementById("loseSound");

// 🔧 Configuración del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

let foods = [];
let numberOfApples = 1;
const APPLE_LIFETIME = 7000; // 7s de duración de la manzana

let obstacles = [];
let obstacleCheckInterval = 5000; // Cada 5s se revisa si aparece uno nuevo
let lastObstacleCheck = Date.now();

// --- IMÁGENES ---
const appleImg = new Image();
appleImg.src = 'assets/apple-red.svg';
const goldAppleImg = new Image();
goldAppleImg.src = 'assets/apple-gold.svg';

const bgImg = new Image();
bgImg.src = 'assets/background.svg';

const snakeHeadImg = new Image();
snakeHeadImg.src = 'assets/snake-head.svg';
const snakeBodyImg = new Image();
snakeBodyImg.src = 'assets/snake-body.svg';

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// --- MENÚ DE INICIO ---
startButton.addEventListener("click", () => {
  const appleCount = parseInt(appleCountInput.value);
  if (appleCount > 0 && appleCount <= 20) {
    numberOfApples = appleCount;
    startMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    snake = [{ x: tileSize * 10, y: tileSize * 10 }];
    direction = { x: tileSize, y: 0 };
    newDirection = { x: tileSize, y: 0 };
    foods = [];
    obstacles = [];
    score = 0;
    gameOver = false;
    lastObstacleCheck = Date.now();

    initializeGame();
  } else {
    alert("Por favor, introduce un número de manzanas entre 1 y 20.");
  }
});

// --- CONTROL DEL TECLADO ---
window.addEventListener("keydown", (e) => {
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => {});
  }

  switch (e.key.toLowerCase()) {
    case "w":
    case "arrowup":
      if (direction.y === 0) newDirection = { x: 0, y: -tileSize };
      break;
    case "s":
    case "arrowdown":
      if (direction.y === 0) newDirection = { x: 0, y: tileSize };
      break;
    case "a":
    case "arrowleft":
      if (direction.x === 0) newDirection = { x: -tileSize, y: 0 };
      break;
    case "d":
    case "arrowright":
      if (direction.x === 0) newDirection = { x: tileSize, y: 0 };
      break;
  }
});

// --- INICIO DEL JUEGO ---
function initializeGame() {
  spawnFoods();
  gameLoop();
}

// ✨ Posición aleatoria alineada a la cuadrícula
function randomGridPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
      y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
    };
  } while (
    snake.some((s) => s.x === position.x && s.y === position.y) ||
    obstacles.some((o) => o.x === position.x && o.y === position.y) ||
    foods.some((f) => f.x === position.x && f.y === position.y)
  );
  return position;
}

// 🍎 Genera comidas múltiples con tiempo de vida
function spawnFoods() {
  while (foods.length < numberOfApples) {
    const isGolden = Math.random() < 0.1;
    const pos = randomGridPosition();
    foods.push({
      x: pos.x,
      y: pos.y,
      color: isGolden ? "gold" : "red",
      img: isGolden ? goldAppleImg : appleImg,
      points: isGolden ? 10 : 1,
      spawnTime: Date.now(),
    });
  }
}

// 💀 Obstáculos
function spawnObstacle() {
  if (obstacles.length >= 10) return;
  const pos = randomGridPosition();
  obstacles.push(pos);
}

// ⏱️ Elimina manzanas expiradas
function updateFoodTimers() {
  const now = Date.now();
  for (let i = foods.length - 1; i >= 0; i--) {
    if (now - foods[i].spawnTime >= APPLE_LIFETIME) {
      foods.splice(i, 1);
    }
  }
  spawnFoods();
}

// ⚙️ Lógica del juego
function update() {
  if (gameOver) return;

  direction = newDirection;
  if (direction.x === 0 && direction.y === 0) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 🌍 Movimiento continuo por bordes
  if (head.x < 0) head.x = canvas.width - tileSize;
  else if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - tileSize;
  else if (head.y >= canvas.height) head.y = 0;

  // 💥 Colisiones
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) return endGame();
  }
  for (const obs of obstacles) {
    if (head.x === obs.x && head.y === obs.y) return endGame();
  }

  snake.unshift(head);

  // 🍏 Comer manzana
  let ate = false;
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    if (f.x === head.x && f.y === head.y) {
      score += f.points;
      if (eatSound) {
        eatSound.currentTime = 0;
        eatSound.play().catch(() => {});
      }

      if (f.points === 10) {
        const tail = snake[snake.length - 1];
        for (let j = 0; j < 9; j++) snake.push({ ...tail });
      }

      foods.splice(i, 1);
      ate = true;
      spawnFoods();
      break;
    }
  }

  if (!ate) snake.pop();

  updateFoodTimers();

  // ⏱️ Cada 5s, 50% de probabilidad de generar obstáculo
  const now = Date.now();
  if (now - lastObstacleCheck >= obstacleCheckInterval) {
    lastObstacleCheck = now;
    if (Math.random() < 0.5) spawnObstacle();
  }
}

// 🎨 Dibujar todo
function draw() {
  // Fondo
  if (bgImg && bgImg.complete) {
    try {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach((obs) => ctx.fillRect(obs.x, obs.y, tileSize, tileSize));

  // Serpiente
  snake.forEach((segment, index) => {
    if (index === 0 && snakeHeadImg.complete) {
      ctx.save();
      const cx = segment.x + tileSize / 2;
      const cy = segment.y + tileSize / 2;
      ctx.translate(cx, cy);
      let angle = 0;
      if (direction.x > 0) angle = 0;
      else if (direction.x < 0) angle = Math.PI;
      else if (direction.y > 0) angle = Math.PI / 2;
      else if (direction.y < 0) angle = -Math.PI / 2;
      ctx.rotate(angle);
      ctx.drawImage(snakeHeadImg, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
      ctx.restore();
    } else if (index > 0 && snakeBodyImg.complete) {
      ctx.drawImage(snakeBodyImg, segment.x, segment.y, tileSize, tileSize);
    } else {
      ctx.fillStyle = index === 0 ? "#00FF00" : "#00A000";
      ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
    }
  });

  // Comidas con barra de tiempo
  const now = Date.now();
  foods.forEach((f) => {
    const remaining = Math.max(0, (APPLE_LIFETIME - (now - f.spawnTime)) / APPLE_LIFETIME);
    if (f.img && f.img.complete) {
      ctx.drawImage(f.img, f.x, f.y, tileSize, tileSize);
    } else {
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, tileSize, tileSize);
    }

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(f.x, f.y + tileSize - 3, tileSize, 3);
    ctx.fillStyle = remaining > 0.6 ? "#0f0" : remaining > 0.3 ? "#ff0" : "#f00";
    ctx.fillRect(f.x, f.y + tileSize - 3, tileSize * remaining, 3);
  });

  // Puntaje
  ctx.fillStyle = "#fff";
  ctx.font = "24px 'Courier New'";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Fin del juego
function endGame() {
  gameOver = true;
  if (bgMusic) bgMusic.pause();
  if (loseSound) loseSound.play().catch(() => {});
  setTimeout(() => {
    alert(`💀 Game Over!\nPuntuación final: ${score}`);
    gameContainer.classList.add("hidden");
    startMenu.classList.remove("hidden");
  }, 500);
}

// 🔁 Bucle principal
function gameLoop() {
  if (gameOver) return;
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}
