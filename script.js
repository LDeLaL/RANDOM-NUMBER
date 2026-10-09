
const DIGITS = 7;
const HISTORY_LIMIT = 10;
const SETTINGS_KEY = "violetRandomSettings";

const DEFAULT_SETTINGS = {
  particles: 65,
  speed: 3,
  effect: 2,
  rareEffects: true
};

const numberElement = document.getElementById("number");
const numberBox = document.getElementById("number-box");
const drawButton = document.getElementById("draw-button");
const instantButton = document.getElementById("instant-button");
const statusElement = document.getElementById("status");
const historyList = document.getElementById("history-list");
const averageElement = document.getElementById("average");
const averageStatus = document.getElementById("average-status");
const effectsLayer = document.getElementById("effects");

const rareLabel = document.getElementById("rare-label");
const primeStatus = document.getElementById("prime-status");
const divisorStatus = document.getElementById("divisor-status");

const maxNumberElement = document.getElementById("max-number");
const minNumberElement = document.getElementById("min-number");
const totalDrawsElement = document.getElementById("total-draws");

const settingsButton = document.getElementById("settings-button");
const settingsOverlay = document.getElementById("settings-overlay");
const closeSettingsButton = document.getElementById("close-settings");
const saveSettingsButton = document.getElementById("save-settings");
const resetSettingsButton = document.getElementById("reset-settings");
const settingsMessage = document.getElementById("settings-message");

const particleSetting = document.getElementById("particle-setting");
const speedSetting = document.getElementById("speed-setting");
const effectSetting = document.getElementById("effect-setting");
const rareSetting = document.getElementById("rare-setting");

const particleValue = document.getElementById("particle-value");
const speedValue = document.getElementById("speed-value");
const effectValue = document.getElementById("effect-value");

const digitElements = Array.from(
  numberElement.querySelectorAll("span")
);

let settings = loadSettings();
let history = [];
let totalDraws = 0;
let highestNumber = null;
let lowestNumber = null;
let isDrawing = false;

let animationTimers = [];
let animationIntervals = [];
let backgroundParticles = [];

let lastFocusedElement = null;

/* -----------------------------
   설정 불러오기 및 저장
----------------------------- */

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(saved);

    return {
      particles: clampNumber(parsed.particles, 0, 150, 65),
      speed: clampNumber(parsed.speed, 1, 5, 3),
      effect: clampNumber(parsed.effect, 0, 3, 2),
      rareEffects:
        typeof parsed.rareEffects === "boolean"
          ? parsed.rareEffects
          : true
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function saveSettings() {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    settingsMessage.textContent = "설정을 저장했어! 💜";
    return true;
  } catch {
    settingsMessage.textContent =
      "저장에 실패했어. 브라우저 저장 공간을 확인해 줘.";
    return false;
  }
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

  speedValue.textContent = speedNames[speedSetting.value];
  effectValue.textContent = effectNames[effectSetting.value];
}

function readSettingsFromControls() {
  settings = {
    particles: Number(particleSetting.value),
    speed: Number(speedSetting.value),
    effect: Number(effectSetting.value),
    rareEffects: rareSetting.checked
  };
}

function applySettings() {
  document.documentElement.style.setProperty(
    "--effect-scale",
    String(settings.effect / 2)
  );

  resizeCanvas();
  updateSettingsLabels();
}

function populateSettingsControls() {
  particleSetting.value = settings.particles;
  speedSetting.value = settings.speed;
  effectSetting.value = settings.effect;
  rareSetting.checked = settings.rareEffects;

  updateSettingsLabels();
}

function openSettings() {
  lastFocusedElement = document.activeElement;

  populateSettingsControls();
  settingsMessage.textContent = "설정은 이 브라우저에 저장돼.";

  settingsOverlay.hidden = false;
  settingsButton.setAttribute("aria-expanded", "true");
  closeSettingsButton.focus();
}

