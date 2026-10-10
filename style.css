"use strict";

const DIGITS = 7;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";
const PROGRESS_KEY = "violetRandomProgress";
const FEATURE_PASSWORD = "0708";

const DEFAULT_SETTINGS = {
  particles: 65,
  speed: 2,
  effect: 2,
  rareEffects: true,
  theme: "dark"
};

const $ = id => document.getElementById(id);

const numberElement = $("number");
const numberBox = $("number-box");
const drawButton = $("draw-button");
const instantButton = $("instant-button");
const autoButton = $("auto-button");
const autoOverlay = $("auto-overlay");
const closeAutoButton = $("close-auto");
const cancelAutoButton = $("cancel-auto");
const startAutoButton = $("start-auto");
const autoDurationInput = $("auto-duration");
const autoMessage = $("auto-message");
const autoCountInput = $("auto-count");
const autoDurationSetting = $("auto-duration-setting");
const autoCountSetting = $("auto-count-setting");
const statisticsButton = $("statistics-button");
const replayButton = $("replay-button");
const replayOverlay = $("replay-overlay");
const closeReplayButton = $("close-replay");
const replayMessage = $("replay-message");
const passwordOverlay = $("password-overlay");
const passwordInput = $("password-input");
const passwordMessage = $("password-message");
const submitPasswordButton = $("submit-password");
const closePasswordButton = $("close-password");
const cancelPasswordButton = $("cancel-password");
const turboButton = $("turbo-button");
const turboOverlay = $("turbo-overlay");
const closeTurboButton = $("close-turbo");
const cancelTurboButton = $("cancel-turbo");
const startTurboButton = $("start-turbo");
const turboCountInput = $("turbo-count");
const turboMessage = $("turbo-message");
const statisticsOverlay = $("statistics-overlay");
const closeStatisticsButton = $("close-statistics");
const autoSummaryOverlay = $("auto-summary-overlay");
const closeAutoSummaryButton = $("close-auto-summary");
const closeSummaryDoneButton = $("close-summary-done");
const rareHistoryList = $("rare-history-list");
const statusElement = $("status");
const historyList = $("history-list");
const averageElement = $("average");
const averageStatus = $("average-status");

const rareLabel = $("rare-label");
const digitCountLabel = $("digit-count-label");
const primeStatus = $("prime-status");
const divisorStatus = $("divisor-status");

const maxNumberElement = $("max-number");
const minNumberElement = $("min-number");
const totalDrawsElement = $("total-draws");

const effectsLayer = $("effects");
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

const digitElements = Array.from(
  numberElement.querySelectorAll("span")
);

let settings = loadSettings();

let history = [];
let rareHistory = [];
let totalDraws = 0;
let highestNumber = null;
let lowestNumber = null;
let lastResult = "0000000";
let pendingProtectedAction = null;
let isDrawing = false;
let queuedCheatNumber = null;
let lastDrawWasCheat = false;

let autoRunning = false;
let autoEndsAt = 0;
let autoMode = "animated";
let autoNextTimeout = null;
let autoStopRarities = [];
let autoLimitMode = "duration";
let autoTargetCount = 100;
let autoCompletedCount = 0;
let autoResults = [];
let autoRareResults = [];
let autoStopReason = "";

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
  rarities: {
    uncommon: 0,
    rare: 0,
    glorious: 0,
    legendary: 0,
    ultimate: 0,
    mythic: 0,
    eclipse: 0,
    jackpot: 0,
    special: 0,
    "reverse-special": 0,
    phantom: 0,
    aurora: 0,
    seraph: 0,
    common: 0
  }
};

// 희귀도가 높은 순서. Mythic은 Legendary 바로 아래에 둔다.
const RARITY_ORDER = [
  "ultimate",
  "reverse-special",
  "special",
  "jackpot",
  "eclipse",
  "legendary",
  "mythic",
  "seraph",
  "aurora",
  "phantom",
  "glorious",
  "rare",
  "uncommon",
  "common"
];

let pendingEffectOverride = null;

function getRarityRank(level) {
  const index = RARITY_ORDER.indexOf(level || "common");
  return index === -1 ? RARITY_ORDER.length : index;
}

function sortRareResults(entries) {
  return [...entries].sort((a, b) => {
    const rankDifference =
      getRarityRank(a.pattern?.level) -
      getRarityRank(b.pattern?.level);

    return rankDifference || a.value - b.value;
  });
}

function takeEffectPattern(actualPattern) {
  if (!pendingEffectOverride) return actualPattern;

  const selected = pendingEffectOverride;
  pendingEffectOverride = null;

  document.querySelectorAll("[data-preview-rarity]").forEach(button => {
    button.classList.remove("selected");
  });

  return selected;
}

function triggerNextResultEffect(actualPattern, result) {
  const hasOverride = Boolean(pendingEffectOverride);
  const previousRareEffects = settings.rareEffects;
  const effectPattern = takeEffectPattern(actualPattern);

  // 직접 선택한 연출은 희귀 숫자 이펙트 설정이 꺼져 있어도 적용한다.
  if (hasOverride) {
    settings.rareEffects = true;
  }

  triggerResultImpact(effectPattern, result);

  settings.rareEffects = previousRareEffects;

  return effectPattern;
}

let rollTimeouts = [];
let rollIntervals = [];
let backgroundParticles = [];

/* =====================================
   사운드: 외부 파일 없이 Web Audio로 생성
===================================== */

let audioContext = null;

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

  // 기존 음색은 유지하면서 모든 효과음의 음량을 높인다.
  // 과도한 증폭으로 소리가 찢어지는 현상은 제한한다.
  const louderVolume = Math.min(0.22, Math.max(0.0002, volume * 2.8));

  gain.gain.exponentialRampToValueAtTime(
    louderVolume,
    start + 0.012
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

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
    common: [
      [420, 0.07, "sine"]
    ],

    uncommon: [
      [520, 0.09, "triangle"]
    ],

    rare: [
      [580, 0.09, "triangle"],
      [760, 0.12, "sine", 0.025, 0.055]
    ],

    glorious: [
      [490, 0.13, "sine"],
      [660, 0.13, "sine", 0.035, 0.08],
      [880, 0.18, "triangle", 0.03, 0.16]
    ],

    mythic: [
      [440, 0.18, "sine"],
      [587, 0.2, "triangle", 0.035, 0.09],
      [784, 0.24, "sine", 0.03, 0.2]
    ],

    legendary: [
      [660, 0.13, "triangle"],
      [880, 0.16, "sine", 0.04, 0.08],
      [1175, 0.23, "triangle", 0.035, 0.17]
    ],

    phantom: [
      [330, 0.2, "sine"],
      [494, 0.22, "triangle", 0.03, 0.1],
      [370, 0.25, "sine", 0.025, 0.22]
    ],

    aurora: [
      [523, 0.18, "sine"],
      [659, 0.2, "sine", 0.035, 0.09],
      [784, 0.23, "triangle", 0.03, 0.18],
      [1047, 0.28, "sine", 0.025, 0.29]
    ],

    seraph: [
      [784, 0.16, "sine"],
      [988, 0.2, "triangle", 0.04, 0.08],
      [1175, 0.25, "sine", 0.035, 0.17],
      [1568, 0.32, "triangle", 0.03, 0.29]
    ],

    eclipse: [
      [220, 0.22, "sawtooth", 0.035],
      [330, 0.24, "triangle", 0.03, 0.1],
      [660, 0.3, "sine", 0.035, 0.23]
    ],

    ultimate: [
      [392, 0.2, "sine"],
      [587, 0.22, "triangle", 0.04, 0.09],
      [784, 0.25, "sine", 0.04, 0.18],
      [1175, 0.32, "triangle", 0.04, 0.28]
    ],

    jackpot: [
      [880, 0.1, "square", 0.025],
      [1175, 0.13, "triangle", 0.035, 0.07],
      [1568, 0.2, "sine", 0.04, 0.15]
    ],

    special: [
      [659, 0.12, "triangle"],
      [880, 0.18, "sine", 0.035, 0.09]
    ],

    "reverse-special": [
      [880, 0.1, "triangle"],
      [659, 0.12, "triangle", 0.035, 0.08],
      [440, 0.2, "sine", 0.03, 0.17]
    ]
  };

  (sounds[level] || sounds.common).forEach(
    ([frequency, duration, type, volume = 0.035, delay = 0]) => {
      playTone(frequency, duration, type, volume, delay);
    }
  );
}

