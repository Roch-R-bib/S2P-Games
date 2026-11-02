// =========================================
// LOCAL LOOP - CONFIG
// =========================================

const GAME_DURATION_SECONDS = 60;
const POINTS_PER_OPTIMIZED_FLOW = 10;

const supplierTypes = [
  {
    id: "blue",
    name: "Components",
    color: "#2da8ff"
  },
  {
    id: "red",
    name: "Raw Materials",
    color: "#ff4d5f"
  },
  {
    id: "green",
    name: "Logistics",
    color: "#43e36d"
  },
  {
    id: "yellow",
    name: "Packaging",
    color: "#ffd84d"
  },
  {
    id: "purple",
    name: "Services",
    color: "#b45cff"
  }
];

const companies = [
  {
    id: "na",
    label: "NA",
    name: "North America",
    x: 17,
    y: 34
  },
  {
    id: "sa",
    label: "SA",
    name: "South America",
    x: 34,
    y: 62
  },
  {
    id: "we",
    label: "WE",
    name: "Western Europe",
    x: 49,
    y: 31
  },
  {
    id: "ee",
    label: "EE",
    name: "Eastern Europe",
    x: 57,
    y: 31
  },
  {
    id: "as",
    label: "AS",
    name: "Asia",
    x: 83,
    y: 38
  },
  {
    id: "aim",
    label: "AIM",
    name: "Africa, India, Middle East",
    x: 61,
    y: 51
  }
];

const suppliers = [
  // Blue - Components
  {
    id: "blue-mexico",
    typeId: "blue",
    label: "MX",
    location: "Mexico",
    x: 19,
    y: 47
  },
  {
    id: "blue-brazil",
    typeId: "blue",
    label: "BR",
    location: "Brazil",
    x: 34,
    y: 66
  },
  {
    id: "blue-belgium",
    typeId: "blue",
    label: "BE",
    location: "Belgium",
    x: 48,
    y: 35
  },
  {
    id: "blue-poland",
    typeId: "blue",
    label: "PL",
    location: "Poland",
    x: 56,
    y: 34
  },
  {
    id: "blue-china",
    typeId: "blue",
    label: "CN",
    location: "China",
    x: 77,
    y: 43
  },

  // Red - Raw Materials
  {
    id: "red-usa",
    typeId: "red",
    label: "US",
    location: "United States",
    x: 18,
    y: 34
  },
  {
    id: "red-chile",
    typeId: "red",
    label: "CL",
    location: "Chile",
    x: 27,
    y: 73
  },
  {
    id: "red-uk",
    typeId: "red",
    label: "UK",
    location: "United Kingdom",
    x: 46,
    y: 32
  },
  {
    id: "red-turkey",
    typeId: "red",
    label: "TR",
    location: "Turkey",
    x: 60,
    y: 42
  },
  {
    id: "red-india",
    typeId: "red",
    label: "IN",
    location: "India",
    x: 69,
    y: 55
  },

  // Green - Logistics
  {
    id: "green-canada",
    typeId: "green",
    label: "CA",
    location: "Canada",
    x: 16,
    y: 27
  },
  {
    id: "green-argentina",
    typeId: "green",
    label: "AR",
    location: "Argentina",
    x: 31,
    y: 76
  },
  {
    id: "green-france",
    typeId: "green",
    label: "FR",
    location: "France",
    x: 49,
    y: 38
  },
  {
    id: "green-south-africa",
    typeId: "green",
    label: "ZA",
    location: "South Africa",
    x: 55,
    y: 73
  },
  {
    id: "green-japan",
    typeId: "green",
    label: "JP",
    location: "Japan",
    x: 84,
    y: 39
  },

  // Yellow - Packaging
  {
    id: "yellow-us-east",
    typeId: "yellow",
    label: "US",
    location: "US East",
    x: 23,
    y: 38
  },
  {
    id: "yellow-colombia",
    typeId: "yellow",
    label: "CO",
    location: "Colombia",
    x: 29,
    y: 57
  },
  {
    id: "yellow-germany",
    typeId: "yellow",
    label: "DE",
    location: "Germany",
    x: 51,
    y: 34
  },
  {
    id: "yellow-uae",
    typeId: "yellow",
    label: "AE",
    location: "United Arab Emirates",
    x: 62,
    y: 50
  },
  {
    id: "yellow-se-asia",
    typeId: "yellow",
    label: "SEA",
    location: "South East Asia",
    x: 77,
    y: 58
  },

  // Purple - Services
  {
    id: "purple-us-west",
    typeId: "purple",
    label: "US",
    location: "US West",
    x: 13,
    y: 37
  },
  {
    id: "purple-peru",
    typeId: "purple",
    label: "PE",
    location: "Peru",
    x: 25,
    y: 65
  },
  {
    id: "purple-spain",
    typeId: "purple",
    label: "ES",
    location: "Spain",
    x: 47,
    y: 43
  },
  {
    id: "purple-egypt",
    typeId: "purple",
    label: "EG",
    location: "Egypt",
    x: 58,
    y: 51
  },
  {
    id: "purple-korea",
    typeId: "purple",
    label: "KR",
    location: "Korea",
    x: 81,
    y: 36
  }
];

