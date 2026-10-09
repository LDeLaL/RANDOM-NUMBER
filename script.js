
/* =========================
   숫자 추첨 설정
========================= */

const numberElement = document.getElementById("number");
const numberBox = document.getElementById("number-box");
const generateButton = document.getElementById("generate-btn");
const buttonText = document.getElementById("button-text");
const statusElement = document.getElementById("status");

const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");

const averagePanel = document.getElementById("average-panel");
const averageValue = document.getElementById("average-value");
const averageStatus = document.getElementById("average-status");

const DIGITS = 7;
const HISTORY_LIMIT = 10;

const SPIN_SPEED = 85;
const FIRST_STOP = 1000;
const STOP_INTERVAL = 450;

let timers = [];
let rollingIntervals = [];
let isGenerating = false;

let history = [];


/* =========================
   애니메이션 정리
========================= */

function clearAnimations() {
    timers.forEach((timer) => clearTimeout(timer));

    rollingIntervals.forEach((interval) => {
        if (interval !== undefined) {
            clearInterval(interval);
        }
    });

    timers = [];
    rollingIntervals = [];
}


/* =========================
   앞자리 0 제거
========================= */

function displayFinalNumber(result, digits) {
    const visibleNumber = String(Number(result));

    // 숫자 0도 마지막 자리는 표시
    const firstVisibleIndex = DIGITS - visibleNumber.length;

    digits.forEach((digit, index) => {
        digit.classList.remove("rolling", "locked");

        if (index < firstVisibleIndex) {
            digit.style.display = "none";
        } else {
            digit.style.display = "inline-block";
            digit.textContent = result[index];
        }
    });

    // 남은 숫자들이 flex 중앙 정렬로 모이도록 한다.
}


/* =========================
   기록 목록 표시
========================= */

function renderHistory() {
    historyCount.textContent =
        String(history.length).padStart(2, "0");

    historyList.replaceChildren();

    if (history.length === 0) {
        const empty = document.createElement("p");

        empty.className = "history-empty";
        empty.textContent = "No records yet";

        historyList.appendChild(empty);
        return;
    }

    history.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const numberIndex = document.createElement("span");
        numberIndex.className = "history-index";
        numberIndex.textContent =
            String(index + 1).padStart(2, "0");

        const number = document.createElement("span");
        number.className = "history-number";
        number.textContent = value;

        item.append(numberIndex, number);
        historyList.appendChild(item);
    });
}


/* =========================
   평균 계산
========================= */

function updateAverage() {
    if (history.length < HISTORY_LIMIT) {
        averagePanel.classList.remove("ready");

        averageValue.textContent = "--";

        const remaining = HISTORY_LIMIT - history.length;

        averageStatus.textContent =
            `평균 계산까지 ${remaining}회 남음`;

        return;
    }

    // 문자열을 실제 숫자로 변환하여 평균 계산
    const total = history.reduce((sum, value) => {
        return sum + Number(value);
    }, 0);

    const average = total / HISTORY_LIMIT;

    averagePanel.classList.add("ready");

    // 소수점 둘째 자리까지 표시
    averageValue.textContent = average.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

    averageStatus.textContent = "최근 10회 추첨 평균";
}


/* =========================
   추첨 결과 기록
========================= */

function addToHistory(result) {
    // 앞자리 0을 제거한 결과를 기록
    const displayValue = String(Number(result));

    history.unshift(displayValue);

    // 최근 10개만 유지
    if (history.length > HISTORY_LIMIT) {
        history = history.slice(0, HISTORY_LIMIT);
    }

    renderHistory();
    updateAverage();
}


/* =========================
   숫자 확정 애니메이션
========================= */

function digitLockEffect(digit) {
    digit.classList.remove("rolling", "locked");

    void digit.offsetWidth;

    digit.classList.add("locked");
}


/* =========================
   추첨 완료 임팩트
========================= */

function playResultImpact() {
    numberElement.classList.remove("finished");
    numberBox.classList.remove("finished", "impact");

    // 기존 애니메이션을 초기화하여 다시 실행
    void numberBox.offsetWidth;

    numberElement.classList.add("finished");
    numberBox.classList.add("finished", "impact");

    // 파동 애니메이션 클래스 정리
    const impactTimer = setTimeout(() => {
        numberBox.classList.remove("impact");
    }, 1000);

    timers.push(impactTimer);
}