document.addEventListener("click", event => {
  const target = event.target.closest(
    "button, .auto-mode-option, .auto-rarity-grid label, .setting-toggle"
  );

  if (target && !target.disabled) {
    playUiClick();
  }
});

/* =====================================
   설정
===================================== */

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(saved);

    return {
      particles: clamp(parsed.particles, 0, 150, 65),
      speed: clamp(parsed.speed, 1, 5, 2),
      effect: clamp(parsed.effect, 0, 3, 2),
      rareEffects:
        typeof parsed.rareEffects === "boolean"
          ? parsed.rareEffects
          : true,
      theme: parsed.theme === "light" ? "light" : "dark"
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function clamp(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function populateSettingsControls() {
  particleSetting.value = settings.particles;
  speedSetting.value = settings.speed;
  effectSetting.value = settings.effect;
  rareSetting.checked = settings.rareEffects;
  themeSetting.value = settings.theme;

  updateSettingLabels();
}

function readSettingsControls() {
  settings = {
    particles: Number(particleSetting.value),
    speed: Number(speedSetting.value),
    effect: Number(effectSetting.value),
    rareEffects: rareSetting.checked,
    theme: themeSetting.value === "light" ? "light" : "dark"
  };
}

function updateSettingLabels() {
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

  speedValue.textContent = speedNames[speedSetting.value];
  effectValue.textContent = effectNames[effectSetting.value];

  themeValue.textContent =
    themeSetting.value === "light" ? "라이트 모드" : "다크 모드";
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    settingsMessage.textContent = "설정을 저장했어! 💜";
    return true;
  } catch {
    settingsMessage.textContent =
      "설정 저장에 실패했어. 브라우저 저장 공간을 확인해 줘.";
    return false;
  }
}

function applySettings() {
  updateSettingLabels();

  document.body.classList.toggle(
    "light-mode",
    settings.theme === "light"
  );

  resizeCanvas();
}

function openSettings() {
  populateSettingsControls();
  settingsMessage.textContent = "설정은 이 브라우저에 저장돼.";
  settingsOverlay.hidden = false;
  settingsButton.setAttribute("aria-expanded", "true");
  closeSettingsButton.focus();
}

function closeSettings() {
  settingsOverlay.hidden = true;
  settingsButton.setAttribute("aria-expanded", "false");
  settingsButton.focus();
}

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);

settingsOverlay.addEventListener("click", event => {
  if (event.target === settingsOverlay) {
    closeSettings();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !settingsOverlay.hidden) {
    closeSettings();
  }
});

[
  particleSetting,
  speedSetting,
  effectSetting,
  rareSetting,
  themeSetting
].forEach(control => {
  control.addEventListener("input", () => {
    readSettingsControls();
    applySettings();

    settingsMessage.textContent =
      "미리 보는 중이야. 저장 버튼을 누르면 유지돼.";
  });
});

saveSettingsButton.addEventListener("click", () => {
  readSettingsControls();
  applySettings();

  if (saveSettings()) {
    closeSettings();
  }
});

resetSettingsButton.addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  populateSettingsControls();
  applySettings();

  settingsMessage.textContent =
    "기본값으로 바꿨어. 저장 버튼을 눌러 적용해 줘.";
});

/* =====================================
   치트 설정
===================================== */

function openCheatPanel() {
  cheatOverlay.hidden = false;
  cheatButton.setAttribute("aria-expanded", "true");

  cheatMessage.textContent = queuedCheatNumber === null
    ? "치트를 설정하면 다음 추첨에 한 번 적용돼."
    : `다음 추첨 예약 숫자: ${queuedCheatNumber}`;

  closeCheatButton.focus();
}

function closeCheat() {
  cheatOverlay.hidden = true;
  cheatButton.setAttribute("aria-expanded", "false");
  cheatButton.focus();
}

cheatButton.addEventListener("click", () => requestProtectedAccess("cheat"));
closeCheatButton.addEventListener("click", closeCheat);

cheatOverlay.addEventListener("click", event => {
  if (event.target === cheatOverlay) {
    closeCheat();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !cheatOverlay.hidden) {
    closeCheat();
  }
});

applyCheatButton.addEventListener("click", () => {
  const raw = cheatNumberInput.value.trim();
  const value = Number(raw);

  if (
    raw === "" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 9999999
  ) {
    cheatMessage.textContent =
      "0부터 9,999,999 사이의 정수를 입력해 줘.";
    return;
  }

  queuedCheatNumber = String(value).padStart(DIGITS, "0");

  cheatMessage.textContent =
    `설정 완료! 다음 추첨에서 ${value.toLocaleString("en-US")}이(가) 나와.`;
});

clearCheatButton.addEventListener("click", () => {
  queuedCheatNumber = null;
  cheatNumberInput.value = "";
  cheatMessage.textContent =
    "치트를 해제했어. 이제 무작위 숫자가 나와.";
});

function getNextResult() {
  if (queuedCheatNumber !== null) {
    const result = queuedCheatNumber;
    queuedCheatNumber = null;
    lastDrawWasCheat = true;
    return result;
  }

  lastDrawWasCheat = false;
  return secureRandomNumber();
}

/* =====================================
   균등 확률 난수
===================================== */

function secureRandomNumber() {
  const RANGE = 10_000_000;
  const MAX = 0x100000000;
  const LIMIT = Math.floor(MAX / RANGE) * RANGE;
  const buffer = new Uint32Array(1);

  // 편향을 제거해 0~9,999,999의 모든 결과가
  // 정확히 같은 확률로 나오도록 한다.
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= LIMIT);

  return String(buffer[0] % RANGE).padStart(DIGITS, "0");
}

/* =====================================
   롤링 타이머 관리
===================================== */

function clearRollTimers() {
  rollTimeouts.forEach(id => clearTimeout(id));
  rollIntervals.forEach(id => clearInterval(id));

  rollTimeouts = [];
  rollIntervals = [];
}

function scheduleRollTimeout(callback, delay) {
  const id = setTimeout(callback, delay);
  rollTimeouts.push(id);
  return id;
}

function setButtonsDisabled(disabled) {
  drawButton.disabled = disabled || autoRunning;
  instantButton.disabled = disabled || autoRunning;
}

