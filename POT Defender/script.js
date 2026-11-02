// =========================================
// POT DEFENDER - CONFIG
// =========================================

const GAME_DURATION = 30;
const POT_TARGET = 93;

const PLAYER_SPEED = 420;
const CASH_SPEED = 620;

const PLAYER_WIDTH = 72;
const PLAYER_HEIGHT = 72;

const CASH_WIDTH = 28;
const CASH_HEIGHT = 36;

const INVOICE_WIDTH = 56;
const INVOICE_HEIGHT = 70;

const DUE_DATE_OFFSET_BOTTOM = 112;

// =========================================
// DOM ELEMENTS
// =========================================

const gameScreen = document.getElementById("game-screen");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const invoicesLayer = document.getElementById("invoices-layer");
const cashLayer = document.getElementById("cash-layer");
const effectsLayer = document.getElementById("effects-layer");

const playerElement = document.getElementById("player");

const potValueElement = document.getElementById("pot-value");
const potFillElement = document.getElementById("pot-fill");

const timeValueElement = document.getElementById("time-value");
const paidValueElement = document.getElementById("paid-value");
const lateValueElement = document.getElementById("late-value");
const totalValueElement = document.getElementById("total-value");

const finalPotElement = document.getElementById("final-pot");
const finalMessageElement = document.getElementById("final-message");
const finalPaidElement = document.getElementById("final-paid");
const finalLateElement = document.getElementById("final-late");
const finalTotalElement = document.getElementById("final-total");

const replayButton = document.getElementById("replay-button");
const gameMessage = document.getElementById("game-message");

// =========================================
// GAME STATE
// =========================================

let gameStarted = false;
let gameEnded = false;

let paidInvoices = 0;
let lateInvoices = 0;

let playerX = 0;

let keys = {
  left: false,
  right: false
};

let spaceHeld = false;

let invoices = [];
let cashShots = [];
let effects = [];

let lastTimestamp = 0;
let startTimestamp = 0;
let animationId = null;

// Correction: timeout tracked to avoid animation class conflicts
let playerShootTimeout = null;

// =========================================
// UTILITIES
// =========================================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getScreenWidth() {
  return gameScreen.clientWidth;
}

function getScreenHeight() {
  return gameScreen.clientHeight;
}

function getDueDateY() {
  return getScreenHeight() - DUE_DATE_OFFSET_BOTTOM;
}

function getTotalInvoices() {
  return paidInvoices + lateInvoices;
}

function getPotRatio() {
  const total = getTotalInvoices();

  if (total === 0) {
    return 100;
  }

  return Math.round((paidInvoices / total) * 100);
}

function rectanglesCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// =========================================
// INIT / RESET
// =========================================

function initGame() {
  stopAnimationLoop();

  gameStarted = false;
  gameEnded = false;

  paidInvoices = 0;
  lateInvoices = 0;

  invoices = [];
  cashShots = [];
  effects = [];

  keys.left = false;
  keys.right = false;
  spaceHeld = false;

  if (playerShootTimeout) {
    clearTimeout(playerShootTimeout);
    playerShootTimeout = null;
  }

  playerElement.classList.remove("shooting");

  invoicesLayer.innerHTML = "";
  cashLayer.innerHTML = "";
  effectsLayer.innerHTML = "";

  const screenWidth = getScreenWidth();
  playerX = screenWidth / 2 - PLAYER_WIDTH / 2;
  updatePlayerPosition();

  startScreen.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");

  timeValueElement.textContent = GAME_DURATION;
  gameMessage.textContent = "Pay invoices before the Due Date.";

  updateHud();
}

function startGame() {
  if (gameStarted || gameEnded) {
    return;
  }

  gameStarted = true;
  startTimestamp = performance.now();
  lastTimestamp = startTimestamp;

  startScreen.classList.add("hidden");
  gameMessage.textContent = "Pay On Time the Invoices!";

  animationId = requestAnimationFrame(gameLoop);
}

function stopAnimationLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// =========================================
// GAME LOOP
// =========================================

function gameLoop(timestamp) {
  if (gameEnded) {
    return;
  }

  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  const elapsedTime = (timestamp - startTimestamp) / 1000;
  const timeLeft = Math.max(0, GAME_DURATION - elapsedTime);

  updateTimer(timeLeft);
  updateDifficulty(elapsedTime);
  updatePlayer(deltaTime);
  updateCash(deltaTime);
  updateInvoices(deltaTime, elapsedTime);
  updateCollisions();
  updateEffects(deltaTime);
  updateHud();

  if (timeLeft <= 0) {
    endGame();
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
}

// =========================================
// TIMER
// =========================================

function updateTimer(timeLeft) {
  timeValueElement.textContent = Math.ceil(timeLeft);
}

// =========================================
// DIFFICULTY
// =========================================

function getTargetInvoiceCount(elapsedTime) {
  if (elapsedTime < 5) {
    return 3;
  }

  if (elapsedTime < 10) {
    return 6;
  }

  if (elapsedTime < 15) {
    return 12;
  }

  if (elapsedTime < 20) {
    return 15;
  }

  if (elapsedTime < 25) {
    return 20;
  }

  return 25;
}

function getInvoiceSpeed(elapsedTime) {
  if (elapsedTime < 5) {
    return random(70, 95);
  }

  if (elapsedTime < 10) {
    return random(80, 110);
  }

  if (elapsedTime < 15) {
    return random(95, 125);
  }

  if (elapsedTime < 20) {
    return random(110, 145);
  }

  if (elapsedTime < 25) {
    return random(125, 165);
  }

  return random(130, 185);
}

function updateDifficulty(elapsedTime) {
  const targetCount = getTargetInvoiceCount(elapsedTime);

  while (invoices.length < targetCount) {
    spawnInvoice(elapsedTime);
  }
}

// =========================================
// PLAYER
// =========================================

function updatePlayer(deltaTime) {
  const screenWidth = getScreenWidth();
  let direction = 0;

  if (keys.left) {
    direction -= 1;
  }

  if (keys.right) {
    direction += 1;
  }

  playerX += direction * PLAYER_SPEED * deltaTime;
  playerX = clamp(playerX, 0, screenWidth - PLAYER_WIDTH);

  updatePlayerPosition();
}

function updatePlayerPosition() {
  playerElement.style.left = `${playerX}px`;

  // Important:
  // Do not set playerElement.style.transform here.
  // The previous "transform = none" conflicted with the CSS shooting animation.
}

function triggerPlayerShootAnimation() {
  if (playerShootTimeout) {
    clearTimeout(playerShootTimeout);
    playerShootTimeout = null;
  }

  playerElement.classList.remove("shooting");

  // Force class restart cleanly
  void playerElement.offsetWidth;

  playerElement.classList.add("shooting");

  playerShootTimeout = setTimeout(() => {
    playerElement.classList.remove("shooting");
    playerShootTimeout = null;
  }, 140);
}

// =========================================
// CASH SHOTS
// =========================================

function shootCash() {
  if (!gameStarted || gameEnded) {
    return;
  }

  const cashElement = document.createElement("div");
  cashElement.className = "cash";

  const img = document.createElement("img");
  img.src = "images/Cash.png";
  img.alt = "Cash projectile";

  cashElement.appendChild(img);
  cashLayer.appendChild(cashElement);

  const cash = {
    element: cashElement,
    x: playerX + PLAYER_WIDTH / 2 - CASH_WIDTH / 2,
    y: getScreenHeight() - DUE_DATE_OFFSET_BOTTOM + 42,
    width: CASH_WIDTH,
    height: CASH_HEIGHT,
    speed: CASH_SPEED
  };

  cashShots.push(cash);
  triggerPlayerShootAnimation();
  renderCash(cash);
}

function updateCash(deltaTime) {
  for (let i = cashShots.length - 1; i >= 0; i -= 1) {
    const cash = cashShots[i];

    cash.y -= cash.speed * deltaTime;

    if (cash.y + cash.height < 0) {
      removeCash(i);
      continue;
    }

    renderCash(cash);
  }
}

function renderCash(cash) {
  cash.element.style.left = `${cash.x}px`;
  cash.element.style.top = `${cash.y}px`;
}

function removeCash(index) {
  const cash = cashShots[index];

  if (cash && cash.element.parentNode) {
    cash.element.parentNode.removeChild(cash.element);
  }

  cashShots.splice(index, 1);
}

// =========================================
// INVOICES
// =========================================

function spawnInvoice(elapsedTime) {
  const screenWidth = getScreenWidth();

  const invoiceElement = document.createElement("div");
  invoiceElement.className = "invoice";

  const img = document.createElement("img");
  img.src = "images/Invoice.png";
  img.alt = "Invoice";

  invoiceElement.appendChild(img);
  invoicesLayer.appendChild(invoiceElement);

  const direction = Math.random() > 0.5 ? 1 : -1;

  const invoice = {
    element: invoiceElement,
    x: random(0, Math.max(0, screenWidth - INVOICE_WIDTH)),
    y: random(-220, -INVOICE_HEIGHT),
    width: INVOICE_WIDTH,
    height: INVOICE_HEIGHT,
    speedY: getInvoiceSpeed(elapsedTime),
    speedX: random(25, 80) * direction,
    rotation: random(-8, 8)
  };

  invoices.push(invoice);
  renderInvoice(invoice);
}

function updateInvoices(deltaTime, elapsedTime) {
  const screenWidth = getScreenWidth();
  const dueDateY = getDueDateY();

  for (let i = invoices.length - 1; i >= 0; i -= 1) {
    const invoice = invoices[i];

    invoice.x += invoice.speedX * deltaTime;
    invoice.y += invoice.speedY * deltaTime;

    if (invoice.x <= 0) {
      invoice.x = 0;
      invoice.speedX *= -1;
    }

    if (invoice.x + invoice.width >= screenWidth) {
      invoice.x = screenWidth - invoice.width;
      invoice.speedX *= -1;
    }

    const distanceToDueDate = dueDateY - (invoice.y + invoice.height);

    if (distanceToDueDate < 90) {
      invoice.element.classList.add("warning");
    } else {
      invoice.element.classList.remove("warning");
    }

    if (invoice.y + invoice.height >= dueDateY) {
      markInvoiceLate(i);
      continue;
    }

    invoice.rotation += invoice.speedX * deltaTime * 0.02;
    renderInvoice(invoice);
  }
}

function renderInvoice(invoice) {
  invoice.element.style.left = `${invoice.x}px`;
  invoice.element.style.top = `${invoice.y}px`;
  invoice.element.style.transform = `rotate(${invoice.rotation}deg)`;
}

function removeInvoice(index) {
  const invoice = invoices[index];

  if (invoice && invoice.element.parentNode) {
    invoice.element.parentNode.removeChild(invoice.element);
  }

  invoices.splice(index, 1);
}

function markInvoicePaid(invoiceIndex, cashIndex) {
  const invoice = invoices[invoiceIndex];

  paidInvoices += 1;

  createEffect("OK", invoice.x + 8, invoice.y + 10, "ok");

  removeInvoice(invoiceIndex);
  removeCash(cashIndex);

  updateHud();
}

function markInvoiceLate(invoiceIndex) {
  const invoice = invoices[invoiceIndex];

  lateInvoices += 1;

  createEffect("Too late", invoice.x - 4, invoice.y + 12, "late");

  removeInvoice(invoiceIndex);

  updateHud();
}

// =========================================
// COLLISIONS
// =========================================

function updateCollisions() {
  for (let i = invoices.length - 1; i >= 0; i -= 1) {
    const invoice = invoices[i];

    for (let j = cashShots.length - 1; j >= 0; j -= 1) {
      const cash = cashShots[j];

      if (rectanglesCollide(invoice, cash)) {
        markInvoicePaid(i, j);
        break;
      }
    }
  }
}

// =========================================
// EFFECTS
// =========================================

function createEffect(text, x, y, type) {
  const effectElement = document.createElement("div");
  effectElement.className = `effect ${type}`;
  effectElement.textContent = text;
  effectElement.style.left = `${x}px`;
  effectElement.style.top = `${y}px`;

  effectsLayer.appendChild(effectElement);

  const effect = {
    element: effectElement,
    life: 0.6
  };

  effects.push(effect);
}

function updateEffects(deltaTime) {
  for (let i = effects.length - 1; i >= 0; i -= 1) {
    const effect = effects[i];

    effect.life -= deltaTime;

    if (effect.life <= 0) {
      if (effect.element.parentNode) {
        effect.element.parentNode.removeChild(effect.element);
      }

      effects.splice(i, 1);
    }
  }
}

// =========================================
// HUD
// =========================================

function updateHud() {
  const potRatio = getPotRatio();
  const total = getTotalInvoices();

  potValueElement.textContent = `${potRatio}%`;
  paidValueElement.textContent = paidInvoices;
  lateValueElement.textContent = lateInvoices;
  totalValueElement.textContent = total;

  potFillElement.style.width = `${potRatio}%`;
  potFillElement.style.background = getPotColor(potRatio);
}

function getPotColor(potRatio) {
  if (potRatio >= 93) {
    return "#80d010";
  }

  if (potRatio >= 80) {
    return "#f8b800";
  }

  if (potRatio >= 60) {
    return "#f87800";
  }

  return "#d82800";
}

// =========================================
// END GAME
// =========================================

function endGame() {
  if (gameEnded) {
    return;
  }

  gameEnded = true;
  gameStarted = false;

  stopAnimationLoop();

  clearRemainingInvoicesWithoutPenalty();
  clearRemainingCash();
  updateHud();

  const finalPot = getPotRatio();
  const total = getTotalInvoices();

  finalPotElement.textContent = `Final POT: ${finalPot}%`;
  finalMessageElement.textContent =
    finalPot >= POT_TARGET ? "Nice POT" : "Below the target";

  finalPaidElement.textContent = paidInvoices;
  finalLateElement.textContent = lateInvoices;
  finalTotalElement.textContent = total;

  gameMessage.textContent = "Final score calculated.";
  gameOverScreen.classList.remove("hidden");
}

function clearRemainingInvoicesWithoutPenalty() {
  invoices.forEach((invoice) => {
    if (invoice.element.parentNode) {
      invoice.element.parentNode.removeChild(invoice.element);
    }
  });

  invoices = [];
}

function clearRemainingCash() {
  cashShots.forEach((cash) => {
    if (cash.element.parentNode) {
      cash.element.parentNode.removeChild(cash.element);
    }
  });

  cashShots = [];
}

// =========================================
// INPUTS
// =========================================

document.addEventListener("keydown", (event) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (event.code === "ArrowLeft") {
    keys.left = true;
  }

  if (event.code === "ArrowRight") {
    keys.right = true;
  }

  if (event.code === "Space") {
    if (spaceHeld) {
      return;
    }

    spaceHeld = true;

    if (!gameStarted && !gameEnded) {
      startGame();
      return;
    }

    if (gameStarted && !gameEnded) {
      shootCash();
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (event.code === "ArrowLeft") {
    keys.left = false;
  }

  if (event.code === "ArrowRight") {
    keys.right = false;
  }

  if (event.code === "Space") {
    spaceHeld = false;
  }
});

replayButton.addEventListener("click", () => {
  initGame();
});

// =========================================
// HANDLE RESIZE
// =========================================

window.addEventListener("resize", () => {
  const screenWidth = getScreenWidth();

  playerX = clamp(playerX, 0, screenWidth - PLAYER_WIDTH);
  updatePlayerPosition();
});

// =========================================
// START
// =========================================

window.addEventListener("load", () => {
  initGame();
});