/* =========================
   숫자 추첨
========================= */

function generateNumber() {
    if (isGenerating) return;

    isGenerating = true;

    clearAnimations();

    generateButton.disabled = true;
    buttonText.textContent = "GENERATING";

    statusElement.textContent = "GENERATING NUMBER...";

    numberElement.classList.remove("finished");
    numberBox.classList.remove("finished", "impact");

    const digits = numberElement.querySelectorAll("span");

    // 숨겨진 앞자리 0을 다시 표시
    digits.forEach((digit) => {
        digit.style.display = "inline-block";
        digit.classList.remove("locked");
        digit.classList.add("rolling");

        digit.textContent = Math.floor(Math.random() * 10);
    });

    // 0 ~ 9999999
    const result = String(
        Math.floor(Math.random() * 10000000)
    ).padStart(DIGITS, "0");

    // 숫자 회전
    digits.forEach((digit, index) => {
        rollingIntervals[index] = setInterval(() => {
            digit.textContent = Math.floor(Math.random() * 10);
        }, SPIN_SPEED + index * 8);
    });

    // 왼쪽부터 순서대로 확정
    for (let i = 0; i < DIGITS; i++) {
        const timer = setTimeout(() => {
            clearInterval(rollingIntervals[i]);

            digitLockEffect(digits[i]);
            digits[i].textContent = result[i];

        }, FIRST_STOP + i * STOP_INTERVAL);

        timers.push(timer);
    }

    // 모든 숫자가 멈춘 뒤 최종 결과 표시
    const finishTimer = setTimeout(() => {
        displayFinalNumber(result, digits);

        playResultImpact();

        statusElement.textContent = "NUMBER GENERATED";

        buttonText.textContent = "GENERATE";
        generateButton.disabled = false;

        isGenerating = false;

        addToHistory(result);

    }, FIRST_STOP + (DIGITS - 1) * STOP_INTERVAL + 400);

    timers.push(finishTimer);
}

generateButton.addEventListener("click", generateNumber);


/* =========================
   파티클 배경
========================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame = null;

const PARTICLE_COUNT = 75;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;


/* =========================
   캔버스 크기 조절
========================= */

function resizeCanvas() {
    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.floor(canvasWidth * pixelRatio);
    canvas.height = Math.floor(canvasHeight * pixelRatio);

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createParticles();
}


/* =========================
   파티클 생성
========================= */

function createParticles() {
    particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,

            size: Math.random() * 1.5 + 0.4,

            speedX: (Math.random() - 0.5) * 0.22,
            speedY: (Math.random() - 0.5) * 0.22,

            alpha: Math.random() * 0.45 + 0.15,

            twinkleSpeed: Math.random() * 0.008 + 0.002,
            twinkleOffset: Math.random() * Math.PI * 2,

            // 보라색 계열
            hue: Math.random() * 28 + 268
        });
    }
}


/* =========================
   파티클 애니메이션
========================= */

function animateParticles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -5) {
            particle.x = canvasWidth + 5;
        } else if (particle.x > canvasWidth + 5) {
            particle.x = -5;
        }

        if (particle.y < -5) {
            particle.y = canvasHeight + 5;
        } else if (particle.y > canvasHeight + 5) {
            particle.y = -5;
        }

        particle.twinkleOffset += particle.twinkleSpeed;

        const twinkle =
            0.55 + Math.sin(particle.twinkleOffset) * 0.45;

        const opacity = particle.alpha * twinkle;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `hsla(${particle.hue}, 85%, 75%, ${opacity})`;

        ctx.fill();

        if (particle.size > 1.3) {
            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size * 3,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `hsla(${particle.hue}, 85%, 70%, ${opacity * 0.09})`;

            ctx.fill();
        }
    });

    animationFrame = requestAnimationFrame(animateParticles);
}


/* =========================
   초기화
========================= */

renderHistory();
updateAverage();

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animateParticles();


/* =========================
   화면 비활성화 최적화
========================= */

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    } else if (animationFrame === null) {
        animateParticles();
    }
});