function resetNumberEffects() {
  numberElement.classList.remove("finished");

  numberBox.classList.remove(
    "impact",
    "rare",
    "rare-legendary",
    "rare-glorious",
    "rare-uncommon",
    "rare-ultimate",
    "rare-jackpot",
    "rare-special",
    "rare-reverse-special",
    "rare-mythic",
    "rare-eclipse",
    "rare-phantom",
    "rare-aurora",
    "rare-seraph",
    "rarity-uncommon-impact",
    "rarity-rare-impact",
    "rarity-glorious-impact",
    "rarity-legendary-impact",
    "rarity-ultimate-impact",
    "rarity-jackpot-impact",
    "rarity-special-impact",
    "rarity-reverse-special-impact",
    "rarity-mythic-impact",
    "rarity-eclipse-impact",
    "rarity-phantom-impact",
    "rarity-aurora-impact",
    "rarity-seraph-impact",
    "magnitude-6",
    "magnitude-5",
    "magnitude-4",
    "magnitude-3",
    "magnitude-2",
    "magnitude-1"
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
      value
        .slice(0, index + 1)
        .split("")
        .every(char => char === "0");

    digit.style.display = isLeadingZero ? "none" : "inline-block";
    digit.classList.remove("rolling");
  });
}

/* =====================================
   희귀 패턴 판별
===================================== */

function getRarePattern(value) {
  // 앞자리 0은 실제 자릿수에 포함하지 않는다.
  const normalized = String(Number(value));
  const digits = normalized.split("");
  const length = normalized === "0" ? 0 : normalized.length;
  const result = (title, level, detail = title) => ({ title, level, detail });

  // 지정 숫자는 일반 패턴보다 항상 우선한다.
  if (["7777777", "777777", "77777", "7777", "777"].includes(normalized)) {
    return result("✦ JACKPOT ✦", "jackpot", "Jackpot");
  }

  if (normalized === "708" || normalized === "1234567") {
    return result("✧ SPECIAL ✧", "special", "Special");
  }

  if (normalized === "7654321") {
    return result("✧ REVERSE SPECIAL ✧", "reverse-special", "Reverse Special");
  }

  if (length === 7 && /^(\d)\1{6}$/.test(normalized)) {
    return result("✦ ECLIPSE · 7자리 단일 숫자 ✦", "eclipse", "Eclipse");
  }

  // Aurora: 일곱 자리가 한 칸씩 증가하거나 감소하는 연속 패턴.
  if (
    length === 7 &&
    (
      normalized === "2345678" ||
      normalized === "3456789" ||
      normalized === "8765432" ||
      normalized === "9876543"
    )
  ) {
    return result("✧ AURORA · 연속 숫자 ✧", "aurora", "Aurora");
  }

  // Phantom: ABABABA 형태의 7자리 교차 반복.
  if (
    length === 7 &&
    digits[0] === digits[2] &&
    digits[2] === digits[4] &&
    digits[4] === digits[6] &&
    digits[1] === digits[3] &&
    digits[3] === digits[5] &&
    digits[0] !== digits[1]
  ) {
    return result("✧ PHANTOM · 교차 반복 ✧", "phantom", "Phantom");
  }

  // Seraph: 중복 숫자 없이, 숫자 합이 35 또는 42인 7자리 조합.
  if (
    length === 7 &&
    new Set(digits).size === 7 &&
    [35, 42].includes(
      digits.reduce((sum, digit) => sum + Number(digit), 0)
    )
  ) {
    return result("✦ SERAPH · 완전 무중복 ✦", "seraph", "Seraph");
  }

  // Mythic은 Legendary보다 한 단계 아래다.
  if (
    length === 7 &&
    normalized === normalized.split("").reverse().join("")
  ) {
    return result("✧ MYTHIC · 좌우 대칭 ✧", "mythic", "Mythic");
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
    return result("✦ LEGENDARY · 7연속 반복 ✦", "legendary", "Legendary");
  }

  if (longestRun === 6) {
    return result("✦ GLORIOUS · 6연속 반복 ✦", "glorious", "Glorious");
  }

  if (longestRun >= 3 && longestRun <= 5) {
    return result("✧ RARE · 연속 반복 ✧", "rare", "Rare");
  }

  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 3 <= normalized.length; start++) {
      const block = normalized.slice(start, start + size);

      if (
        normalized.slice(start + size, start + size * 2) === block &&
        normalized.slice(start + size * 2, start + size * 3) === block
      ) {
        return result(
          "✦ GLORIOUS · 숫자 집합 3회 반복 ✦",
          "glorious",
          "Glorious"
        );
      }
    }
  }

  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 2 <= normalized.length; start++) {
      const block = normalized.slice(start, start + size);

      if (
        normalized.slice(start + size, start + size * 2) === block
      ) {
        return result("✧ RARE · 숫자 집합 반복 ✧", "rare", "Rare");
      }
    }
  }

  if (length === 0) {
    return result("✦ ULTIMATE ✦", "ultimate", "Ultimate");
  }

  if (length === 1) {
    return result("✦ LEGENDARY ✦", "legendary", "Legendary");
  }

  if (length === 2) {
    return result("✦ GLORIOUS ✦", "glorious", "Glorious");
  }

  if (length >= 3 && length <= 5) {
    return result("✧ RARE ✧", "rare", "Rare");
  }

  if (length === 6) {
    return result("✧ UNCOMMON ✧", "uncommon", "Uncommon");
  }

  return null;
}

function getDigitCountLabel(value) {
  const normalized = String(Number(value));
  const length = normalized === "0" ? 0 : normalized.length;
  const pattern = getRarePattern(normalized);
  const countText = length === 0 ? "0자리 수" : `${length}자리 수`;

  return pattern
    ? `${countText} · ${pattern.detail}`
    : countText;
}

/* =====================================
   소수 판별
===================================== */

function isPrime(number) {
  if (!Number.isInteger(number) || number < 2) {
    return false;
  }

  if (number === 2) {
    return true;
  }

  if (number % 2 === 0) {
    return false;
  }

  for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
    if (number % divisor === 0) {
      return false;
    }
  }

  return true;
}

function updateNumberInfo(value) {
  const number = Number(value);
  const prime = isPrime(number);

  primeStatus.classList.toggle("prime", prime);
  primeStatus.classList.toggle("not-prime", !prime);

  if (prime) {
    primeStatus.textContent = "✦ 소수 · 약수 2개";
    divisorStatus.textContent =
      `약수: 1, ${number.toLocaleString("en-US")}`;
  } else if (number < 2) {
    primeStatus.textContent = "소수 아님";
    divisorStatus.textContent =
      "소수는 2 이상의 자연수 중에서 찾아";
  } else {
    primeStatus.textContent = "소수 아님 · 합성수";
    divisorStatus.textContent = "약수가 2개보다 많아";
  }
}

/* =====================================
   파티클 및 임팩트
===================================== */

