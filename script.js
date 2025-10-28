// 🐍 Juego: Snake - Versión Mejorada
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos del DOM para el menú
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const appleCountInput = document.getElementById('appleCount');
const startButton = document.getElementById('startButton');

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

// 📊 Estado del juego
let score = 0;
let gameOver = false;
let gameSpeed = 100;

// --- CONTROL DEL JUEGO ---

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

function spawnFoods() {
    while (foods.length < numberOfApples) {
        const isGolden = Math.random() < 0.1;
        const newFood = {
            x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
            y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize,
            color: isGolden ? "gold" : "red",
            points: isGolden ? 10 : 1
        };
        foods.push(newFood);
    }
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

            // ---- ¡CAMBIO IMPORTANTE AQUÍ! ----
            // Si es una manzana dorada, añade 9 segmentos extra a la cola.
            // (El crecimiento normal de 1 segmento ya está incluido, sumando 10 en total).
            if (food.points === 10) {
                const tail = snake[snake.length - 1]; // Identifica cuál es la cola
                for (let j = 0; j < 9; j++) {
                    snake.push({ ...tail }); // Agrega 9 copias de la cola al final
                }
            }
            // ---- FIN DEL CAMBIO ----

            foods.splice(i, 1);
            ateFood = true;
            spawnFoods();
            break;
        }
    }

    if (!ateFood) {
        snake.pop();
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
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#00FF00" : "#00A000";
        ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
    });

    foods.forEach(food => {
        ctx.fillStyle = food.color;
        ctx.fillRect(food.x, food.y, tileSize, tileSize);
    });

    ctx.fillStyle = "white";
    ctx.font = "24px 'Courier New', Courier, monospace";
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