// =========================================
// DOM ELEMENTS
// =========================================

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const optimizedCountElement = document.getElementById("optimized-count");
const totalFlowsElement = document.getElementById("total-flows");
const selectedInfoElement = document.getElementById("selected-info");

const worldMap = document.getElementById("world-map");
const connectionsSvg = document.getElementById("connections-svg");
const nodesLayer = document.getElementById("nodes-layer");
const toastElement = document.getElementById("toast");

const startScreen = document.getElementById("start-screen");
const tutorialScreen = document.getElementById("tutorial-screen");
const endScreen = document.getElementById("end-screen");

const startButton = document.getElementById("start-button");
const startOptimizationButton = document.getElementById("start-optimization-button");
const playAgainButton = document.getElementById("play-again-button");

const endTitleElement = document.getElementById("end-title");
const endResultElement = document.getElementById("end-result");
const endScoreElement = document.getElementById("end-score");
const endMessageElement = document.getElementById("end-message");

// =========================================
// GAME STATE
// =========================================

let connections = [];
let selectedConnectionId = null;
let hoveredConnectionId = null;

let gameRunning = false;
let gameEnded = false;

let gameStartTime = 0;
let animationId = null;
let toastTimeout = null;

// =========================================
// UTILITIES
// =========================================

function getSupplierType(typeId) {
  return supplierTypes.find((type) => type.id === typeId);
}

function getCompany(companyId) {
  return companies.find((company) => company.id === companyId);
}

function getSupplier(supplierId) {
  return suppliers.find((supplier) => supplier.id === supplierId);
}

function getConnection(connectionId) {
  return connections.find((connection) => connection.id === connectionId);
}

function distanceBetween(a, b) {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getNearestSupplier(company, typeId) {
  const compatibleSuppliers = suppliers.filter((supplier) => supplier.typeId === typeId);

  let nearestSupplier = compatibleSuppliers[0];
  let nearestDistance = distanceBetween(company, nearestSupplier);

  compatibleSuppliers.forEach((supplier) => {
    const distance = distanceBetween(company, supplier);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSupplier = supplier;
    }
  });

  return nearestSupplier;
}

function isConnectionOptimal(connection) {
  const company = getCompany(connection.companyId);
  const nearestSupplier = getNearestSupplier(company, connection.typeId);

  return nearestSupplier.id === connection.supplierId;
}

function getOptimizedFlowCount() {
  return connections.filter((connection) => isConnectionOptimal(connection)).length;
}

function getMaximumScore() {
  return companies.length * supplierTypes.length * POINTS_PER_OPTIMIZED_FLOW;
}

function getCurrentScore() {
  return getOptimizedFlowCount() * POINTS_PER_OPTIMIZED_FLOW;
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showToast(message) {
  clearTimeout(toastTimeout);

  toastElement.textContent = message;
  toastElement.classList.remove("hidden");

  toastTimeout = setTimeout(() => {
    toastElement.classList.add("hidden");
  }, 1400);
}

// =========================================
// ROBUST LINE DETECTION
// =========================================

function getMapPointFromEvent(event) {
  const rect = worldMap.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100
  };
}

function distancePointToSegment(point, start, end) {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;

  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared === 0) {
    return distanceBetween(point, start);
  }

  let projection =
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) /
    lengthSquared;

  projection = Math.max(0, Math.min(1, projection));

  const closestPoint = {
    x: start.x + projection * segmentX,
    y: start.y + projection * segmentY
  };

  return distanceBetween(point, closestPoint);
}

