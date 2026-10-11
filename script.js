"use strict";

const DIGITS = 7;
const HISTORY_LIMIT = 10;

const SETTINGS_KEY = "violetRandomSettings";
const PROGRESS_KEY = "violetRandomProgress";
const RARE_HISTORY_FILTER_KEY = "violetRandomRareHistoryFilter";
const RARE_HISTORY_FILTER_VERSION_KEY = "violetRandomRareHistoryFilterVersion";
const RARE_HISTORY_FILTER_VERSION = "4";

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
const statisticsOverlay = $("statistics-overlay");
const closeStatisticsButton = $("close-statistics");

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

const dataResetButton = $("reset-button");
const dataResetOverlay = $("reset-overlay");
const closeDataResetButton = $("close-reset");
const dataResetMessage = $("reset-message");

const dataResetConfirmOverlay = $("reset-confirm-overlay");
const closeDataResetConfirmButton = $("close-reset-confirm");
const cancelDataResetConfirmButton = $("cancel-reset-confirm");
const applyDataResetConfirmButton = $("apply-reset-confirm");
const dataResetConfirmDescription = $("reset-confirm-description");
const dataResetConfirmInput = $("reset-confirm-input");
const dataResetConfirmMessage = $("reset-confirm-message");

const dataResetActionButtons = {
  totalDraws: $("reset-total-draws"),
  minNumber: $("reset-min-number"),
  maxNumber: $("reset-max-number"),
  history: $("reset-history"),
  rareHistory: $("reset-rare-history")
};

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

const RARITY_ORDER = [
  "ultimate",
  "reverse-special",
  "special",
  "jackpot",
  "eclipse",
  "pi",
  "euler",
  "golden-light",
  "aurora",
  "hallow",
  "apex",
  "omniversal",
  "divine",
  "genesis",
  "celestial",
  "quantum",
  "paradox",
  "prismatic",
  "legendary",
  "mythic",
  "seraph",
  "phantom",
  "glorious",
  "rare",
  "noteworthy",
  "curious",
  "oddity",
  "uncommon",
  "common"
];

const RARITY_LABELS = {
  ultimate: "Ultimate",
  "reverse-special": "Reverse Special",
  special: "Special",
  jackpot: "Jackpot",
  eclipse: "Eclipse",
  pi: "π · 원주율",
  euler: "e · 자연상수",
  "golden-light": "황금빛 · 황금비",
  aurora: "Aurora",
  hallow: "Hallow",
  apex: "Apex",
  omniversal: "Omniversal",
  divine: "Divine",
  genesis: "Genesis",
  celestial: "Celestial",
  quantum: "Quantum",
  paradox: "Paradox",
  prismatic: "Prismatic",
  legendary: "Legendary",
  mythic: "Mythic",
  seraph: "Seraph",
  phantom: "Phantom",
  glorious: "Glorious",
  rare: "Rare",
  noteworthy: "Noteworthy",
  curious: "Curious",
  oddity: "Oddity",
  uncommon: "Uncommon",
  common: "Common"
};

const DEFAULT_RARE_HISTORY_LEVELS = new Set(
  RARITY_ORDER.filter(level => level !== "common")
);

let settings = loadSettings();

let history = [];
let rareHistory = [];
let totalDraws = 0;
let highestNumber = null;
let lowestNumber = null;
let lastResult = "0000000";

let pendingProtectedAction = null;
let sessionUnlocked = false;
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

let pendingEffectOverride = null;

let rollTimeouts = [];
let rollIntervals = [];
let backgroundParticles = [];

let audioContext = null;
let effectCleanupTimeout = null;

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

  rarities: Object.fromEntries(
    RARITY_ORDER.map(level => [level, 0])
  )
};

function clamp(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function percentage(part, total) {
  return total
    ? `${(part / total * 100).toFixed(1)}%`
    : "0%";
}

function getRarityRank(level) {
  const index = RARITY_ORDER.indexOf(level || "common");

  return index === -1
    ? RARITY_ORDER.length
    : index;
}

function sortRareResults(entries) {
  return [...entries].sort((a, b) => {
    const rankDifference =
      getRarityRank(a.pattern?.level) -
      getRarityRank(b.pattern?.level);

    return rankDifference || a.value - b.value;
  });
}

function getRarityTitle(level) {
  return RARITY_LABELS[level] || "Common";
}

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
    themeSetting.value === "light"
      ? "라이트 모드"
      : "다크 모드";
}

function saveSettings() {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    settingsMessage.textContent = "설정을 저장했어! 💜";
    return true;
  } catch (error) {
    console.warn("설정 저장 실패:", error);

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

  settingsMessage.textContent =
    "설정은 이 브라우저에 저장돼.";

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

let pendingDataResetAction = null;

const DATA_RESET_LABELS = {
  totalDraws: "전체 추첨 횟수",
  minNumber: "최솟값",
  maxNumber: "최댓값",
  history: "최근 숫자 10개",
  rareHistory: "최근 희귀 숫자 10개"
};

function openDataReset() {
  dataResetOverlay.hidden = false;
  dataResetButton.setAttribute("aria-expanded", "true");
  dataResetMessage.textContent = "초기화할 항목을 선택해 줘.";
  closeDataResetButton.focus();
}

function closeDataReset() {
  if (!dataResetConfirmOverlay.hidden) {
    closeDataResetConfirm();
  }

  dataResetOverlay.hidden = true;
  dataResetButton.setAttribute("aria-expanded", "false");
  dataResetButton.focus();
}

function requestDataReset(action) {
  if (!Object.prototype.hasOwnProperty.call(DATA_RESET_LABELS, action)) {
    return;
  }

  pendingDataResetAction = action;

  dataResetConfirmDescription.textContent =
    `「${DATA_RESET_LABELS[action]}」 항목만 초기화할 거야. 계속하려면 아래에 초기화라고 정확히 입력해 줘.`;

  dataResetConfirmInput.value = "";
  dataResetConfirmMessage.textContent =
    "'초기화'를 입력해야 진행할 수 있어.";

  dataResetConfirmOverlay.hidden = false;
  dataResetConfirmInput.focus();
}

function closeDataResetConfirm() {
  dataResetConfirmOverlay.hidden = true;
  dataResetConfirmInput.value = "";
  pendingDataResetAction = null;

  if (!dataResetOverlay.hidden && dataResetButton) {
    closeDataResetButton.focus();
  } else if (dataResetButton) {
    dataResetButton.focus();
  }
}

function executeDataReset(action) {
  switch (action) {
    case "totalDraws":
      totalDraws = 0;
      updateStatistics();
      renderStatistics();

      dataResetMessage.textContent =
        "전체 추첨 횟수를 초기화했어. 다른 기록은 유지돼. 💜";

      statusElement.textContent =
        "전체 추첨 횟수 기록을 초기화했어.";
      break;

    case "minNumber":
      lowestNumber = null;
      updateStatistics();
      renderStatistics();

      dataResetMessage.textContent =
        "최솟값 기록을 초기화했어. 다른 기록은 유지돼. 💜";

      statusElement.textContent =
        "최솟값 기록을 초기화했어.";
      break;

    case "maxNumber":
      highestNumber = null;
      updateStatistics();
      renderStatistics();

      dataResetMessage.textContent =
        "최댓값 기록을 초기화했어. 다른 기록은 유지돼. 💜";

      statusElement.textContent =
        "최댓값 기록을 초기화했어.";
      break;

    case "history":
      history = [];
      renderHistory();
      updateAverage();

      dataResetMessage.textContent =
        "최근 숫자 10개 기록을 초기화했어. 다른 기록은 유지돼. 💜";

      statusElement.textContent =
        "최근 숫자 10개 기록을 초기화했어.";
      break;

    case "rareHistory":
      rareHistory = [];
      renderRareHistory();

      dataResetMessage.textContent =
        "최근 희귀 숫자 10개 기록을 초기화했어. 다른 기록은 유지돼. 💜";

      statusElement.textContent =
        "최근 희귀 숫자 10개 기록을 초기화했어.";
      break;

    default:
      return false;
  }

  saveProgress();
  return true;
}

function confirmDataReset() {
  if (!pendingDataResetAction) {
    dataResetConfirmMessage.textContent =
      "먼저 초기화할 항목을 선택해 줘.";

    return;
  }

  if (dataResetConfirmInput.value.trim() !== "초기화") {
    dataResetConfirmMessage.textContent =
      "입력 내용이 달라. '초기화'라고 정확히 입력해 줘.";

    dataResetConfirmInput.focus();
    return;
  }

  const action = pendingDataResetAction;
  const succeeded = executeDataReset(action);

  if (!succeeded) return;

  dataResetConfirmOverlay.hidden = true;
  dataResetConfirmInput.value = "";
  pendingDataResetAction = null;

  dataResetConfirmMessage.textContent = "초기화가 완료됐어.";
  closeDataResetButton.focus();
}

dataResetButton.addEventListener("click", openDataReset);
closeDataResetButton.addEventListener("click", closeDataReset);

dataResetOverlay.addEventListener("click", event => {
  if (event.target === dataResetOverlay) {
    closeDataReset();
  }
});

Object.entries(dataResetActionButtons).forEach(([action, button]) => {
  if (!button) return;

  button.addEventListener("click", () => {
    requestDataReset(action);
  });
});

closeDataResetConfirmButton.addEventListener(
  "click",
  closeDataResetConfirm
);

cancelDataResetConfirmButton.addEventListener(
  "click",
  closeDataResetConfirm
);

applyDataResetConfirmButton.addEventListener(
  "click",
  confirmDataReset
);

dataResetConfirmInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    confirmDataReset();
  }
});

