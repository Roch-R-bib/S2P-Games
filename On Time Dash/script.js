"use strict";

/* =========================
   GLOBAL CONFIG
========================= */

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TOTAL_TIME = 80;

const LANE_Y = [100, 210, 320];

const VEHICLE_ASSETS = [
  "car1.png",
  "car2.png",
  "car3.png",
  "car4.png",
  "car5.png",
  "car6.png",
  "car7.png",
  "car8.png",
  "car9.png",
  "car10.png",
  "bus.png",
  "van.png"
];

const ALL_ASSETS = ["truck.png", ...VEHICLE_ASSETS];

const STAGES = [
  {
    type: "drive",
    title: "Course 1",
    instruction: "Deliver raw materials to the Processing Plant",
    label: "Course 1 - Raw Materials to Processing Plant",
    progressRate: 6.7,
    roadSpeed: 260,
    trafficMinSpeed: 85,
    trafficMaxSpeed: 125,
    spawnMin: 0.9,
    spawnMax: 1.5
  },
  {
    type: "production1",
    title: "Production 1",
    instruction: "Respect the Specification to manufacture the Semi-Finished Product"
  },
  {
    type: "drive",
    title: "Course 2",
    instruction: "Deliver the semi-finished product to the Manufacturing Plant",
    label: "Course 2 - Semi-Finished Product to Manufacturing Plant",
    progressRate: 7.0,
    roadSpeed: 320,
    trafficMinSpeed: 105,
    trafficMaxSpeed: 155,
    spawnMin: 0.75,
    spawnMax: 1.25
  },
  {
    type: "production2",
    title: "Production 2",
    instruction: "Enter the 6-Character product code to initiate production"
  },
  {
    type: "drive",
    title: "Course 3",
    instruction: "Deliver the finished product to the end customer",
    label: "Course 3 - Finished Product to End Customer",
    progressRate: 7.3,
    roadSpeed: 390,
    trafficMinSpeed: 125,
    trafficMaxSpeed: 190,
    spawnMin: 0.65,
    spawnMax: 1.05
  }
];

/* =========================
   DOM
========================= */

const screens = {
  title: document.getElementById("title-screen"),
  instruction: document.getElementById("instruction-screen"),
  drive: document.getElementById("drive-screen"),
  production1: document.getElementById("production1-screen"),
  production2: document.getElementById("production2-screen"),
  result: document.getElementById("result-screen")
};

const assetStatus = document.getElementById("asset-status");
const pressSpace = document.getElementById("press-space");

const instructionTitle = document.getElementById("instruction-title");
const instructionText = document.getElementById("instruction-text");

const timerPies = [
  document.getElementById("timer-pie"),
  document.getElementById("timer-pie-p1"),
  document.getElementById("timer-pie-p2")
];

const timerTexts = [
  document.getElementById("timer-text"),
  document.getElementById("timer-text-p1"),
  document.getElementById("timer-text-p2")
];

const liveScores = [
  document.getElementById("live-score"),
  document.getElementById("live-score-p1"),
  document.getElementById("live-score-p2")
];

const stepLabel = document.getElementById("step-label");
const progressBar = document.getElementById("progress-bar");
const roadArea = document.getElementById("road-area");
const roadBg = document.querySelector(".road-bg");
const laneLines = document.querySelectorAll(".lane");
const obstacleLayer = document.getElementById("obstacle-layer");
const playerTruck = document.getElementById("player-truck");

const specA = document.getElementById("spec-a");
const specB = document.getElementById("spec-b");
const specC = document.getElementById("spec-c");
const specLever = document.getElementById("spec-lever");
const specPower = document.getElementById("spec-power");

const btnA = document.getElementById("btn-a");
const btnB = document.getElementById("btn-b");
const btnC = document.getElementById("btn-c");
const leverBtn = document.getElementById("lever-btn");
const powerSlider = document.getElementById("power-slider");
const powerValue = document.getElementById("power-value");
const prod1Ok = document.getElementById("prod1-ok");
const prod1Feedback = document.getElementById("prod1-feedback");
const instructionHelp = document.getElementById("instruction-help");

const packageList = document.getElementById("package-list");
const codeInput = document.getElementById("code-input");
const prod2Feedback = document.getElementById("prod2-feedback");

const resultPanel = document.getElementById("result-panel");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const finalScoreLine = document.getElementById("final-score-line");

/* =========================
   GAME STATE
========================= */

let assetsReady = false;
let state = "title";
let currentStageIndex = 0;
let remainingTime = TOTAL_TIME;
let lastTimestamp = 0;
let gameOver = false;