function closeSettings() {
  settingsOverlay.hidden = true;
  settingsButton.setAttribute("aria-expanded", "false");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
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
  rareSetting
].forEach(control => {
  control.addEventListener("input", () => {
    readSettingsFromControls();
    applySettings();
    settingsMessage.textContent =
      "미리 보는 중이야. 저장 버튼을 눌러 적용을 유지해 줘.";
  });
});

saveSettingsButton.addEventListener("click", () => {
  readSettingsFromControls();
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
    "기본값으로 바꿨어. 저장 버튼을 누르면 유지돼.";
});

/* -----------------------------
   공정한 난수 생성
----------------------------- */

function secureRandomNumber() {
  const RANGE = 10_000_000;
  const MAX = 0x100000000;
  const LIMIT = Math.floor(MAX / RANGE) * RANGE;
  const buffer = new Uint32Array(1);

  // 범위가 균등하게 나누어지도록 일부 값을 거부한다.
  // 따라서 0~9,999,999의 모든 결과가 동일한 확률을 갖는다.
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= LIMIT);

  return String(buffer[0] % RANGE).padStart(DIGITS, "0");
}

/* -----------------------------
   애니메이션 타이머 관리
----------------------------- */

function clearAnimationTimers() {
  animationTimers.forEach(clearTimeout);
  animationIntervals.forEach(clearInterval);

  animationTimers = [];
  animationIntervals = [];
}

function setButtonsDisabled(disabled) {
  drawButton.disabled = disabled;
  instantButton.disabled = disabled;
}

function resetNumberEffects() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact", "rare", "rare-legendary");

  rareLabel.textContent = "";

  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
    digit.style.display = "inline-block";
  });

  effectsLayer
    .querySelectorAll(".rare-flash")
    .forEach(element => element.remove());
}

/* -----------------------------
   숫자 패턴 및 희귀 숫자 판별
----------------------------- */

function getRarePattern(value) {
  const digits = value.split("").map(Number);

  // 모든 숫자가 동일: 7777777, 0000000 등
  if (digits.every(digit => digit === digits[0])) {
    return {
      name: "ALL SAME",
      title: "✦ 전설적인 반복 숫자 ✦",
      level: "legendary"
    };
  }

  // 연속 상승 또는 하강: 1234567, 7654321 등
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
      name: "SEQUENCE",
      title: "✦ 완벽한 연속 숫자 ✦",
      level: "legendary"
    };
  }

  // 좌우 대칭: 1234321 등
  const isPalindrome = digits.every(
    (digit, index) => digit === digits[DIGITS - 1 - index]
  );

  if (isPalindrome) {
    return {
      name: "PALINDROME",
      title: "✧ 대칭 숫자 발견 ✧",
      level: "rare"
    };
  }

  // 한 숫자가 7자리 중 5자리 이상 등장
  const counts = {};

  for (const digit of digits) {
    counts[digit] = (counts[digit] || 0) + 1;
  }

  const highestRepeat = Math.max(...Object.values(counts));

  if (highestRepeat >= 5) {
    return {
      name: "REPEATED DIGITS",
      title: "✦ 반복 숫자 발견 ✦",
      level: "rare"
    };
  }

  // 끝자리가 여러 개의 0인 숫자
  if (/0{3,}$/.test(value)) {
    return {
      name: "ROUND NUMBER",
      title: "✧ 라운드 숫자 발견 ✧",
      level: "rare"
    };
  }

  // 같은 숫자 두 개가 반복되는 3자리 패턴이 있는지 확인
  // 예: 5585588처럼 일부 패턴이 반복되는 숫자
  for (let size = 2; size <= 3; size++) {
    for (let start = 0; start + size * 2 <= DIGITS; start++) {
      const first = value.slice(start, start + size);
      const second = value.slice(start + size, start + size * 2);

      if (first === second) {
        return {
          name: "REPEATING PATTERN",
          title: "✧ 반복 패턴 발견 ✧",
          level: "rare"
        };
      }
    }
  }

  return null;
}

