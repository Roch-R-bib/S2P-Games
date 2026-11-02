// ==========================================
// GAME VARIABLES
// ==========================================

let score = 0;
let timeLeft = 10;
let gameStarted = false;
let gameFinished = false;
let spacePressed = false;

let velocity = 0;
let distance = 0;
let timerInterval = null;
let animationId = null;

// ==========================================
// HTML ELEMENTS
// ==========================================

const game = document.getElementById("game");
const cloudLayer = document.getElementById("cloud-layer");
const spaceLayer = document.getElementById("space-layer");
const launchPad = document.getElementById("launch-pad");
const rocket = document.getElementById("rocket");

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

const gameOverPanel = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const finalRank = document.getElementById("final-rank");
const restartButton = document.getElementById("restart-btn");

const clouds = [];
const stars = [];
const planets = [];

// ==========================================
// CONFIG
// ==========================================

const GAME_DURATION = 10;
const BOOST_POWER = 4.2;
const FRICTION = 0.94;

const CLOUD_COUNT = 70;
const STAR_COUNT = 180;
const PLANET_COUNT = 9;

// ==========================================
// UTILS
// ==========================================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ==========================================
// CLOUD GENERATION
// ==========================================

function generateClouds() {
  cloudLayer.innerHTML = "";
  clouds.length = 0;

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";

    const width = random(130, 330);
    const height = random(52, 105);

    const cloudData = {
      element: cloud,
      x: random(-80, 920),
      y: random(-250, 1100),
      width,
      height,
      speed: random(0.38, 0.82)
    };

    cloud.style.width = `${width}px`;
    cloud.style.height = `${height}px`;

    cloudLayer.appendChild(cloud);
    clouds.push(cloudData);
  }
}

// ==========================================
// STAR GENERATION
// ==========================================

function generateStars() {
  spaceLayer.innerHTML = "";
  stars.length = 0;

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "star";

    const size = random(2, 4);

    const starData = {
      element: star,
      x: random(0, 1000),
      y: random(-300, 1100),
      size,
      speed: random(0.22, 0.5)
    };

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    spaceLayer.appendChild(star);
    stars.push(starData);
  }
}

// ==========================================
// PLANET GENERATION
// ==========================================

function generatePlanets() {
  const colors = [
    "linear-gradient(135deg, #00d4ff, #005a90)",
    "linear-gradient(135deg, #ff6b6b, #8b1e1e)",
    "linear-gradient(135deg, #ffd84d, #b67a00)",
    "linear-gradient(135deg, #b27fff, #4b1a87)",
    "linear-gradient(135deg, #4dff9f, #0a7a4b)"
  ];

  for (let i = 0; i < PLANET_COUNT; i++) {
    const planet = document.createElement("div");
    planet.className = "planet";

    const size = random(62, 145);

    const planetData = {
      element: planet,
      x: random(40, 850),
      y: random(-500, 1000),
      size,
      speed: random(0.13, 0.28)
    };

    planet.style.width = `${size}px`;
    planet.style.height = `${size}px`;
    planet.style.background = colors[Math.floor(Math.random() * colors.length)];

    spaceLayer.appendChild(planet);
    planets.push(planetData);
  }
}

// ==========================================
// STAGE UPDATE
// ==========================================

function updateStage() {
  if (score >= 3) {
    launchPad.classList.add("hidden-launchpad");
  }

  if (score < 20) {
    game.classList.remove("space-background");
    messageElement.textContent = "Ciel bleu - continue à booster !";
    setCloudDensity(0);
    setSpaceVisibility(false);
    return;
  }

  if (score < 30) {
    game.classList.remove("space-background");
    messageElement.textContent = "Entrée dans la couche nuageuse";
    setCloudDensity(14);
    setSpaceVisibility(false);
    return;
  }

  if (score < 40) {
    game.classList.remove("space-background");
    messageElement.textContent = "Nuages plus denses";
    setCloudDensity(38);
    setSpaceVisibility(false);
    return;
  }

  if (score < 50) {
    game.classList.remove("space-background");
    messageElement.textContent = "Couche nuageuse maximale";
    setCloudDensity(CLOUD_COUNT);
    setSpaceVisibility(false);
    return;
  }

  game.classList.add("space-background");
  messageElement.textContent = "Espace atteint - traverse les étoiles !";
  setCloudDensity(0);
  setSpaceVisibility(true);
}

function setCloudDensity(visibleCount) {
  clouds.forEach((cloud, index) => {
    cloud.element.style.opacity = index < visibleCount ? "0.92" : "0";
  });
}