dataResetConfirmOverlay.addEventListener("click", event => {
  if (event.target === dataResetConfirmOverlay) {
    closeDataResetConfirm();
  }
});

function migrateLegacyRarity(level, hasLegacyLevels) {
  if (level === "transcendent") return "pi";
  if (level === "singularity") return "euler";
  if (level === "sovereign") return "hallow";
  if (level === "astral") return "paradox";

  if (level === "paradox" && hasLegacyLevels) {
    return "golden-light";
  }

  if (
    level === "infinity" ||
    level === "ethereal" ||
    level === "radiant"
  ) {
    return null;
  }

  return level;
}

function loadRareHistoryLevels() {
  try {
    const raw = localStorage.getItem(RARE_HISTORY_FILTER_KEY);
    const saved = JSON.parse(raw || "null");

    if (!Array.isArray(saved)) {
      return new Set(DEFAULT_RARE_HISTORY_LEVELS);
    }

    const hasLegacyLevels = saved.some(level =>
      [
        "transcendent",
        "singularity",
        "infinity",
        "sovereign",
        "ethereal",
        "astral",
        "radiant"
      ].includes(level)
    );

    const migrated = saved
      .map(level => migrateLegacyRarity(level, hasLegacyLevels))
      .filter(level =>
        level &&
        RARITY_ORDER.includes(level) &&
        level !== "common"
      );

    const levels = new Set(migrated);

    const version = localStorage.getItem(
      RARE_HISTORY_FILTER_VERSION_KEY
    );

    if (version !== RARE_HISTORY_FILTER_VERSION) {
      [
        "apex",
        "omniversal",
        "divine",
        "genesis",
        "prismatic",
        "noteworthy",
        "curious",
        "oddity"
      ].forEach(level => levels.add(level));

      localStorage.setItem(
        RARE_HISTORY_FILTER_VERSION_KEY,
        RARE_HISTORY_FILTER_VERSION
      );

      localStorage.setItem(
        RARE_HISTORY_FILTER_KEY,
        JSON.stringify([...levels])
      );
    }

    return levels;
  } catch {
    return new Set(DEFAULT_RARE_HISTORY_LEVELS);
  }
}

let rareHistoryLevels = loadRareHistoryLevels();

function getSelectedRareHistoryLevels() {
  return new Set(
    rareHistoryFilterInputs
      .filter(input => input.checked)
      .map(input => input.value)
  );
}

function applyRareHistoryFilterControls() {
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

    localStorage.setItem(
      RARE_HISTORY_FILTER_VERSION_KEY,
      RARE_HISTORY_FILTER_VERSION
    );
  } catch (error) {
    console.warn("희귀 기록 설정 저장 실패:", error);
  }

  renderRareHistory();
}

function openRareHistoryFilter() {
  rareHistoryFilterPanel.hidden = false;

  rareHistoryFilterButton.setAttribute("aria-expanded", "true");
  rareHistoryFilterCloseButton.focus();
}

function closeRareHistoryFilter() {
  rareHistoryFilterPanel.hidden = true;

  rareHistoryFilterButton.setAttribute("aria-expanded", "false");
  rareHistoryFilterButton.focus();
}

applyRareHistoryFilterControls();

rareHistoryFilterInputs.forEach(input => {
  input.addEventListener("change", saveRareHistoryLevels);
});

rareHistoryFilterAllButton.addEventListener("click", () => {
  rareHistoryFilterInputs.forEach(input => {
    input.checked = true;
  });

  saveRareHistoryLevels();
});

rareHistoryFilterNoneButton.addEventListener("click", () => {
  rareHistoryFilterInputs.forEach(input => {
    input.checked = false;
  });

  saveRareHistoryLevels();
});

rareHistoryFilterButton.addEventListener(
  "click",
  openRareHistoryFilter
);

rareHistoryFilterCloseButton.addEventListener(
  "click",
  closeRareHistoryFilter
);

rareHistoryFilterPanel.addEventListener("click", event => {
  if (event.target === rareHistoryFilterPanel) {
    closeRareHistoryFilter();
  }
});

function getAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtor) return null;

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

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
    0.5,
    Math.max(0.0002, volume * 5.8)
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

    oddity: [
      [440, 0.09, "triangle"],
      [587, 0.12, "sine", 0.035, 0.055]
    ],

    curious: [
      [523, 0.1, "sine"],
      [659, 0.14, "triangle", 0.035, 0.07]
    ],

    noteworthy: [
      [587, 0.12, "triangle"],
      [784, 0.16, "sine", 0.04, 0.08]
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

    phantom: [
      [330, 0.2, "sine"],
      [494, 0.22, "triangle", 0.03, 0.1],
      [370, 0.25, "sine", 0.025, 0.22]
    ],

    seraph: [
      [784, 0.16, "sine"],
      [988, 0.2, "triangle", 0.04, 0.08],
      [1175, 0.25, "sine", 0.035, 0.17],
      [1568, 0.32, "triangle", 0.03, 0.29]
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

    celestial: [
      [587, 0.2, "sine"],
      [784, 0.22, "sine", 0.045, 0.08],
      [988, 0.26, "triangle", 0.045, 0.16],
      [1319, 0.34, "sine", 0.04, 0.25]
    ],

    quantum: [
      [880, 0.1, "square", 0.035],
      [440, 0.14, "triangle", 0.045, 0.06],
      [1320, 0.18, "sine", 0.045, 0.12],
      [660, 0.24, "triangle", 0.04, 0.2]
    ],

    paradox: [
      [349, 0.18, "sine"],
      [523, 0.2, "triangle", 0.045, 0.07],
      [698, 0.25, "sine", 0.04, 0.15],
      [1047, 0.35, "triangle", 0.045, 0.23]
    ],

    prismatic: [
      [523, 0.12, "sine"],
      [659, 0.14, "triangle", 0.04, 0.06],
      [784, 0.17, "sine", 0.04, 0.12],
      [1047, 0.22, "triangle", 0.045, 0.2]
    ],

    hallow: [
      [392, 0.16, "triangle"],
      [523, 0.18, "triangle", 0.05, 0.06],
      [659, 0.22, "sine", 0.05, 0.13],
      [1047, 0.36, "triangle", 0.05, 0.22]
    ],

    "golden-light": [
      [740, 0.18, "triangle", 0.05],
      [988, 0.2, "sine", 0.055, 0.07],
      [1245, 0.22, "triangle", 0.055, 0.15],
      [1480, 0.24, "sine", 0.055, 0.23],
      [1976, 0.46, "triangle", 0.06, 0.34]
    ],

    euler: [
      [110, 0.3, "sine", 0.05],
      [220, 0.32, "triangle", 0.05, 0.08],
      [330, 0.3, "sine", 0.045, 0.16],
      [440, 0.34, "sawtooth", 0.045, 0.24],
      [660, 0.36, "triangle", 0.05, 0.32],
      [880, 0.48, "sine", 0.055, 0.42]
    ],

    pi: [
      [523, 0.18, "sine", 0.05],
      [784, 0.2, "triangle", 0.055, 0.07],
      [1047, 0.23, "sine", 0.055, 0.14],
      [1319, 0.28, "triangle", 0.055, 0.22],
      [1568, 0.42, "sine", 0.06, 0.32],
      [2093, 0.48, "triangle", 0.055, 0.44]
    ],

    eclipse: [
      [220, 0.22, "sawtooth", 0.035],
      [330, 0.24, "triangle", 0.03, 0.1],
      [660, 0.3, "sine", 0.035, 0.23]
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

    jackpot: [
      [880, 0.1, "square", 0.025],
      [1175, 0.13, "triangle", 0.035, 0.07],
      [1568, 0.2, "sine", 0.04, 0.15]
    ],

    apex: [
      [587, 0.16, "sine"],
      [880, 0.2, "triangle", 0.05, 0.08],
      [1175, 0.24, "sine", 0.05, 0.16],
      [1760, 0.4, "triangle", 0.05, 0.25]
    ],

    omniversal: [
      [196, 0.22, "sine"],
      [392, 0.24, "triangle", 0.05, 0.08],
      [784, 0.28, "sine", 0.05, 0.16],
      [1568, 0.42, "triangle", 0.05, 0.25]
    ],

    divine: [
      [523, 0.2, "sine"],
      [659, 0.22, "triangle", 0.05, 0.08],
      [784, 0.25, "sine", 0.05, 0.16],
      [1175, 0.4, "triangle", 0.05, 0.26]
    ],

    genesis: [
      [330, 0.2, "sine"],
      [494, 0.22, "triangle", 0.05, 0.08],
      [659, 0.25, "sine", 0.05, 0.16],
      [988, 0.4, "triangle", 0.05, 0.26]
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

function secureRandomNumber() {
  const range = 10_000_000;

  if (
    window.crypto &&
    typeof window.crypto.getRandomValues === "function"
  ) {
    const max = 0x100000000;
    const limit = Math.floor(max / range) * range;
    const buffer = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return String(buffer[0] % range).padStart(DIGITS, "0");
  }

  return String(
    Math.floor(Math.random() * range)
  ).padStart(DIGITS, "0");
}

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

const EXACT_RARITY_PATTERNS = {
  apex: [
    "9090909"
  ],

  omniversal: [
    "1234321",
    "7654567"
  ],

  divine: [
    "8888887",
    "7777778",
    "9999998",
    "4444449"
  ],

  genesis: [
    "1122334",
    "2233445",
    "3344556",
    "4455667",
    "5566778",
    "6677889",
    "7788990",
    "9988776"
  ],

  prismatic: [
    "1231234",
    "2342345",
    "3453456",
    "4564567",
    "5675678",
    "6786789"
  ]
};

const EXCLUSIVE_RARITY_PATTERNS = {
  "3141592": {
    title: "✦ π · 원주율 배열 ✦",
    level: "pi",
    detail: "π · 원주율"
  },

  "2718281": {
    title: "✦ e · 자연상수 배열 ✦",
    level: "euler",
    detail: "e · 자연상수"
  },

  "1618033": {
    title: "✦ 황금빛 · 황금비 배열 ✦",
    level: "golden-light",
    detail: "황금빛 · 황금비"
  },

  "1020304": {
    title: "✦ HALLOW · 일정 간격의 0 ✦",
    level: "hallow",
    detail: "Hallow"
  },

  "1357924": {
    title: "✦ CELESTIAL · 홀수 중심 조합 ✦",
    level: "celestial",
    detail: "Celestial"
  },

  "2468135": {
    title: "✦ QUANTUM · 짝홀 교차 배열 ✦",
    level: "quantum",
    detail: "Quantum"
  },

  "3142314": {
    title: "✦ PARADOX · 반복 배열 ✦",
    level: "paradox",
    detail: "Paradox"
  }
};

function makePattern(level, title = null) {
  const label = getRarityTitle(level);

  return {
    level,
    detail: label,
    title: title || `✦ ${label.toUpperCase()} ✦`
  };
}

function getLongestRun(digits) {
  if (!digits.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] === digits[i - 1]) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getRepeatedBlockLength(value, repetitions) {
  for (let size = 2; size <= 3; size++) {
    for (
      let start = 0;
      start + size * repetitions <= value.length;
      start++
    ) {
      const block = value.slice(start, start + size);
      let matches = true;

      for (let repetition = 1; repetition < repetitions; repetition++) {
        const current = value.slice(
          start + size * repetition,
          start + size * (repetition + 1)
        );

        if (current !== block) {
          matches = false;
          break;
        }
      }

      if (matches) return true;
    }
  }

  return false;
}

function getRarePattern(value) {
  const normalized = String(Number(value));

  const digits = normalized.split("");
  const length = normalized === "0" ? 0 : normalized.length;

  const digitSum = digits.reduce(
    (sum, digit) => sum + Number(digit),
    0
  );

  const uniqueDigits = new Set(digits).size;
  const longestRun = getLongestRun(digits);

  if (normalized === "0") {
    return makePattern("ultimate");
  }

  if (normalized === "7654321") {
    return makePattern("reverse-special");
  }

  if (normalized === "708" || normalized === "1234567") {
    return makePattern("special");
  }

  if (
    ["777", "7777", "77777", "777777", "7777777"].includes(normalized)
  ) {
    return makePattern("jackpot");
  }

  if (length === 7 && /^(\d)\1{6}$/.test(normalized)) {
    return makePattern("eclipse");
  }

  if (EXCLUSIVE_RARITY_PATTERNS[normalized]) {
    return {
      ...EXCLUSIVE_RARITY_PATTERNS[normalized]
    };
  }

  if (
    length === 7 &&
    ["2345678", "3456789", "8765432", "9876543"].includes(normalized)
  ) {
    return makePattern("aurora");
  }

  if (EXACT_RARITY_PATTERNS.apex.includes(normalized)) {
    return makePattern("apex");
  }

  if (EXACT_RARITY_PATTERNS.omniversal.includes(normalized)) {
    return makePattern("omniversal");
  }

  if (EXACT_RARITY_PATTERNS.divine.includes(normalized)) {
    return makePattern("divine");
  }

  if (EXACT_RARITY_PATTERNS.genesis.includes(normalized)) {
    return makePattern("genesis");
  }

  if (
    length === 7 &&
    new Set(digits).size === 7 &&
    [35, 42].includes(digitSum)
  ) {
    return makePattern("seraph");
  }

  if (
    length === 7 &&
    normalized === normalized.split("").reverse().join("")
  ) {
    return makePattern("mythic");
  }

  if (
    length === 7 &&
    digits[0] === digits[2] &&
    digits[2] === digits[4] &&
    digits[4] === digits[6] &&
    digits[1] === digits[3] &&
    digits[3] === digits[5] &&
    digits[0] !== digits[1]
  ) {
    return makePattern("phantom");
  }

  if (
    length === 7 &&
    digits[0] === digits[6] &&
    uniqueDigits >= 5 &&
    digitSum % 7 === 0
  ) {
    return makePattern("noteworthy");
  }

  if (
    length === 7 &&
    uniqueDigits === 5 &&
    digitSum % 5 === 0
  ) {
    return makePattern("curious");
  }

  if (
    length === 7 &&
    uniqueDigits >= 3 &&
    uniqueDigits <= 4 &&
    digitSum % 2 === 1 &&
    longestRun <= 2
  ) {
    return makePattern("oddity");
  }

  if (EXACT_RARITY_PATTERNS.prismatic.includes(normalized)) {
    return makePattern("prismatic");
  }

  if (longestRun >= 6) {
    return makePattern("glorious");
  }

  if (longestRun >= 3 && longestRun <= 5) {
    return makePattern("rare");
  }

  if (getRepeatedBlockLength(normalized, 3)) {
    return makePattern("glorious");
  }

  if (getRepeatedBlockLength(normalized, 2)) {
    return makePattern("rare");
  }

  if (length === 1) {
    return makePattern("legendary");
  }

  if (length === 2) {
    return makePattern("glorious");
  }

  if (length >= 3 && length <= 5) {
    return makePattern("rare");
  }

  if (length === 6) {
    return makePattern("uncommon");
  }

  return null;
}

function getDigitCountLabel(value) {
  const normalized = String(Number(value));
  const length = normalized === "0" ? 0 : normalized.length;
  const countText = `${length}자리 수`;
  const pattern = getRarePattern(normalized);

  return pattern
    ? `${countText} · ${pattern.detail}`
    : `${countText} · Common`;
}

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
      `약수: 1, ${formatNumber(number)}`;
  } else if (number < 2) {
    primeStatus.textContent = "소수 아님";
    divisorStatus.textContent =
      "소수는 2 이상의 자연수 중에서 찾아";
  } else {
    primeStatus.textContent = "소수 아님 · 합성수";
    divisorStatus.textContent = "약수가 2개보다 많아";
  }
}

function clearRollTimers() {
  rollTimeouts.forEach(id => clearTimeout(id));
  rollIntervals.forEach(id => clearInterval(id));

  rollTimeouts = [];
  rollIntervals = [];
}

function setButtonsDisabled(disabled) {
  drawButton.disabled = disabled || autoRunning;
  instantButton.disabled = disabled || autoRunning;
}

function clearTemporaryResultClasses() {
  numberElement.classList.remove("finished");

  Array.from(numberBox.classList).forEach(className => {
    if (
      className === "impact" ||
      className === "rare" ||
      className.startsWith("rare-") ||
      className.startsWith("rarity-") ||
      className.startsWith("magnitude-")
    ) {
      numberBox.classList.remove(className);
    }
  });
}

function resetNumberEffects() {
  if (effectCleanupTimeout !== null) {
    clearTimeout(effectCleanupTimeout);
    effectCleanupTimeout = null;
  }

  clearTemporaryResultClasses();

  rareLabel.textContent = "";

  digitElements.forEach(digit => {
    digit.classList.remove("rolling", "leading-zero");
    digit.style.display = "inline-block";
  });
}

function setDisplayedNumber(value, hideLeadingZeros = false) {
  const normalized = String(value).padStart(DIGITS, "0").slice(-DIGITS);

  digitElements.forEach((digit, index) => {
    digit.textContent = normalized[index];

    const isLeadingZero =
      hideLeadingZeros &&
      index < DIGITS - 1 &&
      normalized
        .slice(0, index + 1)
        .split("")
        .every(char => char === "0");

    digit.classList.toggle("leading-zero", isLeadingZero);

    digit.style.display = isLeadingZero
      ? "none"
      : "inline-block";

    digit.classList.remove("rolling");
  });
}

function createBurst(
  x,
  y,
  count = 30,
  distance = 150,
  kind = "normal"
) {
  if (settings.effect === 0) return;

  const multiplier = settings.effect / 2;

  const actualCount = Math.max(
    1,
    Math.min(300, Math.round(count * multiplier))
  );

  const actualDistance = Math.min(
    320,
    distance * (0.55 + multiplier * 0.35)
  );

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < actualCount; i++) {
    const particle = document.createElement("span");
    const isStar = Math.random() < 0.38;

    particle.className = isStar
      ? "burst-particle star"
      : "burst-particle";

    if (isStar) {
      if (kind === "pi") {
        particle.textContent = Math.random() < 0.55 ? "π" : "✦";
        particle.classList.add("rare-star");
        particle.style.color = "#f0d9ff";
        particle.style.textShadow =
          "0 0 10px #fff, 0 0 22px #d8a3ff, 0 0 38px #a64bff";
      } else if (kind === "euler") {
        particle.textContent = Math.random() < 0.55 ? "e" : "✧";
        particle.classList.add("rare-star");
        particle.style.color = "#d5e7ff";
        particle.style.textShadow =
          "0 0 10px #fff, 0 0 22px #91aaff, 0 0 38px #6388ff";
      } else if (kind === "golden-light") {
        particle.textContent = Math.random() < 0.55 ? "φ" : "✦";
        particle.classList.add("gold-star");
        particle.style.color = "#fff0bd";
        particle.style.textShadow =
          "0 0 10px #fff, 0 0 22px #ffe29a, 0 0 38px #ffc34d";
      } else {
        particle.textContent = Math.random() < 0.5 ? "✦" : "✧";

        if (
          kind === "legendary" ||
          kind === "divine" ||
          kind === "seraph"
        ) {
          particle.classList.add("gold-star");
        } else if (
          kind !== "normal" &&
          kind !== "uncommon" &&
          kind !== "oddity"
        ) {
          particle.classList.add("rare-star");
        }
      }
    } else if (kind === "pi") {
      particle.style.background = "#d8a3ff";
      particle.style.boxShadow =
        "0 0 10px #d8a3ff, 0 0 20px rgba(166, 75, 255, .85)";
    } else if (kind === "euler") {
      particle.style.background = "#91aaff";
      particle.style.boxShadow =
        "0 0 10px #91aaff, 0 0 20px rgba(99, 136, 255, .85)";
    } else if (kind === "golden-light") {
      particle.style.background = "#ffe29a";
      particle.style.boxShadow =
        "0 0 10px #ffe29a, 0 0 20px rgba(255, 195, 77, .85)";
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

  setTimeout(() => {
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

    coin.style.left =
      `${x + (Math.random() - 0.5) * 90}px`;

    coin.style.top =
      `${y + (Math.random() - 0.5) * 25}px`;

    coin.style.setProperty(
      "--coin-x",
      `${(Math.random() - 0.5) * 300}px`
    );

    coin.style.setProperty(
      "--coin-y",
      `${-80 - Math.random() * 180}px`
    );

    coin.style.setProperty(
      "--coin-spin",
      `${360 + Math.random() * 720}deg`
    );

    coin.style.setProperty(
      "--coin-delay",
      `${Math.random() * 180}ms`
    );

    coin.addEventListener(
      "animationend",
      () => coin.remove(),
      { once: true }
    );

    effectsLayer.appendChild(coin);
  }
}

function triggerResultImpact(pattern = null, result = "0000000") {
  resetNumberEffects();

  setDisplayedNumber(result, true);

  void numberBox.offsetWidth;
  void numberElement.offsetWidth;

  numberElement.classList.add("finished");

  const rect = numberBox.getBoundingClientRect();
  const rareActive = Boolean(pattern && settings.rareEffects);
  const normalized = String(Number(result));
  const visibleDigits = normalized === "0" ? 0 : normalized.length;

  numberBox.style.transition =
    "border-color 450ms ease, background 450ms ease, box-shadow 450ms ease";

  numberElement.style.transition =
    "color 450ms ease, text-shadow 450ms ease";

  if (rareActive) {
    playRaritySound(pattern.level);
  }

  const magnitudeClass =
    visibleDigits >= 1 && visibleDigits <= 6
      ? `magnitude-${visibleDigits}`
      : "";

  if (magnitudeClass && settings.effect > 0) {
    numberBox.classList.add(magnitudeClass);
  }

  const levelScales = {
    ultimate: 4.8,
    "reverse-special": 4.4,
    special: 4.1,
    jackpot: 4.0,
    eclipse: 3.9,
    pi: 5.0,
    euler: 4.9,
    "golden-light": 4.8,
    aurora: 3.4,
    hallow: 3.3,

    apex: 4.7,
    omniversal: 4.5,
    divine: 4.3,
    genesis: 4.1,

    celestial: 3.1,
    quantum: 3.0,
    paradox: 2.9,
    prismatic: 2.8,

    legendary: 2.7,
    mythic: 2.5,
    seraph: 2.3,
    phantom: 2.1,
    glorious: 1.7,
    rare: 1.4,

    noteworthy: 1.3,
    curious: 1.2,
    oddity: 1.1,
    uncommon: 1.05
  };

  const magnitudeScale =
    visibleDigits === 0
      ? 3.2
      : visibleDigits >= 7
        ? 1
        : 1 + (7 - visibleDigits) * 0.42;

  const rareScale = rareActive
    ? (levelScales[pattern.level] || 1.3)
    : 1;

  const totalScale = magnitudeScale * rareScale;

  if (settings.effect > 0) {
    numberBox.classList.add("impact");
  }

  if (rareActive) {
    numberBox.classList.add(`rare-${pattern.level}`);

    if (settings.effect > 0) {
      numberBox.classList.add(
        `rarity-${pattern.level}-impact`
      );
    }

    rareLabel.textContent = pattern.title;

    if (pattern.level === "jackpot") {
      createCoinBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }

    const flash = document.createElement("div");

    flash.className = `rare-flash ${pattern.level}`;

    effectsLayer.appendChild(flash);

    const flashDuration =
      ["pi", "euler", "golden-light"].includes(pattern.level)
        ? 2400
        : 1600;

    setTimeout(() => flash.remove(), flashDuration);
  } else {
    rareLabel.textContent = "";
  }

  void numberBox.offsetWidth;

  const burstCounts = {
    ultimate: 170,
    "reverse-special": 150,
    special: 135,
    jackpot: 145,
    eclipse: 145,
    pi: 220,
    euler: 215,
    "golden-light": 210,
    aurora: 115,
    hallow: 110,

    apex: 160,
    omniversal: 155,
    divine: 150,
    genesis: 145,

    celestial: 105,
    quantum: 100,
    paradox: 95,
    prismatic: 95,

    legendary: 100,
    mythic: 120,
    seraph: 115,
    phantom: 95,
    glorious: 80,
    rare: 65,

    noteworthy: 50,
    curious: 45,
    oddity: 40,
    uncommon: 35
  };

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    Math.min(
      260,
      Math.round(
        (rareActive ? (burstCounts[pattern.level] || 65) : 30) *
        totalScale
      )
    ),
    Math.min(
      rect.width * (0.4 + (totalScale - 1) * 0.13),
      320
    ),
    rareActive ? pattern.level : "normal"
  );

  if (
    rareActive &&
    settings.effect > 0 &&
    ["pi", "euler", "golden-light"].includes(pattern.level)
  ) {
    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      Math.round(38 * (settings.effect / 2)),
      Math.min(rect.width * 0.75, 280),
      pattern.level
    );
  }

  if (settings.effect > 0 && visibleDigits <= 6) {
    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      Math.round(
        (
          visibleDigits === 6
            ? 12
            : 18 + (6 - visibleDigits) * 12
        ) *
        (settings.effect / 2)
      ),
      Math.min(100 + (6 - visibleDigits) * 45, 300),
      visibleDigits <= 3 ? "legendary" : "rare"
    );
  }

  if (effectCleanupTimeout !== null) {
    clearTimeout(effectCleanupTimeout);
  }

  const temporaryEffectDuration =
    rareActive && ["pi", "euler", "golden-light"].includes(pattern.level)
      ? 2350
      : rareActive
        ? 1900
        : 850;

  effectCleanupTimeout = window.setTimeout(() => {
    clearTemporaryResultClasses();
    effectCleanupTimeout = null;
  }, temporaryEffectDuration);
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
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(snapshot)
    );
  } catch (error) {
    console.warn("Violet Random 기록 저장 실패:", error);
  }
}

