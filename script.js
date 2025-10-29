// 🐍 Snake completo: menú + obstáculos + bordes continuos + sonidos + manzanas múltiples

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM
const startMenu = document.getElementById("startMenu");
const gameContainer = document.getElementById("gameContainer");
const appleCountInput = document.getElementById("appleCount");
const startButton = document.getElementById("startButton");

// 🎵 Sonidos
const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const loseSound = document.getElementById("loseSound");

// 🔧 Configuración del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comidas múltiples
let foods = [];
let numberOfApples = 1;

// 💀 Obstáculos
let obstacles = [];
let obstacleCheckInterval = 5000; // cada 5s
let lastObstacleCheck = Date.now();

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// --- CONTROL DEL MENÚ ---
startButton.addEventListener("click", () => {
  const appleCount = parseInt(appleCountInput.value);
  if (appleCount > 0 && appleCount <= 20) {
    numberOfApples = appleCount;
    startMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    initializeGame();
  } else {
    alert("Por favor, introduce un número de manzanas entre 1 y 20.");
  }
});

// --- CONTROL DEL TECLADO ---
window.addEventListener("keydown", (e) => {
  // Inicia la música al primer movimiento
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic.play();
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

// --- FUNCIONES DEL JUEGO ---
function initializeGame() {
  spawnFoods();
  gameLoop();
}

// ✨ Genera una posición aleatoria alineada a la cuadrícula
function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
    y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
  };
}

// 🍎 Genera comidas evitando la serpiente y los obstáculos
function spawnFoods() {
  while (foods.length < numberOfApples) {
    const isGolden = Math.random() < 0.1;
    let newFood;
    do {
      newFood = randomGridPosition();
    } while (
      snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
      obstacles.some((o) => o.x === newFood.x && o.y === newFood.y)
    );

    foods.push({
      ...newFood,
      color: isGolden ? "gold" : "red",
      points: isGolden ? 10 : 1,
    });
  }
}

// 🧱 Genera un obstáculo nuevo evitando zonas ocupadas
function spawnObstacle() {
  let newObstacle;
  do {
    newObstacle = randomGridPosition();
  } while (
    snake.some((s) => s.x === newObstacle.x && s.y === newObstacle.y) ||
    obstacles.some((o) => o.x === newObstacle.x && o.y === newObstacle.y) ||
    foods.some((f) => f.x === newObstacle.x && f.y === newObstacle.y)
  );
  obstacles.push(newObstacle);
}

// 🔁 Actualiza el juego
function update() {
  if (gameOver) return;

  direction = newDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 🌍 Movimiento continuo por los bordes
  if (head.x < 0) head.x = canvas.width - tileSize;
  else if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - tileSize;
  else if (head.y >= canvas.height) head.y = 0;

  // 💥 Colisión con obstáculos
  for (const obs of obstacles) {
    if (head.x === obs.x && head.y === obs.y) {
      endGame();
      return;
    }
  }

  // 💥 Colisión consigo misma
  if (isCollisionWithBody(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // 🍎 Comida
  let ateFood = false;
  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    if (head.x === food.x && head.y === food.y) {
      score += food.points;
      if (eatSound) {
        eatSound.currentTime = 0;
        eatSound.play();
      }

      // 🍏 Si es manzana dorada, añade más segmentos
      if (food.points === 10) {
        const tail = snake[snake.length - 1];
        for (let j = 0; j < 9; j++) {
          snake.push({ ...tail });
        }
      }

      foods.splice(i, 1);
      ateFood = true;
      spawnFoods();
      break;
    }
  }

  if (!ateFood) snake.pop();

  // ⏱️ Cada 5s, 50% de probabilidad de generar obstáculo
  const now = Date.now();
  if (now - lastObstacleCheck >= obstacleCheckInterval) {
    lastObstacleCheck = now;
    if (Math.random() < 0.5) spawnObstacle();
  }
}

function isCollisionWithBody(head) {
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

// 🎨 Dibuja todo
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Obstáculos
  ctx.fillStyle = "#555";
  obstacles.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, tileSize, tileSize);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(obs.x, obs.y, tileSize, tileSize);
  });

  // Serpiente
  snake.forEach((segment, i) => {
    ctx.fillStyle = i === 0 ? "#00FF00" : "#00A000";
    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
  });

  // Comidas
  foods.forEach((food) => {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, tileSize, tileSize);
  });

  // Puntaje
  ctx.fillStyle = "white";
  ctx.font = "24px 'Courier New'";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Fin del juego
function endGame() {
  gameOver = true;
  if (bgMusic) bgMusic.pause();
  if (loseSound) loseSound.play();
  setTimeout(() => {
    alert(`💀 Game Over!\nPuntuación final: ${score}`);
    window.location.reload();
  }, 500);
}

// 🔁 Bucle principal
function gameLoop() {
  if (gameOver) return;
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}
