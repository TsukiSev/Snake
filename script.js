// 🐍 Juego: Snake Avanzado (Lógica de Tiempo, Obstáculos, Assets y Menú Modal)

(function () {
    // --- ACCESO AL DOM Y CONFIGURACIÓN INICIAL ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas?.getContext?.("2d");

    // Elementos del DOM para el menú principal
    const startMenu = document.getElementById('startMenu');
    const gameContainer = document.getElementById('gameContainer');
    const appleCountInput = document.getElementById('appleCount');
    const startButton = document.getElementById('startButton');

    // Elementos del DOM para el MODAL DE GAME OVER (NUEVOS)
    const gameOverModal = document.getElementById('gameOverModal');
    const finalScoreText = document.getElementById('finalScoreText');
    const retryButton = document.getElementById('retryButton');
    const backToMenuButton = document.getElementById('backToMenuButton');

    // 🎵 Sonidos 
    const bgMusic = document.getElementById("bgMusic");
    const eatSound = document.getElementById("eatSound");
    const loseSound = document.getElementById("loseSound");

    if (!canvas || !ctx) return console.error("[Snake] Canvas no disponible.");

    // 🔧 Ajustes del lienzo y del juego
    const tileSize = 20;
    const gridSize = canvas.width / tileSize;
    canvas.width = 600;
    canvas.height = 600;
    let gameSpeed = 90; // Velocidad de juego avanzado

    // 🍎 Configuración Avanzada
    const APPLE_LIFETIME = 7000; // 7 segundos de vida
    let obstacleCheckInterval = 5000; // Obstáculos dinámicos

    // 🖼️ CARGA DE IMÁGENES (ASSETS)
    const appleImg = new Image(); appleImg.src = 'assets/apple-red.svg';
    const goldAppleImg = new Image(); goldAppleImg.src = 'assets/apple-gold.svg';
    const bgImg = new Image(); bgImg.src = 'assets/background.svg';
    const snakeHeadImg = new Image(); snakeHeadImg.src = 'assets/snake-head.svg';
    const snakeBodyImg = new Image(); snakeBodyImg.src = 'assets/snake-body.svg';

    // 📊 Estado del juego
    let snake, direction, newDirection, foods, obstacles, score, gameOver, numberOfApples;
    let lastObstacleCheck = Date.now();
    let loopHandle = null;

    // --- UTILIDADES ---
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function randomFreeCell() {
        let tries = 0;
        while (tries < 5000) {
            const pos = { x: randInt(0, gridSize - 1) * tileSize, y: randInt(0, gridSize - 1) * tileSize };
            const occSnake = snake?.some(s => s.x === pos.x && s.y === pos.y);
            const occFood = foods?.some(f => f.x === pos.x && f.y === pos.y);
            const occObs = obstacles?.some(o => o.x === pos.x && o.y === o.y);
            if (!occSnake && !occFood && !occObs) return pos;
            tries++;
        }
        return { x: 0, y: 0 };
    }

    function isCollisionWithBody(head) {
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) return true;
        }
        return false;
    }

    function initState() {
        snake = [{ x: tileSize * 10, y: tileSize * 10 }];
        direction = { x: tileSize, y: 0 };
        newDirection = { x: tileSize, y: 0 };
        foods = [];
        obstacles = [];
        score = 0;
        gameOver = false;
        
        spawnFoods(numberOfApples); 
        lastObstacleCheck = Date.now();
    }
    
    function spawnFoods(count) {
        for (let i = 0; i < count; i++) {
            const isGolden = Math.random() < 0.2; // 20% probabilidad de ser dorada
            foods.push({
                ...randomFreeCell(),
                color: isGolden ? "gold" : "red",
                birthTime: Date.now(),
                img: isGolden ? goldAppleImg : appleImg,
                points: isGolden ? 10 : 1
            });
        }
    }
    
    // --- CONTROL DE INICIO/FIN (FLUJO CORREGIDO) ---

    function showStartMenu() {
        startMenu.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        gameOverModal.classList.add('hidden');
    }

    /**
     * Inicia el juego.
     * @param {boolean} useCurrentSettings Si es true, usa el valor de numberOfApples de la partida anterior.
     */
    function startGame(useCurrentSettings = false) {
        if (!useCurrentSettings) {
            const parsed = parseInt(appleCountInput?.value ?? "1", 10);
            numberOfApples = Math.min(20, Math.max(1, isNaN(parsed) ? 1 : parsed));
        }

        startMenu.classList.add('hidden');
        gameOverModal.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        initState(); 
        
        try { if (bgMusic) { bgMusic.currentTime = 0; bgMusic.play().catch(()=>{}); } } catch {}
        loopHandle = setTimeout(gameLoop, gameSpeed);
    }
    
    function endGame() {
        gameOver = true;
        if (loopHandle !== null) clearTimeout(loopHandle);
        
        try {
            if (bgMusic) bgMusic.pause();
            if (loseSound) { loseSound.currentTime = 0; loseSound.play().catch(()=>{}); }
        } catch {}

        // Muestra el modal de Game Over
        if (finalScoreText) finalScoreText.textContent = `Puntuación: ${score}`;
        gameOverModal.classList.remove('hidden');
    }

    // --- BUCLE PRINCIPAL ---

    function update() {
        if (gameOver) return;

        direction = newDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // Colisiones: Borde (Teletransporte)
        if (head.x < 0) head.x = canvas.width - tileSize;
        else if (head.x >= canvas.width) head.x = 0;
        if (head.y < 0) head.y = canvas.height - tileSize;
        else if (head.y >= canvas.height) head.y = 0;

        // Colisiones: Cuerpo y Obstáculos
        if (isCollisionWithBody(head)) return endGame();
        if (obstacles.some(o => o.x === head.x && o.y === head.y)) return endGame();

        snake.unshift(head);

        let ateFood = false;
        for (let i = foods.length - 1; i >= 0; i--) {
            let food = foods[i];
            if (head.x === food.x && head.y === food.y) {
                score += food.points;
                
                // Crecimiento de 10 segmentos para la dorada
                if (food.points === 10) {
                    const tail = snake[snake.length - 1]; 
                    for (let j = 0; j < 9; j++) {
                        snake.push({ ...tail }); 
                    }
                }
                
                try { if (eatSound) { eatSound.currentTime = 0; eatSound.play().catch(()=>{}); } } catch {}
                foods.splice(i, 1);
                ateFood = true;
                spawnFoods(1); 
                break;
            }
        }

        if (!ateFood) {
            snake.pop(); 
        }

        // 💀 Lógica dinámica de Obstáculos
        if (Date.now() - lastObstacleCheck > obstacleCheckInterval) {
            if (obstacles.length < 30) { 
                obstacles.push(randomFreeCell());
            }
            lastObstacleCheck = Date.now();
        }

        // 🍎 Lógica de Manzanas Expiradas (Aplica a TODAS)
        const now = Date.now();
        foods = foods.filter(food => {
            // Se asume que todas las manzanas tienen birthTime
            if (food.birthTime && (now - food.birthTime) > APPLE_LIFETIME) { 
                spawnFoods(1);
                return false; 
            }
            return true; 
        });
    }

    function draw() {
        // 🖼️ Fondo
        if (bgImg && bgImg.complete) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#111111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Obstáculos (Gris)
        ctx.fillStyle = "#6B7280";
        obstacles.forEach(o => { ctx.fillRect(o.x, o.y, tileSize, tileSize); });

        // 🍎 Comida (Con assets y barra de tiempo)
        const now = Date.now();
        foods.forEach(food => {
            // Imagen de la manzana
            if (food.img && food.img.complete) {
                ctx.drawImage(food.img, food.x, food.y, tileSize, tileSize);
            } else {
                ctx.fillStyle = food.color;
                ctx.fillRect(food.x, food.y, tileSize, tileSize);
            }

            // Barra de tiempo
            if (food.birthTime) {
                const timeElapsed = now - food.birthTime;
                const timePercent = 1 - (timeElapsed / APPLE_LIFETIME);
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize, 3);
                
                ctx.fillStyle = timePercent > 0.6 ? "#00FF00" : timePercent > 0.3 ? "#FFFF00" : "#FF0000";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize * timePercent, 3);
            }
        });

        // 🐍 Serpiente (Con imágenes y rotación para la cabeza)
        snake.forEach((segment, index) => {
            if (index === 0) {
                // Cabeza
                if (snakeHeadImg && snakeHeadImg.complete) {
                    ctx.save();
                    const cx = segment.x + tileSize / 2;
                    const cy = segment.y + tileSize / 2;
                    ctx.translate(cx, cy);
                    let angle = 0;
                    if (direction.x > 0) angle = 0; 
                    else if (direction.x < 0) angle = Math.PI; 
                    else if (direction.y > 0) angle = Math.PI / 2; 
                    else if (direction.y < 0) angle = -Math.PI / 2; 
                    ctx.rotate(angle);
                    ctx.drawImage(snakeHeadImg, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                    ctx.restore();
                } else {
                    ctx.fillStyle = "#00FF00"; 
                    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
                }
            } else {
                // Cuerpo/cola
                if (snakeBodyImg && snakeBodyImg.complete) {
                    ctx.drawImage(snakeBodyImg, segment.x, segment.y, tileSize, tileSize);
                } else {
                    ctx.fillStyle = "#00A000"; 
                    ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
                }
            }
        });

        // Puntaje
        ctx.fillStyle = "white";
        ctx.font = "24px 'Courier New', Courier, monospace";
        ctx.fillText("Puntos: " + score, 10, 30);
    }

    function gameLoop() {
        if (gameOver) return;
        update();
        draw();
        loopHandle = setTimeout(gameLoop, gameSpeed);
    }

    // --- CONEXIONES DE BOTONES Y CONTROLES ---
    startButton?.addEventListener('click', () => startGame(false));

    // Botones del modal de Game Over
    retryButton?.addEventListener('click', () => startGame(true)); 
    backToMenuButton?.addEventListener('click', showStartMenu); 

    window.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        
        // Control de movimiento (solo si el juego está activo)
        if (!gameContainer.classList.contains('hidden')) { 
            switch (k) {
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
                case "escape":
                    endGame(); // Pausa o termina
                    break;
            }
        }
        
        // Control de menús (teclas de acceso rápido)
        if (!startMenu?.classList.contains('hidden') && k === "enter") {
            startGame(false);
        } else if (!gameOverModal?.classList.contains('hidden') && k === "r") {
            startGame(true);
        } else if (!gameOverModal?.classList.contains('hidden') && k === "escape") {
            showStartMenu();
        }
    });

    // Inicialización: Asegurar que al inicio solo se vea el menú.
    showStartMenu();
})();