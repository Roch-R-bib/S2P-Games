/* CatMan - Category Management
   Version corrigée complète :
   - mapping intégré C_ uniquement
   - une seule balle à la fois
   - balles grises
   - tapis animé
   - tuyaux améliorés
   - aucun mapping.json requis
*/

/* ------------------------- CONFIG ------------------------- */

const CONFIG = {
  gameDuration: 40,

  canvasWidth: 720,
  canvasHeight: 960,

  maxConcurrentBalls: 1,

  initialSpawnInterval: 2000,
  accelerationEverySeconds: 5,
  accelerationFactor: 0.94,

  minSpawnGapY: 220,

  pointsCorrect: 10,
  pointsWrong: -5,
  pointsMissed: -10,

  gloveHitDuration: 180,
  catReactionDuration: 750,
  ballToPipeDuration: 260,

  ballRadius: 46,

  spawnY: 104,
  beltCenterX: 360,

  missY: 810,

  hitToleranceY: 98
};

/* ------------------------- LANES ------------------------- */

const LANES = {
  MFE: {
    y: 250,
    color: "#4da6ff",
    pipeLabel: "MFE",
    pipeY: 190,
    fold: "images/mfefold.png",
    hit: "images/mfehit.png",
    gloveId: "gloveMFE",
    buttonId: "btnMFE"
  },
  RMAT: {
    y: 480,
    color: "#ff5c68",
    pipeLabel: "RMAT",
    pipeY: 420,
    fold: "images/rmatfold.png",
    hit: "images/rmathit.png",
    gloveId: "gloveRMAT",
    buttonId: "btnRMAT"
  },
  SVC: {
    y: 710,
    color: "#ffd45e",
    pipeLabel: "SVC",
    pipeY: 650,
    fold: "images/svcfold.png",
    hit: "images/svchit.png",
    gloveId: "gloveSVC",
    buttonId: "btnSVC"
  }
};

/* ------------------------- CATMAN ------------------------- */

const CAT_IMAGES = {
  neutral: "images/neutral.png",
  happy: ["images/welcome.png", "images/welldone.png", "images/happy.png"],
  wrong: "images/notgood.png",
  sad: "images/sad.png"
};

/* ------------------------- BALL STYLE ------------------------- */

const BALL_STYLE = {
  fillTop: "#f2f4f6",
  fillMiddle: "#b9c0c8",
  fillBottom: "#6f7780",
  outline: "#02070d",
  shadow: "#03070d",
  highlight: "rgba(255,255,255,0.65)",
  text: "#ffffff",
  textShadow: "#02070d"
};

/* ------------------------- MAPPING C_ UNIQUEMENT ------------------------- */

const EMBEDDED_MAPPING = {
  "C_MECHA": "MFE",
  "C_TEXT": "RMAT",
  "C_MKTC": "SVC",
  "C_COMP": "MFE",
  "C_DATP": "SVC",
  "C_PTAD": "MFE",
  "C_FILL": "RMAT",
  "C_SP": "SVC",
  "C_SUPP": "SVC",
  "C_WPD": "MFE",
  "C_CUR": "MFE",
  "C_ELAS": "RMAT",
  "C_VEHI": "MFE",
  "C_TRAS": "MFE",
  "C_METL": "MFE",
  "C_MONO": "RMAT",
  "C_ENER": "MFE",
  "C_ATCP": "MFE",
  "C_FLUD": "MFE",
  "C_COND": "MFE",
  "C_MAIN_GSS": "MFE",
  "C_MIX": "MFE",
  "C_LIFT": "MFE",
  "C_PLAS": "MFE",
  "C_GENS": "MFE",
  "C_PREP": "MFE",
  "C_TELE": "SVC",
  "C_CHEM": "RMAT",
  "C_ENGI": "MFE",
  "C_CPV": "MFE",
  "C_EBU": "MFE",
  "C_LOG": "SVC",
  "C_TEST": "MFE",
  "C_NRUB": "RMAT",
  "C_DATA": "SVC",
  "C_CHEN": "MFE",
  "C_OFFT": "MFE",
  "C_ENVI": "MFE",
  "C_ARINCO": "MFE",
  "C_PEXT": "MFE",
  "C_TBM": "MFE",
  "C_INT_SER": "MFE",
  "C_MATCAL": "MFE",
  "C_REES": "SVC",
  "C_OILR": "RMAT",
  "C_MATAUX": "MFE",
  "C_ERC": "MFE",
  "C_CTRL": "MFE",
  "C_MATRM": "MFE",
  "C_META": "RMAT",
  "C_EEA": "MFE",
  "C_AUCE": "MFE",
  "C_MATRT": "MFE",
  "C_BENE": "SVC",
  "C_WHEE": "MFE"
};