function setSpaceVisibility(isVisible) {
  stars.forEach((star) => {
    star.element.style.opacity = isVisible ? "1" : "0";
  });

  const visiblePlanets = isVisible
    ? clamp(Math.floor((score - 50) / 8) + 2, 0, planets.length)
    : 0;

  planets.forEach((planet, index) => {
    planet.element.style.opacity = index < visiblePlanets ? "1" : "0";
  });
}

// ==========================================
// RANK
// ==========================================

function calculateRank() {
  if (score >= 150) {
    return "PTOP Master";
  }

  if (score >= 100) {
    return "BI Champion";
  }

  if (score >= 70) {
    return "Insight Explorer";
  }

  if (score >= 40) {
    return "Cloud Breaker";
  }

  return "Procurement Rookie";
}

// ==========================================
// TIMER
// ==========================================

function startGameTimer() {
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ==========================================
// ANIMATION LOOP
// ==========================================

function startAnimation() {
  function animate() {
    if (!gameFinished) {
      distance += velocity;
      velocity *= FRICTION;

      if (velocity < 0.05) {
        velocity = 0;
      }

      animateRocket();
      animateClouds();
      animateSpace();

      animationId = requestAnimationFrame(animate);
    }
  }

  animate();
}

function animateRocket() {
  const shake = gameStarted ? random(-2.2, 2.2) : 0;
  const lift = clamp(velocity * 1.8, 0, 34);
  const rotation = clamp(shake, -2, 2);

  rocket.style.transform = `translateY(${-lift}px) rotate(${rotation}deg)`;
}

function animateClouds() {
  const gameHeight = game.clientHeight;
  const gameWidth = game.clientWidth;

  clouds.forEach((cloud) => {
    const wrappedY = ((cloud.y + distance * cloud.speed) % (gameHeight + 360)) - 220;
    const responsiveX = (cloud.x / 1000) * gameWidth;

    cloud.element.style.transform = `translate(${responsiveX}px, ${wrappedY}px)`;
  });
}

function animateSpace() {
  const gameHeight = game.clientHeight;
  const gameWidth = game.clientWidth;

  stars.forEach((star) => {
    const wrappedY = ((star.y + distance * star.speed) % (gameHeight + 300)) - 180;
    const responsiveX = (star.x / 1000) * gameWidth;

    star.element.style.transform = `translate(${responsiveX}px, ${wrappedY}px)`;
  });

  planets.forEach((planet) => {
    const wrappedY = ((planet.y + distance * planet.speed) % (gameHeight + 700)) - 420;
    const responsiveX = (planet.x / 1000) * gameWidth;

    planet.element.style.transform = `translate(${responsiveX}px, ${wrappedY}px)`;
  });
}

// ==========================================
// GAME FLOW
// ==========================================

function startGame() {
  gameStarted = true;
  game.classList.add("playing");
  messageElement.textContent = "Décollage ! Continue à appuyer sur ESPACE !";

  startGameTimer();
  startAnimation();
}

function addBoost() {
  score += 1;
  scoreElement.textContent = score;

  velocity += BOOST_POWER;

  updateStage();
}

function endGame() {
  if (gameFinished) {
    return;
  }

  gameFinished = true;
  game.classList.remove("playing");

  clearInterval(timerInterval);

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  finalScore.textContent = `Score final : ${score} boosts`;
  finalRank.textContent = `Rang : ${calculateRank()}`;

  gameOverPanel.style.display = "block";
  messageElement.textContent = "Mission terminée";
}

function resetGame() {
  score = 0;
  timeLeft = GAME_DURATION;
  gameStarted = false;
  gameFinished = false;
  spacePressed = false;
  velocity = 0;
  distance = 0;

  clearInterval(timerInterval);

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  timerElement.textContent = timeLeft;
  scoreElement.textContent = score;
  messageElement.textContent = "Appuie rapidement sur ESPACE pour lancer la fusée !";

  finalScore.textContent = "";
  finalRank.textContent = "";
  gameOverPanel.style.display = "none";

  game.classList.remove("playing", "space-background");
  launchPad.classList.remove("hidden-launchpad");

  rocket.style.transform = "translateY(0) rotate(0deg)";

  generateClouds();
  generateStars();
  generatePlanets();
  updateStage();
}

// ==========================================
// KEYBOARD EVENTS
// ==========================================

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }

  event.preventDefault();

  if (spacePressed || gameFinished) {
    return;
  }

  spacePressed = true;

  if (!gameStarted) {
    startGame();
  }

  addBoost();
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;
  }
});

// ==========================================
// REPLAY
// ==========================================

restartButton.addEventListener("click", resetGame);

// ==========================================
// INITIALIZATION
// ==========================================

resetGame();
