"use strict";

const DIGITS = 7;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";
const PROGRESS_KEY = "violetRandomProgress";
const RARE_HISTORY_FILTER_KEY = "violetRandomRareHistoryFilter";
const RARITY_SCHEMA_VERSION_KEY = "violetRandomRaritySchemaVersion";
let migrateLegacyRarityData = false;
try {
  const savedSchemaVersion = localStorage.getItem(RARITY_SCHEMA_VERSION_KEY);
  const existingSnapshot = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null");
  const savedRarityKeys = existingSnapshot?.drawStats?.rarities;
  const alreadyUsesCurrentTiers = savedRarityKeys &&
    Object.prototype.hasOwnProperty.call(savedRarityKeys, "pi") &&
    Object.prototype.hasOwnProperty.call(savedRarityKeys, "golden-light") &&
    Object.prototype.hasOwnProperty.call(savedRarityKeys, "apex");
  migrateLegacyRarityData = savedSchemaVersion !== "2" && !alreadyUsesCurrentTiers;
} catch {
  migrateLegacyRarityData = true;
}
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

const resetButton = $("reset-button");
const resetOverlay = $("reset-overlay");
const closeResetButton = $("close-reset");
const resetMessage = $("reset-message");
const resetConfirmOverlay = $("reset-confirm-overlay");
const resetConfirmTitle = $("reset-confirm-title");
const resetConfirmDescription = $("reset-confirm-description");
const resetConfirmInput = $("reset-confirm-input");
const resetConfirmMessage = $("reset-confirm-message");
const resetConfirmCloseButton = $("reset-confirm-close");
const resetConfirmCancelButton = $("reset-confirm-cancel");
const resetConfirmSubmitButton = $("reset-confirm-submit");
let pendingResetTarget = null;


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
  digits: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [String(i), 0])),
  lastDigits: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i), 0])),
  rarities: {
    ultimate: 0,
    "reverse-special": 0,
    special: 0,
    jackpot: 0,
    eclipse: 0,
    pi: 0,
    e: 0,
    "golden-light": 0,
    aurora: 0,
    hallow: 0,
    apex: 0,
    omniversal: 0,
    divine: 0,
    genesis: 0,
    celestial: 0,
    quantum: 0,
    paradox: 0,
    prismatic: 0,
    legendary: 0,
    mythic: 0,
    seraph: 0,
    phantom: 0,
    glorious: 0,
    rare: 0,
    noteworthy: 0,
    curious: 0,
    oddity: 0,
    uncommon: 0,
    common: 0
  }
};

const RARITY_ORDER = [
  "ultimate", "reverse-special", "special", "jackpot", "eclipse",
  "pi", "e", "golden-light", "aurora", "hallow", "apex",
  "omniversal", "divine", "genesis", "celestial", "quantum", "paradox",
  "prismatic", "legendary", "mythic", "seraph", "phantom", "glorious",
  "rare", "noteworthy", "curious", "oddity", "uncommon", "common"
];

const RARITY_LABELS = {
  ultimate: "Ultimate", "reverse-special": "Reverse Special", special: "Special",
  jackpot: "Jackpot", eclipse: "Eclipse", pi: "π", e: "e",
  "golden-light": "φ", aurora: "Aurora", hallow: "Hallow", apex: "Apex",
  omniversal: "Omniversal", divine: "Divine", genesis: "Genesis",
  celestial: "Celestial", quantum: "Quantum", paradox: "Paradox",
  prismatic: "Prismatic", legendary: "Legendary", mythic: "Mythic",
  seraph: "Seraph", phantom: "Phantom", glorious: "Glorious", rare: "Rare",
  noteworthy: "Noteworthy", curious: "Curious", oddity: "Oddity",
  uncommon: "Uncommon", common: "Common"
};

let pendingEffectOverride = null;

const DEFAULT_RARE_HISTORY_LEVELS = new Set(
  RARITY_ORDER.filter(level => level !== "common")
);

