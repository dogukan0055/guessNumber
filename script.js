const grid = document.querySelector(".grid");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const modal = document.getElementById("usernameModal");
const startGameBtn = document.getElementById("startGameBtn");
const player1Display = document.getElementById("player1");
const player2Display = document.getElementById("player2");
let diceRolling = false;
let rollTimeoutId = null;

let currentPlayer = 1;
let currentNumber = 1;
let canClick = true;
let scores = [0, 0]; // Player 1 and Player 2 scores
let playerNames = ["Player 1", "Player 2"];

function isValidUsername(username) {
  // Check if username only contains letters and numbers
  return /^[a-zA-Z0-9]+$/.test(username);
}

function updatePlayerDisplay() {
  player1Display.innerHTML = `${playerNames[0]} (<span id="score1">${scores[0]}</span>)`;
  player2Display.innerHTML = `${playerNames[1]} (<span id="score2">${scores[1]}</span>)`;

  // Re-assign score elements after innerHTML update
  score1 = document.getElementById("score1");
  score2 = document.getElementById("score2");
}

function shuffleNumbers() {
  return Array.from({ length: 9 }, (_, i) => i + 1).sort(
    () => Math.random() - 0.5
  );
}

function createGrid() {
  grid.innerHTML = ""; // Clear existing grid
  const numbers = shuffleNumbers();
  numbers.forEach((number) => {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item", "hidden");
    gridItem.innerHTML = `
            <div class="inner">
                <div class="front">?</div>
                <div class="back">${number}</div>
            </div>
        `;
    gridItem.dataset.number = number;
    grid.appendChild(gridItem);
  });
}

function resetGame() {
  currentNumber = 1;
  canClick = true;
  message.textContent = "";
  const newNumbers = shuffleNumbers();

  document.querySelectorAll(".grid-item").forEach((item, index) => {
    item.classList.remove("flipped");
    item.classList.add("hidden");
    const backEl = item.querySelector(".back");
    backEl.classList.remove("wrong", "correct");
    backEl.textContent = newNumbers[index];
    item.dataset.number = newNumbers[index];
  });
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  player1Display.classList.toggle("active", currentPlayer === 1);
  player2Display.classList.toggle("active", currentPlayer === 2);
}

grid.addEventListener("click", (e) => {
  if (!canClick) return;

  const target = e.target.closest(".grid-item");
  if (!target || !target.classList.contains("hidden")) return;

  canClick = false;
  const number = parseInt(target.dataset.number, 10);
  const backElement = target.querySelector(".back");

  target.classList.add("flipped");
  target.classList.remove("hidden");

  if (number === currentNumber) {
    backElement.classList.add("correct");
    currentNumber++;
    if (currentNumber > 9) {
      Swal.fire({
        icon: "success",
        title: "We Have a Winner!",
        text: `${playerNames[currentPlayer - 1]} wins!`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "One More Round",
        denyButtonText: "Exit",
      }).then((result) => {
        if (result.isConfirmed) {
          resetGame(); // Start a new round
        } else if (result.isDenied) {
          Swal.fire({
            icon: "info",
            title: "Game Over",
            text: "Thanks for playing!",
          });
          window.close();
        }
      });

      scores[currentPlayer - 1]++;
      updateScores();
      updatePlayerDisplay();
      setTimeout(() => resetGame(), 2000);
    }
    setTimeout(() => {
      canClick = true;
    }, 500);
  } else {
    backElement.classList.add("wrong");
    message.textContent = `Wrong number! It's ${
      playerNames[currentPlayer % 2]
    }'s turn.`;
    setTimeout(() => {
      document.querySelectorAll(".grid-item").forEach((item) => {
        item.classList.remove("flipped");
        item.classList.add("hidden");
        item.querySelector(".back").classList.remove("wrong");
      });
      currentNumber = 1;
      switchPlayer();
      message.textContent = "";
      canClick = true;
    }, 500);
  }
});

function updateScores() {
  const score1Element = document.getElementById("score1");
  const score2Element = document.getElementById("score2");
  if (score1Element) score1Element.textContent = scores[0];
  if (score2Element) score2Element.textContent = scores[1];
}