function trackDrawStatistics(result, options = {}) {
  const {
    render = true,
    persist = true
  } = options;

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

  drawStats.rarities[pattern?.level || "common"]++;

  if (render) renderStatistics();
  if (persist) saveProgress();
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
      `${formatNumber(count)} · ${percentage(count, total)}`;

    heading.append(name, amount);

    const track = document.createElement("div");
    track.className = "statistics-bar-track";

    const fill = document.createElement("div");

    fill.className =
      `statistics-bar-fill ${colorClass || ""}`;

    fill.style.width = percentage(count, total);

    track.appendChild(fill);
    row.append(heading, track);

    container.appendChild(row);
  });
}

function renderStatistics() {
  const setText = (id, value) => {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  };

  setText("odd-count", formatNumber(drawStats.odd));
  setText("even-count", formatNumber(drawStats.even));

  setText("odd-ratio", percentage(drawStats.odd, drawStats.total));
  setText("even-ratio", percentage(drawStats.even, drawStats.total));

  setText("prime-count", formatNumber(drawStats.prime));
  setText("composite-count", formatNumber(drawStats.composite));

  setText("prime-ratio", percentage(drawStats.prime, drawStats.total));
  setText(
    "composite-ratio",
    percentage(drawStats.composite, drawStats.total)
  );

  setText(
    "overall-average",
    drawStats.total
      ? formatNumber(Math.round(drawStats.sum / drawStats.total))
      : "—"
  );

  setText(
    "statistics-max",
    highestNumber === null ? "—" : formatNumber(highestNumber)
  );

  setText(
    "statistics-min",
    lowestNumber === null ? "—" : formatNumber(lowestNumber)
  );

  const lastDigitEntries = Object.entries(drawStats.lastDigits)
    .sort((a, b) => b[1] - a[1]);

  const mostCommon = drawStats.total
    ? lastDigitEntries[0]
    : null;

  setText(
    "most-common-last-digit",
    mostCommon ? mostCommon[0] : "—"
  );

  setText(
    "most-common-last-digit-count",
    mostCommon
      ? `${formatNumber(mostCommon[1])}회 · ${percentage(mostCommon[1], drawStats.total)}`
      : "아직 기록 없음"
  );

  setText(
    "statistics-total",
    `누적 ${formatNumber(drawStats.total)}회 추첨 기준 · 기록은 자동 저장돼.`
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
      ([digits, count]) => [
        digitNames[digits],
        count,
        ""
      ]
    ),
    drawStats.total
  );

  renderStatBar(
    $("last-digit-statistics"),
    Object.entries(drawStats.lastDigits).map(
      ([digit, count]) => [
        `끝자리 ${digit}`,
        count,
        ""
      ]
    ),
    drawStats.total
  );

  renderStatBar(
    $("rarity-statistics"),
    RARITY_ORDER.map(level => [
      getRarityTitle(level),
      drawStats.rarities[level] || 0,
      `bar-${level}`
    ]),
    drawStats.total
  );
}