/* Drive state */
let currentLane = 1;
let driveProgress = 0;
let obstacles = [];
let spawnTimer = 0;
let nextSpawn = 1;
let slowUntil = 0;
let invincibleUntil = 0;
let roadOffset = 0;

/* Production 1 state */
let productionSpec = null;
let productionSettings = null;

/* Production 2 state */
let productCodes = [];

/* =========================
   ASSET PRELOAD
========================= */

function preloadAssets() {
  let loaded = 0;
  const missing = [];

  ALL_ASSETS.forEach((asset) => {
    const img = new Image();

    img.onload = () => {
      loaded += 1;
      checkDone();
    };

    img.onerror = () => {
      missing.push(`images/${asset}`);
      loaded += 1;
      checkDone();
    };

    img.src = `images/${asset}`;
  });

  function checkDone() {
    if (missing.length > 0) {
  assetStatus.textContent = `Missing asset: ${missing[0]}`;
  assetStatus.classList.remove("hidden");
  pressSpace.classList.add("hidden");
  assetsReady = false;
    } else {
  assetStatus.textContent = "";
  assetStatus.classList.add("hidden");
  pressSpace.classList.remove("hidden");
  assetsReady = true;
    }

  }
}

/* =========================
   SCREEN MANAGEMENT
========================= */

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active");
  });

  screens[name].classList.add("active");
  state = name;
}

function showInstruction(stageIndex) {
  const stage = STAGES[stageIndex];

  instructionTitle.textContent = stage.title;
  instructionText.textContent = stage.instruction;

  showScreen("instruction");
}

function startStage() {
  const stage = STAGES[currentStageIndex];

  lastTimestamp = performance.now();

  if (stage.type === "drive") {
    startDriveStage(stage);
    showScreen("drive");
  }

  if (stage.type === "production1") {
    startProduction1();
    showScreen("production1");
  }

  if (stage.type === "production2") {
    startProduction2();
    showScreen("production2");
    setTimeout(() => codeInput.focus(), 50);
  }
}

function completeStage() {
  currentStageIndex += 1;

  if (currentStageIndex >= STAGES.length) {
    winGame();
  } else {
    showInstruction(currentStageIndex);
  }
}

/* =========================
   TIMER / SCORE
========================= */

function updateGlobalTimer(dt) {
  if (!isTimerRunning()) return;

  remainingTime -= dt;

  if (remainingTime <= 0) {
    remainingTime = 0;
    loseGame();
  }
}

function isTimerRunning() {
  return ["drive", "production1", "production2"].includes(state) && !gameOver;
}

function getScore() {
  return Math.max(0, Math.floor(remainingTime) * 100);
}

function updateHud() {
  const ratio = Math.max(0, remainingTime / TOTAL_TIME);
  const degrees = ratio * 360;

  let color = "#61d66b";
  if (remainingTime <= 20) color = "#ffb13b";
  if (remainingTime <= 10) color = "#ff4f4f";

  timerPies.forEach((pie) => {
    pie.style.background = `conic-gradient(${color} ${degrees}deg, #2a2f3a ${degrees}deg)`;
  });

  timerTexts.forEach((text) => {
    text.textContent = Math.ceil(remainingTime);
  });

  liveScores.forEach((score) => {
    score.textContent = getScore();
  });
}

/* =========================
   GAME START / END
========================= */

function resetGame() {
  currentStageIndex = 0;
  remainingTime = TOTAL_TIME;
  gameOver = false;
  obstacles = [];
  currentLane = 1;
  driveProgress = 0;
  spawnTimer = 0;
  slowUntil = 0;
  invincibleUntil = 0;
  roadOffset = 0;
  updateHud();
}

function startGame() {
  resetGame();
  showInstruction(0);
}

function winGame() {
  gameOver = true;
  showScreen("result");

  resultPanel.style.borderColor = "#79e36d";
  resultTitle.textContent = "Success!";
  resultMessage.textContent = "On Time Delivery! Your client is satisfied.";
  finalScoreLine.textContent = `Score: ${getScore()}`;
}

function loseGame() {
  if (gameOver) return;

  gameOver = true;
  showScreen("result");

  resultPanel.style.borderColor = "#ff6b6b";
  resultTitle.textContent = "You lose!";
  resultMessage.textContent = "Late delivery! You must pay a penalty.";
  finalScoreLine.textContent = "Score: 0";
}

/* =========================
   DRIVE STAGES
========================= */

function startDriveStage(stage) {
  driveProgress = 0;
  obstacles = [];
  obstacleLayer.innerHTML = "";
  currentLane = 1;
  spawnTimer = 0;
  nextSpawn = randomBetween(stage.spawnMin, stage.spawnMax);
  slowUntil = 0;
  invincibleUntil = 0;

  stepLabel.textContent = stage.label;
  progressBar.style.width = "0%";

  updateTruckPosition();
}

