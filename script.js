"use strict";

/* =========================================
   Violet Random · 전체 JavaScript
   기존 HTML ID와 보라색 UI 유지
========================================= */

const DIGITS = 7;
const MAX_NUMBER = 9999999;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";
const PROGRESS_KEY = "violetRandomProgress";
const FEATURE_PASSWORD = "0708";

const $ = id => document.getElementById(id);

const DEFAULT_SETTINGS = {
  particles: 65,
  speed: 2,
  effect: 2,
  rareEffects: true,
  theme: "dark"
};

const RARITY_ORDER = [
  "ultimate",
  "reverse-special",
  "special",
  "jackpot",
  "eclipse",
  "legendary",
  "mythic",
  "celestial",
  "infinity",
  "paradox",
  "quantum",
  "nebula",
  "nova",
  "astral",
  "zenith",
  "ethereal",
  "genesis",
  "seraph",
  "aurora",
  "phantom",
  "glorious",
  "rare",
  "uncommon",
  "common"
];

const RARITY_NAMES = {
  ultimate: "Ultimate",
  "reverse-special": "Reverse Special",
  special: "Special",
  jackpot: "Jackpot",
  eclipse: "Eclipse",
  legendary: "Legendary",
  mythic: "Mythic",
  celestial: "Celestial",
  infinity: "Infinity",
  paradox: "Paradox",
  quantum: "Quantum",
  nebula: "Nebula",
  nova: "Nova",
  astral: "Astral",
  zenith: "Zenith",
  ethereal: "Ethereal",
  genesis: "Genesis",
  seraph: "Seraph",
  aurora: "Aurora",
  phantom: "Phantom",
  glorious: "Glorious",
  rare: "Rare",
  uncommon: "Uncommon",
  common: "Common"
};

const RARITY_DETAILS = {
  ultimate: "숫자 0",
  "reverse-special": "7654321",
  special: "지정된 특별 숫자",
  jackpot: "7 반복 숫자",
  eclipse: "7자리 동일 숫자",
  legendary: "한 자리 숫자 또는 7회 반복",
  mythic: "7자리 좌우 대칭",
  celestial: "원주율 패턴",
  infinity: "자연상수 e 패턴",
  paradox: "황금비 패턴",
  quantum: "홀수 계열 패턴",
  nebula: "교차 숫자 패턴",
  nova: "간격 숫자 패턴",
  astral: "하강 숫자 패턴",
  zenith: "고유 숫자 배열",
  ethereal: "고유 숫자 조합",
  genesis: "고유 숫자 배열",
  seraph: "무중복·숫자 합 패턴",
  aurora: "연속 숫자 패턴",
  phantom: "교차 반복 패턴",
  glorious: "2자리 또는 강한 반복",
  rare: "반복 패턴 또는 3~5자리",
  uncommon: "6자리 숫자",
  common: "일반 숫자"
};

const $all = selector => Array.from(document.querySelectorAll(selector));

const numberElement = $("number");
const numberBox = $("number-box");
const digitElements = Array.from(numberElement.querySelectorAll("span"));
const rareLabel = $("rare-label");
const digitCountLabel = $("digit-count-label");
const primeStatus = $("prime-status");
const divisorStatus = $("divisor-status");
const statusElement = $("status");
const effectsLayer = $("effects");

const drawButton = $("draw-button");
const instantButton = $("instant-button");
const autoButton = $("auto-button");
const turboButton = $("turbo-button");

const historyList = $("history-list");
const rareHistoryList = $("rare-history-list");
const averageElement = $("average");
const averageStatus = $("average-status");
const maxNumberElement = $("max-number");
const minNumberElement = $("min-number");
const totalDrawsElement = $("total-draws");

const settingsButton = $("settings-button");
const settingsOverlay = $("settings-overlay");
const closeSettingsButton = $("close-settings");
const saveSettingsButton = $("save-settings");
const resetSettingsButton = $("reset-settings");
const settingsMessage = $("settings-message");

const particleSetting = $("particle-setting");
const speedSetting = $("speed-setting");
const effectSetting = $("effect-setting");
const rareSetting = $("rare-setting");
const particleValue = $("particle-value");
const speedValue = $("speed-value");
const effectValue = $("effect-value");
const themeSetting = $("theme-setting");
const themeValue = $("theme-value");

const cheatButton = $("cheat-button");
const cheatOverlay = $("cheat-overlay");
const closeCheatButton = $("close-cheat");
const cheatNumberInput = $("cheat-number-input");
const applyCheatButton = $("apply-cheat");
const clearCheatButton = $("clear-cheat");
const cheatMessage = $("cheat-message");

const rarityButton = $("rarity-button");
const rarityOverlay = $("rarity-overlay");
const closeRarityButton = $("close-rarity");

const statisticsButton = $("statistics-button");
const statisticsOverlay = $("statistics-overlay");
const closeStatisticsButton = $("close-statistics");

const replayButton = $("replay-button");
const replayOverlay = $("replay-overlay");
const closeReplayButton = $("close-replay");
const replayMessage = $("replay-message");

const autoOverlay = $("auto-overlay");
const closeAutoButton = $("close-auto");
const cancelAutoButton = $("cancel-auto");
const startAutoButton = $("start-auto");
const autoDurationInput = $("auto-duration");
const autoCountInput = $("auto-count");
const autoDurationSetting = $("auto-duration-setting");
const autoCountSetting = $("auto-count-setting");
const autoMessage = $("auto-message");

const passwordOverlay = $("password-overlay");
const passwordInput = $("password-input");
const passwordMessage = $("password-message");
const submitPasswordButton = $("submit-password");
const closePasswordButton = $("close-password");
const cancelPasswordButton = $("cancel-password");

const turboOverlay = $("turbo-overlay");
const closeTurboButton = $("close-turbo");
const cancelTurboButton = $("cancel-turbo");
const startTurboButton = $("start-turbo");
const turboCountInput = $("turbo-count");
const turboMessage = $("turbo-message");

const autoSummaryOverlay = $("auto-summary-overlay");
const closeAutoSummaryButton = $("close-auto-summary");
const closeSummaryDoneButton = $("close-summary-done");

const rareHistoryFilterButton = $("rare-history-filter-button");
const rareHistoryFilterOverlay = $("rare-history-filter-overlay");
const closeRareHistoryFilterButton = $("close-rare-history-filter");
const selectAllRareHistoryButton = $("select-all-rare-history");
const clearRareHistoryFilterButton = $("clear-rare-history-filter");
const cancelRareHistoryFilterButton = $("cancel-rare-history-filter");
const saveRareHistoryFilterButton = $("save-rare-history-filter");
const rareHistoryFilterMessage = $("rare-history-filter-message");

let settings = loadSettings();
let history = [];
let rareHistory = [];
let totalDraws = 0;
let highestNumber = null;
let lowestNumber = null;
let lastResult = "0000000";
let queuedCheatNumber = null;
let pendingProtectedAction = null;
let pendingEffectOverride = null;

let isDrawing = false;
let autoRunning = false;
let autoNextTimeout = null;
let autoEndsAt = 0;
let autoMode = "animated";
let autoLimitMode = "duration";
let autoTargetCount = 100;
let autoCompletedCount = 0;
let autoStopRarities = [];
let autoResults = [];
let autoRareResults = [];
let autoStopReason = "";
let lastDrawWasCheat = false;

let backgroundParticles = [];
let particleAnimationFrame = null;
let audioContext = null;

let selectedRareHistoryRarities = new Set(
  $all('input[name="rare-history-rarity"]').map(input => input.value)
);

const drawStats = {
  odd: 0,
  even: 0,
  prime: 0,
  composite: 0,
  total: 0,
  sum: 0,
  digits: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [String(i), 0])
  ),
  lastDigits: Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [String(i), 0])
  ),
  rarities: Object.fromEntries(RARITY_ORDER.map(level => [level, 0]))
};