function getClosestConnectionIdFromEvent(event) {
  const point = getMapPointFromEvent(event);

  let closestConnectionId = null;
  let closestDistance = Infinity;

  connections.forEach((connection) => {
    const company = getCompany(connection.companyId);
    const supplier = getSupplier(connection.supplierId);

    const distance = distancePointToSegment(point, company, supplier);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestConnectionId = connection.id;
    }
  });

  const selectionThreshold = 3.5;

  if (closestDistance <= selectionThreshold) {
    return closestConnectionId;
  }

  return null;
}

function handleMapClick(event) {
  if (!gameRunning || gameEnded) {
    return;
  }

  if (event.target.closest && event.target.closest(".supplier")) {
    return;
  }

  const closestConnectionId = getClosestConnectionIdFromEvent(event);

  if (closestConnectionId) {
    selectConnection(closestConnectionId);
  }
}

function handleMapMouseMove(event) {
  if (!gameRunning || gameEnded) {
    return;
  }

  if (event.target.closest && event.target.closest(".supplier")) {
    if (hoveredConnectionId !== null) {
      hoveredConnectionId = null;
      worldMap.classList.remove("line-hover");
      renderConnections();
    }

    return;
  }

  const closestConnectionId = getClosestConnectionIdFromEvent(event);

  if (closestConnectionId !== hoveredConnectionId) {
    hoveredConnectionId = closestConnectionId;

    if (hoveredConnectionId) {
      worldMap.classList.add("line-hover");
    } else {
      worldMap.classList.remove("line-hover");
    }

    renderConnections();
  }
}

function handleMapMouseLeave() {
  if (hoveredConnectionId !== null) {
    hoveredConnectionId = null;
    worldMap.classList.remove("line-hover");
    renderConnections();
  }
}

// =========================================
// INITIALIZATION
// =========================================

function initializeRound() {
  stopTimerLoop();

  connections = [];
  selectedConnectionId = null;
  hoveredConnectionId = null;

  gameRunning = false;
  gameEnded = false;
  gameStartTime = 0;

  timerElement.textContent = GAME_DURATION_SECONDS;
  totalFlowsElement.textContent = companies.length * supplierTypes.length;

  createInitialConnections();
  renderNodes();
  renderConnections();
  updateHud();

  selectedInfoElement.textContent = "Select a flow line to reallocate it.";
}

function createInitialConnections() {
  companies.forEach((company) => {
    supplierTypes.forEach((type) => {
      const nearestSupplier = getNearestSupplier(company, type.id);
      const compatibleSuppliers = suppliers.filter((supplier) => supplier.typeId === type.id);
      const nonOptimalSuppliers = compatibleSuppliers.filter(
        (supplier) => supplier.id !== nearestSupplier.id
      );

      const shouldStartOptimized = Math.random() < 0.25;

      const initialSupplier = shouldStartOptimized
        ? nearestSupplier
        : getRandomItem(nonOptimalSuppliers);

      connections.push({
        id: `${company.id}-${type.id}`,
        companyId: company.id,
        typeId: type.id,
        supplierId: initialSupplier.id
      });
    });
  });
}

// =========================================
// RENDERING - NODES
// =========================================

function renderNodes() {
  nodesLayer.innerHTML = "";

  companies.forEach((company) => {
    const companyElement = document.createElement("div");

    companyElement.className = "company";
    companyElement.dataset.companyId = company.id;
    companyElement.textContent = company.label;
    companyElement.title = company.name;
    companyElement.style.left = `${company.x}%`;
    companyElement.style.top = `${company.y}%`;

    nodesLayer.appendChild(companyElement);
  });

  suppliers.forEach((supplier) => {
    const type = getSupplierType(supplier.typeId);
    const supplierElement = document.createElement("div");

    supplierElement.className = "supplier";
    supplierElement.dataset.supplierId = supplier.id;
    supplierElement.dataset.typeId = supplier.typeId;
    supplierElement.title = `${type.name} - ${supplier.location}`;
    supplierElement.style.left = `${supplier.x}%`;
    supplierElement.style.top = `${supplier.y}%`;
    supplierElement.style.background = type.color;

    supplierElement.addEventListener("click", (event) => {
      event.stopPropagation();
      handleSupplierClick(supplier.id);
    });

    nodesLayer.appendChild(supplierElement);
  });
}

