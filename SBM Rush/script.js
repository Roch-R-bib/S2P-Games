(() => {
  "use strict";

  const W = 1200;
  const H = 720;
  const GAME_DURATION = 60;
  const COMPLETE_HIERARCHY_BONUS = 25;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const homeScreen = document.getElementById("homeScreen");
  const gameScreen = document.getElementById("gameScreen");
  const resultScreen = document.getElementById("resultScreen");

  const playBtn = document.getElementById("playBtn");
  const replayBtn = document.getElementById("replayBtn");

  const finalScore = document.getElementById("finalScore");
  const finalRank = document.getElementById("finalRank");
  const finalComplete = document.getElementById("finalComplete");
  const finalSorted = document.getElementById("finalSorted");

  const LEVEL_POINTS = {
    GRP: 10,
    SUB: 5,
    SIT: 2
  };

  const LEVELS = ["GRP", "SUB", "SIT"];

  const COLORS = [
    "#E6194B", "#3CB44B", "#FFE119", "#4363D8",
    "#F58231", "#911EB4", "#46F0F0", "#F032E6",
    "#BCF60C", "#FABEBE", "#008080", "#E6BEFF",
    "#9A6324", "#FFFAC8", "#800000", "#AAFFC3"
  ];

  const playArea = {
    x: 220,
    y: 92,
    w: 760,
    h: 594
  };

  let suppliers = [];
  let containers = [];

  let running = false;
  let startTime = 0;
  let lastFrame = 0;
  let timeLeft = GAME_DURATION;

  let score = 0;
  let completeCount = 0;
  let sortedCount = 0;

  let mouse = { x: 0, y: 0 };
  let drag = null;

  function showScreen(screen) {
  gameScreen.classList.add("active");

  homeScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  if (screen === homeScreen || screen === resultScreen) {
    screen.classList.add("active");
  }
}


  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function shuffle(array) {
    const a = array.slice();

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  function getMouse(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H
    };
  }

  function createContainers() {
    const result = [];
    const cw = 178;
    const ch = 132;
    const gap = 14;
    const y0 = 92;

    for (let i = 0; i < 4; i++) {
      result.push({
        id: i,
        label: "Container " + (i + 1),
        x: 20,
        y: y0 + i * (ch + gap),
        w: cw,
        h: ch,
        color: null,
        suppliers: []
      });
    }

    for (let i = 0; i < 4; i++) {
      result.push({
        id: i + 4,
        label: "Container " + (i + 5),
        x: 1002,
        y: y0 + i * (ch + gap),
        w: cw,
        h: ch,
        color: null,
        suppliers: []
      });
    }

    return result;
  }

  function createSupplier(colorIndex, level, hierarchyRef) {
    return {
      id: "SUP-" + String(suppliers.length + 1).padStart(3, "0"),
      colorIndex,
      color: COLORS[colorIndex],
      level,
      hierarchyRef,
      state: "field",
      containerId: null,
      x: rand(playArea.x + 30, playArea.x + playArea.w - 30),
      y: rand(playArea.y + 40, playArea.y + playArea.h - 40),
      vx: rand(-1.5, 1.5) || 1,
      vy: rand(-1.5, 1.5) || -1,
      drawX: 0,
      drawY: 0,
      complete: false
    };
  }

  function generateSuppliers() {
  suppliers = [];

  const colorIndexes = shuffle([...Array(16).keys()]);
  const completeColors = colorIndexes.slice(0, 8);
  const incompleteColors = colorIndexes.slice(8, 16);

  /*
    8 complete colors.
    Each complete color has only one hierarchyRef.
    Each hierarchy has only one GRP.
    A complete hierarchy may have several SUB and SIT, but only one GRP.
  */
  completeColors.forEach((colorIndex, c) => {
    const ref = "C" + c + "-H1";

    suppliers.push(createSupplier(colorIndex, "GRP", ref));

    suppliers.push(createSupplier(colorIndex, "SUB", ref));
    suppliers.push(createSupplier(colorIndex, "SUB", ref));
    suppliers.push(createSupplier(colorIndex, "SUB", ref));

    suppliers.push(createSupplier(colorIndex, "SIT", ref));
    suppliers.push(createSupplier(colorIndex, "SIT", ref));
    suppliers.push(createSupplier(colorIndex, "SIT", ref));
  });

  /*
    8 incomplete colors.
    They may look attractive, but they never create a complete GRP + SUB + SIT hierarchy.
    Also, no hierarchyRef contains more than one GRP.
  */
  const incompletePatterns = [
    ["GRP", "SUB", "SUB", "SUB"],
    ["SUB", "SUB", "SUB", "SIT", "SIT", "SIT"],
    ["SIT", "SIT", "SIT", "SIT", "SIT"],
    ["GRP", "SIT", "SIT", "SIT"],
    ["SUB", "SUB", "SUB", "SUB"],
    ["GRP", "SUB", "SUB"],
    ["SIT", "SIT", "SIT", "SIT"],
    ["SUB", "SUB", "SIT", "SIT", "SIT"]
  ];

  incompleteColors.forEach((colorIndex, i) => {
    const ref = "INC-" + i;

    incompletePatterns[i].forEach(level => {
      suppliers.push(createSupplier(colorIndex, level, ref));
    });
  });

  suppliers = shuffle(suppliers);

  suppliers.forEach((s, i) => {
    s.id = "SUP-" + String(i + 1).padStart(3, "0");
    s.x = rand(playArea.x + 30, playArea.x + playArea.w - 30);
    s.y = rand(playArea.y + 40, playArea.y + playArea.h - 40);
  });
}

  function resetGame() {
    containers = createContainers();
    generateSuppliers();

    timeLeft = GAME_DURATION;
    score = 0;
    completeCount = 0;
    sortedCount = 0;
    drag = null;

    updateScore();
  }

  function startGame() {
  resetGame();
  showScreen(gameScreen);

  running = true;
  startTime = performance.now();
  lastFrame = performance.now();
}

  function endGame() {
    running = false;
    drag = null;
    canvas.classList.remove("dragging");

    updateScore();

    finalScore.textContent = score;
    finalRank.textContent = getRank(score);
    finalComplete.textContent = completeCount;
    finalSorted.textContent = sortedCount;

    showScreen(resultScreen);
  }

  function getRank(value) {
    if (value >= 300) return "Procurement Master";
    if (value >= 220) return "SBM Expert";
    if (value >= 150) return "Supplier Manager";
    if (value >= 80) return "Supplier Analyst";
    return "Supplier Trainee";
  }

  function loop(now) {
  const dt = Math.min(0.04, (now - lastFrame) / 1000);
  lastFrame = now;

  if (running) {
    timeLeft = Math.max(0, GAME_DURATION - (now - startTime) / 1000);
  } else {
    timeLeft = GAME_DURATION;
  }

  update(dt);
  draw();

  if (running && timeLeft <= 0) {
    endGame();
  }

  requestAnimationFrame(loop);
}

  function update(dt) {
    suppliers.forEach(s => {
      if (s.state !== "field") return;

      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;

      s.vx += rand(-0.02, 0.02);
      s.vy += rand(-0.02, 0.02);

      s.vx = clamp(s.vx, -1.9, 1.9);
      s.vy = clamp(s.vy, -1.9, 1.9);

      const m = 24;

      if (s.x < playArea.x + m) {
        s.x = playArea.x + m;
        s.vx = Math.abs(s.vx);
      }

      if (s.x > playArea.x + playArea.w - m) {
        s.x = playArea.x + playArea.w - m;
        s.vx = -Math.abs(s.vx);
      }

      if (s.y < playArea.y + m) {
        s.y = playArea.y + m;
        s.vy = Math.abs(s.vy);
      }

      if (s.y > playArea.y + playArea.h - m) {
        s.y = playArea.y + playArea.h - m;
        s.vy = -Math.abs(s.vy);
      }
    });
  }

  function updateScore() {
  score = 0;
  completeCount = 0;
  sortedCount = 0;

  suppliers.forEach(s => {
    s.complete = false;
  });

  containers.forEach(container => {
    const byRef = {};
    let containerAlreadyHasCompleteHierarchy = false;

    container.suppliers.forEach(s => {
      sortedCount++;
      score += LEVEL_POINTS[s.level];

      if (!byRef[s.hierarchyRef]) {
        byRef[s.hierarchyRef] = {
          GRP: [],
          SUB: [],
          SIT: []
        };
      }

      byRef[s.hierarchyRef][s.level].push(s);
    });

    Object.values(byRef).forEach(group => {
      const hasOneGrpOnly = group.GRP.length === 1;
      const hasSub = group.SUB.length >= 1;
      const hasSit = group.SIT.length >= 1;

      if (
        !containerAlreadyHasCompleteHierarchy &&
        hasOneGrpOnly &&
        hasSub &&
        hasSit
      ) {
        score += COMPLETE_HIERARCHY_BONUS;
        completeCount++;
        containerAlreadyHasCompleteHierarchy = true;

        group.GRP.forEach(s => s.complete = true);
        group.SUB.forEach(s => s.complete = true);
        group.SIT.forEach(s => s.complete = true);
      }
    });
  });
}

  function canAccept(container, supplier) {
    return container.color === null || container.color === supplier.colorIndex;
  }

  function getContainerAt(x, y) {
    return containers.find(c =>
      x >= c.x &&
      x <= c.x + c.w &&
      y >= c.y &&
      y <= c.y + c.h
    ) || null;
  }

  function removeFromContainer(supplier) {
    if (supplier.containerId === null) return;

    const container = containers.find(c => c.id === supplier.containerId);
    if (!container) return;

    container.suppliers = container.suppliers.filter(s => s !== supplier);

    if (container.suppliers.length === 0) {
      container.color = null;
    }

    supplier.containerId = null;
  }

  function placeInContainer(supplier, container) {
    supplier.state = "container";
    supplier.containerId = container.id;

    if (container.color === null) {
      container.color = supplier.colorIndex;
    }

    if (!container.suppliers.includes(supplier)) {
      container.suppliers.push(supplier);
    }

    updateScore();
  }

  function placeInField(supplier, x, y) {
    supplier.state = "field";
    supplier.containerId = null;

    supplier.x = clamp(x, playArea.x + 30, playArea.x + playArea.w - 30);
    supplier.y = clamp(y, playArea.y + 30, playArea.y + playArea.h - 30);

    supplier.vx = rand(-1.5, 1.5) || 1;
    supplier.vy = rand(-1.5, 1.5) || -1;

    updateScore();
  }

  function findSupplierAt(x, y) {
    for (let i = suppliers.length - 1; i >= 0; i--) {
      const s = suppliers[i];

      if (s.state === "drag") continue;

      const dx = x - s.drawX;
      const dy = y - s.drawY;
      const radius = s.state === "container" ? 18 : 22;

      if (dx * dx + dy * dy <= radius * radius) {
        return s;
      }
    }

    return null;
  }

  canvas.addEventListener("mousedown", event => {
    if (!running) return;

    mouse = getMouse(event);

    const supplier = findSupplierAt(mouse.x, mouse.y);
    if (!supplier) return;

    removeFromContainer(supplier);

    supplier.state = "drag";
    supplier.containerId = null;

    drag = supplier;
    canvas.classList.add("dragging");

    updateScore();
  });

  canvas.addEventListener("mousemove", event => {
    mouse = getMouse(event);
  });

  canvas.addEventListener("mouseup", event => {
    if (!running || !drag) return;

    mouse = getMouse(event);

    const container = getContainerAt(mouse.x, mouse.y);

    if (container && canAccept(container, drag)) {
      placeInContainer(drag, container);
    } else {
      placeInField(drag, mouse.x, mouse.y);
    }

    drag = null;
    canvas.classList.remove("dragging");
  });

  canvas.addEventListener("mouseleave", () => {
    if (!running || !drag) return;

    placeInField(drag, mouse.x, mouse.y);

    drag = null;
    canvas.classList.remove("dragging");
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    drawBackground();
    drawHud();
    drawPlayArea();

    containers.forEach(drawContainer);

    suppliers.forEach(s => {
      if (s.state === "field") {
        drawSupplier(s, s.x, s.y, 27);
        s.drawX = s.x;
        s.drawY = s.y;
      }
    });

    if (drag) {
      drawSupplier(drag, mouse.x, mouse.y, 34, true);
      drag.drawX = mouse.x;
      drag.drawY = mouse.y;
    }

    drawInstruction();
  }

  function drawBackground() {
    ctx.fillStyle = "#07111f";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(77,231,255,0.07)";
    ctx.lineWidth = 1;

    for (let x = 0; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawHud() {
    ctx.fillStyle = "#101f35";
    ctx.fillRect(0, 0, W, 72);

    ctx.strokeStyle = "#4de7ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, 56);

    text("SBM RUSH", 32, 44, 28, "#ffd84d", "left");

    text("TIME", 390, 28, 14, "#9fb2d0", "center");
    text(String(Math.ceil(timeLeft)).padStart(2, "0"), 390, 54, 27, timeLeft <= 10 ? "#ff5c7a" : "#ffffff", "center");

    text("SCORE", 560, 28, 14, "#9fb2d0", "center");
    text(String(score).padStart(3, "0"), 560, 54, 27, "#62ff9f", "center");

    text("COMPLETE HIERARCHIES", 800, 28, 14, "#9fb2d0", "center");
    text(String(completeCount), 800, 54, 27, "#ffd84d", "center");

    text("SORTED", 1040, 28, 14, "#9fb2d0", "center");
    text(String(sortedCount), 1040, 54, 27, "#ffffff", "center");
  }

  function drawPlayArea() {
    ctx.fillStyle = "rgba(8,18,32,0.92)";
    ctx.fillRect(playArea.x, playArea.y, playArea.w, playArea.h);

    ctx.strokeStyle = "#4de7ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(playArea.x, playArea.y, playArea.w, playArea.h);

    text(
      "FLOATING SUPPLIER BASE",
      playArea.x + playArea.w / 2,
      playArea.y + 26,
      16,
      "rgba(255,255,255,0.45)",
      "center"
    );
  }

  function drawContainer(container) {
    const hover = drag && getContainerAt(mouse.x, mouse.y) === container;
    const compatible = drag && canAccept(container, drag);
    const hasComplete = container.suppliers.some(s => s.complete);

    ctx.fillStyle = "#101f35";
    ctx.fillRect(container.x, container.y, container.w, container.h);

    if (container.color !== null) {
      ctx.fillStyle = COLORS[container.color] + "33";
      ctx.fillRect(container.x + 5, container.y + 5, container.w - 10, container.h - 10);
    }

    ctx.lineWidth = hover ? 5 : 3;
    ctx.strokeStyle = hover
      ? compatible ? "#62ff9f" : "#ff5c7a"
      : hasComplete ? "#ffd84d" : "#4de7ff";

    ctx.strokeRect(container.x, container.y, container.w, container.h);

    text(container.label, container.x + container.w / 2, container.y + 16, 12, "#ffffff", "center");

    const top = container.y + 24;
    const laneH = (container.h - 28) / 3;

    LEVELS.forEach((level, index) => {
      const y = top + index * laneH;

      ctx.fillStyle = index % 2 === 0
        ? "rgba(255,255,255,0.045)"
        : "rgba(255,255,255,0.075)";

      ctx.fillRect(container.x + 5, y, container.w - 10, laneH);

      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.strokeRect(container.x + 5, y, container.w - 10, laneH);

      text(level + " LEVEL", container.x + 43, y + 20, 10, "#9fb2d0", "center");
    });

    if (container.color !== null) {
      ctx.fillStyle = COLORS[container.color];
      ctx.fillRect(container.x + container.w - 25, container.y + 8, 14, 14);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(container.x + container.w - 25, container.y + 8, 14, 14);
    }

    drawContainerSuppliers(container);
  }

  function drawContainerSuppliers(container) {
    const top = container.y + 24;
    const laneH = (container.h - 28) / 3;

    LEVELS.forEach((level, laneIndex) => {
      const list = container.suppliers.filter(s => s.level === level);

      const size = 18;
      const gap = 5;
      const startX = container.x + 90;
      const startY = top + laneIndex * laneH + 20;

      list.forEach((s, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);

        const x = startX + col * (size + gap);
        const y = startY + row * (size + gap);

        drawSupplier(s, x, y, size, false, true);

        s.drawX = x;
        s.drawY = y;
      });
    });
  }

  function drawSupplier(s, x, y, size, dragging = false, small = false) {
    ctx.save();

    if (dragging) {
      ctx.shadowColor = "rgba(255,216,77,0.8)";
      ctx.shadowBlur = 18;
    }

    ctx.fillStyle = s.color;
    ctx.strokeStyle = s.complete ? "#ffd84d" : "#050914";
    ctx.lineWidth = s.complete ? 4 : 3;

    if (s.level === "GRP") {
      triangle(x, y, size);
    } else if (s.level === "SUB") {
      square(x, y, size);
    } else {
      circle(x, y, size);
    }

    if (!small) {
      text(s.level, x, y + 4, size <= 27 ? 9 : 11, readableColor(s.color), "center");
    }

    ctx.restore();
  }

  function triangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.62);
    ctx.lineTo(x - size * 0.65, y + size * 0.55);
    ctx.lineTo(x + size * 0.65, y + size * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function square(x, y, size) {
    const s = size * 1.1;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    ctx.strokeRect(x - s / 2, y - s / 2, s, s);
  }

  function circle(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.58, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawInstruction() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(playArea.x, H - 30, playArea.w, 24);

  text(
    "Group same colors. Triangle = GRP, Square = SUB, Circle = SIT. Complete one hierarchy per container.",
    playArea.x + playArea.w / 2,
    H - 17,
    12,
    "#ffffff",
    "center"
  );
}

  function text(value, x, y, size, color, align = "left") {
    ctx.font = "bold " + size + "px Courier New, monospace";
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);
  }

  function readableColor(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    return lum > 150 ? "#050914" : "#ffffff";
  }

  playBtn.addEventListener("click", startGame);
replayBtn.addEventListener("click", startGame);

resetGame();
showScreen(homeScreen);
lastFrame = performance.now();
requestAnimationFrame(loop);
})();