/* ------------------------- STATE ------------------------- */

let mapping = {};
let mappingKeys = [];

let canvas;
let ctx;

let previewNextCanvas;
let previewFollowingCanvas;
let previewNextCtx;
let previewFollowingCtx;

let catCanvas;
let catCtx;

let running = false;
let gameEnded = false;

let startTime = 0;
let lastFrameTime = 0;

let spawnTimer = 0;
let currentSpawnInterval = CONFIG.initialSpawnInterval;

let balls = [];
let particles = [];
let floatingTexts = [];

let conveyorOffset = 0;

let preview = {
  next: null,
  following: null
};

let score = 0;
let correctCount = 0;
let wrongCount = 0;
let missedCount = 0;

let happyIndex = 0;
let catTimeout = null;

const imageCache = {};

/* ------------------------- INIT ------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  bindDom();
  await loadMapping();
  preloadImages();
  initGameState();
  bindEvents();
  drawCat(CAT_IMAGES.neutral);
  requestAnimationFrame(loop);
});

/* ------------------------- DOM ------------------------- */

function bindDom() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  previewNextCanvas = document.getElementById("previewNext");
  previewFollowingCanvas = document.getElementById("previewFollowing");
  previewNextCtx = previewNextCanvas.getContext("2d");
  previewFollowingCtx = previewFollowingCanvas.getContext("2d");

  catCanvas = document.getElementById("catCanvas");
  catCtx = catCanvas.getContext("2d");
}

function bindEvents() {
  document.getElementById("startButton").addEventListener("click", startGame);
  document.getElementById("playAgainButton").addEventListener("click", startGame);

  document.getElementById("btnMFE").addEventListener("click", () => strike("MFE"));
  document.getElementById("btnRMAT").addEventListener("click", () => strike("RMAT"));
  document.getElementById("btnSVC").addEventListener("click", () => strike("SVC"));

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      if (!running) {
        startGame();
      }
      event.preventDefault();
      return;
    }

    if (!running) return;

    const key = event.key.toLowerCase();

    if (key === "m") strike("MFE");
    if (key === "r") strike("RMAT");
    if (key === "s") strike("SVC");
  });
}

/* ------------------------- MAPPING ------------------------- */

async function loadMapping() {
  mapping = EMBEDDED_MAPPING;
  mappingKeys = Object.keys(mapping);
  console.log("Mapping intégré chargé :", mappingKeys.length, "entrées");
}

/* ------------------------- ASSETS ------------------------- */

function preloadImages() {
  const sources = new Set();

  Object.values(LANES).forEach((lane) => {
    sources.add(lane.fold);
    sources.add(lane.hit);
  });

  sources.add(CAT_IMAGES.neutral);
  sources.add(CAT_IMAGES.wrong);
  sources.add(CAT_IMAGES.sad);
  CAT_IMAGES.happy.forEach((src) => sources.add(src));

  sources.forEach((src) => {
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
  });
}

/* ------------------------- START / END ------------------------- */

function initGameState() {
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  missedCount = 0;

  balls = [];
  particles = [];
  floatingTexts = [];

  conveyorOffset = 0;

  spawnTimer = 0;
  currentSpawnInterval = CONFIG.initialSpawnInterval;

  preview.next = randomCategory();
  preview.following = randomCategory();

  updateHud();
  drawPreview();

  document.getElementById("timer").textContent = "00:40";
}

