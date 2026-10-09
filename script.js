
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

const digitElements = Array.from(
  numberElement.querySelectorAll("span")
);

let history = [];
let isDrawing = false;
let animationTimers = [];
let animationIntervals = [];

/* 0부터 9,999,999까지 균등한 확률로 난수 생성 */
function secureRandomNumber() {
  const RANGE = 10_000_000;
  const MAX = 0x100000000;
  const LIMIT = Math.floor(MAX / RANGE) * RANGE;
  const buffer = new Uint32Array(1);

  // 편향이 생기는 일부 난수를 버려 확률을 균등하게 맞춤
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= LIMIT);

  return String(buffer[0] % RANGE).padStart(DIGITS, "0");
}

/* 이전 애니메이션의 타이머와 인터벌 정리 */
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

function resetNumberEffects() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact");

  digitElements.forEach(digit => {
    digit.classList.remove("rolling");
  });
}

/* 버튼을 누를 때 버튼 주위로 퍼지는 임팩트 */
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
    15,
    65
  );
}

/* 숫자 추첨 완료 임팩트 */
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
    42,
    Math.min(rect.width * 0.55, 240)
  );

  const timer = setTimeout(() => {
    numberBox.classList.remove("impact");
  }, 600);

  animationTimers.push(timer);
}

/* 별과 작은 파티클 생성 */
function createBurst(x, y, count = 30, distance = 150) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    const isStar = Math.random() < 0.32;

    particle.className = isStar
      ? "burst-particle star"
      : "burst-particle";

    if (isStar) {
      particle.textContent = Math.random() < 0.5 ? "✦" : "✧";
    }

    const angle = Math.random() * Math.PI * 2;
    const travelDistance = distance * (0.35 + Math.random() * 0.65);
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

    item.append(rank, number);
    historyList.appendChild(item);
  });
}

/* 기록이 10개 쌓이면 평균 계산 */
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

  averageElement.textContent = Math.round(average).toLocaleString("en-US");
  averageStatus.textContent = "최근 10회 결과의 평균";
}

/* 추첨 결과 확정 */
function finishDraw(result) {
  clearAnimationTimers();

  setDisplayedNumber(result, true);
  addToHistory(result);
  triggerResultImpact();

  statusElement.textContent =
    `추첨 완료 · ${Number(result).toLocaleString("en-US")}`;

  isDrawing = false;
  setButtonsDisabled(false);
}

/* 즉각 뽑기: 애니메이션 없이 결과 표시 */
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

  // 실제 추첨 결과는 애니메이션 시작 시 한 번만 생성
  const result = secureRandomNumber();

  const startDelay = 650;
  const stopInterval = 260;
  const spinSpeed = 55;

  // 각 자리가 독립적으로 굴러감
  digitElements.forEach((digit, index) => {
    const interval = setInterval(() => {
      digit.textContent = String(
        Math.floor(Math.random() * 10)
      );
    }, spinSpeed);

    animationIntervals.push(interval);

    // 왼쪽 자리부터 차례대로 멈춤
    const stopTimer = setTimeout(() => {
      clearInterval(interval);

      digit.classList.remove("rolling");
      digit.textContent = result[index];

      // 마지막 자리까지 멈춘 뒤 결과를 확정
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

/* 은은하게 떠다니는 배경 파티클 */
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

    ctx.fillStyle = `rgba(183, 124, 255, ${particle.alpha})`;
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
