"use strict";

const DIGITS = 7;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";
const PROGRESS_KEY = "violetRandomProgress";
const RARE_HISTORY_FILTER_KEY = "violetRandomRareHistoryFilter";
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
const statisticsOverlay = $("statistics-overlay");
const closeStatisticsButton = $("close-statistics");
const autoSummaryOverlay = $("auto-summary-overlay");
const closeAutoSummaryButton = $("close-auto-summary");
const closeSummaryDoneButton = $("close-summary-done");
const rareHistoryList = $("rare-history-list");
const rareHistoryFilterButton = $("rare-history-filter-button");
const rareHistoryFilterPanel = $("rare-history-filter");
const rareHistoryFilterCloseButton = $("rare-history-filter-close");
const rareHistoryFilterAllButton = $("rare-history-filter-all");
const rareHistoryFilterNoneButton = $("rare-history-filter-none");
const rareHistoryFilterInputs = Array.from(
  document.querySelectorAll('input[name="rare-history-rarity"]')
);
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
    ultimate: 0,
    "reverse-special": 0,
    special: 0,
    jackpot: 0,
    eclipse: 0,
    transcendent: 0,
    singularity: 0,
    radiant: 0,
    aurora: 0,
    hallow: 0,
    paradox: 0,
    legendary: 0,
    mythic: 0,
    seraph: 0,
    phantom: 0,
    glorious: 0,
    rare: 0,
    uncommon: 0,
    common: 0
  }
};

const RARITY_ORDER = [
  "ultimate",
  "reverse-special",
  "special",
  "jackpot",
  "eclipse",
  "transcendent",
  "singularity",
  "radiant",
  "aurora",
  "hallow",
  "paradox",
  "legendary",
  "mythic",
  "seraph",
  "phantom",
  "glorious",
  "rare",
  "uncommon",
  "common"
];

let pendingEffectOverride = null;

const DEFAULT_RARE_HISTORY_LEVELS = new Set(
  RARITY_ORDER.filter(level => level !== "common")
);

let rareHistoryLevels = loadRareHistoryLevels();

function loadRareHistoryLevels() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(RARE_HISTORY_FILTER_KEY) || "null"
    );

    if (!Array.isArray(saved)) {
      return new Set(DEFAULT_RARE_HISTORY_LEVELS);
    }

    return new Set(
      saved.filter(
        level => RARITY_ORDER.includes(level) && level !== "common"
      )
    );
  } catch {
    return new Set(DEFAULT_RARE_HISTORY_LEVELS);
  }
}

function getSelectedRareHistoryLevels() {
  if (!rareHistoryFilterInputs.length) {
    return new Set(DEFAULT_RARE_HISTORY_LEVELS);
  }

  return new Set(
    rareHistoryFilterInputs
      .filter(input => input.checked)
      .map(input => input.value)
  );
}

function applyRareHistoryFilterControls() {
  if (!rareHistoryFilterInputs.length) return;

  rareHistoryFilterInputs.forEach(input => {
    input.checked = rareHistoryLevels.has(input.value);
  });
}

function saveRareHistoryLevels() {
  rareHistoryLevels = getSelectedRareHistoryLevels();

  try {
    localStorage.setItem(
      RARE_HISTORY_FILTER_KEY,
      JSON.stringify([...rareHistoryLevels])
    );
  } catch (error) {
    console.warn("Violet Random 희귀 기록 설정 저장 실패:", error);
  }

  renderRareHistory();
}

function openRareHistoryFilter() {
  if (!rareHistoryFilterPanel || !rareHistoryFilterButton) return;

  rareHistoryFilterPanel.hidden = false;
  rareHistoryFilterButton.setAttribute("aria-expanded", "true");
  rareHistoryFilterCloseButton?.focus();
}

function closeRareHistoryFilter() {
  if (!rareHistoryFilterPanel || !rareHistoryFilterButton) return;

  rareHistoryFilterPanel.hidden = true;
  rareHistoryFilterButton.setAttribute("aria-expanded", "false");
  rareHistoryFilterButton.focus();
}

