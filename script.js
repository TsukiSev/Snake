// 🐍 Juego: Snake con sonidos y movimiento continuo por los bordes
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM para el menú (aunque no se usan en esta versión base, se mantienen por consistencia)
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const appleCountInput = document.getElementById('appleCount');
const startButton = document.getElementById('startButton');

// 🔧 Ajustes
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comida (Versión simple, una sola manzana)
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
  let newFood;
  do {
    newFood = {
        x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
        y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
    };
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
  
  food = newFood;
}

// ⌨️ Movimiento
window.addEventListener("keydown", (e) => {
  // Inicia la música solo la primera vez que el jugador se mueve
  // Nota: Esto puede fallar debido a restricciones de autoplay, pero se mantiene la lógica original
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic.play().catch(e => console.warn("Error al iniciar la música.", e));
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
  if (direction.x === 0 && direction.y === 0) return; // Espera el primer movimiento

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 🌍 Movimiento continuo por los bordes (Solución de Salir-de-lados)
  if (head.x < 0) head.x = canvas.width - tileSize;
  else if (head.x >= canvas.width) head.x = 0;

  if (head.y < 0) head.y = canvas.height - tileSize;
  else if (head.y >= canvas.height) head.y = 0;

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
    if (eatSound) {
        eatSound.currentTime = 0;
        eatSound.play().catch(e => console.warn("Error al reproducir sonido de comer.", e));
    }
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
  ctx.font = "24px 'Courier New', Courier, monospace";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Fin del juego
function endGame() {
  gameOver = true;
  if (bgMusic) bgMusic.pause();
  if (loseSound) {
    loseSound.play().catch(e => console.warn("Error al reproducir sonido de perder.", e));
  }
  
  setTimeout(() => {
    // Nota: window.location.reload() se usó en la versión original de 'main'
    // En entornos con menú, es mejor mostrar el menú de nuevo.
    alert(`💀 Game Over!\nPuntuación final: ${score}`);
    
    // Si los elementos del menú existen, volvemos al menú.
    if (gameContainer && startMenu) {
        gameContainer.classList.add('hidden');
        startMenu.classList.remove('hidden');
    } else {
        window.location.reload();
    }
  }, 500);
}

// 🌀 Bucle principal
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

// --- INICIO DEL JUEGO ---
spawnFood(); // Coloca la primera comida
gameLoop();  // ¡Empieza el juego!