function startGame() {
  document.getElementById("startOverlay").classList.add("hidden");
  document.getElementById("startOverlay").classList.remove("visible");

  document.getElementById("endOverlay").classList.add("hidden");
  document.getElementById("endOverlay").classList.remove("visible");

  initGameState();

  running = true;
  gameEnded = false;
  startTime = performance.now();
  lastFrameTime = performance.now();

  drawCat(CAT_IMAGES.neutral);
}

function endGame() {
  if (gameEnded) return;

  running = false;
  gameEnded = true;

  const endOverlay = document.getElementById("endOverlay");
  const endCat = document.getElementById("endCat");
  const endTitle = document.getElementById("endTitle");
  const endScore = document.getElementById("endScore");

  endScore.textContent = `Score: ${score}`;

  if (score >= 0) {
    endCat.src = CAT_IMAGES.happy[happyIndex % CAT_IMAGES.happy.length];
    endTitle.textContent = "Bravo!";
  } else {
    endCat.src = CAT_IMAGES.sad;
    endTitle.textContent = "Try Again";
  }

  endOverlay.classList.remove("hidden");
  endOverlay.classList.add("visible");
}

/* ------------------------- LOOP ------------------------- */

function loop(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const dt = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (running) {
    updateGame(dt, timestamp);
  }

  drawGame();
  requestAnimationFrame(loop);
}

function updateGame(dt, timestamp) {
  const elapsedSeconds = (timestamp - startTime) / 1000;
  const remaining = Math.max(0, CONFIG.gameDuration - elapsedSeconds);

  document.getElementById("timer").textContent = formatTime(remaining);

  if (remaining <= 0) {
    endGame();
    return;
  }

  updateSpawnInterval(elapsedSeconds);
  updateConveyor(dt, elapsedSeconds);
  updateSpawning(dt);
  updateBalls(dt, timestamp);
  updateParticles(dt);
  updateFloatingTexts(dt);
}

function updateSpawnInterval(elapsedSeconds) {
  const steps = Math.floor(elapsedSeconds / CONFIG.accelerationEverySeconds);
  currentSpawnInterval = CONFIG.initialSpawnInterval * Math.pow(CONFIG.accelerationFactor, steps);
  currentSpawnInterval = Math.max(900, currentSpawnInterval);
}

function updateConveyor(dt, elapsedSeconds) {
  const speedBonus = Math.min(38, elapsedSeconds * 1.3);
  const beltSpeed = 78 + speedBonus;

  conveyorOffset += beltSpeed * (dt / 1000);
  conveyorOffset = conveyorOffset % 74;
}

function updateSpawning(dt) {
  spawnTimer += dt;

  if (spawnTimer < currentSpawnInterval) return;
  if (countActiveFallingBalls() >= CONFIG.maxConcurrentBalls) return;
  if (!canSpawnWithSpacing()) return;

  spawnTimer = 0;
  spawnBallFromPreview();
}

function updateBalls(dt, timestamp) {
  const toRemove = [];

  balls.forEach((ball) => {
    if (ball.state === "falling") {
      const elapsedSeconds = (timestamp - startTime) / 1000;
      const speedBonus = Math.min(38, elapsedSeconds * 1.3);
      ball.y += (ball.speed + speedBonus) * (dt / 1000);

      if (ball.y >= CONFIG.missY) {
        markMissed(ball);
      }
    }

    if (ball.state === "toPipe") {
      const t = clamp((timestamp - ball.animStart) / CONFIG.ballToPipeDuration, 0, 1);
      const eased = easeOutQuad(t);

      ball.x = lerp(ball.startX, ball.targetX, eased);
      ball.y = lerp(ball.startY, ball.targetY, eased);

      if (t >= 1) {
        floatingText("OK", ball.targetX + 36, ball.targetY - 26, "#59f28b");
        toRemove.push(ball.id);
      }
    }

    if (ball.state === "missed") {
      const t = clamp((timestamp - ball.animStart) / 300, 0, 1);
      ball.y = lerp(ball.startY, CONFIG.missY + 60, easeOutQuad(t));
      ball.alpha = 1 - t;

      if (t >= 1) {
        toRemove.push(ball.id);
      }
    }
  });

  if (toRemove.length) {
    balls = balls.filter((ball) => !toRemove.includes(ball.id));
  }
}

/* ------------------------- SPAWN / PREVIEW ------------------------- */