if (rareHistoryFilterInputs.length) {
  applyRareHistoryFilterControls();

  rareHistoryFilterInputs.forEach(input => {
    input.addEventListener("change", saveRareHistoryLevels);
  });

  rareHistoryFilterAllButton?.addEventListener("click", () => {
    rareHistoryFilterInputs.forEach(input => {
      input.checked = true;
    });

    saveRareHistoryLevels();
  });

  rareHistoryFilterNoneButton?.addEventListener("click", () => {
    rareHistoryFilterInputs.forEach(input => {
      input.checked = false;
    });

    saveRareHistoryLevels();
  });

  rareHistoryFilterButton?.addEventListener(
    "click",
    openRareHistoryFilter
  );

  rareHistoryFilterCloseButton?.addEventListener(
    "click",
    closeRareHistoryFilter
  );

  rareHistoryFilterPanel?.addEventListener("click", event => {
    if (event.target === rareHistoryFilterPanel) {
      closeRareHistoryFilter();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      rareHistoryFilterPanel &&
      !rareHistoryFilterPanel.hidden
    ) {
      closeRareHistoryFilter();
    }
  });
}

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

  gain.gain.setValueAtTime(0.0004, start);

  const louderVolume = Math.min(
    0.45,
    Math.max(0.0004, volume * 5.8)
  );

  gain.gain.exponentialRampToValueAtTime(
    louderVolume,
    start + 0.012
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0004,
    start + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playUiClick() {
  playTone(620, 0.055, "triangle", 0.08);
  playTone(840, 0.045, "sine", 0.05, 0.025);
}

function playRaritySound(level) {
  const sounds = {
    common: [[420, 0.07, "sine"]],
    uncommon: [[520, 0.09, "triangle"]],
    rare: [
      [580, 0.09, "triangle"],
      [760, 0.12, "sine", 0.05, 0.055]
    ],
    glorious: [
      [490, 0.13, "sine"],
      [660, 0.13, "sine", 0.07, 0.08],
      [880, 0.18, "triangle", 0.06, 0.16]
    ],
    mythic: [
      [440, 0.18, "sine"],
      [587, 0.2, "triangle", 0.07, 0.09],
      [784, 0.24, "sine", 0.06, 0.2]
    ],
    legendary: [
      [660, 0.13, "triangle"],
      [880, 0.16, "sine", 0.08, 0.08],
      [1175, 0.23, "triangle", 0.07, 0.17]
    ],
    phantom: [
      [330, 0.2, "sine"],
      [494, 0.22, "triangle", 0.06, 0.1],
      [370, 0.25, "sine", 0.05, 0.22]
    ],
    aurora: [
      [523, 0.18, "sine"],
      [659, 0.2, "sine", 0.07, 0.09],
      [784, 0.23, "triangle", 0.06, 0.18],
      [1047, 0.28, "sine", 0.05, 0.29]
    ],
    seraph: [
      [784, 0.16, "sine"],
      [988, 0.2, "triangle", 0.08, 0.08],
      [1175, 0.25, "sine", 0.07, 0.17],
      [1568, 0.32, "triangle", 0.06, 0.29]
    ],
    eclipse: [
      [220, 0.22, "sawtooth", 0.07],
      [330, 0.24, "triangle", 0.06, 0.1],
      [660, 0.3, "sine", 0.07, 0.23]
    ],
    ultimate: [
      [392, 0.2, "sine"],
      [587, 0.22, "triangle", 0.08, 0.09],
      [784, 0.25, "sine", 0.08, 0.18],
      [1175, 0.32, "triangle", 0.08, 0.28]
    ],
    jackpot: [
      [880, 0.1, "square", 0.05],
      [1175, 0.13, "triangle", 0.07, 0.07],
      [1568, 0.2, "sine", 0.08, 0.15]
    ],
    special: [
      [659, 0.12, "triangle"],
      [880, 0.18, "sine", 0.07, 0.09]
    ],
    "reverse-special": [
      [880, 0.1, "triangle"],
      [659, 0.12, "triangle", 0.07, 0.08],
      [440, 0.2, "sine", 0.06, 0.17]
    ],
    transcendent: [
      [523, 0.18, "sine"],
      [784, 0.2, "triangle", 0.1, 0.08],
      [1047, 0.24, "sine", 0.1, 0.17],
      [1568, 0.38, "triangle", 0.09, 0.27]
    ],
    singularity: [
      [110, 0.28, "sine", 0.1],
      [220, 0.3, "triangle", 0.09, 0.09],
      [440, 0.32, "sawtooth", 0.07, 0.2],
      [880, 0.4, "sine", 0.1, 0.31]
    ],
    radiant: [
      [784, 0.13, "triangle"],
      [988, 0.16, "sine", 0.1, 0.06],
      [1319, 0.22, "triangle", 0.1, 0.13],
      [1760, 0.36, "sine", 0.09, 0.21]
    ],
    hallow: [
      [392, 0.16, "triangle"],
      [523, 0.18, "triangle", 0.1, 0.06],
      [659, 0.22, "sine", 0.1, 0.13],
      [1047, 0.36, "triangle", 0.1, 0.22]
    ],
    paradox: [
      [740, 0.13, "triangle"],
      [494, 0.17, "sine", 0.09, 0.06],
      [831, 0.18, "triangle", 0.09, 0.13],
      [554, 0.28, "sine", 0.08, 0.21]
    ]
  };

  (sounds[level] || sounds.common).forEach(
    ([frequency, duration, type, volume = 0.07, delay = 0]) => {
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
   설정 관리
===================================== */

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(saved);
    return {
      particles: clamp(parsed.particles, 0, 150, 65),
      speed: clamp(parsed.speed, 1, 5, 2),
      effect: clamp(parsed.effect, 0, 3, 2),
      rareEffects: typeof parsed.rareEffects === "boolean" ? parsed.rareEffects : true,
      theme: parsed.theme === "light" ? "light" : "dark"
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
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

  const speedNames = { 1: "아주 느리게", 2: "느리게", 3: "보통", 4: "빠르게", 5: "아주 빠르게" };
  const effectNames = { 0: "없음", 1: "약하게", 2: "보통", 3: "강하게" };

  speedValue.textContent = speedNames[speedSetting.value];
  effectValue.textContent = effectNames[effectSetting.value];
  themeValue.textContent = themeSetting.value === "light" ? "라이트 모드" : "다크 모드";
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    settingsMessage.textContent = "설정을 저장했어! 💜";
    return true;
  } catch {
    settingsMessage.textContent = "설정 저장에 실패했어.";
    return false;
  }
}

function applySettings() {
  updateSettingLabels();
  document.body.classList.toggle("light-mode", settings.theme === "light");
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
  if (event.target === settingsOverlay) closeSettings();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !settingsOverlay.hidden) closeSettings();
});

[particleSetting, speedSetting, effectSetting, rareSetting, themeSetting].forEach(control => {
  control.addEventListener("input", () => {
    readSettingsControls();
    applySettings();
    settingsMessage.textContent = "미리 보는 중이야. 저장 버튼을 누르면 유지돼.";
  });
});

saveSettingsButton.addEventListener("click", () => {
  readSettingsControls();
  applySettings();
  if (saveSettings()) closeSettings();
});

resetSettingsButton.addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  populateSettingsControls();
  applySettings();
  settingsMessage.textContent = "기본값으로 바꿨어. 저장 버튼을 눌러 적용해 줘.";
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
  if (event.target === cheatOverlay) closeCheat();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !cheatOverlay.hidden) closeCheat();
});