function createBurst(
  x,
  y,
  count = 30,
  distance = 150,
  kind = "normal"
) {
  if (settings.effect === 0) return;

  const multiplier = settings.effect / 2;
  const actualCount = Math.max(1, Math.round(count * multiplier));
  const actualDistance = distance * (0.55 + multiplier * 0.35);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < actualCount; i++) {
    const particle = document.createElement("span");
    const isStar = Math.random() < 0.38;

    particle.className = isStar
      ? "burst-particle star"
      : "burst-particle";

    if (isStar) {
      particle.textContent = Math.random() < 0.5 ? "✦" : "✧";

      if (kind === "legendary") {
        particle.classList.add("gold-star");
      } else if (kind === "rare") {
        particle.classList.add("rare-star");
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const travelDistance =
      actualDistance * (0.35 + Math.random() * 0.65);

    const dx = Math.cos(angle) * travelDistance;
    const dy = Math.sin(angle) * travelDistance;

    const size = isStar
      ? `${8 + Math.random() * 10 * multiplier}px`
      : `${2 + Math.random() * 4 * multiplier}px`;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);
    particle.style.setProperty("--size", size);

    particle.style.setProperty(
      "--rotation",
      `${Math.random() * 360 - 180}deg`
    );

    particle.style.setProperty(
      "--duration",
      `${500 + Math.random() * 500}ms`
    );

    particle.addEventListener(
      "animationend",
      () => particle.remove(),
      { once: true }
    );

    fragment.appendChild(particle);
  }

  effectsLayer.appendChild(fragment);
}

function triggerButtonImpact(button) {
  if (settings.effect === 0) return;

  button.classList.remove("button-impact");
  void button.offsetWidth;
  button.classList.add("button-impact");

  scheduleRollTimeout(() => {
    button.classList.remove("button-impact");
  }, 450);

  const rect = button.getBoundingClientRect();

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    15,
    65
  );
}

function createCoinBurst(x, y) {
  if (settings.effect === 0) return;

  const count = Math.round(12 * (settings.effect / 2));

  for (let i = 0; i < count; i++) {
    const coin = document.createElement("span");
    coin.className = "jackpot-coin";
    coin.textContent = "＄";
    coin.style.left = `${x + (Math.random() - 0.5) * 90}px`;
    coin.style.top = `${y + (Math.random() - 0.5) * 25}px`;
    coin.style.setProperty("--coin-x", `${(Math.random() - 0.5) * 300}px`);
    coin.style.setProperty("--coin-y", `${-80 - Math.random() * 180}px`);
    coin.style.setProperty("--coin-spin", `${360 + Math.random() * 720}deg`);
    coin.style.setProperty("--coin-delay", `${Math.random() * 180}ms`);

    coin.addEventListener("animationend", () => coin.remove(), {
      once: true
    });

    effectsLayer.appendChild(coin);
  }
}

function triggerResultImpact(pattern = null, result = "0000000") {
  numberElement.classList.remove("finished");

  numberBox.classList.remove(
    "impact",
    "rare",
    "rare-legendary",
    "rare-glorious",
    "rare-uncommon",
    "rare-ultimate",
    "rare-jackpot",
    "rare-special",
    "rare-reverse-special",
    "rare-mythic",
    "rare-eclipse",
    "rare-phantom",
    "rare-aurora",
    "rare-seraph",
    "rarity-uncommon-impact",
    "rarity-rare-impact",
    "rarity-glorious-impact",
    "rarity-legendary-impact",
    "rarity-ultimate-impact",
    "rarity-jackpot-impact",
    "rarity-special-impact",
    "rarity-reverse-special-impact",
    "rarity-mythic-impact",
    "rarity-eclipse-impact",
    "rarity-phantom-impact",
    "rarity-aurora-impact",
    "rarity-seraph-impact",
    "magnitude-6",
    "magnitude-5",
    "magnitude-4",
    "magnitude-3",
    "magnitude-2",
    "magnitude-1"
  );

  void numberElement.offsetWidth;
  numberElement.classList.add("finished");

  const rect = numberBox.getBoundingClientRect();
  const rareActive = Boolean(pattern && settings.rareEffects);

  if (rareActive) {
    playRaritySound(pattern.level);
  }

  const normalized = String(Number(result));
  const visibleDigits = normalized === "0" ? 0 : normalized.length;

  const magnitudeClass =
    visibleDigits >= 1 && visibleDigits <= 6
      ? `magnitude-${visibleDigits}`
      : "";

  if (magnitudeClass && settings.effect > 0) {
    numberBox.classList.add(magnitudeClass);
  }

  if (pattern && settings.rareEffects) {
    numberBox.classList.add(`rare-${pattern.level}`);
    numberBox.classList.add(`rarity-${pattern.level}-impact`);

    if (pattern.level === "jackpot") {
      createCoinBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }
  }

  // 자릿수가 낮거나 등급이 높을수록 파티클과 연출을 강화한다.
  const magnitudeScale =
    visibleDigits === 0
      ? 3.2
      : visibleDigits >= 7
        ? 1
        : 1 + (7 - visibleDigits) * 0.42;

  const levelScales = {
    uncommon: 1.15,
    rare: 1.3,
    glorious: 1.65,
    legendary: 2,
    ultimate: 3,
    mythic: 2.6,
    eclipse: 3.2,
    jackpot: 2.8,
    special: 2.1,
    "reverse-special": 2.4,
    phantom: 2.45,
    aurora: 2.7,
    seraph: 3.1
  };

  const rareScale = rareActive
    ? (levelScales[pattern.level] || 1.3)
    : 1;

  const totalScale = magnitudeScale * rareScale;

  if (settings.effect > 0) {
    numberBox.classList.add("impact");
  }

  if (rareActive) {
    if (pattern.level === "legendary") {
      numberBox.classList.add("rare-legendary");
    } else if (pattern.level === "ultimate") {
      numberBox.classList.add("rare-ultimate");
    } else if (pattern.level === "jackpot") {
      numberBox.classList.add("rare-jackpot");
    } else if (pattern.level === "glorious") {
      numberBox.classList.add("rare-glorious");
    } else if (pattern.level === "uncommon") {
      numberBox.classList.add("rare-uncommon");
    } else if (pattern.level === "special") {
      numberBox.classList.add("rare-special");
    } else if (pattern.level === "reverse-special") {
      numberBox.classList.add("rare-reverse-special");
    } else if (pattern.level === "mythic") {
      numberBox.classList.add("rare-mythic");
    } else if (pattern.level === "eclipse") {
      numberBox.classList.add("rare-eclipse");
    } else if (["phantom", "aurora", "seraph"].includes(pattern.level)) {
      numberBox.classList.add(`rare-${pattern.level}`);
    } else {
      numberBox.classList.add("rare");
    }

    rareLabel.textContent = pattern.title;

    const flash = document.createElement("div");
    flash.className = `rare-flash ${pattern.level}`;

    if (
      [
        "legendary",
        "ultimate",
        "jackpot",
        "reverse-special",
        "mythic",
        "eclipse",
        "phantom",
        "aurora",
        "seraph"
      ].includes(pattern.level)
    ) {
      flash.classList.add("legendary");
    }

    effectsLayer.appendChild(flash);
    setTimeout(() => flash.remove(), 900);
  } else {
    rareLabel.textContent = "";
  }

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    Math.round(
      (
        rareActive
          ? (
              pattern.level === "eclipse" ? 190
              : pattern.level === "ultimate" ? 150
              : pattern.level === "jackpot" ? 135
              : pattern.level === "mythic" ? 120
              : pattern.level === "legendary" ? 100
              : pattern.level === "seraph" ? 145
              : pattern.level === "aurora" ? 115
              : pattern.level === "phantom" ? 95
              : 65
            )
          : 30
      ) * totalScale
    ),
    Math.min(rect.width * (0.4 + (totalScale - 1) * 0.13), 320),
    rareActive ? pattern.level : "normal"
  );

  if (settings.effect > 0 && visibleDigits <= 6) {
    numberBox.classList.add("impact");

    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      Math.round(
        (
          visibleDigits === 6
            ? 12
            : 18 + (6 - visibleDigits) * 12
        ) * (settings.effect / 2)
      ),
      Math.min(100 + (6 - visibleDigits) * 45, 300),
      visibleDigits <= 3 ? "legendary" : "rare"
    );
  }

  scheduleRollTimeout(() => {
    numberBox.classList.remove("impact");
  }, 650);
}