/* -----------------------------
   소수 판별
----------------------------- */

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

  // 제곱근까지만 확인하면 소수 여부를 판별할 수 있다.
  for (
    let divisor = 3;
    divisor * divisor <= number;
    divisor += 2
  ) {
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
    divisorStatus.textContent = "약수: 1, " + number.toLocaleString("en-US");
  } else if (number <= 1) {
    primeStatus.textContent = "소수 아님";
    divisorStatus.textContent =
      "1보다 큰 자연수만 소수가 될 수 있어";
  } else {
    primeStatus.textContent = "소수 아님 · 합성수";
    divisorStatus.textContent = "약수가 2개보다 많아";
  }
}

/* -----------------------------
   파티클 및 임팩트 효과
----------------------------- */

function createBurst(x, y, count = 30, distance = 150, kind = "normal") {
  const intensity = settings.effect;

  if (intensity === 0 || count <= 0) {
    return;
  }

  const multiplier = intensity / 2;
  const actualCount = Math.max(1, Math.round(count * multiplier));
  const actualDistance = distance * (0.55 + multiplier * 0.35);

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < actualCount; i++) {
    const particle = document.createElement("span");

    const isStar = Math.random() < 0.38;
    particle.className = isStar
      ? "burst-particle star"
      : "burst-particle";

    if (kind !== "normal" && isStar) {
      particle.classList.add(
        kind === "legendary" ? "gold-star" : "rare-star"
      );
    }

    if (isStar) {
      particle.textContent =
        Math.random() < 0.5 ? "✦" : "✧";
    }

    const angle = Math.random() * Math.PI * 2;
    const travelDistance =
      actualDistance * (0.35 + Math.random() * 0.65);

    const dx = Math.cos(angle) * travelDistance;
    const dy = Math.sin(angle) * travelDistance;

    let size;

    if (isStar) {
      size = `${8 + Math.random() * 10 * multiplier}px`;
    } else {
      size = `${2 + Math.random() * 4 * multiplier}px`;
    }

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
  if (settings.effect === 0) {
    return;
  }

  button.classList.remove("button-impact");
  void button.offsetWidth;
  button.classList.add("button-impact");

  const timer = setTimeout(() => {
    button.classList.remove("button-impact");
  }, 450);

  animationTimers.push(timer);

  const rect = button.getBoundingClientRect();

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    15,
    65
  );
}

function triggerResultImpact(rarePattern = null) {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact", "rare", "rare-legendary");

  void numberElement.offsetWidth;

  numberElement.classList.add("finished");

  if (settings.effect > 0) {
    numberBox.classList.add("impact");
  }

  const rect = numberBox.getBoundingClientRect();

  if (rarePattern && settings.rareEffects) {
    const kind = rarePattern.level;

    numberBox.classList.add(
      kind === "legendary" ? "rare-legendary" : "rare"
    );

    rareLabel.textContent = rarePattern.title;

    const flash = document.createElement("div");
    flash.className = "rare-flash";

    if (kind === "legendary") {
      flash.classList.add("legendary");
    }

    effectsLayer.appendChild(flash);

    const flashTimer = setTimeout(() => flash.remove(), 900);
    animationTimers.push(flashTimer);

    // 희귀 패턴은 일반 결과보다 파티클을 더 많이 생성
    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      kind === "legendary" ? 100 : 65,
      Math.min(rect.width * 0.85, 320),
      kind
    );
  } else {
    rareLabel.textContent = "";

    createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      42,
      Math.min(rect.width * 0.55, 240)
    );
  }

  const timer = setTimeout(() => {
    numberBox.classList.remove("impact");
  }, 650);

  animationTimers.push(timer);
}

/* -----------------------------
   기록 및 통계
----------------------------- */