applyCheatButton.addEventListener("click", () => {
  const raw = cheatNumberInput.value.trim();
  const value = Number(raw);

  if (raw === "" || !Number.isInteger(value) || value < 0 || value > 9999999) {
    cheatMessage.textContent = "0부터 9,999,999 사이의 정수를 입력해 줘.";
    return;
  }

  queuedCheatNumber = String(value).padStart(DIGITS, "0");
  cheatMessage.textContent = `설정 완료! 다음 추첨에서 ${value.toLocaleString("en-US")}이(가) 나와.`;
});

clearCheatButton.addEventListener("click", () => {
  queuedCheatNumber = null;
  cheatNumberInput.value = "";
  cheatMessage.textContent = "치트를 해제했어. 이제 무작위 숫자가 나와.";
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

function secureRandomNumber() {
  const RANGE = 10_000_000;
  const MAX = 0x100000000;
  const LIMIT = Math.floor(MAX / RANGE) * RANGE;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= LIMIT);

  return String(buffer[0] % RANGE).padStart(DIGITS, "0");
}

/* =====================================
   비밀번호 보안 인증 관리
===================================== */

function requestProtectedAccess(actionType) {
  pendingProtectedAction = actionType;
  passwordInput.value = "";
  passwordMessage.textContent = "비밀번호를 입력해 줘.";
  passwordOverlay.hidden = false;
  passwordInput.focus();
}

function closePasswordOverlay() {
  passwordOverlay.hidden = true;
  pendingProtectedAction = null;
}

submitPasswordButton.addEventListener("click", () => {
  if (passwordInput.value === FEATURE_PASSWORD) {
    const action = pendingProtectedAction;
    closePasswordOverlay();

    if (action === "cheat") openCheatPanel();
  } else {
    passwordMessage.textContent = "비밀번호가 틀렸어! 다시 확인해 봐.";
    passwordInput.focus();
  }
});

closePasswordButton.addEventListener("click", closePasswordOverlay);
cancelPasswordButton.addEventListener("click", closePasswordOverlay);
passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") submitPasswordButton.click();
});