// =========================================
// RENDERING - CONNECTIONS
// =========================================

function renderConnections() {
  connectionsSvg.innerHTML = "";

  connections.forEach((connection) => {
    const company = getCompany(connection.companyId);
    const supplier = getSupplier(connection.supplierId);
    const type = getSupplierType(connection.typeId);

    const isSelected = connection.id === selectedConnectionId;
    const isOptimal = isConnectionOptimal(connection);

    const visibleLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    visibleLine.setAttribute("x1", company.x);
    visibleLine.setAttribute("y1", company.y);
    visibleLine.setAttribute("x2", supplier.x);
    visibleLine.setAttribute("y2", supplier.y);
    visibleLine.setAttribute("stroke", type.color);
    visibleLine.dataset.connectionId = connection.id;

    let className = "flow-line";

    if (isOptimal) {
      className += " optimal";
    }

    if (connection.id === hoveredConnectionId && !isSelected) {
      className += " hovered";
    }

    if (isSelected) {
      className += " selected";
    }

    visibleLine.setAttribute("class", className);

    visibleLine.addEventListener("click", (event) => {
      event.stopPropagation();
      selectConnection(connection.id);
    });

    const hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hitLine.setAttribute("x1", company.x);
    hitLine.setAttribute("y1", company.y);
    hitLine.setAttribute("x2", supplier.x);
    hitLine.setAttribute("y2", supplier.y);
    hitLine.setAttribute("class", "flow-hit");
    hitLine.dataset.connectionId = connection.id;

    hitLine.addEventListener("click", (event) => {
      event.stopPropagation();
      selectConnection(connection.id);
    });

    connectionsSvg.appendChild(visibleLine);
    connectionsSvg.appendChild(hitLine);
  });

  updateNodeHighlights();
}

// =========================================
// SELECTION
// =========================================

function selectConnection(connectionId) {
  if (!gameRunning || gameEnded) {
    return;
  }

  selectedConnectionId = connectionId;

  const connection = getConnection(connectionId);
  const company = getCompany(connection.companyId);
  const type = getSupplierType(connection.typeId);
  const supplier = getSupplier(connection.supplierId);

  selectedInfoElement.textContent =
    `Selected: ${company.name} - ${type.name}. Current source: ${supplier.location}.`;

  renderConnections();
}

function handleSupplierClick(supplierId) {
  if (!gameRunning || gameEnded) {
    return;
  }

  if (!selectedConnectionId) {
    showToast("Select a flow line first.");
    return;
  }

  const selectedConnection = getConnection(selectedConnectionId);
  const selectedSupplier = getSupplier(supplierId);

  if (selectedSupplier.typeId !== selectedConnection.typeId) {
    showToast("Same color required.");
    return;
  }

  if (selectedSupplier.id === selectedConnection.supplierId) {
    showToast("This supplier is already connected.");
    return;
  }

  selectedConnection.supplierId = selectedSupplier.id;

  const company = getCompany(selectedConnection.companyId);
  const type = getSupplierType(selectedConnection.typeId);
  const isNowOptimal = isConnectionOptimal(selectedConnection);

  selectedInfoElement.textContent =
    `${company.name} - ${type.name} flow reallocated to ${selectedSupplier.location}.`;

  if (isNowOptimal) {
    showToast("Optimized +10");
  } else {
    showToast("Flow updated.");
  }

  selectedConnectionId = null;
  hoveredConnectionId = null;
  worldMap.classList.remove("line-hover");

  renderConnections();
  updateHud();
}

function updateNodeHighlights() {
  const companyElements = document.querySelectorAll(".company");
  const supplierElements = document.querySelectorAll(".supplier");

  companyElements.forEach((element) => {
    element.classList.remove("selected-company");
  });

  supplierElements.forEach((element) => {
    element.classList.remove("compatible", "incompatible", "current");
  });

  if (!selectedConnectionId) {
    return;
  }

  const selectedConnection = getConnection(selectedConnectionId);

  const selectedCompanyElement = document.querySelector(
    `.company[data-company-id="${selectedConnection.companyId}"]`
  );

  if (selectedCompanyElement) {
    selectedCompanyElement.classList.add("selected-company");
  }

  supplierElements.forEach((element) => {
    const supplierId = element.dataset.supplierId;
    const supplier = getSupplier(supplierId);

    if (supplier.typeId === selectedConnection.typeId) {
      element.classList.add("compatible");
    } else {
      element.classList.add("incompatible");
    }

    if (supplier.id === selectedConnection.supplierId) {
      element.classList.add("current");
    }
  });
}

