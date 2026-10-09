
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

const DIGITS = 7;
const HISTORY_LIMIT = 10;

const SPIN_SPEED = 85;
const FIRST_STOP = 1000;
const STOP_INTERVAL = 450;

let timers = [];
let rollingIntervals = [];
let isGenerating = false;

// 최근 추첨 결과
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
   추첨 기록 표시
========================= */

function renderHistory() {
    historyCount.textContent = String(history.length).padStart(2, "0");

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
        numberIndex.textContent = String(index + 1).padStart(2, "0");

        const number = document.createElement("span");
        number.className = "history-number";
        number.textContent = value;

        item.append(numberIndex, number);
        historyList.appendChild(item);
    });
}


/* =========================
   기록에 결과 추가
========================= */

function addToHistory(result) {
    history.unshift(result);

    if (history.length > HISTORY_LIMIT) {
        history.length = HISTORY_LIMIT;
    }

    renderHistory();
}


/* =========================
   숫자 확정 효과
========================= */

function digitLockEffect(digit) {
    digit.classList.remove("rolling");
    digit.classList.remove("locked");

    // 애니메이션 재실행
    void digit.offsetWidth;

    digit.classList.add("locked");
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
    numberBox.classList.remove("finished");

    const digits = numberElement.querySelectorAll("span");

    // 0 ~ 9999999 범위에서 추첨
    const result = String(
        Math.floor(Math.random() * 10000000)
    ).padStart(DIGITS, "0");

    // 모든 숫자를 회전 상태로 설정
    digits.forEach((digit) => {
        digit.classList.remove("locked");
        digit.classList.add("rolling");

        digit.textContent = Math.floor(Math.random() * 10);
    });

    // 각 자릿수 회전
    digits.forEach((digit, index) => {
        rollingIntervals[index] = setInterval(() => {
            digit.textContent = Math.floor(Math.random() * 10);
        }, SPIN_SPEED + index * 8);
    });

    // 왼쪽부터 한 자리씩 멈춤
    for (let i = 0; i < DIGITS; i++) {
        const timer = setTimeout(() => {
            clearInterval(rollingIntervals[i]);

            digits[i].textContent = result[i];

            digitLockEffect(digits[i]);

        }, FIRST_STOP + i * STOP_INTERVAL);

        timers.push(timer);
    }

    // 모든 숫자가 확정된 뒤 실행
    const finishTimer = setTimeout(() => {
        numberElement.classList.add("finished");
        numberBox.classList.add("finished");

        statusElement.textContent = "NUMBER GENERATED";

        buttonText.textContent = "GENERATE";
        generateButton.disabled = false;

        isGenerating = false;

        digits.forEach((digit) => {
            digit.classList.remove("locked");
        });

        // 추첨이 완전히 끝난 결과만 기록
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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

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

            // 푸른 남색보다는 보라색에 가까운 계열
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

        // 큰 파티클의 은은한 광택
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

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animateParticles();


/* =========================
   화면 비활성화 시 최적화
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