/* =====================================
   롤링 애니메이션 및 추첨 코어
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
    "impact", "rare", "rare-legendary", "rare-glorious", "rare-uncommon",
    "rare-ultimate", "rare-jackpot", "rare-special", "rare-reverse-special",
    "rare-mythic", "rare-eclipse", "rare-transcendent", "rare-singularity",
    "rare-radiant", "rare-aurora", "rare-hallow", "rare-paradox",
    "rare-seraph", "rare-phantom",
    "rarity-transcendent-impact", "rarity-singularity-impact",
    "rarity-paradox-impact", "rarity-hallow-impact",
    "rarity-radiant-impact", "rarity-uncommon-impact", "rarity-rare-impact",
    "rarity-glorious-impact", "rarity-legendary-impact", "rarity-ultimate-impact",
    "rarity-jackpot-impact", "rarity-special-impact", "rarity-reverse-special-impact",
    "rarity-mythic-impact", "rarity-eclipse-impact", "rarity-phantom-impact",
    "rarity-aurora-impact", "rarity-seraph-impact",
    "magnitude-6", "magnitude-5", "magnitude-4",
    "magnitude-3", "magnitude-2", "magnitude-1"
  );
  rareLabel.textContent = "";
  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
    digit.style.display = "inline-block";
  });
}

function setDisplayedNumber(value) {
  digitElements.forEach((digit, index) => {
    digit.textContent = value[index];
    digit.style.display = "inline-block";
    digit.classList.remove("rolling");
  });
}

/* =====================================
   희귀 패턴 및 통계
===================================== */