/* =====================================
   기록 및 통계
===================================== */

function trackDrawStatistics(result, options = {}) {
  const { render = true, persist = true } = options;
  const value = Number(result);
  const normalized = String(value);
  const digitLength = value === 0 ? 0 : normalized.length;
  const pattern = getRarePattern(normalized);

  drawStats.total++;
  drawStats.sum += value;

  if (value % 2 === 0) {
    drawStats.even++;
  } else {
    drawStats.odd++;
  }

  if (isPrime(value)) {
    drawStats.prime++;
  } else if (value > 1) {
    drawStats.composite++;
  }

  drawStats.digits[String(digitLength)]++;
  drawStats.lastDigits[normalized.slice(-1)]++;

  if (pattern) {
    drawStats.rarities[pattern.level]++;
  } else {
    drawStats.rarities.common++;
  }

  if (render) renderStatistics();
  if (persist) saveProgress();
}

function percentage(part, total) {
  return total ? `${(part / total * 100).toFixed(1)}%` : "0%";
}

function renderStatBar(container, entries, total) {
  container.replaceChildren();

  entries.forEach(([label, count, colorClass]) => {
    const row = document.createElement("div");
    row.className = "statistics-bar-row";

    const heading = document.createElement("div");
    heading.className = "statistics-bar-heading";

    const name = document.createElement("span");
    name.textContent = label;

    const amount = document.createElement("strong");
    amount.textContent =
      `${count.toLocaleString("en-US")} · ${percentage(count, total)}`;

    heading.append(name, amount);

    const track = document.createElement("div");
    track.className = "statistics-bar-track";

    const fill = document.createElement("div");
    fill.className = `statistics-bar-fill ${colorClass || ""}`;
    fill.style.width = percentage(count, total);

    track.appendChild(fill);
    row.append(heading, track);
    container.appendChild(row);
  });
}

function renderStatistics() {
  const setText = (id, value) => {
    const element = $(id);
    if (element) element.textContent = value;
  };

  setText("odd-count", drawStats.odd.toLocaleString("en-US"));
  setText("even-count", drawStats.even.toLocaleString("en-US"));
  setText("odd-ratio", percentage(drawStats.odd, drawStats.total));
  setText("even-ratio", percentage(drawStats.even, drawStats.total));
  setText("prime-count", drawStats.prime.toLocaleString("en-US"));
  setText("composite-count", drawStats.composite.toLocaleString("en-US"));
  setText("prime-ratio", percentage(drawStats.prime, drawStats.total));
  setText("composite-ratio", percentage(drawStats.composite, drawStats.total));

  setText(
    "overall-average",
    drawStats.total
      ? Math.round(drawStats.sum / drawStats.total).toLocaleString("en-US")
      : "—"
  );

  setText(
    "statistics-max",
    highestNumber === null
      ? "—"
      : highestNumber.toLocaleString("en-US")
  );

  setText(
    "statistics-min",
    lowestNumber === null
      ? "—"
      : lowestNumber.toLocaleString("en-US")
  );

  const lastDigitEntries = Object.entries(drawStats.lastDigits)
    .sort((a, b) => b[1] - a[1]);

  const mostCommon = drawStats.total ? lastDigitEntries[0] : null;

  setText(
    "most-common-last-digit",
    mostCommon ? mostCommon[0] : "—"
  );

  setText(
    "most-common-last-digit-count",
    mostCommon
      ? `${mostCommon[1].toLocaleString("en-US")}회 · ${percentage(mostCommon[1], drawStats.total)}`
      : "아직 기록 없음"
  );

  setText(
    "statistics-total",
    `누적 ${drawStats.total.toLocaleString("en-US")}회 추첨 기준 · 기록은 자동 저장돼.`
  );

  const digitNames = {
    0: "0 (숫자 0)",
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
    Object.entries(drawStats.digits).map(
      ([digits, count]) => [digitNames[digits], count, ""]
    ),
    drawStats.total
  );

  renderStatBar(
    $("last-digit-statistics"),
    Object.entries(drawStats.lastDigits).map(
      ([digit, count]) => [`끝자리 ${digit}`, count, ""]
    ),
    drawStats.total
  );

  // 통계에서도 동일한 희귀도 순서를 사용한다.
  const rarityNames = [
    ["ultimate", "Ultimate"],
    ["reverse-special", "Reverse Special"],
    ["special", "Special"],
    ["jackpot", "Jackpot"],
    ["eclipse", "Eclipse"],
    ["legendary", "Legendary"],
    ["mythic", "Mythic"],
    ["seraph", "Seraph"],
    ["aurora", "Aurora"],
    ["phantom", "Phantom"],
    ["glorious", "Glorious"],
    ["rare", "Rare"],
    ["uncommon", "Uncommon"],
    ["common", "일반 숫자"]
  ];

  renderStatBar(
    $("rarity-statistics"),
    rarityNames.map(
      ([key, label]) => [label, drawStats.rarities[key], `bar-${key}`]
    ),
    drawStats.total
  );
}

function openStatistics() {
  renderStatistics();
  statisticsOverlay.hidden = false;
  statisticsButton.setAttribute("aria-expanded", "true");
  closeStatisticsButton.focus();
}

function closeStatistics() {
  statisticsOverlay.hidden = true;
  statisticsButton.setAttribute("aria-expanded", "false");
  statisticsButton.focus();
}

statisticsButton.addEventListener("click", openStatistics);
closeStatisticsButton.addEventListener("click", closeStatistics);

statisticsOverlay.addEventListener("click", event => {
  if (event.target === statisticsOverlay) {
    closeStatistics();
  }
});

document.querySelectorAll('input[name="auto-limit-mode"]').forEach(input => {
  input.addEventListener("change", () => {
    const countMode = input.checked && input.value === "count";
    if (!input.checked) return;

    autoDurationSetting.hidden = countMode;
    autoCountSetting.hidden = !countMode;
  });
});

function showAutoSummary(reason) {
  if (autoCompletedCount <= 0) return;

  $("summary-draw-count").textContent =
    autoCompletedCount.toLocaleString("en-US");

  const sum = autoResults.reduce((total, value) => total + value, 0);

  $("summary-average").textContent =
    Math.round(sum / autoResults.length).toLocaleString("en-US");

  $("summary-max").textContent =
    autoResults
      .reduce((best, value) => Math.max(best, value), -Infinity)
      .toLocaleString("en-US");

  $("summary-min").textContent =
    autoResults
      .reduce((best, value) => Math.min(best, value), Infinity)
      .toLocaleString("en-US");

  const list = $("summary-rare-list");
  list.replaceChildren();

  if (!autoRareResults.length) {
    const item = document.createElement("li");
    item.textContent = "이번 자동 뽑기에서 희귀 숫자가 나오지 않았어.";
    list.appendChild(item);
  } else {
    sortRareResults(autoRareResults).slice(0, 20).forEach(entry => {
      const item = document.createElement("li");

      item.textContent =
        `${entry.pattern.detail} · ${entry.value.toLocaleString("en-US")}`;

      item.className = `summary-${entry.pattern.level}`;
      list.appendChild(item);
    });

    if (autoRareResults.length > 20) {
      const more = document.createElement("li");
      more.textContent = `외 ${autoRareResults.length - 20}개 희귀 결과`;
      list.appendChild(more);
    }
  }

  $("summary-reason").textContent = reason || "자동 뽑기가 종료됐어.";
  autoSummaryOverlay.hidden = false;
  closeAutoSummaryButton.focus();
}

