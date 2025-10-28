// 🐍 Juego: Snake
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔧 Ajustes del lienzo y del juego
const tileSize = 20; // Tamaño de cada cuadro (la cabeza de la serpiente, cuerpo, comida)
canvas.width = 600;  // Ancho (múltiplo de tileSize)
canvas.height = 600; // Alto (múltiplo de tileSize)

// 🐍 Configuración de la serpiente
let snake = [
  { x: tileSize * 10, y: tileSize * 10 } // Posición inicial en el centro
];
let direction = { x: 0, y: 0 }; // Dirección inicial (quieta)
let newDirection = { x: 0, y: 0 }; // Para evitar que la serpiente se invierta

// 🍎 Comida
let food = { x: 0, y: 0 };

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100; // milisegundos por frame (menor es más rápido)

// --- FUNCIONES DEL JUEGO ---

// ✨ Genera una nueva posición para la comida
function spawnFood() {
  food.x = Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize;
  food.y = Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize;
}

// ⌨️ Control del jugador
window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
    case "arrowup":
      // Evita que la serpiente vaya en la dirección opuesta
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

// ⚙️ Actualizar la lógica y posiciones
function update() {
  if (gameOver) return;

  direction = newDirection;

  // Calcula la nueva posición de la cabeza
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 1. Detección de colisión con las paredes
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  // 2. Detección de colisión consigo misma
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }

  // Añade la nueva cabeza
  snake.unshift(head);

  // 3. Detección de colisión con la comida
  if (head.x === food.x && head.y === food.y) {
    score++;
    spawnFood(); // Genera nueva comida
    // La serpiente crece al no quitarle la cola
  } else {
    snake.pop(); // Si no come, quita el último segmento de la cola
  }
}

// 🎨 Dibujar todo en pantalla
function draw() {
  // Fondo negro
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibuja la serpiente
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#00FF00" : "#00A000"; // Cabeza verde brillante
    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
    ctx.strokeStyle = "#000"; // Borde para cada segmento
    ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
  });

  // Dibuja la comida
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, tileSize, tileSize);

  // Dibuja la puntuación
  ctx.fillStyle = "white";
  ctx.font = "24px 'Courier New', Courier, monospace";
  ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Función para terminar el juego
function endGame() {
  gameOver = true;
  alert(`💀 Game Over!\nPuntuación final: ${score}`);
  // Recarga la página para reiniciar
  window.location.reload();
}

// 🌀 Bucle principal del juego
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

// --- INICIO DEL JUEGO ---
spawnFood(); // Coloca la primera comida
gameLoop();  // ¡Empieza el juego!