function getRarePattern(value) {
  const normalized = String(Number(value));
  const digits = normalized.split("");
  const length = normalized === "0" ? 0 : normalized.length;
  const result = (title, level, detail = title) => ({ title, level, detail });

  const exclusiveNumbers = {
    "3141592": ["✦ 원주율 · π의 숫자 배열 ✦", "transcendent", "원주율"],
    "2718281": ["✦ e · 자연로그의 밑 ✦", "singularity", "e"],
    "1618033": ["✦ PARADOX · 황금비 숫자 배열 ✦", "paradox", "Paradox"],
    "1020304": ["✦ HALLOW · 일정 간격의 0 ✦", "hallow", "Hallow"],
    "3142314": ["✦ PARADOX · 대칭 반복 구조 ✦", "paradox", "Paradox"],
    "5831047": ["✦ 황금빛 · 고유 숫자 조합 ✦", "radiant", "황금빛"]
  };

  if (exclusiveNumbers[normalized]) {
    const [title, level, detail] = exclusiveNumbers[normalized];
    return result(title, level, detail);
  }

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

  if (length === 7 && ["2345678", "3456789", "8765432", "9876543"].includes(normalized)) {
    return result("✧ AURORA · 연속 숫자 ✧", "aurora", "Aurora");
  }

  if (
    length === 7 &&
    new Set(digits).size === 7 &&
    [35, 42].includes(digits.reduce((sum, d) => sum + Number(d), 0))
  ) {
    return result("✦ SERAPH · 완전 무중복 ✦", "seraph", "Seraph");
  }

  if (length === 7 && normalized === normalized.split("").reverse().join("")) {
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

  if (longestRun >= 7) return result("✦ LEGENDARY · 7연속 반복 ✦", "legendary", "Legendary");
  if (longestRun === 6) return result("✦ GLORIOUS · 6연속 반복 ✦", "glorious", "Glorious");
  if (longestRun >= 3 && longestRun <= 5) return result("✧ RARE · 연속 반복 ✧", "rare", "Rare");

  if (length === 0) return result("✦ ULTIMATE ✦", "ultimate", "Ultimate");
  if (length === 1) return result("✦ LEGENDARY ✦", "legendary", "Legendary");
  if (length === 2) return result("✦ GLORIOUS ✦", "glorious", "Glorious");
  if (length >= 3 && length <= 5) return result("✧ RARE ✧", "rare", "Rare");
  if (length === 6) return result("✧ UNCOMMON ✧", "uncommon", "Uncommon");

  return null;
}

function getDigitCountLabel(value) {
  const normalized = String(Number(value));
  const length = normalized === "0" ? 0 : normalized.length;
  const pattern = getRarePattern(normalized);
  const countText = length === 0 ? "0자리 수" : `${length}자리 수`;
  return pattern ? `${countText} · ${pattern.detail}` : countText;
}

function isPrime(number) {
  if (!Number.isInteger(number) || number < 2) return false;
  if (number === 2) return true;
  if (number % 2 === 0) return false;
  for (let d = 3; d * d <= number; d += 2) {
    if (number % d === 0) return false;
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
    divisorStatus.textContent = `약수: 1, ${number.toLocaleString("en-US")}`;
  } else if (number < 2) {
    primeStatus.textContent = "소수 아님";
    divisorStatus.textContent = "소수는 2 이상의 자연수 중에서 찾아";
  } else {
    primeStatus.textContent = "소수 아님 · 합성수";
    divisorStatus.textContent = "약수가 2개보다 많아";
  }
}

/* =====================================
   파티클 및 연출 이펙트
===================================== */

function createBurst(x, y, count = 30, distance = 150, kind = "normal") {
  if (settings.effect === 0) return;

  const multiplier = settings.effect / 2;
  const actualCount = Math.max(1, Math.round(count * multiplier));
  const actualDistance = distance * (0.55 + multiplier * 0.35);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < actualCount; i++) {
    const particle = document.createElement("span");
    const isStar = Math.random() < 0.38;

    particle.className = isStar ? "burst-particle star" : "burst-particle";
    if (isStar) {
      particle.textContent = Math.random() < 0.5 ? "✦" : "✧";
      if (kind === "legendary") particle.classList.add("gold-star");
      else if (kind === "rare") particle.classList.add("rare-star");
    }

    const angle = Math.random() * Math.PI * 2;
    const travelDistance = actualDistance * (0.35 + Math.random() * 0.65);
    const dx = Math.cos(angle) * travelDistance;
    const dy = Math.sin(angle) * travelDistance;
    const size = isStar ? `${8 + Math.random() * 10 * multiplier}px` : `${2 + Math.random() * 4 * multiplier}px`;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);
    particle.style.setProperty("--size", size);
    particle.style.setProperty("--rotation", `${Math.random() * 360 - 180}deg`);
    particle.style.setProperty("--duration", `${500 + Math.random() * 500}ms`);

    particle.addEventListener("animationend", () => particle.remove(), { once: true });
    fragment.appendChild(particle);
  }

  effectsLayer.appendChild(fragment);
}