function updateDrive(dt, now) {
  const stage = STAGES[currentStageIndex];

  const isSlowed = now < slowUntil;
  const speedMultiplier = isSlowed ? 0.35 : 1;

  driveProgress += stage.progressRate * speedMultiplier * dt;
  driveProgress = Math.min(driveProgress, 100);
  progressBar.style.width = `${driveProgress}%`;

const roadScrollSpeed = stage.roadSpeed * speedMultiplier;

roadOffset -= roadScrollSpeed * dt;

roadBg.style.backgroundPosition = `${roadOffset}px 0, 0 0`;

laneLines.forEach((lane) => {
  lane.style.backgroundPositionX = `${roadOffset}px`;
});

  spawnTimer += dt;
  if (spawnTimer >= nextSpawn) {
    spawnTimer = 0;
    nextSpawn = randomBetween(stage.spawnMin, stage.spawnMax);
    spawnObstacle(stage);
  }

  updateObstacles(dt, stage, speedMultiplier, now);

  if (driveProgress >= 100) {
    completeStage();
  }
}

function updateTruckPosition() {
  const y = LANE_Y[currentLane];
  playerTruck.style.top = `${y}px`;
}

function moveLane(direction) {
  if (state !== "drive") return;

  currentLane += direction;

  if (currentLane < 0) currentLane = 0;
  if (currentLane > 2) currentLane = 2;

  updateTruckPosition();
}

function spawnObstacle(stage) {
  const asset = VEHICLE_ASSETS[Math.floor(Math.random() * VEHICLE_ASSETS.length)];
  const lane = Math.floor(Math.random() * 3);

  const width = asset === "bus.png" ? 112 : asset === "van.png" ? 86 : 74;
  const height = asset === "bus.png" ? 58 : 52;

  const img = document.createElement("img");
  img.src = `images/${asset}`;
  img.className = "vehicle-obstacle";
  img.style.width = `${width}px`;
  img.style.left = `${GAME_WIDTH + 40}px`;
  img.style.top = `${LANE_Y[lane] + 8}px`;

  obstacleLayer.appendChild(img);

obstacles.push({
  element: img,
  x: GAME_WIDTH + 40,
  y: LANE_Y[lane] + 8,
  w: width,
  h: height,
  lane,
  speed: randomBetween(stage.trafficMinSpeed, stage.trafficMaxSpeed)
});
}

function updateObstacles(dt, stage, speedMultiplier, now) {
  const playerBox = {
    x: 95,
    y: LANE_Y[currentLane] + 8,
    w: 78,
    h: 46
  };

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obs = obstacles[i];

    obs.x -= obs.speed * speedMultiplier * dt;
    obs.element.style.left = `${obs.x}px`;

    if (obs.x < -140) {
      obs.element.remove();
      obstacles.splice(i, 1);
      continue;
    }

    const obsBox = {
      x: obs.x + 8,
      y: obs.y + 8,
      w: obs.w - 16,
      h: obs.h - 16
    };

    if (now > invincibleUntil && boxesOverlap(playerBox, obsBox)) {
      handleCollision(now);
    }
  }
}

function handleCollision(now) {
  slowUntil = now + 1500;
  invincibleUntil = now + 1100;

  playerTruck.classList.add("hit");

  setTimeout(() => {
    playerTruck.classList.remove("hit");
  }, 900);
}

function boxesOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* =========================
   PRODUCTION 1
========================= */

function startProduction1() {
  productionSpec = {
    a: randomBool(),
    b: randomBool(),
    c: randomBool(),
    lever: randomBool() ? "UP" : "DOWN",
    power: Math.floor(randomBetween(10, 91))
  };

  productionSettings = {
    a: randomBool(),
    b: randomBool(),
    c: randomBool(),
    lever: randomBool() ? "UP" : "DOWN",
    power: 50
  };

  renderProduction1();
  prod1Feedback.textContent = "";
  prod1Feedback.className = "feedback";
}

function renderProduction1() {
  specA.textContent = productionSpec.a ? "GREEN" : "RED";
  specB.textContent = productionSpec.b ? "GREEN" : "RED";
  specC.textContent = productionSpec.c ? "GREEN" : "RED";
  specLever.textContent = productionSpec.lever;
  specPower.textContent = productionSpec.power;

  renderMachineButton(btnA, productionSettings.a);
  renderMachineButton(btnB, productionSettings.b);
  renderMachineButton(btnC, productionSettings.c);

  leverBtn.textContent = productionSettings.lever;
  leverBtn.className = `lever ${productionSettings.lever === "UP" ? "up" : "down"}`;

  powerSlider.value = productionSettings.power;
  powerValue.textContent = productionSettings.power;
}