function spawnBallFromPreview() {
  const label = preview.next;
  const domain = mapping[label] || "OTHER";

  const ball = {
    id: cryptoRandomId(),
    label,
    domain,
    x: CONFIG.beltCenterX,
    y: CONFIG.spawnY,
    radius: CONFIG.ballRadius,
    speed: 78,
    state: "falling",
    alpha: 1
  };

  balls.push(ball);

  preview.next = preview.following;
  preview.following = randomCategory();

  animatePreviewShift();
  drawPreview();
}

function canSpawnWithSpacing() {
  const falling = balls.filter((ball) => ball.state === "falling");

  if (!falling.length) return true;

  const highestBall = falling.reduce((top, ball) => {
    return ball.y < top.y ? ball : top;
  }, falling[0]);

  return highestBall.y > CONFIG.spawnY + CONFIG.minSpawnGapY;
}

function countActiveFallingBalls() {
  return balls.filter((ball) => ball.state === "falling").length;
}

function animatePreviewShift() {
  const nextSlot = previewNextCanvas.parentElement;
  const followingSlot = previewFollowingCanvas.parentElement;

  nextSlot.classList.remove("preview-shift");
  followingSlot.classList.remove("preview-shift");

  void nextSlot.offsetWidth;

  nextSlot.classList.add("preview-shift");
  followingSlot.classList.add("preview-shift");
}

function drawPreview() {
  drawPreviewBall(previewNextCtx, preview.next);
  drawPreviewBall(previewFollowingCtx, preview.following);
}

function drawPreviewBall(ctx2d, label) {
  const w = ctx2d.canvas.width;
  const h = ctx2d.canvas.height;

  ctx2d.clearRect(0, 0, w, h);

  if (!label) return;

  drawPixelBall(ctx2d, w / 2, h / 2 + 4, 38, null, label, 12);
}

/* ------------------------- STRIKE ------------------------- */

function strike(domain) {
  if (!running) return;

  animateGlove(domain);

  const lane = LANES[domain];

  const candidates = balls
    .filter((ball) => ball.state === "falling")
    .filter((ball) => Math.abs(ball.y - lane.y) <= CONFIG.hitToleranceY)
    .sort((a, b) => Math.abs(a.y - lane.y) - Math.abs(b.y - lane.y));

  if (!candidates.length) return;

  const ball = candidates[0];

  if (ball.domain === domain) {
    correctHit(ball, domain);
  } else {
    wrongHit(ball);
  }
}

function correctHit(ball, domain) {
  const lane = LANES[domain];

  score += CONFIG.pointsCorrect;
  correctCount += 1;
  updateHud();

  ball.state = "toPipe";
  ball.animStart = performance.now();
  ball.startX = ball.x;
  ball.startY = ball.y;

  ball.targetX = 502;
  ball.targetY = lane.pipeY + 62;

  catReact("success");
}

function wrongHit(ball) {
  score += CONFIG.pointsWrong;
  wrongCount += 1;
  updateHud();

  createExplosion(ball.x, ball.y, "#b9c0c8");
  floatingText("Wrong", ball.x, ball.y - 44, "#ff5c68");

  balls = balls.filter((b) => b.id !== ball.id);

  catReact("wrong");
}

function markMissed(ball) {
  if (ball.state !== "falling") return;

  score += CONFIG.pointsMissed;
  missedCount += 1;
  updateHud();

  ball.state = "missed";
  ball.animStart = performance.now();
  ball.startY = ball.y;

  showMissedBadge();
  floatingText("Missed", CONFIG.beltCenterX, CONFIG.missY - 30, "#ffb347");

  catReact("miss");
}

/* ------------------------- GLOVES ------------------------- */

function animateGlove(domain) {
  const lane = LANES[domain];
  const button = document.getElementById(lane.buttonId);
  const img = document.getElementById(lane.gloveId);

  img.src = lane.hit;
  button.classList.add("hitting");

  window.setTimeout(() => {
    img.src = lane.fold;
    button.classList.remove("hitting");
  }, CONFIG.gloveHitDuration);
}

/* ------------------------- CAT ------------------------- */

