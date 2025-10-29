<<<<<<< HEAD
// 🐍 Juego: Snake con obstáculos aleatorios (50% de probabilidad cada 5s) + versión mejorada con menú y manzanas múltiples + movimiento continuo por los bordes

=======
// Juego: Snake - Versión Mejorada
>>>>>>> origin/Manzana-Tiempo-(Daniel)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM para el menú
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const appleCountInput = document.getElementById('appleCount');
const startButton = document.getElementById('startButton');
<<<<<<< HEAD

// 🔧 Ajustes del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Configuración de la serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comidas múltiples
let foods = [];
let numberOfApples = 1;

// 💀 Obstáculos
let obstacles = [];
let obstacleCheckInterval = 5000; // cada 5 segundos se revisa si aparece uno nuevo
let lastObstacleCheck = Date.now();
=======

// Ajustes del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// Configuración de la serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };
>>>>>>> origin/Manzana-Tiempo-(Daniel)

// Comida (Ahora es un array para múltiples manzanas)
let foods = [];
let numberOfApples = 1;
const APPLE_LIFETIME = 7000; // Tiempo de vida de la manzana en milisegundos

// Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;
<<<<<<< HEAD
=======

// --- CONTROL DEL JUEGO ---

startButton.addEventListener('click', () => {
    const appleCount = parseInt(appleCountInput.value);
    if (appleCount > 0 && appleCount <= 20) {
        numberOfApples = appleCount;
        startMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden'); // Muestra el contenedor del juego
        initializeGame();
    } else {
        alert('Por favor, introduce un número de manzanas entre 1 y 20.');
    }
});

window.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
        case "w": case "arrowup":
            if (direction.y === 0) newDirection = { x: 0, y: -tileSize };
            break;
        case "s": case "arrowdown":
            if (direction.y === 0) newDirection = { x: 0, y: tileSize };
            break;
        case "a": case "arrowleft":
            if (direction.x === 0) newDirection = { x: -tileSize, y: 0 };
            break;
        case "d": case "arrowright":
            if (direction.x === 0) newDirection = { x: tileSize, y: 0 };
            break;
    }
});
>>>>>>> origin/Manzana-Tiempo-(Daniel)

// --- CONTROL DEL JUEGO ---

<<<<<<< HEAD
startButton.addEventListener('click', () => {
  const appleCount = parseInt(appleCountInput.value);
  if (appleCount > 0 && appleCount <= 20) {
    numberOfApples = appleCount;
    startMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initializeGame();
  } else {
    alert('Por favor, introduce un número de manzanas entre 1 y 20.');
  }
});

window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w": case "arrowup":
      if (direction.y === 0) newDirection = { x: 0, y: -tileSize };
      break;
    case "s": case "arrowdown":
      if (direction.y === 0) newDirection = { x: 0, y: tileSize };
      break;
    case "a": case "arrowleft":
      if (direction.x === 0) newDirection = { x: -tileSize, y: 0 };
      break;
    case "d": case "arrowright":
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

// 🍎 Genera comida evitando la serpiente y los obstáculos
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
      points: isGolden ? 10 : 1
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