function triggerButtonImpact(button) {
  if (settings.effect === 0) return;
  const rect = button.getBoundingClientRect();
  createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15, 70, "normal");
}

function triggerResultImpact(pattern, result) {
  if (settings.effect === 0) return;

  const rect = numberBox.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const level = pattern?.level || "common";

  if (settings.rareEffects) {
    if (level === "legendary") {
      createBurst(x, y, 60, 220, "legendary");
      document.body.appendChild(createFlash("legendary"));
    } else if (level !== "common") {
      createBurst(x, y, 45, 180, "rare");
      document.body.appendChild(createFlash("rare"));
    } else {
      createBurst(x, y, 30, 140, "normal");
    }
  } else {
    createBurst(x, y, 30, 140, "normal");
  }
}

function createFlash(type) {
  const flash = document.createElement("div");
  flash.className = type === "legendary" ? "rare-flash legendary" : "rare-flash";
  flash.addEventListener("animationend", () => flash.remove(), { once: true });
  return flash;
}

/* =====================================
   추첨 실행 및 통계 반영
===================================== */

function performDraw(forceResult = null) {
  if (isDrawing) return;
  isDrawing = true;
  setButtonsDisabled(true);
  resetNumberEffects();

  const finalResult = forceResult !== null ? forceResult : getNextResult();
  const pattern = getRarePattern(finalResult);

  playRaritySound(pattern?.level || "common");

  const speedMultiplier = 6 - settings.speed;
  const totalSteps = 12 + settings.speed * 4;
  let step = 0;

  const intervalId = setInterval(() => {
    step++;
    const rollingStr = secureRandomNumber();
    setDisplayedNumber(rollingStr);

    if (step >= totalSteps) {
      clearInterval(intervalId);
      finalizeDraw(finalResult, pattern);
    }
  }, speedMultiplier * 22);

  rollIntervals.push(intervalId);
}

function finalizeDraw(finalResult, pattern) {
  isDrawing = false;
  setButtonsDisabled(false);
  setDisplayedNumber(finalResult);

  numberElement.classList.add("finished");
  numberBox.classList.add("impact");

  const effectivePattern = triggerNextResultEffect(pattern, finalResult);

  if (effectivePattern) {
    rareLabel.textContent = effectivePattern.title;
    numberBox.classList.add(
      effectivePattern.level === "legendary"
        ? "rare-legendary"
        : `rare-${effectivePattern.level}`
    );
  }

  digitCountLabel.textContent = getDigitCountLabel(finalResult);
  updateNumberInfo(finalResult);
  statusElement.textContent = lastDrawWasCheat ? "치트 적용됨 · 운명의 숫자" : "추첨 완료 · 행운이 함께하길 💜";

  recordDrawResult(finalResult, effectivePattern);
}

function recordDrawResult(value, pattern) {
  totalDraws++;
  lastResult = value;

  const num = Number(value);
  if (highestNumber === null || num > Number(highestNumber)) highestNumber = value;
  if (lowestNumber === null || num < Number(lowestNumber)) lowestNumber = value;

  history.unshift({ value, pattern, timestamp: Date.now() });
  if (history.length > HISTORY_LIMIT) history.pop();

  if (pattern && rareHistoryLevels.has(pattern.level)) {
    rareHistory.unshift({ value, pattern, timestamp: Date.now() });
    if (rareHistory.length > HISTORY_LIMIT) rareHistory.pop();
  }

  updateDrawStats(num, pattern);
  renderHistory();
  renderRareHistory();
  updateStatisticsPanel();
}

