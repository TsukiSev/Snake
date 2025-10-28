// Juego: Snake - Versión Mejorada
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM para el menú
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const appleCountInput = document.getElementById('appleCount');
const startButton = document.getElementById('startButton');

// Ajustes del lienzo y del juego
const tileSize = 20;
canvas.width = 600;
canvas.height = 600;

// Configuración de la serpiente
let snake = [{ x: tileSize * 10, y: tileSize * 10 }];
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };

// Comida (Ahora es un array para múltiples manzanas)
let foods = [];
let numberOfApples = 1;
const APPLE_LIFETIME = 7000; // Tiempo de vida de la manzana en milisegundos

// Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

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

// --- FUNCIONES DEL JUEGO ---

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