function catReact(type) {
  if (catTimeout) {
    clearTimeout(catTimeout);
    catTimeout = null;
  }

  if (type === "success") {
    happyIndex = (happyIndex + 1) % CAT_IMAGES.happy.length;
    drawCat(CAT_IMAGES.happy[happyIndex]);
  }

  if (type === "wrong") {
    drawCat(CAT_IMAGES.wrong);
  }

  if (type === "miss") {
    drawCat(CAT_IMAGES.sad);
  }

  catTimeout = window.setTimeout(() => {
    drawCat(CAT_IMAGES.neutral);
  }, CONFIG.catReactionDuration);
}

function drawCat(src) {
  const img = getImage(src);

  if (!img.complete) {
    img.onload = () => drawCat(src);
    return;
  }

  const w = catCanvas.width;
  const h = catCanvas.height;

  catCtx.clearRect(0, 0, w, h);
  catCtx.fillStyle = "#07111f";
  catCtx.fillRect(0, 0, w, h);

  const scale = Math.min((w * 0.88) / img.width, (h * 0.92) / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;

  const x = (w - drawW) / 2;
  const y = h - drawH - 4;

  catCtx.drawImage(img, x, y, drawW, drawH);
}

/* ------------------------- DRAW GAME ------------------------- */

function drawGame() {
  ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  drawBackground();
  drawMachine();
  drawConveyor();
  drawPipes();
  drawMissedBin();

  drawBalls();
  drawParticles();
  drawFloatingTexts();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
  gradient.addColorStop(0, "#10253a");
  gradient.addColorStop(0.45, "#0c1c2c");
  gradient.addColorStop(1, "#07111f");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let y = 0; y < CONFIG.canvasHeight; y += 4) {
    ctx.fillRect(0, y, CONFIG.canvasWidth, 1);
  }
}

function drawMachine() {
  ctx.save();

  ctx.fillStyle = "#02070d";
  ctx.fillRect(204, 32, 320, 72);

  const machineGradient = ctx.createLinearGradient(204, 24, 524, 104);
  machineGradient.addColorStop(0, "#315f87");
  machineGradient.addColorStop(0.5, "#244866");
  machineGradient.addColorStop(1, "#132c42");

  ctx.fillStyle = machineGradient;
  ctx.fillRect(198, 24, 324, 74);

  ctx.fillStyle = "#152d44";
  ctx.fillRect(256, 98, 208, 52);

  ctx.fillStyle = "#02070d";
  ctx.fillRect(318, 112, 84, 42);

  ctx.strokeStyle = "#63b7ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(198, 24, 324, 74);

  ctx.strokeStyle = "#07111f";
  ctx.lineWidth = 4;
  ctx.strokeRect(256, 98, 208, 52);

  drawText("MACHINE", 360, 62, "#f3f7ff", 18, "center");

  ctx.restore();
}

function drawConveyor() {
  const x = 292;
  const y = 126;
  const w = 136;
  const h = 690;
  const segmentSpacing = 74;

  ctx.save();

  ctx.fillStyle = "#02070d";
  ctx.fillRect(x + 10, y + 10, w, h);

  ctx.fillStyle = "#244866";
  ctx.fillRect(x - 10, y - 10, w + 20, h + 20);

  ctx.strokeStyle = "#63b7ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 10, y - 10, w + 20, h + 20);

  ctx.strokeStyle = "#02070d";
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);

  const beltGradient = ctx.createLinearGradient(x, y, x + w, y);
  beltGradient.addColorStop(0, "#b7d7eb");
  beltGradient.addColorStop(0.25, "#e7f6ff");
  beltGradient.addColorStop(0.5, "#ffffff");
  beltGradient.addColorStop(0.75, "#d2e9f7");
  beltGradient.addColorStop(1, "#9fc3dc");

  ctx.fillStyle = beltGradient;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.fillRect(x, y, 12, h);

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillRect(x + w - 10, y, 10, h);

  ctx.strokeStyle = "#07111f";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 8, y + 8, w - 16, h - 16);
  ctx.clip();

  const firstBandY = y + 54 - segmentSpacing + conveyorOffset;

  for (let yy = firstBandY; yy < y + h + segmentSpacing; yy += segmentSpacing) {
    ctx.fillStyle = "#9fc3dc";
    ctx.fillRect(x + 12, yy, w - 24, 6);

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.fillRect(x + 14, yy + 10, w - 28, 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
    ctx.fillRect(x + 14, yy + 15, w - 28, 2);

    ctx.fillStyle = "rgba(49, 95, 135, 0.35)";
    ctx.fillRect(x + 28, yy + 4, 4, 18);
    ctx.fillRect(x + w - 32, yy + 4, 4, 18);
  }

  ctx.restore();

  for (let yy = y + 28; yy < y + h - 20; yy += 78) {
    drawRivet(x + 10, yy);
    drawRivet(x + w - 17, yy);
  }

  ctx.fillStyle = "#315f87";
  ctx.fillRect(x - 10, y, 8, h);

  ctx.fillStyle = "#315f87";
  ctx.fillRect(x + w + 2, y, 8, h);

  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(x - 8, y + 8, 3, h - 16);
  ctx.fillRect(x + w + 4, y + 8, 3, h - 16);

  ctx.restore();
}