function closeAutoSummary() {
  autoSummaryOverlay.hidden = true;
}

closeAutoSummaryButton.addEventListener("click", closeAutoSummary);
closeSummaryDoneButton.addEventListener("click", closeAutoSummary);

autoSummaryOverlay.addEventListener("click", event => {
  if (event.target === autoSummaryOverlay) {
    closeAutoSummary();
  }
});

function addToHistory(result) {
  const value = Number(result);
  const pattern = getRarePattern(String(value));

  history.unshift(value);
  history = history.slice(0, HISTORY_LIMIT);

  if (pattern) {
    rareHistory.unshift({ value, pattern });
    rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
    renderRareHistory();
  }

  totalDraws += 1;

  if (highestNumber === null || value > highestNumber) {
    highestNumber = value;
  }

  if (lowestNumber === null || value < lowestNumber) {
    lowestNumber = value;
  }

  renderHistory();
  updateAverage();
  updateStatistics();
}

function renderHistory() {
  historyList.replaceChildren();

  if (history.length === 0) {
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
    number.textContent = value.toLocaleString("en-US");

    const pattern = getRarePattern(String(value));

    if (pattern) {
      item.classList.add(
        "rare-history-item",
        `rare-history-${pattern.level}`
      );

      if (
        [
          "legendary",
          "ultimate",
          "jackpot",
          "reverse-special",
          "seraph",
          "aurora"
        ].includes(pattern.level)
      ) {
        item.classList.add("rare-history-legendary");
      }

      number.title = pattern.title;

      const mark = document.createElement("span");
      mark.className = "history-rare-mark";
      mark.textContent = pattern.detail.toUpperCase();

      item.append(rank, mark, number);
    } else {
      item.append(rank, number);
    }

    historyList.appendChild(item);
  });
}

function renderRareHistory() {
  rareHistoryList.replaceChildren();

  if (rareHistory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "아직 희귀 숫자가 없어!";
    rareHistoryList.appendChild(empty);
    return;
  }

  rareHistory.forEach((entry, index) => {
    const item = document.createElement("li");

    item.classList.add(
      "rare-history-item",
      `rare-history-${entry.pattern.level}`
    );

    if (
      [
        "legendary",
        "ultimate",
        "jackpot",
        "reverse-special",
        "seraph",
        "aurora"
      ].includes(entry.pattern.level)
    ) {
      item.classList.add("rare-history-legendary");
    }

    const rank = document.createElement("span");
    rank.className = "history-index";
    rank.textContent = `#${index + 1}`;

    const mark = document.createElement("span");
    mark.className = "history-rare-mark";
    mark.textContent = entry.pattern.detail.toUpperCase();

    const number = document.createElement("span");
    number.className = "history-number";
    number.textContent = entry.value.toLocaleString("en-US");
    number.title = entry.pattern.title;

    item.append(rank, mark, number);
    rareHistoryList.appendChild(item);
  });
}

function updateAverage() {
  if (history.length < HISTORY_LIMIT) {
    averageElement.textContent = "—";
    averageStatus.textContent =
      `${history.length}/${HISTORY_LIMIT}회 추첨 완료`;
    return;
  }

  const sum = history.reduce((total, value) => total + value, 0);
  const average = sum / HISTORY_LIMIT;

  averageElement.textContent =
    Math.round(average).toLocaleString("en-US");

  averageStatus.textContent = "최근 10회 결과의 평균";
}

function updateStatistics() {
  maxNumberElement.textContent =
    highestNumber === null
      ? "—"
      : highestNumber.toLocaleString("en-US");

  minNumberElement.textContent =
    lowestNumber === null
      ? "—"
      : lowestNumber.toLocaleString("en-US");

  totalDrawsElement.textContent =
    totalDraws.toLocaleString("en-US");
}

/* =====================================
   추첨 완료
===================================== */

function finishDraw(result) {
  // 롤링만 정리한다. 결과 효과에 필요한 타이머는 건드리지 않는다.
  clearRollTimers();

  setDisplayedNumber(result, true);

  const value = Number(result);
  const pattern = getRarePattern(result);
  lastResult = result;

  digitCountLabel.textContent = getDigitCountLabel(result);

  addToHistory(result);
  trackDrawStatistics(result);

  if (autoRunning) {
    autoCompletedCount++;
    autoResults.push(Number(result));

    if (pattern) {
      autoRareResults.push({ value: Number(result), pattern });
    }
  }

  updateNumberInfo(result);

  const effectPattern = triggerNextResultEffect(pattern, result);

  if (effectPattern && effectPattern !== pattern) {
    statusElement.textContent =
      `선택한 ${effectPattern.detail} 연출 적용 · ${value.toLocaleString("en-US")}`;
  } else if (lastDrawWasCheat) {
    statusElement.textContent =
      `치트 추첨 완료 · ${value.toLocaleString("en-US")}`;
  } else if (pattern && settings.rareEffects) {
    statusElement.textContent =
      `특별한 패턴 발견! · ${value.toLocaleString("en-US")}`;
  } else {
    statusElement.textContent =
      `추첨 완료 · ${value.toLocaleString("en-US")}`;
  }

  isDrawing = false;
  setButtonsDisabled(false);

  if (autoRunning) {
    handleAutoAfterDraw(pattern);
  }
}

/* 즉각 뽑기 */
function drawInstantly() {
  if (isDrawing) return;

  isDrawing = true;
  clearRollTimers();
  resetNumberEffects();
  setButtonsDisabled(true);

  triggerButtonImpact(instantButton);

  const result = getNextResult();
  finishDraw(result);
}

/* =====================================
   느리고 부드러운 숫자 롤링
===================================== */

function drawWithAnimation() {
  if (isDrawing) return;

  isDrawing = true;
  clearRollTimers();
  resetNumberEffects();
  setButtonsDisabled(true);

  triggerButtonImpact(drawButton);
  statusElement.textContent = "숫자를 추첨하는 중...";

  digitElements.forEach(digit => {
    digit.style.display = "inline-block";
    digit.classList.add("rolling");
  });

  const result = getNextResult();

  // 1이 가장 느리고, 5가 가장 빠르다.
  const speedSettings = {
    1: { start: 1900, interval: 850, spin: 100 },
    2: { start: 1500, interval: 650, spin: 85 },
    3: { start: 1200, interval: 500, spin: 70 },
    4: { start: 900, interval: 380, spin: 60 },
    5: { start: 650, interval: 300, spin: 50 }
  };

  const timing = speedSettings[settings.speed];

  digitElements.forEach((digit, index) => {
    // 각 자리의 롤링은 추첨 연출용이다.
    const intervalId = setInterval(() => {
      digit.textContent = String(Math.floor(Math.random() * 10));
    }, timing.spin);

    rollIntervals.push(intervalId);

    const stopId = setTimeout(() => {
      clearInterval(intervalId);

      digit.classList.remove("rolling");
      digit.textContent = result[index];

      // 브라우저가 Web Animations API를 지원할 때만 사용
      if (typeof digit.animate === "function") {
        digit.animate(
          [
            { transform: "translateY(-5px) scale(0.98)" },
            { transform: "translateY(2px) scale(1.035)" },
            { transform: "translateY(0) scale(1)" }
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.2, .8, .25, 1)"
          }
        );
      }

      if (index === DIGITS - 1) {
        scheduleRollTimeout(() => {
          finishDraw(result);
        }, 400);
      }
    }, timing.start + index * timing.interval);

    rollTimeouts.push(stopId);
  });
}

