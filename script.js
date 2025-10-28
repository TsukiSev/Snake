// 🐍 Juego: Snake con obstáculos aleatorios (50% de probabilidad cada 5s)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔧 Ajustes del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Configuración de la serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comida
let food = { x: 0, y: 0 };

// 💀 Obstáculos
let obstacles = [];
let obstacleCheckInterval = 5000; // cada 5 segundos se revisa si aparece uno nuevo
let lastObstacleCheck = Date.now();

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// --- FUNCIONES DEL JUEGO ---

// ✨ Genera una posición aleatoria alineada a la cuadrícula
function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
    y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
  };
}

// 🍎 Genera comida evitando la serpiente y los obstáculos
function spawnFood() {
  let newFood;
  do {
    newFood = randomGridPosition();
  } while (
    snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
    obstacles.some((o) => o.x === newFood.x && o.y === newFood.y)
  );
  food = newFood;
}

// 🧱 Genera un obstáculo nuevo evitando zonas ocupadas
function spawnObstacle() {
  let newObstacle;
  do {
    newObstacle = randomGridPosition();
  } while (
    snake.some((s) => s.x === newObstacle.x && s.y === newObstacle.y) ||
    obstacles.some((o) => o.x === newObstacle.x && o.y === newObstacle.y) ||
    (food.x === newObstacle.x && food.y === newObstacle.y)
  );
  obstacles.push(newObstacle);
}

// ⌨️ Control del jugador
window.addEventListener("keydown", (e) => {
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

// ⚙️ Actualizar la lógica del juego
function update() {
  if (gameOver) return;

  direction = newDirection;
  if (direction.x === 0 && direction.y === 0) return; // Aún no se mueve

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 1️⃣ Colisión con paredes
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  // 2️⃣ Colisión consigo misma
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }

  // 3️⃣ Colisión con obstáculos
  for (const obs of obstacles) {
    if (head.x === obs.x && head.y === obs.y) {
      endGame();
      return;
    }
  }

  // Mueve la serpiente
  snake.unshift(head);

  // 4️⃣ Comer comida
  if (head.x === food.x && head.y === food.y) {
    score++;
    spawnFood();
  } else {
    snake.pop();
  }

  // 5️⃣ Cada 5s hay un 50% de probabilidad de generar un obstáculo
  const now = Date.now();
  if (now - lastObstacleCheck >= obstacleCheckInterval) {
    lastObstacleCheck = now;
    if (Math.random() < 0.5) {
      spawnObstacle();
    }
  }
}

// 🎨 Dibujar todo
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

  // Comida
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, tileSize, tileSize);

  // Puntaje
  ctx.fillStyle = "white";
  ctx.font = "24px 'Courier New'";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Terminar juego
function endGame() {
  gameOver = true;
  alert(`💀 Game Over!\nPuntuación final: ${score}`);
  window.location.reload();
}

// 🌀 Bucle principal
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

// --- INICIO ---
spawnFood();
gameLoop();