/* =========================================
   공통 유틸리티
========================================= */

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function getRarityRank(level) {
  const index = RARITY_ORDER.indexOf(level || "common");
  return index < 0 ? RARITY_ORDER.length : index;
}

function isRareLevel(level) {
  return Boolean(level && level !== "common");
}

function makePattern(level, title = null, detail = null) {
  const name = RARITY_NAMES[level] || "Common";

  return {
    level,
    title: title || `✦ ${name.toUpperCase()} ✦`,
    detail: detail || name
  };
}

function secureRandomNumber() {
  if (window.crypto && window.crypto.getRandomValues) {
    const range = MAX_NUMBER + 1;
    const limit = Math.floor(4294967296 / range) * range;
    const array = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return String(array[0] % range).padStart(DIGITS, "0");
  }

  return String(Math.floor(Math.random() * (MAX_NUMBER + 1)))
    .padStart(DIGITS, "0");
}

function getNextResult() {
  if (queuedCheatNumber !== null) {
    const result = String(queuedCheatNumber).padStart(DIGITS, "0");
    queuedCheatNumber = null;
    lastDrawWasCheat = true;
    return result;
  }

  lastDrawWasCheat = false;
  return secureRandomNumber();
}

function isPrime(value) {
  const number = Number(value);

  if (number < 2) return false;
  if (number === 2) return true;
  if (number % 2 === 0) return false;

  for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
    if (number % divisor === 0) return false;
  }

  return true;
}

function getDivisors(value) {
  const number = Number(value);
  if (number <= 0) return [];

  const divisors = [];

  for (let i = 1; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      divisors.push(i);

      if (i !== number / i) {
        divisors.push(number / i);
      }
    }
  }

  return divisors.sort((a, b) => a - b);
}

function getDigitCountLabel(value) {
  const normalized = String(Number(value));
  const length = normalized === "0" ? 0 : normalized.length;

  return length === 0
    ? "0 · 숫자 0"
    : `${length}자리 숫자`;
}

/* =========================================
   희귀 패턴 판별
   조건이 겹치면 먼저 검사한 등급이 적용됨
========================================= */

function getRarePattern(value) {
  const normalized = String(Number(value));
  const digits = normalized.split("");
  const length = normalized === "0" ? 0 : normalized.length;

  if (normalized === "0") {
    return makePattern("ultimate", "✦ ULTIMATE ✦", "Ultimate");
  }

  if (normalized === "7654321") {
    return makePattern(
      "reverse-special",
      "✧ REVERSE SPECIAL ✧",
      "Reverse Special"
    );
  }

  if (normalized === "708" || normalized === "1234567") {
    return makePattern("special", "✧ SPECIAL ✧", "Special");
  }

  if (["777", "7777", "77777", "777777", "7777777"].includes(normalized)) {
    return makePattern("jackpot", "✦ JACKPOT ✦", "Jackpot");
  }

  if (length === 7 && /^(\d)\1{6}$/.test(normalized)) {
    return makePattern(
      "eclipse",
      "✦ ECLIPSE · 동일 숫자 ✦",
      "Eclipse"
    );
  }

  if (length === 1) {
    return makePattern("legendary", "✦ LEGENDARY ✦", "Legendary");
  }

  if (length === 7 && normalized === normalized.split("").reverse().join("")) {
    return makePattern(
      "mythic",
      "✧ MYTHIC · 좌우 대칭 ✧",
      "Mythic"
    );
  }

  const exactPatterns = {
    "3141592": "celestial",
    "2718281": "infinity",
    "1618033": "paradox",
    "1357913": "quantum",
    "2468135": "nebula",
    "1029384": "nova",
    "8642097": "astral",
    "5820417": "zenith",
    "4739206": "ethereal",
    "6925174": "genesis"
  };

  if (exactPatterns[normalized]) {
    const level = exactPatterns[normalized];
    return makePattern(
      level,
      `✦ ${level.toUpperCase()} ✦`,
      RARITY_NAMES[level]
    );
  }

  // Aurora: 일곱 자리 연속 증가 또는 감소.
  if (
    length === 7 &&
    ["0123456", "1234567", "2345678", "3456789",
      "9876543", "8765432", "7654321", "6543210"].includes(normalized)
  ) {
    return makePattern("aurora", "✧ AURORA · 연속 숫자 ✧", "Aurora");
  }

  // Phantom: ABABABA 형태.
  if (
    length === 7 &&
    digits[0] === digits[2] &&
    digits[2] === digits[4] &&
    digits[4] === digits[6] &&
    digits[1] === digits[3] &&
    digits[3] === digits[5] &&
    digits[0] !== digits[1]
  ) {
    return makePattern("phantom", "✧ PHANTOM · 교차 반복 ✧", "Phantom");
  }

  // Seraph: 숫자가 모두 다르고, 합이 35 또는 42.
  if (
    length === 7 &&
    new Set(digits).size === 7 &&
    [35, 42].includes(
      digits.reduce((sum, digit) => sum + Number(digit), 0)
    )
  ) {
    return makePattern("seraph", "✦ SERAPH · 완전 무중복 ✦", "Seraph");
  }

  let longestRun = 1;
  let currentRun = 1;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] === digits[i - 1]) {
      currentRun++;
      longestRun = Math.max(longestRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  if (longestRun >= 7) {
    return makePattern("legendary", "✦ LEGENDARY · 7연속 반복 ✦");
  }

  if (longestRun === 6) {
    return makePattern("glorious", "✦ GLORIOUS · 6연속 반복 ✦");
  }

  if (longestRun >= 3 && longestRun <= 5) {
    return makePattern("rare", "✧ RARE · 연속 반복 ✧");
  }

  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 3 <= normalized.length; start++) {
      const block = normalized.slice(start, start + size);

      if (
        normalized.slice(start + size, start + size * 2) === block &&
        normalized.slice(start + size * 2, start + size * 3) === block
      ) {
        return makePattern(
          "glorious",
          "✦ GLORIOUS · 숫자 집합 3회 반복 ✦"
        );
      }
    }
  }

  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 2 <= normalized.length; start++) {
      const block = normalized.slice(start, start + size);

      if (normalized.slice(start + size, start + size * 2) === block) {
        return makePattern("rare", "✧ RARE · 숫자 집합 반복 ✧");
      }
    }
  }

  if (length === 2) {
    return makePattern("glorious", "✦ GLORIOUS · 2자리 숫자 ✦");
  }

  if (length >= 3 && length <= 5) {
    return makePattern("rare", "✧ RARE · 짧은 숫자 ✧");
  }

  if (length === 6) {
    return makePattern("uncommon", "✧ UNCOMMON ✧");
  }

  return null;
}

function getLevelForStats(value) {
  return getRarePattern(value)?.level || "common";
}

/* =========================================
   Web Audio · 효과음
========================================= */

function getAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  if (!audioContext) audioContext = new AudioCtor();

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone(
  frequency,
  duration = 0.12,
  type = "sine",
  volume = 0.045,
  delay = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.min(0.32, Math.max(0.0002, volume * 2.8)),
    start + 0.012
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playUiClick() {
  playTone(620, 0.055, "triangle", 0.04);
  playTone(840, 0.045, "sine", 0.025, 0.025);
}

function playRaritySound(level) {
  const sounds = {
    common: [[420, 0.07, "sine"]],
    uncommon: [[520, 0.09, "triangle"]],
    rare: [[580, 0.09, "triangle"], [760, 0.12, "sine", 0.025, 0.055]],
    glorious: [[490, 0.13, "sine"], [660, 0.13, "sine", 0.035, 0.08], [880, 0.18, "triangle", 0.03, 0.16]],
    legendary: [[660, 0.13, "triangle"], [880, 0.16, "sine", 0.04, 0.08], [1175, 0.23, "triangle", 0.035, 0.17]],
    mythic: [[440, 0.18, "sine"], [587, 0.2, "triangle", 0.035, 0.09], [784, 0.24, "sine", 0.03, 0.2]],
    ultimate: [[392, 0.25, "sawtooth"], [587, 0.3, "triangle", 0.05, 0.12], [784, 0.38, "sine", 0.06, 0.25], [1175, 0.5, "triangle", 0.05, 0.42]],
    "reverse-special": [[220, 0.22, "sawtooth"], [330, 0.2, "square", 0.035, 0.09], [196, 0.32, "sawtooth", 0.04, 0.2]],
    special: [[260, 0.15, "triangle"], [520, 0.18, "sawtooth", 0.04, 0.07], [780, 0.24, "triangle", 0.035, 0.17]],
    jackpot: [[660, 0.1, "square"], [880, 0.12, "triangle", 0.04, 0.07], [1320, 0.2, "sine", 0.05, 0.15]],
    eclipse: [[110, 0.25, "sawtooth"], [165, 0.32, "triangle", 0.04, 0.12], [220, 0.4, "sine", 0.04, 0.25]],
    celestial: [[523, 0.13, "sine"], [784, 0.18, "triangle", 0.04, 0.06], [1047, 0.24, "sine", 0.04, 0.14]],
    infinity: [[392, 0.14, "sine"], [587, 0.18, "sine", 0.04, 0.07], [880, 0.22, "triangle", 0.04, 0.14], [1175, 0.25, "sine", 0.035, 0.22]],
    paradox: [[330, 0.16, "triangle"], [494, 0.13, "sawtooth", 0.035, 0.06], [370, 0.2, "triangle", 0.04, 0.13]],
    quantum: [[880, 0.06, "square"], [440, 0.07, "square", 0.04, 0.07], [990, 0.08, "square", 0.04, 0.14], [550, 0.1, "square", 0.04, 0.21]],
    nebula: [[262, 0.18, "sine"], [392, 0.24, "sine", 0.04, 0.09], [311, 0.28, "triangle", 0.04, 0.2]],
    nova: [[1047, 0.06, "sawtooth"], [1568, 0.09, "triangle", 0.05, 0.06], [2093, 0.15, "sine", 0.05, 0.13]],
    astral: [[349, 0.16, "sine"], [440, 0.16, "triangle", 0.04, 0.06], [659, 0.22, "sine", 0.04, 0.12], [880, 0.28, "triangle", 0.04, 0.2]],
    zenith: [[294, 0.14, "triangle"], [587, 0.18, "triangle", 0.045, 0.07], [1175, 0.25, "sine", 0.05, 0.14]],
    ethereal: [[740, 0.22, "sine"], [831, 0.25, "sine", 0.04, 0.08], [988, 0.3, "triangle", 0.04, 0.18]],
    genesis: [[196, 0.18, "sine"], [392, 0.2, "triangle", 0.04, 0.08], [784, 0.28, "sine", 0.05, 0.17]],
    seraph: [[784, 0.16, "sine"], [988, 0.2, "triangle", 0.04, 0.08], [1175, 0.25, "sine", 0.035, 0.17], [1568, 0.32, "triangle", 0.03, 0.29]],
    aurora: [[523, 0.18, "sine"], [659, 0.2, "sine", 0.035, 0.09], [784, 0.23, "triangle", 0.03, 0.18], [1047, 0.28, "sine", 0.025, 0.29]],
    phantom: [[330, 0.2, "sine"], [494, 0.22, "triangle", 0.03, 0.1], [370, 0.25, "sine", 0.025, 0.22]]
  };

  (sounds[level] || sounds.common).forEach(note => {
    playTone(note[0], note[1], note[2], note[3] ?? 0.045, note[4] ?? 0);
  });
}

/* =========================================
   배경 파티클
========================================= */

function resizeParticleCanvas() {
  const canvas = $("particles");
  if (!canvas) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createBackgroundParticles() {
  const count = Number(settings.particles);
  backgroundParticles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 0.5 + Math.random() * 2.2,
    speed: 0.15 + Math.random() * 0.45,
    drift: (Math.random() - 0.5) * 0.45,
    alpha: 0.15 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2
  }));
}

function animateParticles() {
  const canvas = $("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  backgroundParticles.forEach(particle => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    particle.phase += 0.018;

    if (particle.y < -5) {
      particle.y = window.innerHeight + 5;
      particle.x = Math.random() * window.innerWidth;
    }

    if (particle.x < -5) particle.x = window.innerWidth + 5;
    if (particle.x > window.innerWidth + 5) particle.x = -5;

    const alpha = particle.alpha * (0.75 + Math.sin(particle.phase) * 0.25);

    ctx.beginPath();
    ctx.fillStyle = `rgba(177, 120, 255, ${alpha})`;
    ctx.shadowColor = "rgba(151, 83, 255, 0.5)";
    ctx.shadowBlur = particle.size * 4;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  particleAnimationFrame = requestAnimationFrame(animateParticles);
}

/* =========================================
   임팩트 효과
========================================= */

function clearNumberEffects() {
  numberBox.classList.remove(
    "impact", "finished", "rare",
    ...RARITY_ORDER.filter(level => level !== "common").map(level => `rare-${level}`),
    ...RARITY_ORDER.filter(level => level !== "common").map(level => `rarity-${level}-impact`),
    "magnitude-1", "magnitude-2", "magnitude-3",
    "magnitude-4", "magnitude-5", "magnitude-6"
  );

  rareLabel.textContent = "";
  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
    digit.style.display = "inline-block";
  });
}

function setDisplayedNumber(value, hideLeadingZeros = false) {
  digitElements.forEach((digit, index) => {
    digit.textContent = value[index];

    const isLeadingZero =
      hideLeadingZeros &&
      index < DIGITS - 1 &&
      value.slice(0, index + 1).split("").every(char => char === "0");

    digit.style.display = isLeadingZero ? "none" : "inline-block";
    digit.classList.remove("rolling");
  });
}

function createEffectFlash(level) {
  const flash = document.createElement("div");
  flash.className = `rare-flash ${level}`;
  effectsLayer.appendChild(flash);

  window.setTimeout(() => flash.remove(), 1500);
}

function createCoinBurst(x, y) {
  for (let i = 0; i < 18; i++) {
    const coin = document.createElement("span");
    coin.className = "effect-coin";
    coin.textContent = ["✦", "✧", "●", "◆"][i % 4];
    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
    coin.style.setProperty("--dx", `${(Math.random() - 0.5) * 280}px`);
    coin.style.setProperty("--dy", `${(Math.random() - 0.8) * 260}px`);
    effectsLayer.appendChild(coin);
    window.setTimeout(() => coin.remove(), 1300);
  }
}

