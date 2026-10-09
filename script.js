const DIGITS = 7;
const HISTORY_LIMIT = 10;

const numberElement = document.getElementById("number");
const numberBox = document.getElementById("number-box");
const drawButton = document.getElementById("draw-button");
const instantButton = document.getElementById("instant-button");
const statusElement = document.getElementById("status");
const historyList = document.getElementById("history-list");
const averageElement = document.getElementById("average");
const averageStatus = document.getElementById("average-status");
const effectsLayer = document.getElementById("effects");

const maxNumberElement = document.getElementById("max-number");
const minNumberElement = document.getElementById("min-number");
const totalDrawsElement = document.getElementById("total-draws");
const primeStatus = document.getElementById("prime-status");
const divisorStatus = document.getElementById("divisor-status");
const rareLabel = document.getElementById("rare-label");
const rareSetting = document.getElementById("rare-setting");

const digitElements = Array.from(
  numberElement.querySelectorAll("span")
);

let history = [];
let isDrawing = false;
let animationTimers = [];
let animationIntervals = [];

let totalDraws = 0;
let maxNumber = null;
let minNumber = null;

/* 즉각 뽑기를 일반 뽑기 버튼 위로 이동 */
drawButton.parentElement.insertBefore(
  instantButton,
  drawButton
);

/* 0부터 9,999,999까지 균등한 확률로 난수 생성 */
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

/* 이전 애니메이션 타이머와 인터벌 정리 */
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

/* 숫자 표시 */
function setDisplayedNumber(value, hideLeadingZeros = false) {
  digitElements.forEach((digit, index) => {
    digit.textContent = value[index];

    const leadingZero =
      hideLeadingZeros &&
      value.slice(0, index + 1).split("").every(
        char => char === "0"
      );

    digit.style.display = leadingZero
      ? "none"
      : "inline-block";

    digit.classList.remove("rolling");
  });
}

/* 숫자 이펙트 초기화 */
function resetNumberEffects() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact");

  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
  });

  rareLabel.textContent = "";
  rareLabel.classList.remove("rare-active");
}

/* 버튼을 누르면 주변으로 작은 별과 파티클 생성 */
function triggerButtonImpact(button) {
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
    12,
    55
  );
}

/* 추첨 완료 시 결과 숫자에 임팩트 */
function triggerResultImpact() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact");

  void numberElement.offsetWidth;

  numberElement.classList.add("finished");
  numberBox.classList.add("impact");

  const rect = numberBox.getBoundingClientRect();

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    24,
    Math.min(rect.width * 0.35, 150)
  );

  const timer = setTimeout(() => {
    numberBox.classList.remove("impact");
  }, 600);

  animationTimers.push(timer);
}

/* 별과 파티클 생성: 기존 CSS 애니메이션 사용 */
function createBurst(x, y, count = 30, distance = 150) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    const isStar = Math.random() < 0.32;

    particle.className = isStar
      ? "burst-particle star"
      : "burst-particle";

    if (isStar) {
      particle.textContent =
        Math.random() < 0.5 ? "✦" : "✧";
    }

    const angle = Math.random() * Math.PI * 2;
    const travelDistance =
      distance * (0.35 + Math.random() * 0.65);

    const dx = Math.cos(angle) * travelDistance;
    const dy = Math.sin(angle) * travelDistance;

    const size = isStar
      ? `${8 + Math.random() * 10}px`
      : `${2 + Math.random() * 4}px`;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);
    particle.style.setProperty("--size", size);
    particle.style.setProperty(
      "--rotation",
      `${Math.random() * 240 - 120}deg`
    );
    particle.style.setProperty(
      "--duration",
      `${450 + Math.random() * 500}ms`
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

/* 소수 판별 */
function isPrime(number) {
  if (number < 2) return false;
  if (number === 2) return true;
  if (number % 2 === 0) return false;

  for (let i = 3; i * i <= number; i += 2) {
    if (number % i === 0) return false;
  }

  return true;
}

/* 약수 계산 */
function getDivisors(number) {
  if (number === 0) return null;

  const divisors = [];
  const upperDivisors = [];

  for (let i = 1; i * i <= number; i++) {
    if (number % i === 0) {
      divisors.push(i);

      if (i !== number / i) {
        upperDivisors.push(number / i);
      }
    }
  }

  return divisors.concat(upperDivisors.reverse());
}

/* 소수 여부와 약수 표시 */
function updateNumberInfo(value) {
  const number = Number(value);

  if (isPrime(number)) {
    primeStatus.textContent = "✦ 소수";
  } else if (number >= 2) {
    primeStatus.textContent = "합성수";
  } else {
    primeStatus.textContent = "소수도 합성수도 아님";
  }

  if (number === 0) {
    divisorStatus.textContent = "0의 약수는 무한히 많아";
    return;
  }

  const divisors = getDivisors(number);

  const previewLimit = 12;
  const preview = divisors
    .slice(0, previewLimit)
    .map(value => value.toLocaleString("en-US"));

  if (divisors.length > previewLimit) {
    preview.push("...");
  }

  divisorStatus.textContent =
    `약수 ${divisors.length}개 · ${preview.join(", ")}`;
}

/* 희귀 숫자 패턴 판별 */
function getRarePattern(value) {
  /* 럭키 세븐 */
  if (value === "7777777") {
    return "💜 LUCKY SEVEN!";
  }

  /* 같은 숫자 7개 */
  if (/^(\d)\1{6}$/.test(value)) {
    return "✨ ALL SAME DIGITS!";
  }

  /* 연속 숫자 */
  if (value === "1234567" || value === "7654321") {
    return "🌟 SEQUENTIAL!";
  }

  /* 앞뒤가 같은 대칭 숫자 */
  if (value === value.split("").reverse().join("")) {
    return "🔮 PALINDROME!";
  }

  /* 12 또는 123 같은 짧은 패턴 반복 */
  for (let size = 1; size <= 3; size++) {
    const pattern = value.slice(0, size);

    if (pattern.repeat(Math.ceil(7 / size)).slice(0, 7) === value) {
      return "💎 REPEATING PATTERN!";
    }
  }

  /* 앞부분에 0이 4개 이상 */
  if (/^0{4,}/.test(value)) {
    return "🌙 ZERO PATTERN!";
  }

  return "";
}

/* 희귀 숫자 전용 이펙트 */
function triggerRareEffect(value) {
  const pattern = getRarePattern(value);

  if (!pattern || (rareSetting && !rareSetting.checked)) {
    rareLabel.textContent = "";
    rareLabel.classList.remove("rare-active");
    return false;
  }

  rareLabel.textContent = pattern;
  rareLabel.classList.remove("rare-active");

  void rareLabel.offsetWidth;

  rareLabel.classList.add("rare-active");

  const rect = numberBox.getBoundingClientRect();

  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    42,
    Math.min(rect.width * 0.5, 210)
  );

  return true;
}

