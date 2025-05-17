let numSelected = null;
let tileSelected = null;
let errors = 0;

let board = [];
let solution = [];
let raw = "";

window.onload = () => {
  setupEventListeners();
  newGame();
  startTimer();
};

function newGame() {
  const difficultySelect = document.querySelector(".game__difficulty");
  const difficulty = difficultySelect ? difficultySelect.value : "medium";

  raw = sudoku.generate(difficulty);
  board = [];
  solution = [];

  for (let i = 0; i < 9; i++) {
    board.push(raw.slice(i * 9, (i + 1) * 9).replace(/\./g, "-"));
    solution.push(sudoku.solve(raw).slice(i * 9, (i + 1) * 9));
  }

  const messageEl = document.querySelector(".game__message");
  if (messageEl) {
    messageEl.hidden = true;
    messageEl.innerText = "";
  }

  clearBoard();
  renderDigits();
  renderBoard();
  updateDigitsUsage();
}

function setupEventListeners() {
  const newGameBtn = document.querySelector(".game__new-game-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      newGame();
      startTimer();
    });
  }
}

function clearBoard() {
  document.querySelector(".game__board").innerText = "";
  document.querySelector(".game__digits").innerText = "";
}

function renderDigits() {
  const digitsContainer = document.querySelector(".game__digits");

  for (let i = 1; i <= 9; i++) {
    const number = document.createElement("div");
    number.innerText = i;
    number.classList.add("game__number");
    number.addEventListener("click", selectNumber);
    digitsContainer.appendChild(number);
  }
}

function renderBoard() {
  const boardContainer = document.querySelector(".game__board");

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const tile = document.createElement("div");
      tile.dataset.row = r;
      tile.dataset.col = c;
      tile.classList.add("game__tile");

      if (board[r][c] !== "-") {
        tile.innerText = board[r][c];
        tile.classList.add("game__tile--start");
      }

      if (r === 2 || r === 5) tile.classList.add("game__tile--horizontal-line");
      if (c === 2 || c === 5) tile.classList.add("game__tile--vertical-line");

      tile.addEventListener("click", selectTile);
      boardContainer.appendChild(tile);
    }
  }
}

function selectNumber() {
  if (numSelected) {
    numSelected.classList.remove("game__number--selected");
  }
  numSelected = this;
  numSelected.classList.add("game__number--selected");
}

let highlightedValue = null;

function selectTile() {
  clearHighlights();

  if (this.innerText !== "") {
    const value = this.innerText;
    if (highlightedValue === value) {
      highlightedValue = null;
    } else {
      highlightedValue = value;
      highlightTilesWithValue(value);
    }
    return;
  }

  if (!numSelected) return;

  const r = parseInt(this.dataset.row);
  const c = parseInt(this.dataset.col);

  if (solution[r][c] === numSelected.innerText) {
    this.innerText = numSelected.innerText;
    updateDigitsUsage();

    if (checkWin()) {
    }
  } else {
    this.classList.add("game__tile--incorrect");

    setTimeout(() => {
      this.classList.remove("game__tile--incorrect");
    }, 500);
  }
}

function updateDigitsUsage() {
  const count = Array(10).fill(0);

  const tiles = document.querySelectorAll(".game__board .game__tile");

  tiles.forEach((tile) => {
    const val = tile.innerText;
    if (val >= "1" && val <= "9") {
      count[parseInt(val)]++;
    }
  });

  const digitElements = document.querySelectorAll(
    ".game__digits .game__number"
  );

  digitElements.forEach((digitEl) => {
    const digit = parseInt(digitEl.innerText);

    if (count[digit] === 9) {
      digitEl.classList.add("game__number--used");
    } else {
      digitEl.classList.remove("game__number--used");
    }
  });
}

function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const tile = document.querySelector(
        `.game__tile[data-row='${r}'][data-col='${c}']`
      );
      if (tile.innerText !== solution[r][c]) {
        return false;
      }
    }
  }

  clearInterval(timerInterval);

  const minutes = Math.floor(secondsElapsed / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsElapsed % 60).toString().padStart(2, "0");

  const messageEl = document.querySelector(".game__message");
  messageEl.innerText = `🎉 Congratulations! You completed the puzzle in ${minutes} minutes and ${seconds} seconds!`;
  messageEl.hidden = false;

  return true;
}

let timerInterval;
let secondsElapsed = 0;

function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const timerEl = document.querySelector(".game__timer");
  timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

let highlightTimeout;

function highlightTilesWithValue(value) {
  clearHighlights();
  clearTimeout(highlightTimeout);

  const tiles = document.querySelectorAll(".game__tile");
  tiles.forEach((tile) => {
    if (tile.innerText === value) {
      tile.classList.add("game__tile--highlighted");
    }
  });

  highlightTimeout = setTimeout(() => {
    clearHighlights();
  }, 3000);
}

function clearHighlights() {
  const tiles = document.querySelectorAll(".game__tile--highlighted");
  tiles.forEach((tile) => tile.classList.remove("game__tile--highlighted"));
}