function update() {
  if (gameOver) return;

  direction = newDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // 🌍 Movimiento continuo por los bordes
  if (head.x < 0) head.x = canvas.width - tileSize;
  else if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - tileSize;
  else if (head.y >= canvas.height) head.y = 0;

  // Colisión con obstáculos
  for (const obs of obstacles) {
    if (head.x === obs.x && head.y === obs.y) {
      endGame();
      return;
    }
  }

  // Colisión consigo misma
  if (isCollisionWithBody(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Comida
  let ateFood = false;
  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    if (head.x === food.x && head.y === food.y) {
      score += food.points;

      // Si es manzana dorada, añade segmentos extra
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

  // Cada 5s, 50% de probabilidad de generar obstáculo
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
  foods.forEach(food => {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, tileSize, tileSize);
  });

  // Puntaje
  ctx.fillStyle = "white";
  ctx.font = "24px 'Courier New'";
  ctx.fillText("Score: " + score, 10, 30);
}

function endGame() {
  gameOver = true;
  alert(`💀 Game Over!\nPuntuación final: ${score}`);
  window.location.reload();
}

function gameLoop() {
  if (gameOver) return;
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}
=======
function initializeGame() {
    // Es buena práctica iniciar la dirección al comenzar para que la serpiente se mueva
    // Lo iniciamos hacia la derecha por defecto
    direction = { x: tileSize, y: 0 }; 
    newDirection = { x: tileSize, y: 0 };

    spawnFoods();
    gameLoop();
}

function spawnFoods() {
    while (foods.length < numberOfApples) {
        // Asegurarse de que las coordenadas de la comida no choquen con el cuerpo de la serpiente
        let newFood;
        let collision;
        do {
            collision = false;
            const isGolden = Math.random() < 0.1;
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
                y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
                color: isGolden ? "gold" : "red",
                points: isGolden ? 10 : 1,
                spawnTime: Date.now()
            };
            for (const segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    collision = true;
                    break;
                }
            }
        } while (collision);
        
        foods.push(newFood);
    }
}

// NUEVA FUNCIÓN: Actualiza y elimina manzanas expiradas
function updateFoodTimers() {
    const currentTime = Date.now();
    for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        const timeAlive = currentTime - food.spawnTime;
        if (timeAlive >= APPLE_LIFETIME) {
            foods.splice(i, 1);
        }
    }
    spawnFoods();
}

function update() {
    if (gameOver) return;

    direction = newDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || isCollisionWithBody(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    let ateFood = false;
    for (let i = foods.length - 1; i >= 0; i--) {
        let food = foods[i];
        if (head.x === food.x && head.y === food.y) {
            score += food.points;

            // Si es una manzana dorada, la serpiente crece más.
            if (food.points === 10) {
                // Hacemos que la cola crezca 9 segmentos extra (el crecimiento normal de 1 ya está en unshift)
                for (let j = 0; j < 9; j++) {
                    // Solo agregamos segmentos fantasma, se ajustarán en la próxima iteración del bucle
                    snake.push({}); 
                }
            }
            
            foods.splice(i, 1);
            ateFood = true;
            // No llamamos a spawnFoods aquí, lo hace updateFoodTimers en su lugar.
            break;
        }
    }

    if (!ateFood) {
        snake.pop();
    }

    updateFoodTimers(); // Verifica y actualiza temporizadores y genera nueva comida si es necesario
}

function isCollisionWithBody(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        // Ignorar segmentos fantasma creados por la manzana dorada hasta que se les asigne una posición real
        if (segment.x !== undefined) { 
            ctx.fillStyle = index === 0 ? "#00FF00" : "#00A000";
            ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
        }
    });

    // Dibuja manzanas con barra de tiempo
    const currentTime = Date.now();
    foods.forEach(food => {
        const timeAlive = currentTime - food.spawnTime;
        const timePercent = (APPLE_LIFETIME - timeAlive) / APPLE_LIFETIME;
        
        ctx.fillStyle = food.color;
        ctx.fillRect(food.x, food.y, tileSize, tileSize);
        
        // Barra de tiempo
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(food.x, food.y + tileSize - 3, tileSize, 3);
        
        ctx.fillStyle = timePercent > 0.5 ? "#00FF00" : timePercent > 0.25 ? "#FFFF00" : "#FF0000";
        ctx.fillRect(food.x, food.y + tileSize - 3, tileSize * timePercent, 3);
    });

    ctx.fillStyle = "white";
    ctx.font = "24px 'Courier New', Courier, monospace";
    ctx.fillText("Score: " + score, 10, 30);
}

function endGame() {
    gameOver = true;
    alert(`Game Over! 💀\nPuntuación final: ${score}`);
    window.location.reload();
}

function gameLoop() {
    if (gameOver) return;
    update();
    draw();
    setTimeout(gameLoop, gameSpeed);
}
>>>>>>> origin/Manzana-Tiempo-(Daniel)