function addToHistory(result) {
  const value = Number(result);
  const pattern = getRarePattern(String(value));

  history.unshift(value);
  history = history.slice(0, HISTORY_LIMIT);

  if (pattern && rareHistoryLevels.has(pattern.level)) {
    rareHistory.unshift({
      value,
      pattern
    });

    rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
  }

  totalDraws++;

  if (highestNumber === null || value > highestNumber) {
    highestNumber = value;
  }

  if (lowestNumber === null || value < lowestNumber) {
    lowestNumber = value;
  }

  renderHistory();
  renderRareHistory();
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
    number.textContent = formatNumber(value);

    const pattern = getRarePattern(String(value));

    if (pattern) {
      item.classList.add(
        "rare-history-item",
        `rare-history-${pattern.level}`
      );

      number.title = pattern.title;

      const mark = document.createElement("span");
      mark.className = "history-rare-mark";
      mark.textContent = getRarityTitle(pattern.level);

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

    const rank = document.createElement("span");
    rank.className = "history-index";
    rank.textContent = `#${index + 1}`;

    const mark = document.createElement("span");
    mark.className = "history-rare-mark";
    mark.textContent = getRarityTitle(entry.pattern.level);

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

    averageStatus.textContent =
      `${history.length}/${HISTORY_LIMIT}회 추첨 완료`;

    return;
  }

  const sum = history.reduce(
    (total, value) => total + value,
    0
  );

  averageElement.textContent =
    formatNumber(Math.round(sum / HISTORY_LIMIT));

  averageStatus.textContent = "최근 10회 결과의 평균";
}

