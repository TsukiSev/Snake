// 🐍 Juego: Snake Avanzado (Fondo, Cuadrícula y Rotación de Cabeza Corregidos)

(function () {
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

        // 🖼️ CARGA DE IMÁGENES (SVGs)
        const appleImg = new Image(); appleImg.src = 'assets/apple-red.svg';
        const goldAppleImg = new Image(); goldAppleImg.src = 'assets/apple-gold.svg';
        const snakeHeadImg = new Image(); snakeHeadImg.src = 'assets/snake-head.svg';
        const snakeBodyImg = new Image(); snakeBodyImg.src = 'assets/snake-body.svg';

        // --- Configuración Inicial ---
        const tileSize = 20;
        const gridSize = canvas.width / tileSize;
        let gameSpeed = 90;
        const APPLE_LIFETIME = 7000;
        let obstacleCheckInterval = 5000;
        
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
                const occFood = foods?.some(f => f.x === pos.x && f.y === f.y);
                const occObs = obstacles?.some(o => o.x === pos.x && o.y === o.y);
                if (!occSnake && !occFood && !occObs) return pos;
                tries++;
            }
            return { x: 0, y: 0 };
        }

        function spawnFoods(count) {
            for (let i = 0; i < count; i++) {
                const isGold = Math.random() < 0.2; 
                foods.push({
                    ...randomFreeCell(),
                    color: isGold ? "gold" : "red",
                    birthTime: Date.now(),
                    img: isGold ? goldAppleImg : appleImg 
                });
            }
        }
        
        // --- Manejo de Menús y Estado de Juego (Lógica omitida, asumida correcta) ---
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

        // --- Lógica Principal del Juego (Update omitida, asumida correcta) ---
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
                score += (food.color === "gold") ? 10 : 1;
                try { if (eatSound) { eatSound.currentTime = 0; eatSound.play().catch(()=>{}); } } catch {}
                foods.splice(foodIndex, 1);
                spawnFoods(1);
            } else {
                snake.pop();
            }
            
            // 💀 Lógica dinámica de Obstáculos
            if (Date.now() - lastObstacleCheck > obstacleCheckInterval) {
                if (obstacles.length < 30) { 
                    obstacles.push(randomFreeCell());
                }
                lastObstacleCheck = Date.now();
            }
            
            // 🍎 Lógica de Manzanas Expiradas
            const now = Date.now();
            foods = foods.filter(food => {
                if ((now - food.birthTime) > APPLE_LIFETIME) { 
                    spawnFoods(1);
                    return false; 
                }
                return true; 
            });
        }

        function draw() {
            // 1. 🛠️ FONDO NEGRO y CUADRÍCULA
            ctx.fillStyle = "#000000"; // **Fondo negro puro**
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar Cuadrícula
            ctx.strokeStyle = "#222222"; // **Gris muy oscuro para la cuadrícula**
            ctx.lineWidth = 1;
            for (let i = 0; i < gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * tileSize, 0);
                ctx.lineTo(i * tileSize, canvas.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i * tileSize);
                ctx.lineTo(canvas.width, i * tileSize);
                ctx.stroke();
            }

            // Obstáculos
            ctx.fillStyle = "#6B7280";
            obstacles.forEach(o => { ctx.fillRect(o.x, o.y, tileSize, tileSize); });

            // 🍎 Comida (Usando SVGs)
            foods.forEach(food => {
                const isGold = food.color === "gold";
                
                // Usar la imagen del asset (SVG)
                if (food.img && food.img.complete) {
                    ctx.drawImage(food.img, food.x, food.y, tileSize, tileSize);
                } else {
                    // Fallback a color
                    ctx.fillStyle = isGold ? "#FFD700" : "#F53838"; 
                    ctx.fillRect(food.x, food.y, tileSize, tileSize);
                }
                
                // Dibujar la barra de tiempo
                const timeElapsed = Date.now() - food.birthTime;
                const timePercent = 1 - (timeElapsed / APPLE_LIFETIME);
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize, 3);
                ctx.fillStyle = timePercent > 0.6 ? "#00FF00" : timePercent > 0.3 ? "#FFFF00" : "#FF0000";
                ctx.fillRect(food.x, food.y + tileSize - 3, tileSize * timePercent, 3);
            });

            // 3. 🐍 Serpiente (Usando SVGs y ROTACIÓN)
            snake.forEach((s, i) => {
                const isHead = i === 0;
                
                if (isHead) {
                    if (snakeHeadImg && snakeHeadImg.complete) {
                        ctx.save();
                        // 1. Calcular el punto central para la rotación
                        const cx = s.x + tileSize / 2;
                        const cy = s.y + tileSize / 2;
                        
                        // 2. Mover el canvas al centro de la cabeza
                        ctx.translate(cx, cy);
                        
                        // 3. Calcular el ángulo de rotación
                        let angle = 0;
                        if (direction.x > 0) angle = 0; // Derecha (0 grados)
                        else if (direction.x < 0) angle = Math.PI; // Izquierda (180 grados)
                        else if (direction.y > 0) angle = Math.PI / 2; // Abajo (90 grados)
                        else if (direction.y < 0) angle = -Math.PI / 2; // Arriba (-90 grados)
                        
                        // 4. Aplicar la rotación
                        ctx.rotate(angle);
                        
                        // 5. Dibujar la imagen centrada en el origen (que ahora es cx, cy)
                        ctx.drawImage(snakeHeadImg, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                        
                        // 6. Restaurar el canvas al estado anterior
                        ctx.restore();
                    } else {
                        // Fallback de cabeza
                        ctx.fillStyle = "#10B981"; 
                        ctx.fillRect(s.x, s.y, tileSize, tileSize);
                    }
                } else {
                    // Cuerpo/cola
                    if (snakeBodyImg && snakeBodyImg.complete) {
                        ctx.drawImage(snakeBodyImg, s.x, s.y, tileSize, tileSize);
                    } else {
                        // Fallback de cuerpo
                        ctx.fillStyle = "#059669"; 
                        ctx.fillRect(s.x, s.y, tileSize, tileSize);
                    }
                }
            });

            // Puntaje
            ctx.fillStyle = "#e5e7eb";
            ctx.font = "16px monospace";
            ctx.fillText(`Puntos: ${score}`, 10, 20);
        }

        // --- Bucle Principal y Controles (Omitidos, asumidos correctos) ---
        function gameLoop() {
            if (gameOver) return;
            update();
            draw();
            loopHandle = setTimeout(gameLoop, gameSpeed);
        }

        document.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();
            if (!gameOver) {
                if (k === "arrowup" || k === "w") { if (direction.y === 0) newDirection = { x: 0, y: -tileSize }; }
                else if (k === "arrowdown" || k === "s") { if (direction.y === 0) newDirection = { x: 0, y: tileSize }; }
                else if (k === "arrowleft" || k === "a") { if (direction.x === 0) newDirection = { x: -tileSize, y: 0 }; }
                else if (k === "arrowright" || k === "d") { if (direction.x === 0) newDirection = { x: tileSize, y: 0 }; }
            }
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

        startButton?.addEventListener("click", startGame);
        retryButton?.addEventListener("click", restartSameSettings);
        settingsButton?.addEventListener("click", showStartMenu);

        showStartMenu();
    }
})();