function createParticleBurst(amount = 24) {
  const rect = numberBox.getBoundingClientRect();

  for (let i = 0; i < amount; i++) {
    const particle = document.createElement("span");
    particle.className = "effect-particle";
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 320}px`);
    particle.style.setProperty("--dy", `${(Math.random() - 0.5) * 260}px`);
    particle.style.setProperty("--size", `${2 + Math.random() * 5}px`);
    effectsLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 1200);
  }
}

function triggerResultImpact(pattern, result) {
  clearNumberEffects();

  const normalized = String(Number(result));
  const visibleDigits = normalized === "0" ? 0 : normalized.length;
  const rareActive = Boolean(pattern && settings.rareEffects);

  numberElement.classList.add("finished");

  if (visibleDigits >= 1 && visibleDigits <= 6 && settings.effect > 0) {
    numberBox.classList.add(`magnitude-${visibleDigits}`);
  }

  if (settings.effect > 0) {
    numberBox.classList.add("impact");
  }

  if (rareActive) {
    numberBox.classList.add(`rare-${pattern.level}`);
    numberBox.classList.add(`rarity-${pattern.level}-impact`);
    rareLabel.textContent = pattern.title;

    const scale = {
      uncommon: 1.15,
      rare: 1.3,
      glorious: 1.65,
      legendary: 2,
      mythic: 2.6,
      ultimate: 3.2,
      "reverse-special": 2.4,
      special: 2.1,
      jackpot: 2.8,
      eclipse: 3.2,
      celestial: 2.3,
      infinity: 2.45,
      paradox: 2.4,
      quantum: 2.1,
      nebula: 2.2,
      nova: 2.8,
      astral: 2.35,
      zenith: 2.5,
      ethereal: 2.4,
      genesis: 2.6,
      seraph: 3.1,
      aurora: 2.7,
      phantom: 2.45
    }[pattern.level] || 1.3;

    if (settings.effect >= 1) createParticleBurst(Math.round(12 * scale));

    if (settings.effect >= 2) {
      createEffectFlash(pattern.level);
    }

    if (pattern.level === "jackpot") {
      const rect = numberBox.getBoundingClientRect();
      createCoinBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    if (settings.effect >= 3 && scale >= 2.4) {
      document.body.classList.add("ultimate-flash");
      window.setTimeout(() => document.body.classList.remove("ultimate-flash"), 800);
    }

    playRaritySound(pattern.level);
  } else if (settings.effect > 0) {
    createParticleBurst(visibleDigits < 4 ? 22 : 8);
  }
}

function triggerButtonImpact(button) {
  if (!button) return;

  button.classList.remove("button-impact");
  void button.offsetWidth;
  button.classList.add("button-impact");

  window.setTimeout(() => button.classList.remove("button-impact"), 400);
}

/* =========================================
   설정 저장 및 복원
========================================= */

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const saved = JSON.parse(raw);

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      particles: Math.max(0, Math.min(150, Number(saved.particles ?? 65))),
      speed: Math.max(1, Math.min(5, Number(saved.speed ?? 2))),
      effect: Math.max(0, Math.min(3, Number(saved.effect ?? 2))),
      rareEffects: saved.rareEffects !== false,
      theme: saved.theme === "light" ? "light" : "dark"
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettingsToStorage() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("설정을 저장하지 못했어.", error);
  }
}

function populateSettingsControls() {
  particleSetting.value = settings.particles;
  speedSetting.value = settings.speed;
  effectSetting.value = settings.effect;
  rareSetting.checked = settings.rareEffects;
  themeSetting.value = settings.theme;
  updateSettingsLabels();
}

function updateSettingsLabels() {
  particleValue.textContent = particleSetting.value;

  const speedNames = {
    1: "아주 느리게",
    2: "느리게",
    3: "보통",
    4: "빠르게",
    5: "아주 빠르게"
  };

  const effectNames = {
    0: "없음",
    1: "약하게",
    2: "보통",
    3: "강하게"
  };

  speedValue.textContent = speedNames[speedSetting.value] || "보통";
  effectValue.textContent = effectNames[effectSetting.value] || "보통";
  themeValue.textContent = themeSetting.value === "light" ? "라이트 모드" : "다크 모드";
}

function applySettings() {
  document.body.classList.toggle("light-mode", settings.theme === "light");

  particleSetting.value = settings.particles;
  speedSetting.value = settings.speed;
  effectSetting.value = settings.effect;
  rareSetting.checked = settings.rareEffects;
  themeSetting.value = settings.theme;

  updateSettingsLabels();
  resizeParticleCanvas();
  createBackgroundParticles();
}

function openOverlay(overlay, opener, closeButton) {
  if (!overlay) return;
  overlay.hidden = false;

  if (opener) opener.setAttribute("aria-expanded", "true");
  if (closeButton) closeButton.focus();
}

function closeOverlay(overlay, opener) {
  if (!overlay) return;
  overlay.hidden = true;

  if (opener) {
    opener.setAttribute("aria-expanded", "false");
    opener.focus();
  }
}

settingsButton.addEventListener("click", () => {
  playUiClick();
  openOverlay(settingsOverlay, settingsButton, closeSettingsButton);
});

closeSettingsButton.addEventListener("click", () => closeOverlay(settingsOverlay, settingsButton));

settingsOverlay.addEventListener("click", event => {
  if (event.target === settingsOverlay) closeOverlay(settingsOverlay, settingsButton);
});

[particleSetting, speedSetting, effectSetting, themeSetting, rareSetting].forEach(control => {
  control.addEventListener("input", updateSettingsLabels);
  control.addEventListener("change", updateSettingsLabels);
});

saveSettingsButton.addEventListener("click", () => {
  settings = {
    particles: Number(particleSetting.value),
    speed: Number(speedSetting.value),
    effect: Number(effectSetting.value),
    rareEffects: rareSetting.checked,
    theme: themeSetting.value
  };

  saveSettingsToStorage();
  applySettings();
  settingsMessage.textContent = "설정을 저장했어!";
  playUiClick();
});

resetSettingsButton.addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  populateSettingsControls();
  applySettings();
  settingsMessage.textContent = "기본 설정으로 돌아왔어.";
  playUiClick();
});

/* =========================================
   추첨 기록 및 통계
========================================= */

function trackDrawStatistics(result) {
  const value = Number(result);
  const normalized = String(value);
  const level = getLevelForStats(normalized);

  drawStats.total++;
  drawStats.sum += value;

  if (value % 2 === 0) drawStats.even++;
  else drawStats.odd++;

  if (isPrime(value)) drawStats.prime++;
  else if (value > 1) drawStats.composite++;

  drawStats.digits[String(normalized.length === 1 && value === 0 ? 0 : normalized.length)]++;
  drawStats.lastDigits[normalized.slice(-1)]++;
  drawStats.rarities[level] = (drawStats.rarities[level] || 0) + 1;
}

function addToHistory(result, options = {}) {
  const value = Number(result);
  const pattern = getRarePattern(String(value));

  history.unshift(value);
  history = history.slice(0, HISTORY_LIMIT);

  if (pattern && isRareLevel(pattern.level)) {
    rareHistory.unshift({ value, pattern });
    rareHistory = rareHistory.slice(0, HISTORY_LIMIT);

    if (autoRunning) autoRareResults.push({ value, pattern });

    renderRareHistory();
  }

  totalDraws++;

  if (highestNumber === null || value > highestNumber) highestNumber = value;
  if (lowestNumber === null || value < lowestNumber) lowestNumber = value;

  trackDrawStatistics(String(value));

  if (options.render !== false) {
    renderHistory();
    updateAverage();
    updateStatistics();
  }

  if (options.persist !== false) saveProgress();
}

function renderHistory() {
  historyList.replaceChildren();

  if (!history.length) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "아직 추첨 기록이 없어!";
    historyList.appendChild(empty);
    return;
  }

  history.forEach((value, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    rank.className = "history-index";
    rank.textContent = `#${index + 1}`;

    const number = document.createElement("span");
    number.className = "history-number";
    number.textContent = formatNumber(value);

    const pattern = getRarePattern(String(value));

    if (pattern && isRareLevel(pattern.level)) {
      item.classList.add("rare-history-item", `rare-history-${pattern.level}`);

      const mark = document.createElement("span");
      mark.className = "history-rare-mark";
      mark.textContent = pattern.detail.toUpperCase();

      number.title = pattern.title;
      item.append(rank, mark, number);
    } else {
      item.append(rank, number);
    }

    historyList.appendChild(item);
  });
}