function updateStatistics() {
  maxNumberElement.textContent =
    highestNumber === null ? "—" : formatNumber(highestNumber);

  minNumberElement.textContent =
    lowestNumber === null ? "—" : formatNumber(lowestNumber);

  totalDrawsElement.textContent = formatNumber(totalDraws);
}

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
    autoResults.push(value);

    if (pattern) {
      autoRareResults.push({
        value,
        pattern
      });
    }
  }

  updateNumberInfo(result);

  triggerNextResultEffect(pattern, result);

  if (lastDrawWasCheat) {
    statusElement.textContent =
      `치트 추첨 완료 · ${formatNumber(value)}`;
  } else if (pattern && settings.rareEffects) {
    statusElement.textContent =
      `특별한 패턴 발견! · ${formatNumber(value)}`;
  } else {
    statusElement.textContent =
      `추첨 완료 · ${formatNumber(value)}`;
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

function drawWithAnimation() {
  if (isDrawing) return;

  isDrawing = true;

  clearRollTimers();
  resetNumberEffects();

  setButtonsDisabled(true);

  triggerButtonImpact(drawButton);

  statusElement.textContent = "숫자를 추첨하는 중...";

  digitElements.forEach(digit => {
    digit.classList.remove("leading-zero");
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
      digit.textContent = String(
        Math.floor(Math.random() * 10)
      );
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
        setTimeout(() => {
          finishDraw(result);
        }, 400);
      }
    }, timing.start + index * timing.interval);

    rollTimeouts.push(stopId);
  });
}

drawButton.addEventListener("click", drawWithAnimation);
instantButton.addEventListener("click", drawInstantly);

function openAutoSettings() {
  if (autoRunning) {
    stopAutoDraw("자동 뽑기를 중지했어.");
    return;
  }

  autoOverlay.hidden = false;

  autoButton.setAttribute("aria-expanded", "true");

  autoMessage.textContent =
    "설정을 정한 다음 자동 뽑기를 시작해 봐.";

  closeAutoButton.focus();
}

