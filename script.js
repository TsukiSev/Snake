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

// Imágenes de manzanas (SVG externos 64x64)
const appleImg = new Image();
appleImg.src = 'assets/apple-red.svg';
const goldAppleImg = new Image();
goldAppleImg.src = 'assets/apple-gold.svg';

// Imagen de fondo (SVG externo)
const bgImg = new Image();
bgImg.src = 'assets/background.svg';

// Imágenes de la serpiente (SVG externos 64x64)
const snakeHeadImg = new Image();
snakeHeadImg.src = 'assets/snake-head.svg';
const snakeBodyImg = new Image();
snakeBodyImg.src = 'assets/snake-body.svg';

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
            img: isGolden ? goldAppleImg : appleImg,
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
    // Dibujar imagen de fondo si está cargada, si no usar color sólido
    if (bgImg && bgImg.complete) {
        try {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            // En casos raros drawImage puede fallar por CORS o por datos inválidos; fallback
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    snake.forEach((segment, index) => {
        // Cabeza
        if (index === 0) {
            if (snakeHeadImg && snakeHeadImg.complete) {
                // Dibujar la cabeza rotada según la dirección actual
                ctx.save();
                const cx = segment.x + tileSize / 2;
                const cy = segment.y + tileSize / 2;
                ctx.translate(cx, cy);
                let angle = 0;
                if (direction.x > 0) angle = 0; // derecha
                else if (direction.x < 0) angle = Math.PI; // izquierda
                else if (direction.y > 0) angle = Math.PI / 2; // abajo
                else if (direction.y < 0) angle = -Math.PI / 2; // arriba
                ctx.rotate(angle);
                ctx.drawImage(snakeHeadImg, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                ctx.restore();
            } else {
                ctx.fillStyle = "#00FF00";
                ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
            }
        } else {
            // Cuerpo/cola
            if (snakeBodyImg && snakeBodyImg.complete) {
                ctx.drawImage(snakeBodyImg, segment.x, segment.y, tileSize, tileSize);
            } else {
                ctx.fillStyle = "#00A000";
                ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
            }
        }
    });

    foods.forEach(food => {
        // Dibujar la imagen SVG si está cargada; en caso contrario usar el rectángulo de color
        if (food.img && food.img.complete) {
            // Ajustamos para centrar si la imagen es mayor que el tileSize
            ctx.drawImage(food.img, food.x, food.y, tileSize, tileSize);
        } else {
            ctx.fillStyle = food.color;
            ctx.fillRect(food.x, food.y, tileSize, tileSize);
        }
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