function updateDrawStats(num, pattern) {
  drawStats.total++;
  drawStats.sum += num;

  if (num % 2 === 0) drawStats.even++;
  else drawStats.odd++;

  if (isPrime(num)) drawStats.prime++;
  else drawStats.composite++;

  const lastDigit = String(num % 10);
  drawStats.lastDigits[lastDigit] = (drawStats.lastDigits[lastDigit] || 0) + 1;

  const level = pattern?.level || "common";
  drawStats.rarities[level] = (drawStats.rarities[level] || 0) + 1;
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<li class="empty-history">아직 추첨 기록이 없어!</li>';
    averageElement.textContent = "—";
    averageStatus.textContent = "10회 추첨 후 표시";
    maxNumberElement.textContent = "—";
    minNumberElement.textContent = "—";
    totalDrawsElement.textContent = totalDraws;
    return;
  }

  historyList.innerHTML = history.map((item, index) => {
    const isRare = item.pattern && item.pattern.level !== "common";
    const rareClass = isRare ? (item.pattern.level === "legendary" ? "rare-history-legendary" : "rare-history-item") : "";
    const mark = isRare ? `<span class="history-rare-mark">${item.pattern.detail}</span>` : "";

    return `
      <li class="${rareClass}">
        <span class="history-index">#${totalDraws - index}</span>
        <span class="history-number">${Number(item.value).toLocaleString("en-US")}</span>
        ${mark}
      </li>
    `;
  }).join("");

  if (history.length >= 1) {
    const sum = history.reduce((acc, cur) => acc + Number(cur.value), 0);
    const avg = Math.round(sum / history.length);
    averageElement.textContent = avg.toLocaleString("en-US");
    averageStatus.textContent = `최근 ${history.length}회 평균`;
  }

  maxNumberElement.textContent = highestNumber !== null ? Number(highestNumber).toLocaleString("en-US") : "—";
  minNumberElement.textContent = lowestNumber !== null ? Number(lowestNumber).toLocaleString("en-US") : "—";
  totalDrawsElement.textContent = totalDraws;
}

function renderRareHistory() {
  if (rareHistory.length === 0) {
    rareHistoryList.innerHTML = '<li class="empty-history">아직 희귀 숫자가 없어!</li>';
    return;
  }

  rareHistoryList.innerHTML = rareHistory.map((item, index) => `
    <li class="${item.pattern.level === "legendary" ? "rare-history-legendary" : "rare-history-item"}">
      <span class="history-index">#${index + 1}</span>
      <span class="history-number">${Number(item.value).toLocaleString("en-US")}</span>
      <span class="history-rare-mark">${item.pattern.detail}</span>
    </li>
  `).join("");
}

function updateStatisticsPanel() {
  if (drawStats.total === 0) return;

  $("odd-count").textContent = drawStats.odd.toLocaleString("en-US");
  $("odd-ratio").textContent = `${Math.round((drawStats.odd / drawStats.total) * 100)}%`;
  $("even-count").textContent = drawStats.even.toLocaleString("en-US");
  $("even-ratio").textContent = `${Math.round((drawStats.even / drawStats.total) * 100)}%`;
  $("prime-count").textContent = drawStats.prime.toLocaleString("en-US");
  $("prime-ratio").textContent = `${Math.round((drawStats.prime / drawStats.total) * 100)}%`;
  $("composite-count").textContent = drawStats.composite.toLocaleString("en-US");
  $("composite-ratio").textContent = `${Math.round((drawStats.composite / drawStats.total) * 100)}%`;

  $("overall-average").textContent = Math.round(drawStats.sum / drawStats.total).toLocaleString("en-US");
  $("statistics-max").textContent = highestNumber !== null ? Number(highestNumber).toLocaleString("en-US") : "—";
  $("statistics-min").textContent = lowestNumber !== null ? Number(lowestNumber).toLocaleString("en-US") : "—";

  const mostLastDigit = Object.entries(drawStats.lastDigits).reduce((max, cur) => cur[1] > max[1] ? cur : max, ["0", 0]);
  $("most-common-last-digit").textContent = mostLastDigit[1] > 0 ? `${mostLastDigit[0]} (끝자리)` : "—";
  $("most-common-last-digit-count").textContent = mostLastDigit[1] > 0 ? `${mostLastDigit[1]}회 출현` : "아직 기록 없음";

  $("statistics-total").textContent = `총 누적 추첨 횟수: ${drawStats.total.toLocaleString("en-US")}회`;
}