function renderRareHistory() {
  rareHistoryList.replaceChildren();

  const filtered = rareHistory.filter(entry => {
    return selectedRareHistoryRarities.has(entry.pattern.level);
  });

  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "선택한 등급의 희귀 기록이 없어!";
    rareHistoryList.appendChild(empty);
    return;
  }

  filtered.slice(0, HISTORY_LIMIT).forEach((entry, index) => {
    const item = document.createElement("li");
    item.classList.add(
      "rare-history-item",
      `rare-history-${entry.pattern.level}`
    );

    const rank = document.createElement("span");
    rank.className = "history-index";
    rank.textContent = `#${index + 1}`;

    const mark = document.createElement("span");
    mark.className = "history-rare-mark";
    mark.textContent = entry.pattern.detail.toUpperCase();

    const number = document.createElement("span");
    number.className = "history-number";
    number.textContent = formatNumber(entry.value);
    number.title = entry.pattern.title;

    item.append(rank, mark, number);
    rareHistoryList.appendChild(item);
  });
}

function updateAverage() {
  if (history.length < HISTORY_LIMIT) {
    averageElement.textContent = "—";
    averageStatus.textContent = `${history.length}/${HISTORY_LIMIT}회 추첨 완료`;
    return;
  }

  const average = history.reduce((sum, value) => sum + value, 0) / history.length;
  averageElement.textContent = Math.round(average).toLocaleString("en-US");
  averageStatus.textContent = "최근 10회 평균";
}

function updateStatistics() {
  maxNumberElement.textContent = highestNumber === null ? "—" : formatNumber(highestNumber);
  minNumberElement.textContent = lowestNumber === null ? "—" : formatNumber(lowestNumber);
  totalDrawsElement.textContent = formatNumber(totalDraws);
}

function renderStatBar(container, entries, total) {
  if (!container) return;

  container.replaceChildren();

  entries.forEach(([label, count, extraClass]) => {
    const row = document.createElement("div");
    row.className = "statistics-bar-row";

    const title = document.createElement("span");
    title.className = "statistics-bar-label";
    title.textContent = label;

    const track = document.createElement("div");
    track.className = "statistics-bar-track";

    const fill = document.createElement("div");
    fill.className = `statistics-bar-fill ${extraClass || ""}`.trim();
    fill.style.width = `${total ? Math.max(count ? 1 : 0, count / total * 100) : 0}%`;
    track.appendChild(fill);

    const value = document.createElement("strong");
    value.className = "statistics-bar-value";
    value.textContent = `${count.toLocaleString("en-US")} (${total ? (count / total * 100).toFixed(1) : "0.0"}%)`;

    row.append(title, track, value);
    container.appendChild(row);
  });
}

function renderStatistics() {
  const setText = (id, value) => {
    const element = $(id);
    if (element) element.textContent = value;
  };

  const total = drawStats.total;
  const percent = count => `${total ? (count / total * 100).toFixed(1) : "0.0"}%`;

  setText("odd-count", formatNumber(drawStats.odd));
  setText("even-count", formatNumber(drawStats.even));
  setText("prime-count", formatNumber(drawStats.prime));
  setText("composite-count", formatNumber(drawStats.composite));

  setText("odd-ratio", percent(drawStats.odd));
  setText("even-ratio", percent(drawStats.even));
  setText("prime-ratio", percent(drawStats.prime));
  setText("composite-ratio", percent(drawStats.composite));

  setText("overall-average", total ? formatNumber(Math.round(drawStats.sum / total)) : "—");

  const lastDigitEntry = Object.entries(drawStats.lastDigits)
    .sort((a, b) => b[1] - a[1])[0];

  setText("most-common-last-digit", total ? lastDigitEntry[0] : "—");
  setText("most-common-last-digit-count", total ? `${lastDigitEntry[1]}회 등장` : "아직 기록 없음");
  setText("statistics-max", highestNumber === null ? "—" : formatNumber(highestNumber));
  setText("statistics-min", lowestNumber === null ? "—" : formatNumber(lowestNumber));
  setText("statistics-total", `누적 추첨 ${formatNumber(total)}회`);

  const digitNames = {
    0: "숫자 0",
    1: "1자리",
    2: "2자리",
    3: "3자리",
    4: "4자리",
    5: "5자리",
    6: "6자리",
    7: "7자리"
  };

  renderStatBar(
    $("digit-statistics"),
    Object.entries(drawStats.digits).map(([key, count]) => [digitNames[key], count, ""]),
    total
  );

  renderStatBar(
    $("last-digit-statistics"),
    Object.entries(drawStats.lastDigits).map(([key, count]) => [`끝자리 ${key}`, count, ""]),
    total
  );

  renderStatBar(
    $("rarity-statistics"),
    RARITY_ORDER.map(level => [
      RARITY_NAMES[level],
      drawStats.rarities[level] || 0,
      `bar-${level}`
    ]),
    total
  );
}

statisticsButton.addEventListener("click", () => {
  playUiClick();
  renderStatistics();
  openOverlay(statisticsOverlay, statisticsButton, closeStatisticsButton);
});

closeStatisticsButton.addEventListener("click", () => closeOverlay(statisticsOverlay, statisticsButton));

statisticsOverlay.addEventListener("click", event => {
  if (event.target === statisticsOverlay) closeOverlay(statisticsOverlay, statisticsButton);
});

/* =========================================
   기록 저장 및 복원
========================================= */

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      history,
      rareHistory,
      totalDraws,
      highestNumber,
      lowestNumber,
      lastResult,
      drawStats: JSON.parse(JSON.stringify(drawStats)),
      selectedRareHistoryRarities: Array.from(selectedRareHistoryRarities)
    }));
  } catch (error) {
    console.warn("추첨 기록을 저장하지 못했어.", error);
  }
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);

    history = Array.isArray(saved.history)
      ? saved.history.filter(Number.isFinite).slice(0, HISTORY_LIMIT)
      : [];

    rareHistory = Array.isArray(saved.rareHistory)
      ? saved.rareHistory.filter(entry =>
          entry &&
          Number.isFinite(entry.value) &&
          entry.pattern &&
          entry.pattern.level
        ).slice(0, HISTORY_LIMIT)
      : [];

    totalDraws = Number.isFinite(saved.totalDraws) ? saved.totalDraws : 0;
    highestNumber = Number.isFinite(saved.highestNumber) ? saved.highestNumber : null;
    lowestNumber = Number.isFinite(saved.lowestNumber) ? saved.lowestNumber : null;

    if (typeof saved.lastResult === "string" && /^\d{7}$/.test(saved.lastResult)) {
      lastResult = saved.lastResult;
    }

    if (saved.drawStats) {
      ["odd", "even", "prime", "composite", "total", "sum"].forEach(key => {
        if (Number.isFinite(saved.drawStats[key])) drawStats[key] = saved.drawStats[key];
      });

      ["digits", "lastDigits", "rarities"].forEach(group => {
        if (!saved.drawStats[group]) return;

        Object.keys(drawStats[group]).forEach(key => {
          const value = saved.drawStats[group][key];
          if (Number.isFinite(value)) drawStats[group][key] = value;
        });
      });
    }

    if (Array.isArray(saved.selectedRareHistoryRarities)) {
      selectedRareHistoryRarities = new Set(saved.selectedRareHistoryRarities);
      $all('input[name="rare-history-rarity"]').forEach(input => {
        input.checked = selectedRareHistoryRarities.has(input.value);
      });
    }
  } catch (error) {
    console.warn("Violet Random 기록 복원 실패:", error);
  }
}

/* =========================================
   결과 정보 표시
========================================= */

