// 🐍 Juego: Snake Avanzado (Lógica unificada y corregida)

(function () {
    // Patrón de inicialización segura: Espera a que el DOM esté completamente cargado
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    function boot() {
        // --- DOM (Acceso a elementos) ---
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas?.getContext?.("2d");
        const startMenu = document.getElementById("startMenu");
        const gameOverMenu = document.getElementById("gameOverMenu"); 
        const finalScoreEl = document.getElementById("finalScore");
        const appleCountInput = document.getElementById("appleCount");
        const startButton = document.getElementById("startButton");
        const retryButton = document.getElementById("retryButton"); 
        const settingsButton = document.getElementById("settingsButton"); 
        const gameTitle = document.getElementById("gameTitle");
        const bgMusic = document.getElementById("bgMusic");
        const eatSound = document.getElementById("eatSound");
        const loseSound = document.getElementById("loseSound");

        if (!canvas || !ctx) {
            console.error("[Snake] Canvas no disponible.");
            return;
        }

        // --- Configuración Inicial ---
        const tileSize = 20;
        const gridSize = canvas.width / tileSize;
        let gameSpeed = 90;

        // 🍎 Configuración de Comida y Obstáculos
        const APPLE_LIFETIME = 7000; // 7 segundos para TODAS las manzanas
        let obstacleCheckInterval = 5000; // Generar obstáculo cada 5 segundos

        // --- Estado del Juego ---
        let snake, direction, newDirection, foods, obstacles, score, gameOver, numberOfApples;
        let lastObstacleCheck = Date.now();
        let loopHandle = null;

        // --- Utilidades ---
        function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

        function randomFreeCell() {
            let tries = 0;
            while (tries < 5000) {
                const pos = { x: randInt(0, gridSize - 1) * tileSize, y: randInt(0, gridSize - 1) * tileSize };
                const occSnake = snake?.some(s => s.x === pos.x && s.y === pos.y);
                const occFood = foods?.some(f => f.x === pos.x && f.y === pos.y);
                const occObs = obstacles?.some(o => o.x === pos.x && o.y === pos.y);
                if (!occSnake && !occFood && !occObs) return pos;
                tries++;
            }
            return { x: 0, y: 0 };
        }

        // 🍎 Lógica de aparición de la comida (Manzanas Normales vs. Doradas)
        function spawnFoods(count) {
            for (let i = 0; i < count; i++) {
                // 20% de probabilidad de ser dorada (más valor, tiempo limitado)
                const isGold = Math.random() < 0.2; 
                foods.push({
                    ...randomFreeCell(),
                    color: isGold ? "gold" : "red",
                    birthTime: Date.now()
                });
            }
        }
        
        function spawnObstacles(count = 10) {
            obstacles = [];
            for (let i = 0; i < count; i++) obstacles.push(randomFreeCell());
        }

        // --- Manejo de Menús ---
        function showStartMenu() {
            if (loopHandle !== null) { clearTimeout(loopHandle); loopHandle = null; }
            startMenu?.classList.remove("hidden");
            gameOverMenu?.classList.add("hidden");
            gameTitle?.classList.add("hidden");
            try { bgMusic?.pause(); } catch {}
        }
        function showGameOverMenu() {
            if (loopHandle !== null) { clearTimeout(loopHandle); loopHandle = null; }
            if (finalScoreEl) finalScoreEl.textContent = `Puntuación: ${score}`;
            gameOverMenu?.classList.remove("hidden");
        }
        function hideMenusForPlay() {
            startMenu?.classList.add("hidden");
            gameOverMenu?.classList.add("hidden");
            gameTitle?.classList.remove("hidden");
        }

        // --- Funciones de Juego ---
        function initState() {
            // Dirección inicial a la derecha para que empiece a moverse
            snake = [{ x: tileSize * 10, y: tileSize * 10 }];
            direction = { x: tileSize, y: 0 };
            newDirection = { x: tileSize, y: 0 };
            foods = [];
            obstacles = []; // Array de obstáculos vacío al inicio
            score = 0;
            gameOver = false;
            
            spawnFoods(numberOfApples); // Genera la cantidad inicial de manzanas
            lastObstacleCheck = Date.now();
        }

        function startGame() {
            const parsed = parseInt(appleCountInput?.value ?? "1", 10);
            numberOfApples = Math.min(20, Math.max(1, isNaN(parsed) ? 1 : parsed));
            
            hideMenusForPlay();
            initState(); 
            
            try { if (bgMusic) { bgMusic.currentTime = 0; bgMusic.play().catch(()=>{}); } } catch {}
            loopHandle = setTimeout(gameLoop, gameSpeed);
        }

        function restartSameSettings() {
            hideMenusForPlay();
            initState(); 
            try { if (bgMusic) { bgMusic.currentTime = 0; bgMusic.play().catch(()=>{}); } } catch {}
            loopHandle = setTimeout(gameLoop, gameSpeed);
        }

        function endGame() {
            gameOver = true;
            try {
                if (bgMusic) bgMusic.pause();
                if (loseSound) { loseSound.currentTime = 0; loseSound.play().catch(()=>{}); }
            } catch {}
            
            setTimeout(showGameOverMenu, 500); 
        }

        // --- Lógica Principal del Juego ---
        function update() {
            direction = newDirection;
            if (direction.x === 0 && direction.y === 0) return; 

            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

            // Lógica de Teletransporte (Wrapping)
            if (head.x < 0) head.x = canvas.width - tileSize;
            else if (head.x >= canvas.width) head.x = 0;

            if (head.y < 0) head.y = canvas.height - tileSize;
            else if (head.y >= canvas.height) head.y = 0;

            // Colisiones internas (cuerpo y obstáculos)
            if (snake.some(seg => seg.x === head.x && seg.y === head.y)) return endGame();
            if (obstacles.some(o => o.x === head.x && o.y === head.y)) return endGame();

            snake.unshift(head);

            // 🍎 Comprobar si la manzana fue comida
            const foodIndex = foods.findIndex(f => f.x === head.x && f.y === head.y);
            if (foodIndex >= 0) {
                const food = foods[foodIndex];
                
                // Puntuación: 1 por roja, 10 por dorada
                score += (food.color === "gold") ? 10 : 1;
                
                try { if (eatSound) { eatSound.currentTime = 0; eatSound.play().catch(()=>{}); } } catch {}
                foods.splice(foodIndex, 1);
                spawnFoods(1); // Reemplaza la manzana comida
            } else {
                snake.pop(); // Si no come, la cola se acorta
            }
            
            // 💀 Lógica dinámica de Obstáculos: Se añadirán después de 5 segundos
            if (Date.now() - lastObstacleCheck > obstacleCheckInterval) {
                if (obstacles.length < 30) { 
                    obstacles.push(randomFreeCell());
                }
                lastObstacleCheck = Date.now();
            }
            
            // 🍎 Lógica de Manzanas Expiradas (Aplica a TODAS)
            const now = Date.now();
            foods = foods.filter(food => {
                // Si el tiempo de vida (7s) ha pasado para CUALQUIER manzana
                if ((now - food.birthTime) > APPLE_LIFETIME) { 
                    // Reemplaza la manzana expirada con una nueva 
                    spawnFoods(1);
                    return false; // Elimina la manzana
                }
                return true; // Mantiene la manzana
            });
        }

        function draw() {
            ctx.fillStyle = "#111827"; // Fondo
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Obstáculos (Gris)
            ctx.fillStyle = "#6B7280";
            obstacles.forEach(o => { ctx.fillRect(o.x, o.y, tileSize, tileSize); });

            // 🍎 Comida (Diferentes colores y barra de tiempo para todas)
            foods.forEach(food => {
                const isGold = food.color === "gold";
                
                // Color de la manzana
                ctx.fillStyle = isGold ? "#FFD700" : "#F53838"; 
                ctx.fillRect(food.x, food.y, tileSize, tileSize);
                
                // Dibujar la barra de tiempo para TODAS las manzanas
                const timeElapsed = Date.now() - food.birthTime;
                const timePercent = 1 - (timeElapsed / APPLE_LIFETIME);
                
                // Barra de tiempo: Fondo (Gris oscuro)
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize, 3);
                
                // Barra de tiempo: Color 
                ctx.fillStyle = timePercent > 0.6 ? "#00FF00" : timePercent > 0.3 ? "#FFFF00" : "#FF0000";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize * timePercent, 3);
            });

            // Serpiente (Verde)
            snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? "#10B981" : "#059669"; ctx.fillRect(s.x, s.y, tileSize, tileSize); });

            // Puntaje
            ctx.fillStyle = "#e5e7eb";
            ctx.font = "16px monospace";
            ctx.fillText(`Puntos: ${score}`, 10, 20);
        }

        // --- Bucle Principal ---
        function gameLoop() {
            if (gameOver) return;
            update();
            draw();
            loopHandle = setTimeout(gameLoop, gameSpeed);
        }

        // --- Controles de Teclado ---
        document.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();
            
            // Movimiento (solo si el juego está activo)
            if (!gameOver) {
                if (k === "arrowup" || k === "w") { if (direction.y === 0) newDirection = { x: 0, y: -tileSize }; }
                else if (k === "arrowdown" || k === "s") { if (direction.y === 0) newDirection = { x: 0, y: tileSize }; }
                else if (k === "arrowleft" || k === "a") { if (direction.x === 0) newDirection = { x: -tileSize, y: 0 }; }
                else if (k === "arrowright" || k === "d") { if (direction.x === 0) newDirection = { x: tileSize, y: 0 }; }
            }
            
            // Control de menús
            if (k === "enter") { 
                if (!startMenu?.classList.contains("hidden")) startGame(); 
            }
            if (k === "r") { 
                if (!gameOverMenu?.classList.contains("hidden")) restartSameSettings(); 
            }
            if (k === "escape") { 
                showStartMenu(); 
            }
        });

        // --- Conexión de Botones ---
        startButton?.addEventListener("click", startGame);
        retryButton?.addEventListener("click", restartSameSettings);
        settingsButton?.addEventListener("click", showStartMenu);

        // Inicial
        showStartMenu();
    }
})();