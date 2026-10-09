
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

const digitElements = Array.from(numberElement.querySelectorAll("span"));

let history = [];
let isDrawing = false;
let animationTimers = [];

/* 0부터 9,999,999까지 균등한 확률로 추첨 */
function secureRandomNumber() {
  const RANGE = 10_000_000;
  const MAX = 0x100000000;

  // 2^32에서 RANGE의 배수만 남겨 편향을 제거
  const LIMIT = Math.floor(MAX / RANGE) * RANGE;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= LIMIT);

  return String(buffer[0] % RANGE).padStart(DIGITS, "0");
}

function clearAnimationTimers() {
  animationTimers.forEach(clearTimeout);
  animationTimers = [];
}

function setDisplayedNumber(value, hideLeadingZeros = false) {
  digitElements.forEach((digit, index) => {
    digit.textContent = value[index];

    const shouldHide =
      hideLeadingZeros &&
      value.length > 1 &&
      value.slice(0, index + 1).split("").every(char => char === "0");

    digit.style.display = shouldHide ? "none" : "inline-block";
  });
}

function resetNumberEffects() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact");
}

function triggerButtonImpact(button) {
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

function triggerResultImpact() {
  numberElement.classList.remove("finished");
  numberBox.classList.remove("impact");

  void numberElement.offsetWidth;

  numberElement.classList.add("finished");
  numberBox.classList.add("impact");

  const rect = numberBox.getBoundingClientRect();

  // 숫자 상자 주변으로 별과 파티클이 튀어나옴
  createBurst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    42,
    Math.min(rect.width * 0.55, 240)
  );

  setTimeout(() => numberBox.classList.remove("impact"), 600);
}

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
    particle.style.setProperty("--rotation", `${Math.random() * 240 - 120}deg`);
    particle.style.setProperty("--duration", `${450 + Math.random() * 500}ms`);

    fragment.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), {
      once: true
    });
  }

  effectsLayer.appendChild(fragment);
}

function addToHistory(result) {
  history.unshift(String(Number(result)));
  history = history.slice(0, HISTORY_LIMIT);

  renderHistory();
  updateAverage();
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

  const sum = history.reduce((total, value) => total + Number(value), 0);
  const average = sum / HISTORY_LIMIT;

  averageElement.textContent = Math.round(average).toLocaleString("en-US");
  averageStatus.textContent = "최근 10회 결과의 평균";
}

function setButtonsDisabled(disabled) {
  drawButton.disabled = disabled;
  instantButton.disabled = disabled;
}

function finishDraw(result) {
  setDisplayedNumber(result, true);
  addToHistory(result);
  triggerResultImpact();

  statusElement.textContent =
    `추첨 완료 · ${Number(result).toLocaleString("en-US")}`;

  isDrawing = false;
  setButtonsDisabled(false);
}

function drawInstantly() {
  if (isDrawing) return;

  isDrawing = true;
  clearAnimationTimers();
  setButtonsDisabled(true);
  resetNumberEffects();

  triggerButtonImpact(instantButton);

  const result = secureRandomNumber();

  // 즉각 뽑기는 롤링 애니메이션 없이 바로 결과 표시
  finishDraw(result);
}

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
  });

  const result = secureRandomNumber();
  const startTime = 70;
  const firstStop = 850;
  const stopInterval = 300;

  // 추첨 중에 보이는 숫자는 연출용이고,
  // 최종 결과는 위에서 안전하게 생성한 난수임
  for (let index = 0; index < DIGITS; index++) {
    const spin = () => {
      if (index < DIGITS - 1) {
        digitElements[index].textContent = String(
          Math.floor(Math.random() * 10)
        );
      }

      const delay = firstStop + index * stopInterval;

      if (index === DIGITS - 1) {
        // 마지막 자리까지 도는 동안 앞자리도 계속 움직임
        const timer = setTimeout(() => {
          digitElements.forEach((digit, digitIndex) => {
            if (digitIndex < DIGITS - 1) {
              digit.textContent = String(
                Math.floor(Math.random() * 10)
              );
            }
          });

          const finishTimer = setTimeout(() => {
            finishDraw(result);
          }, 180);

          animationTimers.push(finishTimer);
        }, delay);

        animationTimers.push(timer);
        return;
      }

      const timer = setTimeout(() => {
        digitElements[index].textContent = result[index];
        spinNextDigit(index + 1);
      }, delay);

      animationTimers.push(timer);
    };

    if (index === 0) {
      const timer = setTimeout(spin, startTime);
      animationTimers.push(timer);
    }
  }

  function spinNextDigit(index) {
    if (index >= DIGITS) return;

    digitElements[index].textContent = String(
      Math.floor(Math.random() * 10)
    );

    if (index === DIGITS - 1) {
      const timer = setTimeout(() => finishDraw(result), 650);
      animationTimers.push(timer);
      return;
    }

    const timer = setTimeout(() => {
      digitElements[index].textContent = result[index];
      spinNextDigit(index + 1);
    }, 250);

    animationTimers.push(timer);
  }
}

drawButton.addEventListener("click", drawWithAnimation);
instantButton.addEventListener("click", drawInstantly);

/* 배경의 은은한 보라색 파티클 */
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
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