/* 최댓값, 최솟값, 전체 추첨 횟수 */
function updateStatistics(result) {
  const number = Number(result);

  totalDraws++;

  if (maxNumber === null || number > maxNumber) {
    maxNumber = number;
  }

  if (minNumber === null || number < minNumber) {
    minNumber = number;
  }

  maxNumberElement.textContent =
    maxNumber.toLocaleString("en-US");

  minNumberElement.textContent =
    minNumber.toLocaleString("en-US");

  totalDrawsElement.textContent =
    totalDraws.toLocaleString("en-US");
}

/* 추첨 기록 추가 */
function addToHistory(result) {
  history.unshift(String(Number(result)));
  history = history.slice(0, HISTORY_LIMIT);

  renderHistory();
  updateAverage();
}

/* 최근 10회 기록 표시 */
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

    /* 희귀 패턴이 있는 기록도 강조 */
    if (getRarePattern(value)) {
      number.style.color = "#d0aaff";
      number.style.textShadow = "0 0 10px rgba(180, 122, 255, 0.6)";
      number.style.fontWeight = "800";
    }

    item.append(rank, number);
    historyList.appendChild(item);
  });
}

/* 최근 10회 평균 */
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

/* 추첨 결과 확정 */
function finishDraw(result) {
  clearAnimationTimers();

  setDisplayedNumber(result, true);

  updateStatistics(result);
  updateNumberInfo(result);
  addToHistory(result);

  triggerResultImpact();

  const isRare = triggerRareEffect(result);

  statusElement.textContent = isRare
    ? `희귀 숫자 발견! · ${getRarePattern(result)}`
    : `추첨 완료 · ${Number(result).toLocaleString("en-US")}`;

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

/* 일반 뽑기: 숫자가 굴러가며 왼쪽부터 차례대로 멈춤 */
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

  /* 실제 결과는 애니메이션 시작 시 한 번만 생성 */
  const result = secureRandomNumber();

  const startDelay = 650;
  const stopInterval = 260;
  const spinSpeed = 55;

  digitElements.forEach((digit, index) => {
    const interval = setInterval(() => {
      digit.textContent = String(
        Math.floor(Math.random() * 10)
      );
    }, spinSpeed);

    animationIntervals.push(interval);

    /* 왼쪽 자리부터 차례대로 멈춤 */
    const stopTimer = setTimeout(() => {
      clearInterval(interval);

      digit.classList.remove("rolling");
      digit.textContent = result[index];

      if (index === DIGITS - 1) {
        const finishTimer = setTimeout(() => {
          finishDraw(result);
        }, 180);

        animationTimers.push(finishTimer);
      }
    }, startDelay + index * stopInterval);

    animationTimers.push(stopTimer);
  });
}

drawButton.addEventListener("click", drawWithAnimation);
instantButton.addEventListener("click", drawInstantly);

/* 은은하게 떠다니는 기존 배경 파티클 */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
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

  particles = Array.from({ length: 65 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.6 + Math.random() * 1.8,
    speed: 0.12 + Math.random() * 0.3,
    drift: (Math.random() - 0.5) * 0.3,
    alpha: 0.15 + Math.random() * 0.45
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  for (const particle of particles) {
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

resizeCanvas();
animateParticles();

renderHistory();
updateAverage();