function updateNumberInfo(result) {
  const value = Number(result);
  const prime = isPrime(value);

  primeStatus.textContent = value < 2
    ? "소수가 아니야"
    : prime
      ? "✦ 소수 (Prime Number)"
      : "합성수 또는 소수가 아님";

  if (value === 0) {
    divisorStatus.textContent = "0의 약수는 일반적인 방식으로 정의하지 않아.";
    return;
  }

  const divisors = getDivisors(value);
  const divisorText = divisors.length <= 12
    ? divisors.join(", ")
    : `${divisors.slice(0, 8).join(", ")} … ${divisors.slice(-3).join(", ")}`;

  divisorStatus.textContent = `약수 ${divisors.length}개 · ${divisorText}`;
}

/* =========================================
   일반 추첨 및 즉각 추첨
========================================= */

function setButtonsDisabled(disabled) {
  drawButton.disabled = disabled;
  instantButton.disabled = disabled;
  turboButton.disabled = disabled && !autoRunning;
}

function takeEffectPattern(actualPattern) {
  if (!pendingEffectOverride) return actualPattern;

  const selected = pendingEffectOverride;
  pendingEffectOverride = null;

  $all("[data-preview-rarity]").forEach(button => button.classList.remove("selected"));
  return selected;
}

function finishDraw(result) {
  const value = Number(result);
  const pattern = getRarePattern(result);

  lastResult = result;
  setDisplayedNumber(result, true);
  digitCountLabel.textContent = getDigitCountLabel(result);

  addToHistory(result);
  updateNumberInfo(result);

  const effectPattern = takeEffectPattern(pattern);
  const previousRareEffects = settings.rareEffects;

  if (effectPattern && effectPattern !== pattern) {
    settings.rareEffects = true;
  }

  triggerResultImpact(effectPattern, result);
  settings.rareEffects = previousRareEffects;

  if (effectPattern && effectPattern !== pattern) {
    statusElement.textContent = `선택한 ${effectPattern.detail} 연출 적용 · ${formatNumber(value)}`;
  } else if (lastDrawWasCheat) {
    statusElement.textContent = `치트 추첨 완료 · ${formatNumber(value)}`;
  } else if (pattern && settings.rareEffects) {
    statusElement.textContent = `특별한 패턴 발견! · ${formatNumber(value)}`;
  } else {
    statusElement.textContent = `추첨 완료 · ${formatNumber(value)}`;
  }

  isDrawing = false;
  setButtonsDisabled(false);

  if (autoRunning) {
    autoCompletedCount++;
    autoResults.push(value);

    if (pattern && isRareLevel(pattern.level)) {
      autoRareResults.push({ value, pattern });
    }

    handleAutoAfterDraw(pattern);
  }

  saveProgress();
}

function drawInstantly() {
  if (isDrawing || autoRunning) return;

  isDrawing = true;
  setButtonsDisabled(true);
  clearNumberEffects();
  triggerButtonImpact(instantButton);

  const result = getNextResult();
  finishDraw(result);
}

function drawWithAnimation() {
  if (isDrawing || autoRunning) return;

  isDrawing = true;
  setButtonsDisabled(true);
  clearNumberEffects();
  triggerButtonImpact(drawButton);
  statusElement.textContent = "숫자를 추첨하는 중...";

  digitElements.forEach(digit => {
    digit.style.display = "inline-block";
    digit.classList.add("rolling");
  });

  const result = getNextResult();

  const timings = {
    1: { start: 1900, interval: 850, spin: 100 },
    2: { start: 1500, interval: 650, spin: 85 },
    3: { start: 1200, interval: 500, spin: 70 },
    4: { start: 900, interval: 380, spin: 60 },
    5: { start: 650, interval: 300, spin: 50 }
  };

  const timing = timings[settings.speed] || timings[2];
  const intervals = [];

  digitElements.forEach((digit, index) => {
    const intervalId = window.setInterval(() => {
      digit.textContent = String(Math.floor(Math.random() * 10));
    }, timing.spin);

    intervals.push(intervalId);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      digit.classList.remove("rolling");
      digit.textContent = result[index];

      if (typeof digit.animate === "function") {
        digit.animate(
          [
            { transform: "translateY(-5px) scale(.98)" },
            { transform: "translateY(2px) scale(1.035)" },
            { transform: "translateY(0) scale(1)" }
          ],
          { duration: 380, easing: "cubic-bezier(.2,.8,.25,1)" }
        );
      }

      if (index === DIGITS - 1) {
        window.setTimeout(() => finishDraw(result), 400);
      }
    }, timing.start + index * timing.interval);
  });
}

drawButton.addEventListener("click", () => {
  playUiClick();
  drawWithAnimation();
});

instantButton.addEventListener("click", () => {
  playUiClick();
  drawInstantly();
});

/* =========================================
   자동 뽑기
========================================= */

function getSelectedAutoRarities() {
  return $all('input[name="auto-stop-rarity"]:checked').map(input => input.value);
}

function openAutoSettings() {
  if (autoRunning) {
    stopAutoDraw("자동 뽑기를 중지했어.");
    return;
  }

  playUiClick();
  openOverlay(autoOverlay, autoButton, closeAutoButton);
  autoMessage.textContent = "설정을 정한 다음 자동 뽑기를 시작해 봐.";
}

function closeAutoSettings() {
  closeOverlay(autoOverlay, autoButton);
}

autoButton.addEventListener("click", openAutoSettings);
closeAutoButton.addEventListener("click", closeAutoSettings);
cancelAutoButton.addEventListener("click", closeAutoSettings);

autoOverlay.addEventListener("click", event => {
  if (event.target === autoOverlay) closeAutoSettings();
});

$all('input[name="auto-limit-mode"]').forEach(input => {
  input.addEventListener("change", () => {
    if (!input.checked) return;

    const countMode = input.value === "count";
    autoDurationSetting.hidden = countMode;
    autoCountSetting.hidden = !countMode;
  });
});

function startAutoDraw() {
  autoLimitMode =
    document.querySelector('input[name="auto-limit-mode"]:checked')?.value || "duration";

  const duration = Number(autoDurationInput.value);
  const count = Number(autoCountInput.value);

  if (autoLimitMode === "duration" &&
      (!Number.isInteger(duration) || duration < 1 || duration > 3600)) {
    autoMessage.textContent = "지속시간은 1초부터 3600초 사이의 정수로 입력해 줘.";
    return;
  }

  if (autoLimitMode === "count" &&
      (!Number.isInteger(count) || count < 1 || count > 100000)) {
    autoMessage.textContent = "추첨 횟수는 1회부터 100,000회 사이의 정수로 입력해 줘.";
    return;
  }

  autoMode = document.querySelector('input[name="auto-mode"]:checked')?.value || "animated";
  autoStopRarities = getSelectedAutoRarities();
  autoRunning = true;
  autoCompletedCount = 0;
  autoResults = [];
  autoRareResults = [];
  autoStopReason = "";
  autoTargetCount = count;
  autoEndsAt = autoLimitMode === "duration" ? Date.now() + duration * 1000 : Infinity;

  if (autoNextTimeout !== null) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  autoButton.innerHTML = '<span class="button-icon">■</span> 자동 뽑기 중지';
  autoButton.classList.add("auto-running");
  closeAutoSettings();

  statusElement.textContent = autoLimitMode === "count"
    ? `자동 뽑기 시작 · ${formatNumber(count)}회 추첨`
    : `자동 뽑기 시작 · ${duration}초 동안 실행`;

  setButtonsDisabled(true);
  runNextAutoDraw();
}

function stopAutoDraw(message = "자동 뽑기가 멈췄어.") {
  if (!autoRunning) return;

  autoRunning = false;
  autoStopReason = message;

  if (autoNextTimeout !== null) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  autoButton.innerHTML = '<span class="button-icon">⟳</span> 자동 뽑기';
  autoButton.classList.remove("auto-running");
  setButtonsDisabled(isDrawing);
  statusElement.textContent = message;
  showAutoSummary(message);
}