/* =====================================
   자동 뽑기
===================================== */

function openAutoSettings() {
  if (autoRunning) {
    stopAutoDraw("자동 뽑기를 중지했어.");
    return;
  }

  autoOverlay.hidden = false;
  autoButton.setAttribute("aria-expanded", "true");
  autoMessage.textContent = "설정을 정한 다음 자동 뽑기를 시작해 봐.";
  closeAutoButton.focus();
}

function closeAutoSettings() {
  autoOverlay.hidden = true;
  autoButton.setAttribute("aria-expanded", "false");
  autoButton.focus();
}

function getSelectedAutoRarities() {
  return Array.from(
    document.querySelectorAll('input[name="auto-stop-rarity"]:checked')
  ).map(input => input.value);
}

function startAutoDraw() {
  autoLimitMode =
    document.querySelector('input[name="auto-limit-mode"]:checked')?.value ||
    "duration";

  const duration = Number(autoDurationInput.value);
  const count = Number(autoCountInput.value);

  if (
    autoLimitMode === "duration" &&
    (!Number.isInteger(duration) || duration < 1 || duration > 3600)
  ) {
    autoMessage.textContent =
      "지속시간은 1초부터 3600초 사이의 정수로 입력해 줘.";
    return;
  }

  if (
    autoLimitMode === "count" &&
    (!Number.isInteger(count) || count < 1 || count > 100000)
  ) {
    autoMessage.textContent =
      "추첨 횟수는 1회부터 100,000회 사이의 정수로 입력해 줘.";
    return;
  }

  autoMode =
    document.querySelector('input[name="auto-mode"]:checked')?.value ||
    "animated";

  autoStopRarities = getSelectedAutoRarities();
  autoRunning = true;
  autoTargetCount = count;
  autoCompletedCount = 0;
  autoResults = [];
  autoRareResults = [];
  autoStopReason = "";

  autoEndsAt =
    autoLimitMode === "duration"
      ? Date.now() + duration * 1000
      : Infinity;

  if (autoNextTimeout !== null) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  autoButton.innerHTML =
    '<span class="button-icon">■</span> 자동 뽑기 중지';

  autoButton.classList.add("auto-running");

  closeAutoSettings();

  statusElement.textContent = autoLimitMode === "count"
    ? `자동 뽑기 시작 · ${count.toLocaleString("en-US")}회 추첨`
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

  autoButton.innerHTML =
    '<span class="button-icon">⟳</span> 자동 뽑기';

  autoButton.classList.remove("auto-running");

  setButtonsDisabled(isDrawing);
  statusElement.textContent = message;
  showAutoSummary(message);
}

function runNextAutoDraw() {
  if (!autoRunning) return;

  if (autoLimitMode === "duration" && Date.now() >= autoEndsAt) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  if (autoLimitMode === "count" && autoCompletedCount >= autoTargetCount) {
    stopAutoDraw(
      `설정한 ${autoTargetCount.toLocaleString("en-US")}회 추첨을 완료했어!`
    );
    return;
  }

  if (isDrawing) {
    autoNextTimeout = setTimeout(runNextAutoDraw, 100);
    return;
  }

  if (autoMode === "instant") {
    drawInstantly();
  } else {
    drawWithAnimation();
  }
}

function handleAutoAfterDraw(pattern) {
  if (!autoRunning) return;

  if (pattern && autoStopRarities.includes(pattern.level)) {
    stopAutoDraw(
      `${pattern.detail} 등급이 나와 자동 뽑기를 멈췄어!`
    );
    return;
  }

  if (autoLimitMode === "duration" && Date.now() >= autoEndsAt) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  if (autoLimitMode === "count" && autoCompletedCount >= autoTargetCount) {
    stopAutoDraw(
      `설정한 ${autoTargetCount.toLocaleString("en-US")}회 추첨을 완료했어!`
    );
    return;
  }

  // 즉각 모드에서도 잠깐 간격을 둬 브라우저가 멈추지 않도록 한다.
  autoNextTimeout = setTimeout(
    runNextAutoDraw,
    autoMode === "instant" ? 120 : 100
  );
}

autoButton.addEventListener("click", openAutoSettings);
closeAutoButton.addEventListener("click", closeAutoSettings);
cancelAutoButton.addEventListener("click", closeAutoSettings);
startAutoButton.addEventListener("click", startAutoDraw);

autoOverlay.addEventListener("click", event => {
  if (event.target === autoOverlay) {
    closeAutoSettings();
  }
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (!autoOverlay.hidden) closeAutoSettings();
  if (!statisticsOverlay.hidden) closeStatistics();
  if (!autoSummaryOverlay.hidden) closeAutoSummary();
});

/* =====================================
   희귀도 표
===================================== */

function openRarity() {
  rarityOverlay.hidden = false;
  rarityButton.setAttribute("aria-expanded", "true");
  closeRarityButton.focus();
}

function closeRarity() {
  rarityOverlay.hidden = true;
  rarityButton.setAttribute("aria-expanded", "false");
  rarityButton.focus();
}

rarityButton.addEventListener("click", openRarity);
closeRarityButton.addEventListener("click", closeRarity);

rarityOverlay.addEventListener("click", event => {
  if (event.target === rarityOverlay) {
    closeRarity();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !rarityOverlay.hidden) {
    closeRarity();
  }
});

drawButton.addEventListener("click", drawWithAnimation);
instantButton.addEventListener("click", drawInstantly);

/* =====================================
   배경 파티클
===================================== */