let rareHistoryLevels = loadRareHistoryLevels();

function migrateRarityLevel(level) {
  const legacyMap = {
    transcendent: "pi",
    singularity: "e",
    paradox: "golden-light",
    astral: "paradox",
    sovereign: "hallow"
  };
  const migrated = migrateLegacyRarityData ? (legacyMap[level] || level) : level;
  return RARITY_ORDER.includes(migrated) && migrated !== "common" ? migrated : null;
}

function loadRareHistoryLevels() {
  try {
    const saved = JSON.parse(localStorage.getItem(RARE_HISTORY_FILTER_KEY) || "null");
    if (!Array.isArray(saved)) return new Set(DEFAULT_RARE_HISTORY_LEVELS);

    const migrated = saved.map(migrateRarityLevel).filter(Boolean);
    const levels = new Set(migrated);
    // When upgrading an older filter, turn on the newly introduced tiers once.
    if (migrateLegacyRarityData) {
      ["pi", "e", "golden-light", "hallow", "apex", "omniversal", "divine",
        "genesis", "prismatic", "noteworthy", "curious", "oddity"].forEach(level => levels.add(level));
    }
    return levels;
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
  const filterMessage = $("rare-history-filter-message");
  if (filterMessage) filterMessage.textContent = `${rareHistoryLevels.size}개 희귀도 등급을 기록 대상으로 선택했어.`;
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

  gain.gain.setValueAtTime(0.0001, start);

  const louderVolume = Math.min(
    0.22,
    Math.max(0.0002, volume * 2.8)
  );

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
    ],

    transcendent: [
      [523, 0.18, "sine"],
      [784, 0.2, "triangle", 0.05, 0.08],
      [1047, 0.24, "sine", 0.05, 0.17],
      [1568, 0.38, "triangle", 0.045, 0.27]
    ],

    singularity: [
      [110, 0.28, "sine", 0.05],
      [220, 0.3, "triangle", 0.045, 0.09],
      [440, 0.32, "sawtooth", 0.035, 0.2],
      [880, 0.4, "sine", 0.05, 0.31]
    ],

    paradox: [
      [740, 0.13, "triangle"],
      [494, 0.17, "sine", 0.045, 0.06],
      [831, 0.18, "triangle", 0.045, 0.13],
      [554, 0.28, "sine", 0.04, 0.21]
    ],

    infinity: [
      [392, 0.2, "sine"],
      [587, 0.23, "sine", 0.045, 0.07],
      [784, 0.26, "triangle", 0.045, 0.14],
      [1175, 0.32, "sine", 0.04, 0.22]
    ],

    sovereign: [
      [392, 0.16, "triangle"],
      [523, 0.18, "triangle", 0.05, 0.06],
      [659, 0.22, "sine", 0.05, 0.13],
      [1047, 0.36, "triangle", 0.05, 0.22]
    ],

    celestial: [
      [587, 0.2, "sine"],
      [784, 0.22, "sine", 0.045, 0.08],
      [988, 0.26, "triangle", 0.045, 0.16],
      [1319, 0.34, "sine", 0.04, 0.25]
    ],

    ethereal: [
      [659, 0.24, "sine"],
      [880, 0.28, "sine", 0.04, 0.1],
      [1175, 0.32, "triangle", 0.04, 0.2],
      [988, 0.4, "sine", 0.035, 0.31]
    ],

    quantum: [
      [880, 0.1, "square", 0.035],
      [440, 0.14, "triangle", 0.045, 0.06],
      [1320, 0.18, "sine", 0.045, 0.12],
      [660, 0.24, "triangle", 0.04, 0.2]
    ],

    astral: [
      [349, 0.18, "sine"],
      [523, 0.2, "triangle", 0.045, 0.07],
      [698, 0.25, "sine", 0.04, 0.15],
      [1047, 0.35, "triangle", 0.045, 0.23]
    ],

    radiant: [
      [784, 0.13, "triangle"], [988, 0.16, "sine", 0.05, 0.06],
      [1319, 0.22, "triangle", 0.05, 0.13], [1760, 0.36, "sine", 0.045, 0.21]
    ],
    pi: [[392,0.22,"sine",0.06],[587,0.25,"triangle",0.06,0.12],[784,0.3,"sine",0.06,0.25],[1175,0.38,"triangle",0.05,0.4]],
    e: [[220,0.22,"sine",0.06],[440,0.25,"triangle",0.06,0.12],[660,0.3,"sine",0.06,0.25],[880,0.38,"triangle",0.05,0.4]],
    "golden-light": [[330,0.22,"sine",0.06],[523,0.25,"triangle",0.06,0.12],[659,0.3,"sine",0.06,0.25],[1047,0.4,"triangle",0.05,0.4]],
    hallow: [[440,0.18,"sine"],[587,0.22,"triangle",0.045,0.08],[880,0.27,"sine",0.045,0.18]],
    apex: [[392,0.15,"triangle"],[784,0.2,"sine",0.05,0.08],[1175,0.3,"triangle",0.05,0.18]],
    omniversal: [[220,0.2,"sine"],[440,0.22,"triangle",0.05,0.1],[880,0.26,"sine",0.05,0.2],[1320,0.34,"triangle",0.05,0.3]],
    divine: [[523,0.2,"sine"],[784,0.23,"triangle",0.05,0.1],[1047,0.3,"sine",0.05,0.2],[1568,0.4,"triangle",0.05,0.3]],
    genesis: [[349,0.18,"sine"],[523,0.22,"triangle",0.05,0.09],[698,0.26,"sine",0.05,0.18]],
    prismatic: [[523,0.15,"sine"],[659,0.17,"triangle",0.05,0.07],[784,0.2,"sine",0.05,0.14],[1047,0.25,"triangle",0.05,0.21]],
    noteworthy: [[494,0.1,"triangle"],[659,0.15,"sine",0.035,0.07]],
    curious: [[440,0.12,"sine"],[587,0.16,"triangle",0.035,0.08]],
    oddity: [[330,0.12,"triangle"],[494,0.15,"sine",0.035,0.08]]
  };

  (sounds[level] || sounds.common).forEach(
    ([frequency, duration, type, volume = 0.035, delay = 0]) => {
      playTone(frequency, duration, type, volume, delay);
    }
  );
}

