
let Module = null;

let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let gameStarted = false;
let gameFinished = false;

let currentDifficulty = "Easy";
let currentGridSize = 3;

const playerNameInput = document.getElementById("playerName");
const difficultySelect = document.getElementById("difficulty");
const gridSizeSelect = document.getElementById("gridSize");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const boardElement = document.getElementById("board");
const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");

const difficultyGrids = {
    Easy: [3, 4, 5],
    Medium: [6,7],
    Hard: [ 8]
};

// Update grid sizes according to difficulty
function updateGridOptions() {
    currentDifficulty = difficultySelect.value;

    const sizes = difficultyGrids[currentDifficulty];

    gridSizeSelect.innerHTML = "";

    sizes.forEach(size => {
        const option = document.createElement("option");

        option.value = size;
        option.textContent = `${size} × ${size}`;

        gridSizeSelect.appendChild(option);
    });

    currentGridSize = Number(gridSizeSelect.value);
}

// Format timer
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

// Update timer display
function updateTimer() {
    if (!gameStarted || gameFinished) return;

    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    timerElement.textContent = formatTime(elapsedTime);
}

// Start timer on first valid move
function startTimer() {
    if (gameStarted) return;

    gameStarted = true;
    startTime = Date.now();

    timerInterval = setInterval(updateTimer, 1000);
}

// Stop timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Reset timer
function resetTimer() {
    stopTimer();

    gameStarted = false;
    gameFinished = false;

    startTime = null;
    elapsedTime = 0;

    timerElement.textContent = "00:00";
}

// Render puzzle board
function renderBoard() {
    if (!Module) return;

    const size = Module._getSize();

    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size * size; i++) {
        const value = Module._getTile(i);

        const tile = document.createElement("button");

        tile.className = value === 0 ? "tile empty" : "tile";
        tile.textContent = value === 0 ? "" : value;

        tile.disabled = value === 0 || gameFinished;

        tile.addEventListener("click", () => {
            handleTileMove(i);
        });

        boardElement.appendChild(tile);
    }

    movesElement.textContent = Module._getMoves();
}

// Handle tile movement
function handleTileMove(index) {
    if (!Module || gameFinished) return;

    const result = Module._moveTile(index);

    if (result) {
        startTimer();

        movesElement.textContent = Module._getMoves();

        renderBoard();

        checkWin();
    }
}

// Start game
function startGame() {
    if (!Module) {
        alert("Game is still loading. Please wait.");
        return;
    }

    const playerName = playerNameInput.value.trim();

    if (playerName === "") {
        alert("Please enter your name first.");
        playerNameInput.focus();
        return;
    }

    currentDifficulty = difficultySelect.value;
    currentGridSize = Number(gridSizeSelect.value);

    resetTimer();

    const seed = Math.floor(Math.random() * 1000000);

    Module._initPuzzle(currentGridSize, seed);

    gameFinished = false;

    renderBoard();

    startBtn.disabled = true;
    restartBtn.disabled = false;

    playerNameInput.disabled = true;
    difficultySelect.disabled = true;
    gridSizeSelect.disabled = true;
}

// Check win
function checkWin() {
    if (!Module._isSolved()) return;

    gameFinished = true;

    stopTimer();

    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    timerElement.textContent = formatTime(elapsedTime);

    const record = {
        playerName: playerNameInput.value.trim(),
        difficulty: currentDifficulty,
        gridSize: currentGridSize,
        moves: Module._getMoves(),
        time: elapsedTime,
        date: new Date().toLocaleDateString()
    };

    saveRecord(record);

    displayLeaderboard(currentDifficulty);

    alert("Congratulations! You solved the puzzle!");
}

// Restart game
function restartGame() {
    if (!Module) return;

    resetTimer();

    const seed = Math.floor(Math.random() * 1000000);

    Module._initPuzzle(currentGridSize, seed);

    renderBoard();

    startBtn.disabled = true;
}

// Initialize leaderboard and events
function initializeGame() {
    updateGridOptions();

    difficultySelect.addEventListener("change", updateGridOptions);

    gridSizeSelect.addEventListener("change", () => {
        currentGridSize = Number(gridSizeSelect.value);
    });

    startBtn.addEventListener("click", startGame);

    restartBtn.addEventListener("click", restartGame);

    const leaderboardFilter = document.getElementById("leaderboardFilter");

    if (leaderboardFilter) {
        leaderboardFilter.addEventListener("change", () => {
            displayLeaderboard(leaderboardFilter.value);
        });
    }

    restartBtn.disabled = true;
    startBtn.disabled = true;

    displayLeaderboard(currentDifficulty);
}

// Load WebAssembly module


createPuzzleModule()
    .then(module => {
        Module = module;

        initializeGame();

        startBtn.disabled = false;

        console.log("Game is ready!");
    })
    .catch(error => {
        console.error("WebAssembly loading error:", error);

        alert("Game could not load. Please check the browser console.");
    });
