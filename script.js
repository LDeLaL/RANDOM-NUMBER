
/* =========================
   숫자 추첨 설정
========================= */

const numberElement = document.getElementById("number");
const numberBox = document.getElementById("number-box");
const generateButton = document.getElementById("generate-btn");
const buttonText = document.getElementById("button-text");
const statusElement = document.getElementById("status");

const DIGITS = 6;

// 숫자가 바뀌는 간격: 작을수록 빠름
const SPIN_SPEED = 85;

// 첫 번째 숫자가 멈추기까지의 시간
const FIRST_STOP = 1000;

// 다음 숫자가 멈추기까지의 간격
const STOP_INTERVAL = 550;

let timers = [];
let rollingIntervals = [];
let isGenerating = false;


/* =========================
   숫자 애니메이션 정리
========================= */

function clearAnimations() {
    timers.forEach((timer) => clearTimeout(timer));

    rollingIntervals.forEach((interval) => {
        clearInterval(interval);
    });

    timers = [];
    rollingIntervals = [];
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

    // 0부터 999999까지 무작위 숫자 생성
    const result = String(
        Math.floor(Math.random() * 1000000)
    ).padStart(DIGITS, "0");

    // 이전 애니메이션 상태 초기화
    digits.forEach((digit) => {
        digit.classList.remove("locked");
        digit.classList.add("rolling");

        digit.textContent = Math.floor(Math.random() * 10);
    });

    // 각 숫자를 천천히 변경
    digits.forEach((digit, index) => {
        const interval = setInterval(() => {
            digit.textContent = Math.floor(Math.random() * 10);
        }, SPIN_SPEED + index * 8);

        rollingIntervals[index] = interval;
    });

    // 왼쪽 자리부터 순서대로 확정
    for (let i = 0; i < DIGITS; i++) {
        const timer = setTimeout(() => {
            clearInterval(rollingIntervals[i]);

            digits[i].textContent = result[i];

            digits[i].classList.remove("rolling");
            digits[i].classList.add("locked");

        }, FIRST_STOP + i * STOP_INTERVAL);

        timers.push(timer);
    }

    // 모든 숫자가 확정된 후 완료 효과
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

    }, FIRST_STOP + (DIGITS - 1) * STOP_INTERVAL + 400);

    timers.push(finishTimer);
}

generateButton.addEventListener("click", generateNumber);


/* =========================
   보라색 파티클 배경
========================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame = null;

const PARTICLE_COUNT = 75;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;


/* =========================
   화면 크기 설정
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

            // 대부분 작은 점으로 구성
            size: Math.random() * 1.5 + 0.4,

            // 느리고 잔잔한 이동
            speedX: (Math.random() - 0.5) * 0.22,
            speedY: (Math.random() - 0.5) * 0.22,

            // 개별적인 반짝임
            alpha: Math.random() * 0.45 + 0.15,
            twinkleSpeed: Math.random() * 0.008 + 0.002,
            twinkleOffset: Math.random() * Math.PI * 2,

            // 보라색 계열의 다양한 색상
            hue: Math.random() * 35 + 260
        });
    }
}


/* =========================
   파티클 움직임
========================= */

function animateParticles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // 화면 바깥으로 나가면 반대편에서 등장
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

        // 천천히 밝아졌다 어두워지는 효과
        particle.twinkleOffset += particle.twinkleSpeed;

        const twinkle =
            0.55 + Math.sin(particle.twinkleOffset) * 0.45;

        const opacity = particle.alpha * twinkle;

        // 작은 보라색 점
        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `hsla(${particle.hue}, 90%, 75%, ${opacity})`;

        ctx.fill();

        // 은은한 빛 번짐
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
                `hsla(${particle.hue}, 90%, 65%, ${opacity * 0.09})`;

            ctx.fill();
        }
    });

    animationFrame = requestAnimationFrame(animateParticles);
}


/* =========================
   초기화
========================= */

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animateParticles();


/* =========================
   탭을 보지 않을 때 최적화
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