function closeAutoSettings() {
  autoOverlay.hidden = true;

  autoButton.setAttribute("aria-expanded", "false");

  autoButton.focus();
}

function getSelectedAutoRarities() {
  return Array.from(
    document.querySelectorAll(
      'input[name="auto-stop-rarity"]:checked'
    )
  ).map(input => input.value);
}

document.querySelectorAll('input[name="auto-limit-mode"]').forEach(input => {
  input.addEventListener("change", () => {
    if (!input.checked) return;

    const countMode = input.value === "count";

    autoDurationSetting.hidden = countMode;
    autoCountSetting.hidden = !countMode;
  });
});

function startAutoDraw() {
  autoLimitMode =
    document.querySelector(
      'input[name="auto-limit-mode"]:checked'
    )?.value || "duration";

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
    document.querySelector(
      'input[name="auto-mode"]:checked'
    )?.value || "animated";

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

  statusElement.textContent =
    autoLimitMode === "count"
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

  autoButton.innerHTML =
    '<span class="button-icon">⟳</span> 자동 뽑기';

  autoButton.classList.remove("auto-running");

  setButtonsDisabled(isDrawing);

  statusElement.textContent = message;

  showAutoSummary(message);
}

function runNextAutoDraw() {
  if (!autoRunning) return;

  if (
    autoLimitMode === "duration" &&
    Date.now() >= autoEndsAt
  ) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  if (
    autoLimitMode === "count" &&
    autoCompletedCount >= autoTargetCount
  ) {
    stopAutoDraw(
      `설정한 ${formatNumber(autoTargetCount)}회 추첨을 완료했어!`
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

  if (
    autoLimitMode === "duration" &&
    Date.now() >= autoEndsAt
  ) {
    stopAutoDraw("설정한 지속시간이 끝나 자동 뽑기를 멈췄어.");
    return;
  }

  if (
    autoLimitMode === "count" &&
    autoCompletedCount >= autoTargetCount
  ) {
    stopAutoDraw(
      `설정한 ${formatNumber(autoTargetCount)}회 추첨을 완료했어!`
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

function showAutoSummary(reason) {
  if (autoCompletedCount <= 0 || autoResults.length === 0) {
    return;
  }

  $("summary-draw-count").textContent =
    formatNumber(autoCompletedCount);

  const sum = autoResults.reduce(
    (total, value) => total + value,
    0
  );

  $("summary-average").textContent =
    formatNumber(Math.round(sum / autoResults.length));

  $("summary-max").textContent =
    formatNumber(Math.max(...autoResults));

  $("summary-min").textContent =
    formatNumber(Math.min(...autoResults));

  const list = $("summary-rare-list");

  list.replaceChildren();

  if (autoRareResults.length === 0) {
    const item = document.createElement("li");

    item.textContent =
      "이번 자동 뽑기에서 희귀 숫자가 나오지 않았어.";

    list.appendChild(item);
  } else {
    sortRareResults(autoRareResults)
      .slice(0, 20)
      .forEach(entry => {
        const item = document.createElement("li");

        item.textContent =
          `${entry.pattern.detail} · ${formatNumber(entry.value)}`;

        item.className =
          `summary-${entry.pattern.level}`;

        list.appendChild(item);
      });

    if (autoRareResults.length > 20) {
      const more = document.createElement("li");

      more.textContent =
        `외 ${formatNumber(autoRareResults.length - 20)}개 희귀 결과`;

      list.appendChild(more);
    }
  }

  $("summary-reason").textContent =
    reason || "자동 뽑기가 종료됐어.";

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

const RARITY_CONDITION_DESCRIPTIONS = {
  apex: "9090909 · AB 반복형 최고 패턴",
  omniversal: "1234321 · 7654567 · 대칭형 숫자 배열",
  divine: "8888887 · 7777778 · 9999998 · 4444449",
  genesis: "1122334 · 2233445 · 3344556 · 4455667 · 5566778 · 6677889 · 7788990 · 9988776",
  prismatic: "1231234 · 2342345 · 3453456 · 4564567 · 5675678 · 6786789",
  noteworthy: "7자리 · 첫/끝 숫자 동일 · 서로 다른 숫자 5종 이상 · 숫자 합이 7의 배수",
  curious: "7자리 · 서로 다른 숫자 5종 · 숫자 합이 5의 배수",
  oddity: "7자리 · 서로 다른 숫자 3~4종 · 숫자 합이 홀수 · 연속 반복 최대 2자리"
};

function syncRarityTableConditions() {
  const table = document.querySelector(".rarity-table");
  if (!table) return;

  Object.entries(RARITY_CONDITION_DESCRIPTIONS).forEach(([level, description]) => {
    const badge = table.querySelector(`.rarity-badge.${level}`);
    const row = badge?.closest("tr");

    if (!row || !row.cells.length) return;

    const conditionCell = row.cells[0];
    const orderElement = conditionCell.querySelector(".rarity-order");
    const orderText = orderElement ? orderElement.textContent : "";

    conditionCell.replaceChildren();

    if (orderText) {
      const order = document.createElement("span");
      order.className = "rarity-order";
      order.textContent = orderText;
      conditionCell.appendChild(order);
    }

    conditionCell.appendChild(document.createTextNode(` ${description}`));
  });
}

function openRarity() {
  syncRarityTableConditions();
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

function openCheatPanel() {
  cheatOverlay.hidden = false;

  cheatButton.setAttribute("aria-expanded", "true");

  cheatMessage.textContent =
    queuedCheatNumber === null
      ? "치트를 설정하면 다음 추첨에 한 번 적용돼."
      : `다음 추첨 예약 숫자: ${queuedCheatNumber}`;

  closeCheatButton.focus();
}

function closeCheat() {
  cheatOverlay.hidden = true;

  cheatButton.setAttribute("aria-expanded", "false");

  cheatButton.focus();
}

cheatButton.addEventListener("click", () => {
  requestProtectedAccess("cheat");
});

closeCheatButton.addEventListener("click", closeCheat);

cheatOverlay.addEventListener("click", event => {
  if (event.target === cheatOverlay) {
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

  queuedCheatNumber =
    String(value).padStart(DIGITS, "0");

  cheatMessage.textContent =
    `설정 완료! 다음 추첨에서 ${formatNumber(value)}이(가) 나와.`;
});

clearCheatButton.addEventListener("click", () => {
  queuedCheatNumber = null;
  cheatNumberInput.value = "";

  cheatMessage.textContent =
    "치트를 해제했어. 이제 무작위 숫자가 나와.";
});

function requestProtectedAccess(action) {
  if (
    sessionUnlocked &&
    (action === "cheat" || action === "turbo")
  ) {
    if (action === "cheat") {
      openCheatPanel();
    }

    if (action === "turbo") {
      openTurboPanel();
    }

    return;
  }

  pendingProtectedAction = action;

  passwordInput.value = "";

  passwordMessage.textContent =
    "비밀번호를 입력해 줘.";

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
    passwordMessage.textContent =
      "비밀번호가 틀렸어. 다시 입력해 줘.";

    passwordInput.value = "";
    passwordInput.focus();

    return;
  }

  const action = pendingProtectedAction;

  sessionUnlocked = true;

  closePassword();

  if (action === "cheat") {
    openCheatPanel();
  }

  if (action === "turbo") {
    openTurboPanel();
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

function openReplay() {
  replayOverlay.hidden = false;

  replayButton.setAttribute("aria-expanded", "true");

  replayMessage.textContent =
    "보고 싶은 연출을 선택해 줘.";

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

    const label =
      button.querySelector(".rarity-badge")?.textContent?.trim();

    if (!level || !label || !RARITY_ORDER.includes(level)) {
      return;
    }

    pendingEffectOverride = {
      title: `✦ ${label.toUpperCase()} EFFECT ✦`,
      level,
      detail: label
    };

    document.querySelectorAll("[data-preview-rarity]").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    replayMessage.textContent =
      `${label} 연출을 선택했어. 창을 닫고 다음 숫자를 뽑으면 적용돼!`;

    closeReplay();

    statusElement.textContent =
      `다음 추첨에 ${label} 연출이 예약됐어.`;
  });
});

function openTurboPanel() {
  turboOverlay.hidden = false;

  turboButton.setAttribute("aria-expanded", "true");

  turboMessage.textContent =
    "실행하면 결과 요약이 표시돼.";

  closeTurboButton.focus();
}

function closeTurbo() {
  turboOverlay.hidden = true;

  turboButton.setAttribute("aria-expanded", "false");

  turboButton.focus();
}

turboButton.addEventListener("click", () => {
  requestProtectedAccess("turbo");
});

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

  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 100000
  ) {
    turboMessage.textContent =
      "추첨 횟수는 1회부터 100,000회 사이의 정수로 입력해 줘.";

    return;
  }

  const results = [];
  const rareResults = [];

  let localMax = -Infinity;
  let localMin = Infinity;
  let sum = 0;

  startTurboButton.disabled = true;

  turboMessage.textContent =
    `${formatNumber(count)}회 추첨 중...`;

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
        rareHistory.unshift({
          value,
          pattern
        });

        rareHistory = rareHistory.slice(0, HISTORY_LIMIT);
      }

      rareResults.push({
        value,
        pattern
      });
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

  resetNumberEffects();

  setDisplayedNumber(finalResult, true);

  digitCountLabel.textContent =
    getDigitCountLabel(finalResult);

  updateNumberInfo(finalResult);

  triggerNextResultEffect(
    getRarePattern(finalResult),
    finalResult
  );

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
    `초고속 추첨 완료 · ${formatNumber(count)}회`;

  turboMessage.textContent =
    `완료! 평균 ${formatNumber(Math.round(sum / count))} · 최댓값 ${formatNumber(localMax)} · 최솟값 ${formatNumber(localMin)}`;

  startTurboButton.disabled = false;

  closeTurbo();

  showAutoSummary(
    `초고속 추첨 ${formatNumber(count)}회 완료!`
  );
}

startTurboButton.addEventListener("click", runTurboDraw);

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

function restoreProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);

    if (!raw) return;

    const saved = JSON.parse(raw);

    if (!saved || typeof saved !== "object") {
      return;
    }

    history = Array.isArray(saved.history)
      ? saved.history
          .filter(Number.isFinite)
          .slice(0, HISTORY_LIMIT)
      : [];

    rareHistory = Array.isArray(saved.rareHistory)
      ? saved.rareHistory
          .filter(item => item && Number.isFinite(item.value))
          .map(item => ({
            value: item.value,
            pattern: getRarePattern(String(item.value))
          }))
          .filter(entry =>
            entry.pattern &&
            entry.pattern.level !== "common"
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
      const previousRarities = saved.drawStats.rarities || {};

      [
        "odd",
        "even",
        "prime",
        "composite",
        "total",
        "sum"
      ].forEach(key => {
        if (Number.isFinite(saved.drawStats[key])) {
          drawStats[key] = saved.drawStats[key];
        }
      });

      ["digits", "lastDigits"].forEach(group => {
        const previous = saved.drawStats[group];

        if (previous && typeof previous === "object") {
          Object.keys(drawStats[group]).forEach(key => {
            if (Number.isFinite(previous[key])) {
              drawStats[group][key] = previous[key];
            }
          });
        }
      });

      Object.keys(drawStats.rarities).forEach(key => {
        if (Number.isFinite(previousRarities[key])) {
          drawStats.rarities[key] = previousRarities[key];
        }
      });

      if (
        Object.prototype.hasOwnProperty.call(
          previousRarities,
          "transcendent"
        )
      ) {
        drawStats.rarities.pi =
          previousRarities.pi ??
          previousRarities.transcendent ??
          0;

        drawStats.rarities.euler =
          previousRarities.euler ??
          previousRarities.singularity ??
          0;

        drawStats.rarities["golden-light"] =
          previousRarities["golden-light"] ??
          previousRarities.paradox ??
          0;

        drawStats.rarities.hallow =
          previousRarities.hallow ??
          previousRarities.sovereign ??
          0;

        drawStats.rarities.paradox =
          previousRarities.astral ?? 0;

        drawStats.rarities.common +=
          (previousRarities.infinity || 0) +
          (previousRarities.ethereal || 0) +
          (previousRarities.radiant || 0);
      }
    }
  } catch (error) {
    console.warn("Violet Random 기록 복원 실패:", error);
  }
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (!dataResetConfirmOverlay.hidden) {
    closeDataResetConfirm();
    return;
  }

  if (!dataResetOverlay.hidden) {
    closeDataReset();
    return;
  }

  if (!rareHistoryFilterPanel.hidden) {
    closeRareHistoryFilter();
  }

  if (!settingsOverlay.hidden) {
    closeSettings();
  }

  if (!cheatOverlay.hidden) {
    closeCheat();
  }

  if (!autoOverlay.hidden) {
    closeAutoSettings();
  }

  if (!statisticsOverlay.hidden) {
    closeStatistics();
  }

  if (!rarityOverlay.hidden) {
    closeRarity();
  }

  if (!replayOverlay.hidden) {
    closeReplay();
  }

  if (!passwordOverlay.hidden) {
    closePassword();
  }

  if (!turboOverlay.hidden) {
    closeTurbo();
  }

  if (!autoSummaryOverlay.hidden) {
    closeAutoSummary();
  }
});

restoreProgress();

populateSettingsControls();
applySettings();

setDisplayedNumber(lastResult, true);

if (totalDraws > 0) {
  digitCountLabel.textContent =
    getDigitCountLabel(lastResult);

  updateNumberInfo(lastResult);

  statusElement.textContent =
    "이전 기록을 불러왔어. 계속 추첨해 봐!";
}

renderHistory();
renderRareHistory();
updateAverage();
updateStatistics();
renderStatistics();
syncRarityTableConditions();

resizeCanvas();
animateParticles();