function drawRivet(x, y) {
  ctx.save();

  ctx.fillStyle = "#02070d";
  ctx.fillRect(x + 2, y + 2, 8, 8);

  ctx.fillStyle = "#7da6c4";
  ctx.fillRect(x, y, 8, 8);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 1, y + 1, 3, 3);

  ctx.fillStyle = "#315f87";
  ctx.fillRect(x + 2, y + 5, 5, 2);

  ctx.restore();
}

function drawPipes() {
  drawPipe("MFE", 500, LANES.MFE.pipeY, "#4da6ff", "#123c66");
  drawPipe("RMAT", 500, LANES.RMAT.pipeY, "#ff5c68", "#6f1f2b");
  drawPipe("SVC", 500, LANES.SVC.pipeY, "#ffd45e", "#7a5a12");
}

function drawPipe(label, x, y, color, darkColor) {
  ctx.save();

  const pipeW = 196;
  const pipeH = 124;
  const mouthW = 34;

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(x + 10, y + 12, pipeW, pipeH);

  const bodyGradient = ctx.createLinearGradient(x, y, x, y + pipeH);
  bodyGradient.addColorStop(0, "#f0f4f7");
  bodyGradient.addColorStop(0.18, "#cfd8df");
  bodyGradient.addColorStop(0.48, "#a7b2bc");
  bodyGradient.addColorStop(0.78, "#87939d");
  bodyGradient.addColorStop(1, "#68747e");

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, pipeW, pipeH);

  ctx.fillStyle = "#02070d";
  ctx.beginPath();
  ctx.ellipse(x, y + pipeH / 2, mouthW, pipeH / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(x - 5, y + pipeH / 2 - 22, 8, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const rimGradient = ctx.createLinearGradient(x - mouthW, y, x + mouthW, y);
  rimGradient.addColorStop(0, "#f7fbff");
  rimGradient.addColorStop(0.5, "#8d9aa6");
  rimGradient.addColorStop(1, "#3b4650");

  ctx.strokeStyle = rimGradient;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(x, y + pipeH / 2, mouthW, pipeH / 2 - 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#02070d";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, pipeW, pipeH);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillRect(x + 44, y + 14, pipeW - 60, 9);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(x + 44, y + 28, pipeW - 80, 5);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 42, y + pipeH - 28, pipeW - 58, 10);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(x + 42, y + pipeH - 15, pipeW - 70, 5);

  ctx.fillStyle = "#596673";
  ctx.fillRect(x + 54, y + 4, 8, pipeH - 8);

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(x + 64, y + 8, 3, pipeH - 16);

  ctx.fillStyle = "#596673";
  ctx.fillRect(x + pipeW - 22, y + 4, 8, pipeH - 8);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(x + pipeW - 12, y + 8, 3, pipeH - 16);

  const plateX = x + 78;
  const plateY = y + 34;
  const plateW = 94;
  const plateH = 56;

  ctx.fillStyle = "#02070d";
  ctx.fillRect(plateX + 4, plateY + 4, plateW, plateH);

  const plateGradient = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
  plateGradient.addColorStop(0, color);
  plateGradient.addColorStop(0.55, darkColor);
  plateGradient.addColorStop(1, "#02070d");

  ctx.fillStyle = plateGradient;
  ctx.fillRect(plateX, plateY, plateW, plateH);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  ctx.strokeStyle = "#02070d";
  ctx.lineWidth = 2;
  ctx.strokeRect(plateX + 5, plateY + 5, plateW - 10, plateH - 10);

  drawMiniBolt(plateX + 9, plateY + 9);
  drawMiniBolt(plateX + plateW - 17, plateY + 9);
  drawMiniBolt(plateX + 9, plateY + plateH - 17);
  drawMiniBolt(plateX + plateW - 17, plateY + plateH - 17);

  drawPipeLabel(label, plateX + plateW / 2, plateY + plateH / 2 + 2, "#ffffff", color);

  ctx.restore();
}

function drawMiniBolt(x, y) {
  ctx.save();

  ctx.fillStyle = "#02070d";
  ctx.fillRect(x + 1, y + 1, 7, 7);

  ctx.fillStyle = "#dce8f2";
  ctx.fillRect(x, y, 7, 7);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 1, y + 1, 2, 2);

  ctx.fillStyle = "#6b7884";
  ctx.fillRect(x + 2, y + 4, 4, 2);

  ctx.restore();
}

function drawPipeLabel(text, x, y, fillColor, glowColor) {
  ctx.save();

  ctx.font = "bold 28px Courier New, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#02070d";
  ctx.fillText(text, x + 3, y + 3);

  ctx.fillStyle = glowColor;
  ctx.fillText(text, x + 1, y + 1);

  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(text, x - 1, y - 1);

  ctx.restore();
}

function drawMissedBin() {
  ctx.save();

  ctx.fillStyle = "#05070a";
  ctx.beginPath();
  ctx.ellipse(360, 836, 122, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#858b91";
  ctx.fillRect(238, 836, 244, 78);

  drawText("MISSED", 360, 884, "#ffffff", 24, "center");

  ctx.restore();
}

function drawBalls() {
  balls.forEach((ball) => {
    ctx.save();
    ctx.globalAlpha = ball.alpha ?? 1;

    drawPixelBall(
      ctx,
      ball.x,
      ball.y,
      ball.radius,
      null,
      ball.label,
      20
    );

    ctx.restore();
  });
}

function drawPixelBall(ctx2d, x, y, radius, color, label, fontSize) {
  ctx2d.save();

  ctx2d.fillStyle = BALL_STYLE.shadow;
  ctx2d.beginPath();
  ctx2d.arc(x + 6, y + 7, radius, 0, Math.PI * 2);
  ctx2d.fill();

  const ballGradient = ctx2d.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.40,
    radius * 0.10,
    x,
    y,
    radius
  );

  ballGradient.addColorStop(0, BALL_STYLE.fillTop);
  ballGradient.addColorStop(0.35, BALL_STYLE.fillMiddle);
  ballGradient.addColorStop(1, BALL_STYLE.fillBottom);

  ctx2d.fillStyle = ballGradient;
  ctx2d.beginPath();
  ctx2d.arc(x, y, radius, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.fillStyle = BALL_STYLE.highlight;
  ctx2d.beginPath();
  ctx2d.arc(
    x - radius * 0.32,
    y - radius * 0.36,
    radius * 0.18,
    0,
    Math.PI * 2
  );
  ctx2d.fill();

  ctx2d.fillStyle = "rgba(255,255,255,0.38)";
  ctx2d.fillRect(
    x - radius * 0.06,
    y - radius * 0.48,
    Math.max(4, radius * 0.18),
    Math.max(3, radius * 0.08)
  );

  ctx2d.strokeStyle = BALL_STYLE.outline;
  ctx2d.lineWidth = 5;
  ctx2d.beginPath();
  ctx2d.arc(x, y, radius, 0, Math.PI * 2);
  ctx2d.stroke();

  ctx2d.strokeStyle = "rgba(255,255,255,0.22)";
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.arc(x - 1, y - 1, radius - 6, 0, Math.PI * 2);
  ctx2d.stroke();

  const labelBoxW = radius * 1.62;
  const labelBoxH = radius * 0.52;
  const labelBoxX = x - labelBoxW / 2;
  const labelBoxY = y - labelBoxH / 2 + 2;

  ctx2d.fillStyle = "rgba(2, 7, 13, 0.32)";
  roundedRect(ctx2d, labelBoxX, labelBoxY, labelBoxW, labelBoxH, 8);
  ctx2d.fill();

  const adaptiveFontSize = getBallFontSize(label, radius, fontSize);

  ctx2d.font = `bold ${adaptiveFontSize}px Courier New, monospace`;
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";

  ctx2d.fillStyle = BALL_STYLE.textShadow;
  ctx2d.fillText(label, x + 2, y + 3);

  ctx2d.fillStyle = BALL_STYLE.text;
  ctx2d.fillText(label, x, y + 1);

  ctx2d.restore();
}

function getBallFontSize(label, radius, preferredSize) {
  const length = label.length;

  if (length <= 6) return preferredSize;
  if (length <= 8) return Math.max(12, preferredSize - 2);
  if (length <= 10) return Math.max(11, preferredSize - 4);

  return Math.max(10, preferredSize - 6);
}

function roundedRect(ctx2d, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx2d.beginPath();
  ctx2d.moveTo(x + r, y);
  ctx2d.lineTo(x + width - r, y);
  ctx2d.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx2d.lineTo(x + width, y + height - r);
  ctx2d.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx2d.lineTo(x + r, y + height);
  ctx2d.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx2d.lineTo(x, y + r);
  ctx2d.quadraticCurveTo(x, y, x + r, y);
  ctx2d.closePath();
}

/* ------------------------- EFFECTS ------------------------- */

function createExplosion(x, y, color) {
  for (let i = 0; i < 24; i++) {
    particles.push({
      x,
      y,
      vx: randomRange(-4.2, 4.2),
      vy: randomRange(-4.8, 2.5),
      life: randomRange(300, 560),
      maxLife: 560,
      size: randomRange(5, 9),
      color
    });
  }
}

function updateParticles(dt) {
  particles.forEach((p) => {
    p.life -= dt;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.14;
  });

  particles = particles.filter((p) => p.life > 0);
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  });
}

