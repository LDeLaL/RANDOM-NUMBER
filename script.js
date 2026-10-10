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

