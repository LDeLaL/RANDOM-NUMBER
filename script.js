
const numberElement = document.getElementById("number");
const numberBox = document.querySelector(".number-box");
const generateButton = document.getElementById("generate-btn");
const statusElement = document.getElementById("status");

const DIGITS = 6;
const SPIN_SPEED = 45;
const FIRST_STOP = 700;
const STOP_INTERVAL = 450;

let timers = [];
let rollingIntervals = [];

function clearAnimations() {
    timers.forEach(clearTimeout);
    rollingIntervals.forEach(clearInterval);

    timers = [];
    rollingIntervals = [];
}

function generateNumber() {
    if (generateButton.disabled) return;

    clearAnimations();

    generateButton.disabled = true;
    numberElement.classList.remove("finished");
    numberBox.classList.remove("finished");

    statusElement.textContent = "Generating...";
    generateButton.textContent = "GENERATING";

    const result = String(
        Math.floor(Math.random() * 1000000)
    ).padStart(DIGITS, "0");

    const digits = numberElement.querySelectorAll("span");
    const locked = Array(DIGITS).fill(false);

    // 모든 자릿수를 빠르게 회전시킨다.
    digits.forEach((digit, index) => {
        digit.textContent = Math.floor(Math.random() * 10);

        const interval = setInterval(() => {
            if (!locked[index]) {
                digit.textContent = Math.floor(Math.random() * 10);
            }
        }, SPIN_SPEED);

        rollingIntervals.push(interval);
    });

    // 왼쪽부터 한 자리씩 결과를 확정한다.
    for (let i = 0; i < DIGITS; i++) {
        const timer = setTimeout(() => {
            locked[i] = true;
            digits[i].textContent = result[i];

            clearInterval(rollingIntervals[i]);
        }, FIRST_STOP + i * STOP_INTERVAL);

        timers.push(timer);
    }

    // 마지막 자리까지 멈춘 뒤 완료 효과를 적용한다.
    const finishTimer = setTimeout(() => {
        numberElement.classList.add("finished");
        numberBox.classList.add("finished");

        statusElement.textContent = "Number generated!";
        generateButton.textContent = "GENERATE";
        generateButton.disabled = false;
    }, FIRST_STOP + (DIGITS - 1) * STOP_INTERVAL + 100);

    timers.push(finishTimer);
}

generateButton.addEventListener("click", generateNumber);