// =========================================
// HUD
// =========================================

function updateHud() {
  const optimizedFlowCount = getOptimizedFlowCount();
  const currentScore = getCurrentScore();
  const maximumScore = getMaximumScore();

  optimizedCountElement.textContent = optimizedFlowCount;
  scoreElement.textContent = `${currentScore} / ${maximumScore}`;
}

// =========================================
// TIMER
// =========================================

function startTimerLoop() {
  gameStartTime = performance.now();
  animationId = requestAnimationFrame(updateTimerLoop);
}

function updateTimerLoop(timestamp) {
  if (!gameRunning || gameEnded) {
    return;
  }

  const elapsedSeconds = (timestamp - gameStartTime) / 1000;
  const remainingSeconds = Math.max(0, GAME_DURATION_SECONDS - elapsedSeconds);

  timerElement.textContent = Math.ceil(remainingSeconds);

  if (remainingSeconds <= 0) {
    endGame();
    return;
  }

  animationId = requestAnimationFrame(updateTimerLoop);
}

function stopTimerLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// =========================================
// GAME FLOW
// =========================================

function showTutorial() {
  initializeRound();

  startScreen.classList.add("hidden");
  tutorialScreen.classList.remove("hidden");
  endScreen.classList.add("hidden");
}

function startOptimization() {
  tutorialScreen.classList.add("hidden");

  gameRunning = true;
  gameEnded = false;

  selectedInfoElement.textContent =
    "Click a flow line, then click a closer supplier of the same color.";

  startTimerLoop();
}

function endGame() {
  if (gameEnded) {
    return;
  }

  gameEnded = true;
  gameRunning = false;

  stopTimerLoop();

  selectedConnectionId = null;
  hoveredConnectionId = null;
  worldMap.classList.remove("line-hover");

  renderConnections();
  updateHud();

  const optimizedFlowCount = getOptimizedFlowCount();
  const totalFlows = companies.length * supplierTypes.length;
  const finalScore = getCurrentScore();
  const maximumScore = getMaximumScore();

  endTitleElement.textContent = "Well done!";
  endResultElement.textContent =
    `${optimizedFlowCount} out of ${totalFlows} sourcing flows are optimized.`;
  endScoreElement.textContent =
    `Final score: ${finalScore} / ${maximumScore}`;
  endMessageElement.textContent = getEndMessage(optimizedFlowCount);

  endScreen.classList.remove("hidden");
}

function getEndMessage(optimizedFlowCount) {
  if (optimizedFlowCount >= 27) {
    return "Excellent Local Loop.";
  }

  if (optimizedFlowCount >= 22) {
    return "Strong sourcing optimization.";
  }

  if (optimizedFlowCount >= 15) {
    return "Good progress.";
  }

  return "Keep optimizing.";
}

function resetToStartScreen() {
  stopTimerLoop();

  gameRunning = false;
  gameEnded = false;
  selectedConnectionId = null;
  hoveredConnectionId = null;
  worldMap.classList.remove("line-hover");

  startScreen.classList.remove("hidden");
  tutorialScreen.classList.add("hidden");
  endScreen.classList.add("hidden");

  initializeRound();
}

// =========================================
// EVENTS
// =========================================

worldMap.addEventListener("click", handleMapClick);
worldMap.addEventListener("mousemove", handleMapMouseMove);
worldMap.addEventListener("mouseleave", handleMapMouseLeave);

startButton.addEventListener("click", showTutorial);

startOptimizationButton.addEventListener("click", startOptimization);

playAgainButton.addEventListener("click", resetToStartScreen);

document.addEventListener("selectstart", (event) => {
  if (gameRunning) {
    event.preventDefault();
  }
});

// =========================================
// START
// =========================================

window.addEventListener("load", () => {
  initializeRound();
});