const canvas = $("particles");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  backgroundParticles = Array.from(
    { length: settings.particles },
    () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 1.8,
      speed: 0.12 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: 0.15 + Math.random() * 0.45
    })
  );
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  for (const particle of backgroundParticles) {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -5) {
      particle.y = height + 5;
      particle.x = Math.random() * width;
    }

    if (particle.x < -5) {
      particle.x = width + 5;
    }

    if (particle.x > width + 5) {
      particle.x = -5;
    }

    ctx.beginPath();
    ctx.arc(
      particle.x,
      particle.y,
      particle.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(183, 124, 255, ${particle.alpha})`;

    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(155, 83, 255, 0.55)";
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", resizeCanvas);

/* =====================================
   기록 저장 및 복원
===================================== */

function saveProgress() {
  const snapshot = {
    history,
    rareHistory,
    totalDraws,
    highestNumber,
    lowestNumber,
    lastResult,
    drawStats
  };

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Violet Random 기록 저장 실패:", error);
  }
}

function restoreProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return;

    history = Array.isArray(saved.history)
      ? saved.history.filter(Number.isFinite).slice(0, HISTORY_LIMIT)
      : [];

    rareHistory = Array.isArray(saved.rareHistory)
      ? saved.rareHistory
          .filter(
            item =>
              item &&
              Number.isFinite(item.value) &&
              item.pattern &&
              item.pattern.level
          )
          .slice(0, HISTORY_LIMIT)
      : [];

    totalDraws = Number.isFinite(saved.totalDraws)
      ? Math.max(0, saved.totalDraws)
      : 0;

    highestNumber = Number.isFinite(saved.highestNumber)
      ? saved.highestNumber
      : null;

    lowestNumber = Number.isFinite(saved.lowestNumber)
      ? saved.lowestNumber
      : null;

    lastResult =
      typeof saved.lastResult === "string" &&
      /^\d{7}$/.test(saved.lastResult)
        ? saved.lastResult
        : "0000000";

    if (saved.drawStats && typeof saved.drawStats === "object") {
      ["odd", "even", "prime", "composite", "total", "sum"].forEach(key => {
        if (Number.isFinite(saved.drawStats[key])) {
          drawStats[key] = saved.drawStats[key];
        }
      });

      ["digits", "lastDigits", "rarities"].forEach(group => {
        if (
          saved.drawStats[group] &&
          typeof saved.drawStats[group] === "object"
        ) {
          Object.keys(drawStats[group]).forEach(key => {
            const value = saved.drawStats[group][key];

            if (Number.isFinite(value)) {
              drawStats[group][key] = value;
            }
          });
        }
      });
    }
  } catch (error) {
    console.warn("Violet Random 기록 복원 실패:", error);
  }
}

/* =====================================
   비밀번호 보호 기능
===================================== */

function requestProtectedAccess(action) {
  pendingProtectedAction = action;
  passwordInput.value = "";
  passwordMessage.textContent = "비밀번호를 입력해 줘.";
  passwordOverlay.hidden = false;
  passwordInput.focus();
}

function closePassword() {
  passwordOverlay.hidden = true;
  pendingProtectedAction = null;
  passwordInput.value = "";
}

function submitPassword() {
  if (passwordInput.value !== FEATURE_PASSWORD) {
    passwordMessage.textContent = "비밀번호가 틀렸어. 사용할 수 없어.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  const action = pendingProtectedAction;
  closePassword();

  if (action === "cheat") {
    openCheatPanel();
  }

  if (action === "turbo") {
    turboOverlay.hidden = false;
    turboButton.setAttribute("aria-expanded", "true");
    turboMessage.textContent = "실행하면 결과 요약이 표시돼.";
    closeTurboButton.focus();
  }
}

submitPasswordButton.addEventListener("click", submitPassword);

passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    submitPassword();
  }
});

closePasswordButton.addEventListener("click", closePassword);
cancelPasswordButton.addEventListener("click", closePassword);

passwordOverlay.addEventListener("click", event => {
  if (event.target === passwordOverlay) {
    closePassword();
  }
});

/* =====================================
   희귀 연출 선택
===================================== */

function openReplay() {
  replayOverlay.hidden = false;
  replayButton.setAttribute("aria-expanded", "true");
  replayMessage.textContent = "보고 싶은 연출을 선택해 줘.";
  closeReplayButton.focus();
}

function closeReplay() {
  replayOverlay.hidden = true;
  replayButton.setAttribute("aria-expanded", "false");
  replayButton.focus();
}

replayButton.addEventListener("click", openReplay);
closeReplayButton.addEventListener("click", closeReplay);

replayOverlay.addEventListener("click", event => {
  if (event.target === replayOverlay) {
    closeReplay();
  }
});

document.querySelectorAll("[data-preview-rarity]").forEach(button => {
  button.addEventListener("click", () => {
    const level = button.dataset.previewRarity;
    const label = button.querySelector(".rarity-badge")?.textContent?.trim();

    if (!level || !label) return;

    pendingEffectOverride = {
      title: `✦ ${label.toUpperCase()} EFFECT ✦`,
      level,
      detail: label
    };

    document.querySelectorAll("[data-preview-rarity]").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    replayMessage.textContent =
      `${label} 연출을 선택했어. 창을 닫고 다음 숫자를 뽑으면 그 숫자에 이 연출이 적용돼!`;

    closeReplay();

    statusElement.textContent =
      `다음 추첨에 ${label} 연출이 예약됐어.`;
  });
});

/* =====================================
   초고속 추첨
===================================== */

turboButton.addEventListener("click", () => {
  requestProtectedAccess("turbo");
});

function closeTurbo() {
  turboOverlay.hidden = true;
  turboButton.setAttribute("aria-expanded", "false");
  turboButton.focus();
}

closeTurboButton.addEventListener("click", closeTurbo);
cancelTurboButton.addEventListener("click", closeTurbo);

turboOverlay.addEventListener("click", event => {
  if (event.target === turboOverlay) {
    closeTurbo();
  }
});

function runTurboDraw() {
  if (isDrawing || autoRunning) {
    turboMessage.textContent =
      "일반 추첨이나 자동 뽑기가 실행 중일 때는 사용할 수 없어.";
    return;
  }

  const count = Number(turboCountInput.value);

  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    turboMessage.textContent =
      "추첨 횟수는 1회부터 10,000회 사이의 정수로 입력해 줘.";
    return;
  }

  const results = [];
  const rareResults = [];

  let localMax = -Infinity;
  let localMin = Infinity;
  let sum = 0;

  startTurboButton.disabled = true;
  turboMessage.textContent = `${count.toLocaleString("en-US")}회 추첨 중...`;

  // 일괄 처리하므로 중간 애니메이션은 생략하지만 모든 결과는 통계와 기록에 반영한다.
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

    if (pattern) {
      rareHistory.unshift({ value, pattern });
      rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
      rareResults.push({ value, pattern });
    }

    totalDraws++;

    if (highestNumber === null || value > highestNumber) {
      highestNumber = value;
    }

    if (lowestNumber === null || value < lowestNumber) {
      lowestNumber = value;
    }

    trackDrawStatistics(result, {
      render: false,
      persist: false
    });
  }

  const finalResult =
    String(results[results.length - 1]).padStart(DIGITS, "0");

  lastResult = finalResult;

  setDisplayedNumber(finalResult, true);
  digitCountLabel.textContent = getDigitCountLabel(finalResult);
  updateNumberInfo(finalResult);

  const finalPattern = getRarePattern(finalResult);
  triggerNextResultEffect(finalPattern, finalResult);

  renderHistory();
  renderRareHistory();
  updateAverage();
  updateStatistics();
  renderStatistics();
  saveProgress();

  autoCompletedCount = count;
  autoResults = results;
  autoRareResults = rareResults;

  statusElement.textContent =
    `초고속 추첨 완료 · ${count.toLocaleString("en-US")}회`;

  turboMessage.textContent =
    `완료! 평균 ${Math.round(sum / count).toLocaleString("en-US")} · 최댓값 ${localMax.toLocaleString("en-US")} · 최솟값 ${localMin.toLocaleString("en-US")}`;

  startTurboButton.disabled = false;
  closeTurbo();

  showAutoSummary(`초고속 추첨 ${count.toLocaleString("en-US")}회 완료!`);
}

startTurboButton.addEventListener("click", runTurboDraw);

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (!passwordOverlay.hidden) closePassword();
  if (!replayOverlay.hidden) closeReplay();
  if (!turboOverlay.hidden) closeTurbo();
});

/* =====================================
   초기화
===================================== */

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

animateParticles();