function renderMachineButton(button, isGreen) {
  button.classList.remove("green", "red");
  button.classList.add(isGreen ? "green" : "red");
}

function toggleMachineButton(key) {
  productionSettings[key] = !productionSettings[key];
  renderProduction1();
}

function validateProduction1() {
  const isValid =
    productionSettings.a === productionSpec.a &&
    productionSettings.b === productionSpec.b &&
    productionSettings.c === productionSpec.c &&
    productionSettings.lever === productionSpec.lever &&
    Number(productionSettings.power) === Number(productionSpec.power);

  if (isValid) {
    prod1Feedback.textContent = "Specification validated. Production launched!";
    prod1Feedback.className = "feedback success";

    setTimeout(() => {
      completeStage();
    }, 550);
  } else {
    prod1Feedback.textContent = "Wrong settings. Check the specification.";
    prod1Feedback.className = "feedback error";
  }
}

/* =========================
   PRODUCTION 2
========================= */

function startProduction2() {
  productCodes = [
    { code: generateCode(), done: false },
    { code: generateCode(), done: false },
    { code: generateCode(), done: false }
  ];

  codeInput.value = "";
  prod2Feedback.textContent = "";
  prod2Feedback.className = "feedback";

  renderPackages();
}

function renderPackages() {
  packageList.innerHTML = "";

  productCodes.forEach((item, index) => {
    const packageDiv = document.createElement("div");
    packageDiv.className = `package ${item.done ? "done" : ""}`;

    const title = document.createElement("div");
    title.textContent = `Package ${index + 1}`;

    const code = document.createElement("span");
    code.className = "package-code";
    code.textContent = item.code;

    const status = document.createElement("span");
    status.className = "package-status";
    status.textContent = item.done ? "VALIDATED" : "WAITING";

    packageDiv.appendChild(title);
    packageDiv.appendChild(code);
    packageDiv.appendChild(status);

    packageList.appendChild(packageDiv);
  });
}

function validateCodeInput() {
  const input = codeInput.value.trim().toUpperCase();

  if (!input) return;

  const match = productCodes.find((item) => item.code === input && !item.done);

  if (match) {
    match.done = true;
    codeInput.value = "";
    prod2Feedback.textContent = "Code validated.";
    prod2Feedback.className = "feedback success";
    renderPackages();

    const allDone = productCodes.every((item) => item.done);

    if (allDone) {
      setTimeout(() => {
        completeStage();
      }, 500);
    }
  } else {
    prod2Feedback.textContent = "Invalid or already validated code.";
    prod2Feedback.className = "feedback error";
    codeInput.select();
  }
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

/* =========================
   INPUTS
========================= */

document.addEventListener("keydown", (event) => {
  if (state === "title" && event.code === "Space" && assetsReady) {
    startGame();
    return;
  }

  if (state === "instruction" && event.code === "Enter") {
    startStage();
    return;
  }

  if (state === "result" && event.code === "Space") {
    showScreen("title");
    return;
  }

  if (state === "drive") {
    if (event.code === "ArrowUp") {
      event.preventDefault();
      moveLane(-1);
    }

    if (event.code === "ArrowDown") {
      event.preventDefault();
      moveLane(1);
    }
  }

  if (state === "production2" && event.code === "Enter") {
    event.preventDefault();
    validateCodeInput();
  }
});

btnA.addEventListener("click", () => toggleMachineButton("a"));
btnB.addEventListener("click", () => toggleMachineButton("b"));
btnC.addEventListener("click", () => toggleMachineButton("c"));

leverBtn.addEventListener("click", () => {
  productionSettings.lever = productionSettings.lever === "UP" ? "DOWN" : "UP";
  renderProduction1();
});

powerSlider.addEventListener("input", () => {
  productionSettings.power = Number(powerSlider.value);
  powerValue.textContent = productionSettings.power;
});

prod1Ok.addEventListener("click", validateProduction1);

instructionHelp.addEventListener("click", () => {
  prod1Feedback.textContent = "Match all buttons, lever and power with the specification.";
  prod1Feedback.className = "feedback";
});

codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

/* =========================
   MAIN LOOP
========================= */

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;

  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  if (!gameOver) {
    updateGlobalTimer(dt);

    if (state === "drive") {
      updateDrive(dt, timestamp);
    }

    updateHud();
  }

  requestAnimationFrame(gameLoop);
}

/* =========================
   HELPERS
========================= */

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomBool() {
  return Math.random() >= 0.5;
}

/* =========================
   INIT
========================= */

preloadAssets();
updateHud();
requestAnimationFrame(gameLoop);