function createDiceModal() {
  const modalHTML = `
        <div id="diceModal" class="modal">
            <div class="modal-content">
                <h2>Roll Dice to Determine First Player</h2>
                <div class="dice-container">
                    <div class="player-dice">
                        <p class="player-name"></p>
                        <div class="dice">&#9856;</div>
                        <p class="roll-value"></p>
                    </div>
                    <div class="player-dice">
                        <p class="player-name"></p>
                        <div class="dice">&#9856;</div>
                        <p class="roll-value"></p>
                    </div>
                </div>
                <button id="rollDiceBtn">Roll Dice</button>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  return document.getElementById("diceModal");
}

// Function to get random dice value
function getRandomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Function to get dice Unicode character
function getDiceChar(value) {
  const diceChars = [
    "&#9856;",
    "&#9857;",
    "&#9858;",
    "&#9859;",
    "&#9860;",
    "&#9861;",
  ];
  return diceChars[value - 1];
}

// Function to simulate dice rolling
function rollDice() {
  const dices = document.querySelectorAll(".dice");
  const rollValues = document.querySelectorAll(".roll-value");
  const rollBtn = document.getElementById("rollDiceBtn");

  if (diceRolling) return;
  diceRolling = true;
  rollBtn.disabled = true;

  let rolls = 0;
  let finalValues = [0, 0];

  function updateDice() {
    if (rolls < 10) {
      dices.forEach((dice, index) => {
        const value = getRandomDice();
        dice.innerHTML = getDiceChar(value);
        rollValues[index].textContent = "";
      });
      rolls++;
      rollTimeoutId = setTimeout(updateDice, 100);
    } else {
      // Final roll
      finalValues = [getRandomDice(), getRandomDice()];
      dices.forEach((dice, index) => {
        dice.innerHTML = getDiceChar(finalValues[index]);
        rollValues[index].textContent = finalValues[index];
      });

      // Determine starting player
      setTimeout(() => {
        const diceModal = document.getElementById("diceModal");
        if (finalValues[0] === finalValues[1]) {
          Swal.fire({
            icon: "info",
            title: "Tie!",
            text: "It's a tie! Roll again!",
          }).then(() => {
            diceRolling = false;
            rollBtn.disabled = false;
          });
        } else {
          currentPlayer = finalValues[0] > finalValues[1] ? 1 : 2;
          Swal.fire({
            icon: "success",
            title: "Game Start!",
            text: `${playerNames[currentPlayer - 1]} starts the game!`,
          }).then(() => {
            diceModal.style.display = "none";
            player1Display.classList.toggle("active", currentPlayer === 1);
            player2Display.classList.toggle("active", currentPlayer === 2);
            createGrid();
          });

          diceModal.style.display = "none";
          player1Display.classList.toggle("active", currentPlayer === 1);
          player2Display.classList.toggle("active", currentPlayer === 2);
          createGrid();
        }
      }, 1000);
    }
  }

  updateDice();
}

// Modify the startGameBtn click event handler
startGameBtn.addEventListener("click", () => {
  const player1Name = document.getElementById("player1Input").value.trim();
  const player2Name = document.getElementById("player2Input").value.trim();

  if (!player1Name || !player2Name) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please enter usernames for both players.",
    });
    return;
  }

  if (!isValidUsername(player1Name)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Username",
      text: "Player 1 username can only contain letters and numbers.",
    });
    return;
  }

  if (!isValidUsername(player2Name)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Username",
      text: "Player 2 username can only contain letters and numbers.",
    });
    return;
  }

  playerNames = [player1Name, player2Name];
  updatePlayerDisplay();

  modal.style.display = "none";

  // Create dice modal if it doesn't exist
  let diceModal = document.getElementById("diceModal");
  if (!diceModal) {
    diceModal = createDiceModal();
  }

  // Show dice modal and update player names
  diceModal.style.display = "flex";
  const playerDiceNames = diceModal.querySelectorAll(".player-name");
  playerDiceNames[0].textContent = playerNames[0];
  playerDiceNames[1].textContent = playerNames[1];
});

// Add event listener for roll dice button
document.addEventListener("click", (e) => {
  if (e.target.id === "rollDiceBtn") {
    rollDice();
  }
});