function addToHistory(result) {
  const number = Number(result);

  history.unshift(String(number));
  history = history.slice(0, HISTORY_LIMIT);

  totalDraws += 1;

  if (highestNumber === null || number > highestNumber) {
    highestNumber = number;
  }

  if (lowestNumber === null || number < lowestNumber) {
    lowestNumber = number;
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
    number.textContent = value;

    item.append(rank, number);
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

  const sum = history.reduce(
    (total, value) => total + Number(value),
    0
  );

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

/* -----------------------------
   추첨 결과 표시
----------------------------- */

function setDisplayedNumber(value, hideLeadingZeros = false) {
  digitElements.forEach((digit, index) => {
    digit.textContent = value[index];

    const leadingZero =
      hideLeadingZeros &&
      value.slice(0, index + 1).split("").every(char => char === "0");

    digit.style.display = leadingZero ? "none" : "inline-block";
    digit.classList.remove("rolling");
  });
}

function finishDraw(result) {
  clearAnimationTimers();

  setDisplayedNumber(result, true);

  const numericResult = Number(result);
  const rarePattern = getRarePattern(result);

  addToHistory(result);
  updateNumberInfo(result);
  triggerResultImpact(rarePattern);

  if (rarePattern && settings.rareEffects) {
    statusElement.textContent =
      `특별한 패턴 발견! · ${numericResult.toLocaleString("en-US")}`;
  } else {
    statusElement.textContent =
      `추첨 완료 · ${numericResult.toLocaleString("en-US")}`;
  }

  isDrawing = false;
  setButtonsDisabled(false);
}

/* 즉각 뽑기 */
function drawInstantly() {
  if (isDrawing) return;

  isDrawing = true;

  clearAnimationTimers();
  setButtonsDisabled(true);
  resetNumberEffects();

  triggerButtonImpact(instantButton);

  const result = secureRandomNumber();

  finishDraw(result);
}

/* 일반 뽑기: 조금 더 느리고 부드럽게 굴러가는 애니메이션 */
function drawWithAnimation() {
  if (isDrawing) return;

  isDrawing = true;

  clearAnimationTimers();
  setButtonsDisabled(true);
  resetNumberEffects();

  triggerButtonImpact(drawButton);

  statusElement.textContent = "숫자를 추첨하는 중...";

  digitElements.forEach(digit => {
    digit.style.display = "inline-block";
    digit.classList.add("rolling");
  });

  // 최종 결과는 한 번만 생성한다.
  const result = secureRandomNumber();

  const speedMultiplier = {
    1: 1.9,
    2: 1.45,
    3: 1,
    4: 0.78,
    5: 0.62
  }[settings.speed];

  const startDelay = Math.round(850 * speedMultiplier);
  const stopInterval = Math.round(330 * speedMultiplier);
  const spinSpeed = Math.max(45, Math.round(90 * speedMultiplier));

  digitElements.forEach((digit, index) => {
    const interval = setInterval(() => {
      digit.textContent = String(
        Math.floor(Math.random() * 10)
      );
    }, spinSpeed);

    animationIntervals.push(interval);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);

      digit.classList.remove("rolling");
      digit.textContent = result[index];

      // 멈출 때 살짝 튕기는 느낌
      digit.animate(
        [
          { transform: "translateY(-5px) scale(0.98)" },
          { transform: "translateY(2px) scale(1.035)" },
          { transform: "translateY(0) scale(1)" }
        ],
        {
          duration: 260,
          easing: "cubic-bezier(.2, .8, .25, 1)",
          fill: "none"
        }
      );

      if (index === DIGITS - 1) {
        const finishTimer = setTimeout(() => {
          finishDraw(result);
        }, 260);

        animationTimers.push(finishTimer);
      }
    }, startDelay + index * stopInterval);

    animationTimers.push(stopTimer);
  });
}

drawButton.addEventListener("click", drawWithAnimation);
instantButton.addEventListener("click", drawInstantly);

/* -----------------------------
   배경 파티클
----------------------------- */

const canvas = document.getElementById("particles");
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

/* -----------------------------
   초기화
----------------------------- */

populateSettingsControls();
applySettings();

renderHistory();
updateAverage();
updateStatistics();

animateParticles();