/* =====================================
   즉각 뽑기 및 이벤트 리스너
===================================== */

function instantDraw() {
  if (isDrawing) return;
  resetNumberEffects();
  const finalResult = getNextResult();
  const pattern = getRarePattern(finalResult);

  playRaritySound(pattern?.level || "common");
  setDisplayedNumber(finalResult);
  finalizeDraw(finalResult, pattern);
}

drawButton.addEventListener("click", () => {
  triggerButtonImpact(drawButton);
  performDraw();
});

instantButton.addEventListener("click", () => {
  triggerButtonImpact(instantButton);
  instantDraw();
});

/* =====================================
   모달 제어 및 배경 파티클
===================================== */

rarityButton.addEventListener("click", () => {
  rarityOverlay.hidden = false;
  rarityButton.setAttribute("aria-expanded", "true");
  closeRarityButton.focus();
});

closeRarityButton.addEventListener("click", () => {
  rarityOverlay.hidden = true;
  rarityButton.setAttribute("aria-expanded", "false");
  rarityButton.focus();
});

statisticsButton.addEventListener("click", () => {
  statisticsOverlay.hidden = false;
  statisticsButton.setAttribute("aria-expanded", "true");
  closeStatisticsButton.focus();
});

closeStatisticsButton.addEventListener("click", () => {
  statisticsOverlay.hidden = true;
  statisticsButton.setAttribute("aria-expanded", "false");
  statisticsButton.focus();
});

replayButton.addEventListener("click", () => {
  replayOverlay.hidden = false;
  replayButton.setAttribute("aria-expanded", "true");
  closeReplayButton.focus();
});

closeReplayButton.addEventListener("click", () => {
  replayOverlay.hidden = true;
  replayButton.setAttribute("aria-expanded", "false");
  replayButton.focus();
});

document.querySelectorAll("[data-preview-rarity]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-preview-rarity]").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    pendingEffectOverride = {
      level: btn.dataset.previewRarity,
      title: `✦ ${btn.querySelector(".rarity-badge").textContent} 연출 미리보기 ✦`,
      detail: btn.querySelector(".rarity-badge").textContent
    };
    replayMessage.textContent = `${btn.querySelector(".rarity-badge").textContent} 연출이 다음 추첨에 예약되었어! 창을 닫고 숫자를 뽑아 봐.`;
  });
});

$("clear-replay")?.addEventListener("click", () => {
  pendingEffectOverride = null;
  document.querySelectorAll("[data-preview-rarity]").forEach(b => b.classList.remove("selected"));
  replayMessage.textContent = "연출 예약을 해제했어.";
});

$("close-replay-done")?.addEventListener("click", () => {
  replayOverlay.hidden = true;
  replayButton.focus();
});

// Canvas Background Particles
const canvas = $("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initParticles() {
  backgroundParticles = Array.from({ length: settings.particles }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.5 + 0.2
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isLight = settings.theme === "light";
  ctx.fillStyle = isLight ? "rgba(110, 70, 160, 0.45)" : "rgba(180, 140, 255, 0.55)";

  backgroundParticles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}

// Initial setup
applySettings();
initParticles();
animateParticles();