document.addEventListener("click", event => {
  const target = event.target.closest(
    "button, .auto-mode-option, .auto-rarity-grid label, .setting-toggle, .rare-history-filter-grid label"
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
  [...numberBox.classList].forEach(className => {
    if (/^(impact|rare|rare-|rarity-|magnitude-|constant-)/.test(className)) numberBox.classList.remove(className);
  });
  rareLabel.textContent = "";
  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
    digit.style.display = "inline-block";
  });
}

function setDisplayedNumber(value, hideLeadingZeros = false) {
  const normalized = String(value).padStart(DIGITS, "0").slice(-DIGITS);
  digitElements.forEach((digit, index) => {
    digit.textContent = normalized[index];
    const isLeadingZero = hideLeadingZeros && index < DIGITS - 1 &&
      normalized.slice(0, index + 1).split("").every(char => char === "0");
    digit.style.display = isLeadingZero ? "none" : "inline-block";
    digit.classList.remove("rolling");
  });
}

  );

  renderStatBar(
    $("last-digit-statistics"),
    Object.entries(drawStats.lastDigits).map(
      ([digit, count]) => [`끝자리 ${digit}`, count, ""]
    ),
    drawStats.total
  );

  const rarityNames = RARITY_ORDER.map(level => [level, RARITY_LABELS[level] || level]);

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

  if (pattern && rareHistoryLevels.has(pattern.level)) {
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
          "ultimate", "reverse-special", "special", "jackpot", "eclipse",
          "pi", "e", "golden-light", "aurora", "hallow", "apex", "omniversal",
          "divine", "genesis", "celestial", "quantum", "paradox", "prismatic",
          "legendary", "mythic", "seraph", "phantom"
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

  const visibleRareHistory = rareHistory.filter(entry =>
    rareHistoryLevels.has(entry.pattern.level)
  );

  if (visibleRareHistory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "아직 희귀 숫자가 없어!";
    rareHistoryList.appendChild(empty);
    return;
  }

  visibleRareHistory.forEach((entry, index) => {
    const item = document.createElement("li");

    item.classList.add(
      "rare-history-item",
      `rare-history-${entry.pattern.level}`
    );

    if (
      [
        "ultimate", "reverse-special", "special", "jackpot", "eclipse",
        "pi", "e", "golden-light", "aurora", "hallow", "apex", "omniversal",
        "divine", "genesis", "celestial", "quantum", "paradox", "prismatic",
        "legendary", "mythic", "seraph", "phantom"
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
  // Clear only effect classes here. Do not reveal leading zero digits after the
  // final result has already been centered by setDisplayedNumber().
  numberElement.classList.remove("finished");
  [...numberBox.classList].forEach(className => {
    if (/^(impact|rare|rare-|rarity-|magnitude-|constant-)/.test(className)) numberBox.classList.remove(className);
  });
  rareLabel.textContent = "";
  void numberBox.offsetWidth;
  numberElement.classList.add("finished");

  const rect = numberBox.getBoundingClientRect();
  const rareActive = Boolean(pattern && settings.rareEffects);
  const normalized = String(Number(result));
  const visibleDigits = normalized.length;
  const magnitudeClass = visibleDigits >= 1 && visibleDigits <= 6 ? `magnitude-${visibleDigits}` : "";
  if (magnitudeClass && settings.effect > 0) numberBox.classList.add(magnitudeClass);

  if (rareActive) {
    numberBox.classList.add("rare", `rare-${pattern.level}`, `rarity-${pattern.level}-impact`);
    if (["pi", "e", "golden-light"].includes(pattern.level)) {
      numberBox.classList.add(`constant-${pattern.level}`);
    }
    rareLabel.textContent = pattern.title;
    playRaritySound(pattern.level);

    const flash = document.createElement("div");
    flash.className = `rare-flash ${pattern.level}`;
    effectsLayer.appendChild(flash);
    setTimeout(() => flash.remove(), ["pi", "e", "golden-light"].includes(pattern.level) ? 1800 : 1100);

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const strength = Number(settings.effect);

    if (pattern.level === "jackpot") createCoinBurst(centerX, centerY);

    if (pattern.level === "pi") {
      // A layered orbital burst: the number remains π's exact result, only its presentation changes.
      createBurst(centerX, centerY, 150 + strength * 18, 300, "pi");
      setTimeout(() => createBurst(centerX, centerY, 90 + strength * 12, 220, "pi"), 150);
      playTone(392, 0.45, "sine", 0.07, 0.02);
      playTone(587, 0.5, "triangle", 0.06, 0.18);
      playTone(784, 0.6, "sine", 0.055, 0.36);
      playTone(1175, 0.72, "triangle", 0.05, 0.55);
    } else if (pattern.level === "e") {
      createBurst(centerX, centerY, 135 + strength * 20, 290, "e");
      setTimeout(() => createBurst(centerX, centerY, 110 + strength * 10, 245, "e"), 210);
      playTone(220, 0.46, "sine", 0.07, 0.02);
      playTone(440, 0.48, "triangle", 0.06, 0.16);
      playTone(660, 0.58, "sine", 0.06, 0.34);
      playTone(880, 0.68, "triangle", 0.05, 0.52);
    } else if (pattern.level === "golden-light") {
      createBurst(centerX, centerY, 170 + strength * 22, 315, "golden-light");
      setTimeout(() => createBurst(centerX, centerY, 125 + strength * 12, 270, "golden-light"), 170);
      playTone(329.6, 0.44, "sine", 0.07, 0.02);
      playTone(523.25, 0.48, "triangle", 0.06, 0.14);
      playTone(659.25, 0.57, "sine", 0.06, 0.3);
      playTone(1046.5, 0.72, "triangle", 0.055, 0.48);
    }
  } else {
    rareLabel.textContent = "";
  }

  if (settings.effect > 0) numberBox.classList.add("impact");

  const levelScale = {
    ultimate: 3.2, "reverse-special": 2.4, special: 2.1, jackpot: 2.8,
    eclipse: 3.3, pi: 4.6, e: 4.5, "golden-light": 4.8,
    aurora: 2.7, hallow: 3.0, apex: 3.9, omniversal: 4.1,
    divine: 3.8, genesis: 3.6, celestial: 3.5, quantum: 3.5,
    paradox: 3.7, prismatic: 3.4, legendary: 2.2, mythic: 2.6,
    seraph: 3.1, phantom: 2.5, glorious: 1.8, rare: 1.45,
    noteworthy: 1.4, curious: 1.3, oddity: 1.3, uncommon: 1.15
  };
  const scale = rareActive ? (levelScale[pattern.level] || 1.4) : 1;
  const baseCount = rareActive ? (pattern.level === "pi" || pattern.level === "e" || pattern.level === "golden-light" ? 125 : 45) : 24;
  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    Math.round(baseCount * scale * Math.max(0.5, settings.effect / 2)),
    Math.min(rect.width * (0.55 + scale * 0.12), 360),
    rareActive ? pattern.level : "normal"
  );

  if (settings.effect > 0 && visibleDigits <= 6) {
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2,
      Math.round((12 + (6 - visibleDigits) * 10) * (settings.effect / 2)),
      Math.min(100 + (6 - visibleDigits) * 45, 300), "rare");
  }

  setTimeout(() => {
    [...numberBox.classList].forEach(className => {
      if (/^(impact|magnitude-|rarity-)/.test(className)) numberBox.classList.remove(className);
    });
  }, rareActive && ["pi", "e", "golden-light"].includes(pattern.level) ? 1900 : 900);
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

  const rarityNames = RARITY_ORDER.map(level => [level, RARITY_LABELS[level] || level]);

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

  if (pattern && rareHistoryLevels.has(pattern.level)) {
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
          "ultimate", "reverse-special", "special", "jackpot", "eclipse",
          "pi", "e", "golden-light", "aurora", "hallow", "apex", "omniversal",
          "divine", "genesis", "celestial", "quantum", "paradox", "prismatic",
          "legendary", "mythic", "seraph", "phantom"
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

  const visibleRareHistory = rareHistory.filter(entry =>
    rareHistoryLevels.has(entry.pattern.level)
  );

  if (visibleRareHistory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "아직 희귀 숫자가 없어!";
    rareHistoryList.appendChild(empty);
    return;
  }

  visibleRareHistory.forEach((entry, index) => {
    const item = document.createElement("li");

    item.classList.add(
      "rare-history-item",
      `rare-history-${entry.pattern.level}`
    );

    if (
      [
        "ultimate", "reverse-special", "special", "jackpot", "eclipse",
        "pi", "e", "golden-light", "aurora", "hallow", "apex", "omniversal",
        "divine", "genesis", "celestial", "quantum", "paradox", "prismatic",
        "legendary", "mythic", "seraph", "phantom"
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

  const speedSettings = {
    1: { start: 1900, interval: 850, spin: 100 },
    2: { start: 1500, interval: 650, spin: 85 },
    3: { start: 1200, interval: 500, spin: 70 },
    4: { start: 900, interval: 380, spin: 60 },
    5: { start: 650, interval: 300, spin: 50 }
  };

  const timing = speedSettings[settings.speed];

  digitElements.forEach((digit, index) => {
    const intervalId = setInterval(() => {
      digit.textContent = String(Math.floor(Math.random() * 10));
    }, timing.spin);

    rollIntervals.push(intervalId);

    const stopId = setTimeout(() => {
      clearInterval(intervalId);

      digit.classList.remove("rolling");
      digit.textContent = result[index];

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
      ? saved.rareHistory.map(item => {
          if (!item || !Number.isFinite(item.value) || !item.pattern?.level) return null;
          const level = migrateRarityLevel(item.pattern.level);
          if (!level) return null;
          return {
            value: item.value,
            pattern: {
              title: item.pattern.title || RARITY_LABELS[level] || level,
              detail: RARITY_LABELS[level] || item.pattern.detail || level,
              level
            }
          };
        }).filter(Boolean).slice(0, HISTORY_LIMIT)
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

      ["digits", "lastDigits"].forEach(group => {
        if (saved.drawStats[group] && typeof saved.drawStats[group] === "object") {
          Object.keys(drawStats[group]).forEach(key => {
            const value = saved.drawStats[group][key];
            if (Number.isFinite(value)) drawStats[group][key] = value;
          });
        }
      });

      if (saved.drawStats.rarities && typeof saved.drawStats.rarities === "object") {
        const oldRarities = saved.drawStats.rarities;
        const legacyStats = migrateLegacyRarityData && ["transcendent", "singularity", "astral", "sovereign", "infinity", "ethereal", "radiant"].some(key => Object.prototype.hasOwnProperty.call(oldRarities, key));
        const rarityAliases = legacyStats ? {
          pi: "transcendent", e: "singularity", "golden-light": "paradox",
          hallow: "sovereign", paradox: "astral"
        } : {};
        Object.keys(drawStats.rarities).forEach(level => {
          const sourceKey = rarityAliases[level] || level;
          if (Number.isFinite(oldRarities[sourceKey])) drawStats.rarities[level] = oldRarities[sourceKey];
        });
      }
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
      if (rareHistoryLevels.has(pattern.level)) {
        rareHistory.unshift({ value, pattern });
        rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
      }

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

```javascript
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
   항목별 초기화
===================================== */

const RESET_TARGETS = {
  "total-draws": {
    title: "전체 추첨 횟수 초기화",
    description: "전체 추첨 횟수 표시만 초기화해. 다른 기록과 통계는 유지돼.",
    run() {
      totalDraws = 0;
      updateStatistics();
      saveProgress();
    }
  },

  minimum: {
    title: "최솟값 초기화",
    description: "저장된 최솟값만 초기화해. 다음 추첨부터 새 최솟값이 기록돼.",
    run() {
      lowestNumber = null;
      updateStatistics();
      renderStatistics();
      saveProgress();
    }
  },

  maximum: {
    title: "최댓값 초기화",
    description: "저장된 최댓값만 초기화해. 다음 추첨부터 새 최댓값이 기록돼.",
    run() {
      highestNumber = null;
      updateStatistics();
      renderStatistics();
      saveProgress();
    }
  },

  history: {
    title: "최근 숫자 10개 초기화",
    description: "일반 추첨 기록 목록만 비워. 전체 횟수와 희귀 기록은 유지돼.",
    run() {
      history = [];
      renderHistory();
      updateAverage();
      saveProgress();
    }
  },

  "rare-history": {
    title: "최근 희귀 숫자 10개 초기화",
    description: "RARE HISTORY 목록만 비워. 일반 기록과 전체 추첨 데이터는 유지돼.",
    run() {
      rareHistory = [];
      renderRareHistory();
      saveProgress();
    }
  }
};

function openResetMenu() {
  resetOverlay.hidden = false;
  resetButton.setAttribute("aria-expanded", "true");
  resetMessage.textContent = "초기화할 항목을 선택해 줘.";
  closeResetButton.focus();
}

function closeResetMenu() {
  resetOverlay.hidden = true;
  resetButton.setAttribute("aria-expanded", "false");
  resetButton.focus();
}

function openResetConfirmation(target) {
  if (!RESET_TARGETS[target]) return;

  pendingResetTarget = target;

  const item = RESET_TARGETS[target];

  resetConfirmTitle.textContent = item.title;

  resetConfirmDescription.textContent =
    `${item.description} 계속하려면 아래 칸에 ‘초기화’라고 정확히 입력해 줘.`;

  resetConfirmInput.value = "";
  resetConfirmMessage.textContent =
    "정확히 ‘초기화’라고 입력해야 실행할 수 있어.";

  resetConfirmOverlay.hidden = false;
  resetConfirmInput.focus();
}

function closeResetConfirmation() {
  resetConfirmOverlay.hidden = true;
  pendingResetTarget = null;
  resetConfirmInput.value = "";
}

function confirmSelectedReset() {
  if (!pendingResetTarget || !RESET_TARGETS[pendingResetTarget]) return;

  if (resetConfirmInput.value.trim() !== "초기화") {
    resetConfirmMessage.textContent =
      "입력 문구가 달라. ‘초기화’라고 정확히 입력해 줘.";

    resetConfirmInput.focus();
    return;
  }

  const target = pendingResetTarget;
  const item = RESET_TARGETS[target];

  item.run();
  closeResetConfirmation();

  resetMessage.textContent = `완료! ${item.title} 작업을 마쳤어.`;
}

resetButton?.addEventListener("click", openResetMenu);
closeResetButton?.addEventListener("click", closeResetMenu);

resetOverlay?.addEventListener("click", event => {
  if (event.target === resetOverlay) closeResetMenu();
});

document.querySelectorAll("[data-reset-target]").forEach(button => {
  button.addEventListener("click", () => {
    openResetConfirmation(button.dataset.resetTarget);
  });
});

resetConfirmCloseButton?.addEventListener(
  "click",
  closeResetConfirmation
);

resetConfirmCancelButton?.addEventListener(
  "click",
  closeResetConfirmation
);

resetConfirmSubmitButton?.addEventListener(
  "click",
  confirmSelectedReset
);

resetConfirmInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") confirmSelectedReset();
});

resetConfirmOverlay?.addEventListener("click", event => {
  if (event.target === resetConfirmOverlay) {
    closeResetConfirmation();
  }
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (resetConfirmOverlay && !resetConfirmOverlay.hidden) {
    closeResetConfirmation();
  } else if (resetOverlay && !resetOverlay.hidden) {
    closeResetMenu();
  }
});

/* =====================================
   초기화
===================================== */

restoreProgress();

try {
  localStorage.setItem(
    RARE_HISTORY_FILTER_KEY,
    JSON.stringify([...rareHistoryLevels])
  );

  localStorage.setItem(RARITY_SCHEMA_VERSION_KEY, "2");
  saveProgress();
} catch (error) {
  console.warn("희귀도 데이터 버전 저장 실패:", error);
}

populateSettingsControls();
applySettings();
setDisplayedNumber(lastResult, true);

if (totalDraws > 0) {
  digitCountLabel.textContent = getDigitCountLabel(lastResult);
  updateNumberInfo(lastResult);
  statusElement.textContent =
    "이전 기록을 불러왔어. 계속 추첨해 봐!";
}

renderHistory();
renderRareHistory();
updateAverage();
updateStatistics();

resizeCanvas();
animateParticles();

/* =====================================
   희귀 기록 등급 기본값 및 구버전 호환
===================================== */

function loadRareHistoryLevels() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(RARE_HISTORY_FILTER_KEY) || "null"
    );

    if (!Array.isArray(saved)) {
      return new Set(DEFAULT_RARE_HISTORY_LEVELS);
    }

    const migrated = saved
      .map(migrateRarityLevel)
      .filter(Boolean);

    const levels = new Set(migrated);

    if (migrateLegacyRarityData) {
      [
        "pi",
        "e",
        "golden-light",
        "hallow",
        "apex",
        "omniversal",
        "divine",
        "genesis",
        "prismatic",
        "noteworthy",
        "curious",
        "oddity"
      ].forEach(level => levels.add(level));
    }

    return levels;
  } catch {
    return new Set(DEFAULT_RARE_HISTORY_LEVELS);
  }
}
