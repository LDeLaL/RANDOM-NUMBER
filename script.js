"use strict";

const DIGITS = 7;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";

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
const statusElement = $("status");
const historyList = $("history-list");
const averageElement = $("average");
const averageStatus = $("average-status");

const rareLabel = $("rare-label");
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

const digitElements = Array.from(
  numberElement.querySelectorAll("span")
);

let settings = loadSettings();

let history = [];
let totalDraws = 0;
let highestNumber = null;
let lowestNumber = null;
let isDrawing = false;
let queuedCheatNumber = null;
let lastDrawWasCheat = false;

let rollTimeouts = [];
let rollIntervals = [];
let backgroundParticles = [];

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

function openCheat() {
  cheatOverlay.hidden = false;
  cheatButton.setAttribute("aria-expanded", "true");

  cheatMessage.textContent = queuedCheatNumber === null
    ? "치트를 설정하면 다음 추첨에 한 번 적용돼."
    : `다음 추첨 예약 숫자: ${Number(queuedCheatNumber).toLocaleString("en-US")}`;

  closeCheatButton.focus();
}

function closeCheat() {
  cheatOverlay.hidden = true;
  cheatButton.setAttribute("aria-expanded", "false");
  cheatButton.focus();
}

cheatButton.addEventListener("click", openCheat);
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
    cheatMessage.textContent = "0부터 9,999,999 사이의 정수를 입력해 줘.";
    return;
  }

  queuedCheatNumber = String(value).padStart(DIGITS, "0");

  cheatMessage.textContent =
    `설정 완료! 다음 추첨에서 ${value.toLocaleString("en-US")}이(가) 나와.`;
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
  drawButton.disabled = disabled;
  instantButton.disabled = disabled;
}

function resetNumberEffects() {
  numberElement.classList.remove("finished");

  numberBox.classList.remove(
    "impact",
    "rare",
    "rare-legendary",
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
      value.slice(0, index + 1).split("").every(char => char === "0");

    digit.style.display = isLeadingZero ? "none" : "inline-block";
    digit.classList.remove("rolling");
  });
}

/* =====================================
   희귀 패턴 판별
===================================== */

function getRarePattern(value) {
  const digits = value.split("").map(Number);

  if (digits.every(digit => digit === digits[0])) {
    return {
      title: "✦ 전설적인 반복 숫자 ✦",
      level: "legendary"
    };
  }

  const ascending = digits.every(
    (digit, index) =>
      index === 0 || digit === digits[index - 1] + 1
  );

  const descending = digits.every(
    (digit, index) =>
      index === 0 || digit === digits[index - 1] - 1
  );

  if (ascending || descending) {
    return {
      title: "✦ 완벽한 연속 숫자 ✦",
      level: "legendary"
    };
  }

  const palindrome = digits.every(
    (digit, index) => digit === digits[DIGITS - 1 - index]
  );

  if (palindrome) {
    return {
      title: "✧ 대칭 숫자 발견 ✧",
      level: "rare"
    };
  }

  const counts = {};

  digits.forEach(digit => {
    counts[digit] = (counts[digit] || 0) + 1;
  });

  if (Math.max(...Object.values(counts)) >= 5) {
    return {
      title: "✦ 반복 숫자 발견 ✦",
      level: "rare"
    };
  }

  // 3개 이상의 같은 숫자가 연속으로 붙어 있는 패턴
  if (/(\d)\1{2,}/.test(value)) {
    return {
      title: "✦ 연속 반복 숫자 발견 ✦",
      level: "rare"
    };
  }

  if (/0{3,}$/.test(value)) {
    return {
      title: "✧ 라운드 숫자 발견 ✧",
      level: "rare"
    };
  }

  // 같은 2자리 또는 3자리 묶음이 연속해서 반복되는 패턴
  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 2 <= DIGITS; start++) {
      const first = value.slice(start, start + size);
      const second = value.slice(start + size, start + size * 2);

      if (first === second) {
        return {
          title: "✧ 반복 패턴 발견 ✧",
          level: "rare"
        };
      }
    }
  }

  return null;
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

function createBurst(x, y, count = 30, distance = 150, kind = "normal") {
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

function triggerResultImpact(pattern = null, result = "0000000") {
  numberElement.classList.remove("finished");

  numberBox.classList.remove(
    "impact",
    "rare",
    "rare-legendary",
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
  const visibleDigits = String(Number(result)).length;
  const magnitudeClass =
    visibleDigits <= 6 ? `magnitude-${visibleDigits}` : "";

  if (magnitudeClass && settings.effect > 0) {
    numberBox.classList.add(magnitudeClass);
  }

  // 자릿수가 적을수록 이펙트 규모가 커진다.
  const magnitudeScale =
    visibleDigits >= 7 ? 1 : 1 + (7 - visibleDigits) * 0.42;

  const rareScale = rareActive
    ? pattern.level === "legendary" ? 1.7 : 1.3
    : 1;

  const totalScale = magnitudeScale * rareScale;

  if (settings.effect > 0) {
    numberBox.classList.add("impact");
  }

  if (rareActive) {
    numberBox.classList.add(
      pattern.level === "legendary" ? "rare-legendary" : "rare"
    );

    rareLabel.textContent = pattern.title;

    const flash = document.createElement("div");
    flash.className = "rare-flash";

    if (pattern.level === "legendary") {
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
      (rareActive
        ? pattern.level === "legendary" ? 100 : 65
        : 30) * totalScale
    ),
    Math.min(rect.width * (0.4 + (totalScale - 1) * 0.13), 320),
    rareActive ? pattern.level : "normal"
  );

  if (settings.effect > 0 && visibleDigits <= 6) {
    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      Math.round(
        (visibleDigits === 6
          ? 12
          : 18 + (6 - visibleDigits) * 12) * (settings.effect / 2)
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

function addToHistory(result) {
  const value = Number(result);

  history.unshift(value);
  history = history.slice(0, HISTORY_LIMIT);

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

    const pattern = getRarePattern(
      String(value).padStart(DIGITS, "0")
    );

    if (pattern) {
      item.classList.add(
        "rare-history-item",
        pattern.level === "legendary"
          ? "rare-history-legendary"
          : "rare-history-rare"
      );

      number.title = pattern.title;

      const mark = document.createElement("span");
      mark.className = "history-rare-mark";
      mark.textContent =
        pattern.level === "legendary" ? "✦ LEGENDARY" : "✧ RARE";

      item.append(rank, mark, number);
    } else {
      item.append(rank, number);
    }

    historyList.appendChild(item);
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

  addToHistory(result);
  updateNumberInfo(result);
  triggerResultImpact(pattern, result);

  if (lastDrawWasCheat) {
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

    if (particle.x < -5) particle.x = width + 5;
    if (particle.x > width + 5) particle.x = -5;

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
   초기화
===================================== */

populateSettingsControls();
applySettings();

renderHistory();
updateAverage();
updateStatistics();

animateParticles();