function floatingText(text, x, y, color) {
  floatingTexts.push({
    text,
    x,
    y,
    color,
    life: 750,
    maxLife: 750
  });
}

function updateFloatingTexts(dt) {
  floatingTexts.forEach((t) => {
    t.life -= dt;
    t.y -= 0.38;
  });

  floatingTexts = floatingTexts.filter((t) => t.life > 0);
}

function drawFloatingTexts() {
  floatingTexts.forEach((t) => {
    ctx.save();
    ctx.globalAlpha = clamp(t.life / t.maxLife, 0, 1);
    drawText(t.text, t.x, t.y, t.color, 26, "center");
    ctx.restore();
  });
}

function showMissedBadge() {
  const badge = document.getElementById("missedBadge");
  badge.style.display = "block";

  window.setTimeout(() => {
    badge.style.display = "none";
  }, 700);
}

/* ------------------------- HUD / HELPERS ------------------------- */

function updateHud() {
  document.getElementById("bigScore").textContent = score;
  document.getElementById("scoreHud").textContent = `Score: ${score}`;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("missedCount").textContent = missedCount;
}

function randomCategory() {
  return mappingKeys[Math.floor(Math.random() * mappingKeys.length)];
}

function colorForDomain(domain) {
  if (domain === "MFE") return LANES.MFE.color;
  if (domain === "RMAT") return LANES.RMAT.color;
  if (domain === "SVC") return LANES.SVC.color;
  return "#a2abb5";
}

function getImage(src) {
  if (!imageCache[src]) {
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
  }

  return imageCache[src];
}

function formatTime(seconds) {
  const s = Math.ceil(seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function drawText(text, x, y, color, size, align = "left") {
  ctx.save();
  ctx.font = `bold ${size}px Courier New, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#000000";
  ctx.fillText(text, x + 3, y + 3);

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function cryptoRandomId() {
  if (window.crypto && window.crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + "-" + String(Math.random());
}
