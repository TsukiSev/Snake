// 🐍 Juego: Snake con sonidos
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔧 Ajustes
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comida
let food = { x: 0, y: 0 };

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// 🎵 Sonidos
const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const loseSound = document.getElementById("loseSound");

// --- FUNCIONES DEL JUEGO ---
function spawnFood() {
  food.x = Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize;
  food.y = Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize;
}

// ⌨️ Movimiento
window.addEventListener("keydown", (e) => {
  // Inicia la música solo la primera vez que el jugador se mueve
  if (bgMusic.paused) {
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

// ⚙️ Lógica principal
function update() {
  if (gameOver) return;

  direction = newDirection;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 💥 Colisión con paredes
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  // 💥 Colisión consigo misma
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  // 🍎 Comer comida
  if (head.x === food.x && head.y === food.y) {
    score++;
    eatSound.currentTime = 0;
    eatSound.play();
    spawnFood();
  } else {
    snake.pop();
  }
}

// 🎨 Dibujar
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Serpiente
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#00FF00" : "#00A000";
    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
  });

  // 🍎 Comida (manzana roja)
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + tileSize / 2, food.y + tileSize / 2, tileSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Puntuación
  ctx.fillStyle = "white";
  ctx.font = "24px 'Courier New'";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Fin del juego
function endGame() {
  gameOver = true;
  bgMusic.pause();
  loseSound.play();
  setTimeout(() => {
    alert(`💀 Game Over!\nPuntuación final: ${score}`);
    window.location.reload();
  }, 500);
}

// 🌀 Bucle principal
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

spawnFood();
gameLoop();