function handleAutoAfterDraw(pattern) {
  if (!autoRunning) return;

  if (pattern && autoStopRarities.includes(pattern.level)) {
    stopAutoDraw(`${pattern.detail} 등급이 나와 자동 뽑기를 멈췄어!`);
    return;
  }

  if (autoLimitMode === "count" && autoCompletedCount >= autoTargetCount) {
    stopAutoDraw(`설정한 ${formatNumber(autoTargetCount)}회 추첨을 완료했어!`);
    return;
  }

  if (autoLimitMode === "duration" && Date.now() >= autoEndsAt) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  autoNextTimeout = window.setTimeout(runNextAutoDraw, autoMode === "instant" ? 15 : 80);
}

function runNextAutoDraw() {
  if (!autoRunning) return;

  if (autoLimitMode === "duration" && Date.now() >= autoEndsAt) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  if (autoLimitMode === "count" && autoCompletedCount >= autoTargetCount) {
    stopAutoDraw(`설정한 ${formatNumber(autoTargetCount)}회 추첨을 완료했어!`);
    return;
  }

  if (isDrawing) {
    autoNextTimeout = window.setTimeout(runNextAutoDraw, 50);
    return;
  }

  isDrawing = true;

  if (autoMode === "instant") {
    clearNumberEffects();
    finishDraw(getNextResult());
    return;
  }

  clearNumberEffects();
  digitElements.forEach(digit => {
    digit.style.display = "inline-block";
    digit.classList.add("rolling");
  });

  const result = getNextResult();
  const timings = {
    1: { start: 1000, interval: 250, spin: 90 },
    2: { start: 700, interval: 180, spin: 70 },
    3: { start: 500, interval: 130, spin: 55 },
    4: { start: 350, interval: 90, spin: 45 },
    5: { start: 250, interval: 60, spin: 35 }
  };

  const timing = timings[settings.speed] || timings[2];

  digitElements.forEach((digit, index) => {
    const intervalId = window.setInterval(() => {
      digit.textContent = String(Math.floor(Math.random() * 10));
    }, timing.spin);

    window.setTimeout(() => {
      clearInterval(intervalId);
      digit.classList.remove("rolling");
      digit.textContent = result[index];

      if (index === DIGITS - 1) {
        window.setTimeout(() => finishDraw(result), 150);
      }
    }, timing.start + index * timing.interval);
  });
}

startAutoButton.addEventListener("click", () => {
  playUiClick();
  startAutoDraw();
});

/* =========================================
   자동 추첨 결과 요약
========================================= */

function showAutoSummary(reason) {
  if (autoCompletedCount <= 0) return;

  const sum = autoResults.reduce((total, value) => total + value, 0);
  const maximum = autoResults.length ? Math.max(...autoResults) : 0;
  const minimum = autoResults.length ? Math.min(...autoResults) : 0;

  $("summary-draw-count").textContent = formatNumber(autoCompletedCount);
  $("summary-average").textContent = autoResults.length
    ? formatNumber(Math.round(sum / autoResults.length))
    : "—";
  $("summary-max").textContent = autoResults.length ? formatNumber(maximum) : "—";
  $("summary-min").textContent = autoResults.length ? formatNumber(minimum) : "—";
  $("summary-reason").textContent = reason;

  const list = $("summary-rare-list");
  list.replaceChildren();

  const rareResults = sortRareResults(autoRareResults);

  if (!rareResults.length) {
    const item = document.createElement("li");
    item.textContent = "이번 자동 추첨에서는 희귀 결과가 나오지 않았어.";
    list.appendChild(item);
  } else {
    rareResults.slice(0, 20).forEach(entry => {
      const item = document.createElement("li");
      item.className = `rare-history-${entry.pattern.level}`;
      item.textContent = `${entry.pattern.detail} · ${formatNumber(entry.value)}`;
      list.appendChild(item);
    });
  }

  openOverlay(autoSummaryOverlay, null, closeAutoSummaryButton);
}

function sortRareResults(entries) {
  return [...entries].sort((a, b) => {
    const rankDifference =
      getRarityRank(a.pattern?.level) - getRarityRank(b.pattern?.level);

    return rankDifference || a.value - b.value;
  });
}

function closeAutoSummary() {
  closeOverlay(autoSummaryOverlay, null);
}

closeAutoSummaryButton.addEventListener("click", closeAutoSummary);
closeSummaryDoneButton.addEventListener("click", closeAutoSummary);

autoSummaryOverlay.addEventListener("click", event => {
  if (event.target === autoSummaryOverlay) closeAutoSummary();
});

/* =========================================
   치트 · 비밀번호 보호
========================================= */

function requestProtectedAccess(action) {
  pendingProtectedAction = action;
  passwordInput.value = "";
  passwordMessage.textContent = "비밀번호를 입력해 줘.";
  openOverlay(passwordOverlay, null, passwordInput);
}

function closePassword() {
  passwordOverlay.hidden = true;
  pendingProtectedAction = null;
  passwordInput.value = "";
}

function submitPassword() {
  if (passwordInput.value !== FEATURE_PASSWORD) {
    passwordMessage.textContent = "비밀번호가 틀렸어. 다시 확인해 줘.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  const action = pendingProtectedAction;
  closePassword();

  if (action === "cheat") {
    openOverlay(cheatOverlay, cheatButton, closeCheatButton);
  }

  if (action === "turbo") {
    turboMessage.textContent = "실행하면 결과 요약이 표시돼.";
    openOverlay(turboOverlay, turboButton, closeTurboButton);
  }
}

cheatButton.addEventListener("click", () => {
  playUiClick();
  requestProtectedAccess("cheat");
});

closePasswordButton.addEventListener("click", closePassword);
cancelPasswordButton.addEventListener("click", closePassword);
submitPasswordButton.addEventListener("click", submitPassword);

passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") submitPassword();
});

passwordOverlay.addEventListener("click", event => {
  if (event.target === passwordOverlay) closePassword();
});

function closeCheat() {
  closeOverlay(cheatOverlay, cheatButton);
}

closeCheatButton.addEventListener("click", closeCheat);

cheatOverlay.addEventListener("click", event => {
  if (event.target === cheatOverlay) closeCheat();
});

applyCheatButton.addEventListener("click", () => {
  const value = Number(cheatNumberInput.value);

  if (!Number.isInteger(value) || value < 0 || value > MAX_NUMBER) {
    cheatMessage.textContent = "0부터 9,999,999 사이의 정수를 입력해 줘.";
    return;
  }

  queuedCheatNumber = value;
  cheatMessage.textContent = `${formatNumber(value)}을(를) 다음 추첨에 적용할게!`;
  statusElement.textContent = "치트 숫자가 예약됐어.";
  playUiClick();
});

clearCheatButton.addEventListener("click", () => {
  queuedCheatNumber = null;
  cheatNumberInput.value = "";
  cheatMessage.textContent = "치트를 해제했어.";
  playUiClick();
});

/* =========================================
   희귀도 안내
========================================= */

rarityButton.addEventListener("click", () => {
  playUiClick();
  openOverlay(rarityOverlay, rarityButton, closeRarityButton);
});

closeRarityButton.addEventListener("click", () => closeOverlay(rarityOverlay, rarityButton));

rarityOverlay.addEventListener("click", event => {
  if (event.target === rarityOverlay) closeOverlay(rarityOverlay, rarityButton);
});

/* =========================================
   RARE HISTORY 필터
========================================= */

