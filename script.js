// 🐍 Juego: Snake Avanzado (Menú, Múltiples Manzanas Doradas, Obstáculos y Sonidos)

// --- ACCESO AL DOM Y CONFIGURACIÓN INICIAL ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM para el menú (De finalentoeria)
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const appleCountInput = document.getElementById('appleCount');
const startButton = document.getElementById('startButton');

// 🎵 Sonidos (De David_s)
const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const loseSound = document.getElementById("loseSound");

// 🔧 Ajustes del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// 🐍 Configuración de la serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// 🍎 Comida (Ahora es un array para múltiples manzanas)
let foods = [];
let numberOfApples = 1;

// 💀 Obstáculos
let obstacles = [];
let obstacleCheckInterval = 5000; // cada 5 segundos se revisa si aparece uno nuevo
let lastObstacleCheck = Date.now();

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// --- FUNCIONES DE CONTROL Y SETUP ---

startButton.addEventListener('click', () => {
    const appleCount = parseInt(appleCountInput.value);
    if (appleCount > 0 && appleCount <= 20) {
        numberOfApples = appleCount;
        startMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        // Reiniciar variables para un nuevo juego
        snake = [{ x: tileSize * 10, y: tileSize * 10 }];
        direction = { x: 0, y: 0 };
        newDirection = { x: 0, y: 0 };
        foods = [];
        obstacles = [];
        score = 0;
        gameOver = false;
        lastObstacleCheck = Date.now();
        
        initializeGame();
    } else {
        // En este entorno, usamos alert() para feedback, aunque no es ideal.
        alert('Por favor, introduce un número de manzanas entre 1 y 20.');
    }
});

// ⌨️ Control del jugador
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

function initializeGame() {
    spawnFoods();
    
    // Inicia la música al comenzar el juego (después del clic del usuario)
    if (bgMusic) { 
        bgMusic.volume = 0.3;
        // Usa .catch para manejar posibles restricciones de autoplay en navegadores
        bgMusic.play().catch(e => console.warn("Error al reproducir música de fondo (posiblemente por restricciones del navegador).", e));
    }
    
    gameLoop();
}

// --- FUNCIONES DE LÓGICA DEL JUEGO ---

// ✨ Genera una posición aleatoria alineada a la cuadrícula, evitando zonas ocupadas
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

// 🍎 Genera comida hasta alcanzar la cantidad deseada (incluye manzanas doradas)
function spawnFoods() {
    while (foods.length < numberOfApples) {
        const isGolden = Math.random() < 0.1; // 10% de probabilidad de ser dorada
        const newFoodPosition = randomGridPosition();

        const newFood = {
            x: newFoodPosition.x,
            y: newFoodPosition.y,
            color: isGolden ? "gold" : "red",
            points: isGolden ? 10 : 1
        };
        foods.push(newFood);
    }
}

// 🧱 Genera un obstáculo nuevo evitando zonas ocupadas
function spawnObstacle() {
    if (obstacles.length >= 10) return; 

    const newObstaclePosition = randomGridPosition();

    // Si coincide con una comida, la eliminamos y regeneramos
    for (let i = foods.length - 1; i >= 0; i--) {
        if (foods[i].x === newObstaclePosition.x && foods[i].y === newObstaclePosition.y) {
            foods.splice(i, 1);
            spawnFoods(); 
            break;
        }
    }

    obstacles.push(newObstaclePosition);
}

// ⚙️ Revisa colisiones (cuerpo propio y obstáculos)
function isCollisionWithBodyOrObstacle(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    for (const obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) return true;
    }
    return false;
}

// ⚙️ Actualizar la lógica del juego
function update() {
    if (gameOver) return;

    direction = newDirection;
    if (direction.x === 0 && direction.y === 0) return; 

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // 1️⃣ Colisión con paredes
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
        return;
    }

    // 2️⃣ Colisión consigo misma o con obstáculos
    if (isCollisionWithBodyOrObstacle(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // 3️⃣ Comer comida
    let ateFood = false;
    for (let i = foods.length - 1; i >= 0; i--) {
        let food = foods[i];
        if (head.x === food.x && head.y === food.y) {
            score += food.points;
            
            // 🎵 Reproduce sonido de comer
            if (eatSound) {
                eatSound.currentTime = 0;
                eatSound.play().catch(e => console.warn("Error al reproducir sonido de comer.", e));
            }

            // Crecimiento extra por manzana dorada
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

    // Movimiento normal si no comió
    if (!ateFood) {
        snake.pop();
    }

    // 4️⃣ Generación aleatoria de obstáculos
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
    foods.forEach(food => {
        ctx.fillStyle = food.color;
        ctx.fillRect(food.x, food.y, tileSize, tileSize);
        ctx.strokeStyle = food.color === "gold" ? "#FFD700" : "#8B0000"; 
        ctx.strokeRect(food.x, food.y, tileSize, tileSize);
    });

    // Puntaje
    ctx.fillStyle = "white";
    ctx.font = "24px 'Courier New', Courier, monospace";
    ctx.fillText("Score: " + score, 10, 30);
}

// 💀 Terminar juego
function endGame() {
    gameOver = true;
    
    // 🎵 Control de sonido
    if (bgMusic) bgMusic.pause();
    if (loseSound) {
        loseSound.play().catch(e => console.warn("Error al reproducir sonido de perder.", e));
    }

    // Se usa un setTimeout para dar tiempo al sonido de perder, si está disponible.
    setTimeout(() => {
        // Mantenemos alert() para dar feedback inmediato al usuario en este entorno.
        alert(`💀 Game Over!\nPuntuación final: ${score}`);
    }, 500); 
}

// 🌀 Bucle principal
function gameLoop() {
    if (gameOver) return;
    update();
    draw();
    setTimeout(gameLoop, gameSpeed);
}