function openRareHistoryFilter() {
  $all('input[name="rare-history-rarity"]').forEach(input => {
    input.checked = selectedRareHistoryRarities.has(input.value);
  });

  rareHistoryFilterMessage.textContent = "기록할 희귀 등급을 선택해 줘.";
  openOverlay(rareHistoryFilterOverlay, rareHistoryFilterButton, closeRareHistoryFilterButton);
}

function closeRareHistoryFilter() {
  closeOverlay(rareHistoryFilterOverlay, rareHistoryFilterButton);
}

rareHistoryFilterButton.addEventListener("click", () => {
  playUiClick();
  openRareHistoryFilter();
});

closeRareHistoryFilterButton.addEventListener("click", closeRareHistoryFilter);
cancelRareHistoryFilterButton.addEventListener("click", closeRareHistoryFilter);

rareHistoryFilterOverlay.addEventListener("click", event => {
  if (event.target === rareHistoryFilterOverlay) closeRareHistoryFilter();
});

selectAllRareHistoryButton.addEventListener("click", () => {
  $all('input[name="rare-history-rarity"]').forEach(input => {
    input.checked = true;
  });
  playUiClick();
});

clearRareHistoryFilterButton.addEventListener("click", () => {
  $all('input[name="rare-history-rarity"]').forEach(input => {
    input.checked = false;
  });
  playUiClick();
});

saveRareHistoryFilterButton.addEventListener("click", () => {
  const checked = $all('input[name="rare-history-rarity"]:checked').map(input => input.value);

  if (!checked.length) {
    selectedRareHistoryRarities = new Set();
    rareHistoryFilterMessage.textContent = "선택한 등급이 없어. 현재 기록이 모두 숨겨져.";
  } else {
    selectedRareHistoryRarities = new Set(checked);
    rareHistoryFilterMessage.textContent = `${checked.length}개 등급의 기록을 표시할게.`;
  }

  renderRareHistory();
  saveProgress();
  playUiClick();
  closeRareHistoryFilter();
});

/* =========================================
   희귀 연출 다시 보기
========================================= */

function openReplay() {
  playUiClick();
  replayMessage.textContent = "보고 싶은 연출을 선택해 줘.";
  openOverlay(replayOverlay, replayButton, closeReplayButton);
}

function closeReplay() {
  closeOverlay(replayOverlay, replayButton);
}

replayButton.addEventListener("click", openReplay);
closeReplayButton.addEventListener("click", closeReplay);

replayOverlay.addEventListener("click", event => {
  if (event.target === replayOverlay) closeReplay();
});

$all("[data-preview-rarity]").forEach(button => {
  button.addEventListener("click", () => {
    const level = button.dataset.previewRarity;
    const label = button.querySelector(".rarity-badge")?.textContent?.trim();

    if (!level || !label) return;

    pendingEffectOverride = makePattern(level, `✦ ${label.toUpperCase()} EFFECT ✦`, label);

    $all("[data-preview-rarity]").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    replayMessage.textContent =
      `${label} 연출을 선택했어. 창을 닫고 다음 숫자를 뽑으면 적용돼!`;

    statusElement.textContent = `다음 추첨에 ${label} 연출이 예약됐어.`;
    closeReplay();
  });
});

/* =========================================
   초고속 추첨
========================================= */

turboButton.addEventListener("click", () => {
  playUiClick();
  requestProtectedAccess("turbo");
});

function closeTurbo() {
  closeOverlay(turboOverlay, turboButton);
}

closeTurboButton.addEventListener("click", closeTurbo);
cancelTurboButton.addEventListener("click", closeTurbo);

turboOverlay.addEventListener("click", event => {
  if (event.target === turboOverlay) closeTurbo();
});

function runTurboDraw() {
  if (isDrawing || autoRunning) {
    turboMessage.textContent = "일반 추첨이나 자동 뽑기가 실행 중일 때는 사용할 수 없어.";
    return;
  }

  const count = Number(turboCountInput.value);

  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    turboMessage.textContent = "추첨 횟수는 1회부터 10,000회 사이의 정수로 입력해 줘.";
    return;
  }

  startTurboButton.disabled = true;
  const results = [];
  const rareResults = [];

  let sum = 0;
  let localMax = -Infinity;
  let localMin = Infinity;

  turboMessage.textContent = `${formatNumber(count)}회 추첨 중...`;

  for (let i = 0; i < count; i++) {
    const result = secureRandomNumber();
    const value = Number(result);
    const pattern = getRarePattern(result);

    results.push(value);
    sum += value;
    localMax = Math.max(localMax, value);
    localMin = Math.min(localMin, value);

    history.unshift(value);
    history = history.slice(0, HISTORY_LIMIT);

    if (pattern && isRareLevel(pattern.level)) {
      rareHistory.unshift({ value, pattern });
      rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
      rareResults.push({ value, pattern });
    }

    totalDraws++;
    if (highestNumber === null || value > highestNumber) highestNumber = value;
    if (lowestNumber === null || value < lowestNumber) lowestNumber = value;

    trackDrawStatistics(result);
  }

  lastResult = String(results[results.length - 1]).padStart(DIGITS, "0");
  setDisplayedNumber(lastResult, true);
  digitCountLabel.textContent = getDigitCountLabel(lastResult);
  updateNumberInfo(lastResult);

  const finalPattern = getRarePattern(lastResult);
  triggerResultImpact(finalPattern, lastResult);

  renderHistory();
  renderRareHistory();
  updateAverage();
  updateStatistics();
  renderStatistics();
  saveProgress();

  autoCompletedCount = count;
  autoResults = results;
  autoRareResults = rareResults;

  statusElement.textContent = `초고속 추첨 완료 · ${formatNumber(count)}회`;
  turboMessage.textContent =
    `완료! 평균 ${formatNumber(Math.round(sum / count))} · 최댓값 ${formatNumber(localMax)} · 최솟값 ${formatNumber(localMin)}`;

  startTurboButton.disabled = false;
  closeTurbo();
  showAutoSummary(`초고속 추첨 ${formatNumber(count)}회 완료!`);
}

startTurboButton.addEventListener("click", runTurboDraw);

/* =========================================
   버튼 상태 및 키보드
========================================= */

function closeAllOverlays() {
  const pairs = [
    [settingsOverlay, settingsButton],
    [cheatOverlay, cheatButton],
    [rarityOverlay, rarityButton],
    [statisticsOverlay, statisticsButton],
    [replayOverlay, replayButton],
    [autoOverlay, autoButton],
    [turboOverlay, turboButton],
    [rareHistoryFilterOverlay, rareHistoryFilterButton]
  ];

  pairs.forEach(([overlay, opener]) => {
    if (overlay && !overlay.hidden) closeOverlay(overlay, opener);
  });

  if (!passwordOverlay.hidden) closePassword();
  if (!autoSummaryOverlay.hidden) closeAutoSummary();
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAllOverlays();
  }
});

$all("button").forEach(button => {
  button.addEventListener("click", () => {
    if (!button.disabled) playUiClick();
  });
});

/* =========================================
   초기화
========================================= */

restoreProgress();
populateSettingsControls();
applySettings();
setDisplayedNumber(lastResult, true);

if (totalDraws > 0) {
  digitCountLabel.textContent = getDigitCountLabel(lastResult);
  updateNumberInfo(lastResult);
  statusElement.textContent = "이전 기록을 불러왔어. 계속 추첨해 봐!";
}

renderHistory();
renderRareHistory();
updateAverage();
updateStatistics();
renderStatistics();

resizeParticleCanvas();
createBackgroundParticles();

if (particleAnimationFrame !== null) {
  cancelAnimationFrame(particleAnimationFrame);
}
animateParticles();

window.addEventListener("resize", () => {
  resizeParticleCanvas();
  createBackgroundParticles();
});

console.log("💜 Violet Random이 준비됐어!");
