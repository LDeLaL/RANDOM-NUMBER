
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const MIN_NUMBER = 0;
  const MAX_NUMBER = 9_999_999;
  const HISTORY_LIMIT = 10;
  const SETTINGS_KEY = "violetRandomSettingsV2";

  const DEFAULT_SETTINGS = {
    particleCount: 65,
    rollSpeed: 1,
    effectStrength: 2,
    rareEffects: true,
    autoDuration: 30,
    autoInterval: 3,
    autoMaxDraws: 0,
    autoStopRare: false,
    autoRarity: "rare"
  };

  let settings = { ...DEFAULT_SETTINGS };
  let history = [];
  let totalDraws = 0;
  let drawBusy = false;
  let toastTimer = null;
  let autoTimer = null;
  let autoDeadline = 0;
  let autoDrawCount = 0;
  let autoRunning = false;
  let lastAutoNumber = null;
  let canvasAnimationId = null;
  let particles = [];
  let lastFrameTime = 0;

  const drawTimeouts = new Set();
  const effectTimeouts = new Set();

  const canvas = $("particle-canvas");
  const ctx = canvas.getContext("2d");

  const resultStage = $("result-stage");
  const resultNumber = $("result-number");
  const resultRarity = $("result-rarity");
  const resultMessage = $("result-message");

  const drawButton = $("draw-button");
  const instantButton = $("instant-button");
  const autoButton = $("auto-button");
  const stopAutoButton = $("stop-auto-button");
  const autoStatus = $("auto-status");
  const autoStatusText = $("auto-status-text");
  const autoCount = $("auto-count");
  const autoProgress = $("auto-progress");

  const settingsButton = $("settings-button");
  const settingsOverlay = $("settings-overlay");
  const closeSettingsButton = $("close-settings");
  const saveSettingsButton = $("save-settings");
  const resetSettingsButton = $("reset-settings");

  const historyList = $("history-list");
  const averageNumber = $("average-number");
  const maxNumber = $("max-number");
  const minNumber = $("min-number");
  const totalDrawsElement = $("total-draws");

  const particleCountInput = $("particle-count");
  const rollSpeedInput = $("roll-speed");
  const effectStrengthInput = $("effect-strength");
  const rareEffectsInput = $("rare-effects");

  const particleCountValue = $("particle-count-value");
  const rollSpeedValue = $("roll-speed-value");
  const effectStrengthValue = $("effect-strength-value");

  const autoDurationInput = $("auto-duration");
  const autoIntervalInput = $("auto-interval");
  const autoMaxDrawsInput = $("auto-max-draws");
  const autoStopRareInput = $("auto-stop-rare");
  const autoRaritySelect = $("auto-rarity");
  const autoRarityRow = $("auto-rarity-row");

  const toast = $("toast");

  const SPEEDS = {
    1: { start: 2500, interval: 1050, spin: 120 },
    2: { start: 2100, interval: 850, spin: 100 },
    3: { start: 1650, interval: 650, spin: 85 },
    4: { start: 1250, interval: 480, spin: 65 },
    5: { start: 950, interval: 350, spin: 50 }
  };

  const RARITY_ORDER = {
    common: 0,
    rare: 1,
    "very-rare": 2,
    legendary: 3
  };

  function formatNumber(number) {
    return number.toLocaleString("en-US");
  }

  function randomInt(maxExclusive) {
    if (maxExclusive <= 0) return 0;

    if (window.crypto && window.crypto.getRandomValues) {
      const range = 0x1_0000_0000;
      const limit = Math.floor(range / maxExclusive) * maxExclusive;
      const buffer = new Uint32Array(1);

      do {
        window.crypto.getRandomValues(buffer);
      } while (buffer[0] >= limit);

      return buffer[0] % maxExclusive;
    }

    return Math.floor(Math.random() * maxExclusive);
  }

  function getRandomNumber() {
    return MIN_NUMBER + randomInt(MAX_NUMBER - MIN_NUMBER + 1);
  }

  function safeInteger(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed)) return fallback;

    return Math.max(min, Math.min(max, parsed));
  }

  function loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        settings = {
          ...DEFAULT_SETTINGS,
          ...parsed
        };
      }
    } catch (error) {
      console.warn("설정을 불러오지 못했어.", error);
      settings = { ...DEFAULT_SETTINGS };
    }

    settings.particleCount = safeInteger(
      settings.particleCount, DEFAULT_SETTINGS.particleCount, 0, 150
    );
    settings.rollSpeed = safeInteger(
      settings.rollSpeed, DEFAULT_SETTINGS.rollSpeed, 1, 5
    );
    settings.effectStrength = safeInteger(
      settings.effectStrength, DEFAULT_SETTINGS.effectStrength, 0, 3
    );
    settings.autoDuration = safeInteger(
      settings.autoDuration, DEFAULT_SETTINGS.autoDuration, 1, 3600
    );
    settings.autoInterval = safeInteger(
      settings.autoInterval, DEFAULT_SETTINGS.autoInterval, 1, 60
    );
    settings.autoMaxDraws = safeInteger(
      settings.autoMaxDraws, DEFAULT_SETTINGS.autoMaxDraws, 0, 100000
    );

    settings.rareEffects = Boolean(settings.rareEffects);
    settings.autoStopRare = Boolean(settings.autoStopRare);

    if (!["rare", "very-rare", "legendary"].includes(settings.autoRarity)) {
      settings.autoRarity = DEFAULT_SETTINGS.autoRarity;
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.warn("설정을 저장하지 못했어.", error);
      showToast("브라우저에서 설정을 저장할 수 없어.");
      return false;
    }
  }

  function populateSettingsControls() {
    particleCountInput.value = settings.particleCount;
    rollSpeedInput.value = settings.rollSpeed;
    effectStrengthInput.value = settings.effectStrength;
    rareEffectsInput.checked = settings.rareEffects;

    autoDurationInput.value = settings.autoDuration;
    autoIntervalInput.value = settings.autoInterval;
    autoMaxDrawsInput.value = settings.autoMaxDraws;
    autoStopRareInput.checked = settings.autoStopRare;
    autoRaritySelect.value = settings.autoRarity;

    updateSettingLabels();
    updateAutoRarityVisibility();
  }

  function updateSettingLabels() {
    particleCountValue.value = particleCountInput.value;
    rollSpeedValue.value = rollSpeedInput.value;
    effectStrengthValue.value = effectStrengthInput.value;
  }

  function readSettingsControls() {
    settings.particleCount = safeInteger(
      particleCountInput.value, DEFAULT_SETTINGS.particleCount, 0, 150
    );
    settings.rollSpeed = safeInteger(
      rollSpeedInput.value, DEFAULT_SETTINGS.rollSpeed, 1, 5
    );
    settings.effectStrength = safeInteger(
      effectStrengthInput.value, DEFAULT_SETTINGS.effectStrength, 0, 3
    );

    settings.rareEffects = rareEffectsInput.checked;

    settings.autoDuration = safeInteger(
      autoDurationInput.value, DEFAULT_SETTINGS.autoDuration, 1, 3600
    );
    settings.autoInterval = safeInteger(
      autoIntervalInput.value, DEFAULT_SETTINGS.autoInterval, 1, 60
    );
    settings.autoMaxDraws = safeInteger(
      autoMaxDrawsInput.value, DEFAULT_SETTINGS.autoMaxDraws, 0, 100000
    );

    settings.autoStopRare = autoStopRareInput.checked;
    settings.autoRarity = autoRaritySelect.value;

    populateSettingsControls();
  }

  function applySettings() {
    updateSettingLabels();
    resizeCanvas();
    initializeParticles();
    updateAutoRarityVisibility();
  }

  function openSettings() {
    populateSettingsControls();
    settingsOverlay.hidden = false;
    closeSettingsButton.focus();
  }

  function closeSettings() {
    settingsOverlay.hidden = true;
    settingsButton.focus();
  }

  function updateAutoRarityVisibility() {
    autoRarityRow.style.opacity = autoStopRareInput.checked ? "1" : "0.55";
    autoRaritySelect.disabled = !autoStopRareInput.checked;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");

    if (toastTimer !== null) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
      toast.classList.remove("visible");
      toastTimer = null;
    }, 2600);
  }

  function scheduleDrawTimeout(callback, delay) {
    const id = setTimeout(() => {
      drawTimeouts.delete(id);
      callback();
    }, delay);

    drawTimeouts.add(id);
    return id;
  }

  function scheduleEffectTimeout(callback, delay) {
    const id = setTimeout(() => {
      effectTimeouts.delete(id);
      callback();
    }, delay);

    effectTimeouts.add(id);
    return id;
  }

  function clearDrawTimeouts() {
    for (const id of drawTimeouts) {
      clearTimeout(id);
    }

    drawTimeouts.clear();
  }

  function clearEffectTimeouts() {
    for (const id of effectTimeouts) {
      clearTimeout(id);
    }

    effectTimeouts.clear();
  }

  /*
   * 희귀도는 무작위 확률을 보장하는 수학적 확률값이 아니라,
   * 숫자의 눈에 띄는 패턴을 분류한 시각적 등급이야.
   * 같은 숫자라도 여러 패턴을 동시에 만족할 수 있어.
   */
  function analyzeNumber(number) {
    const digits = String(number);
    const reasons = [];

    const isPalindrome =
      digits.length >= 3 &&
      digits === digits.split("").reverse().join("");

    const hasFiveSameDigits = /(.)\1{4,}/.test(digits);
    const hasFourSameDigits = /(.)\1{3}/.test(digits);
    const hasThreeSameDigits = /(.)\1{2}/.test(digits);

    const repeatedBlocks = digits.length >= 4 &&
      (digits.slice(0, 2) === digits.slice(2, 4) ||
       digits.slice(1, 3) === digits.slice(3, 5));

    const repeatedThreeBlock = digits.length >= 6 &&
      digits.slice(0, 3) === digits.slice(3, 6);

    const isAscending = digits.length >= 3 &&
      [...digits].every((digit, index, arr) =>
        index === 0 || Number(digit) === Number(arr[index - 1]) + 1
      );

    const isDescending = digits.length >= 3 &&
      [...digits].every((digit, index, arr) =>
        index === 0 || Number(digit) === Number(arr[index - 1]) - 1
      );

    const isRoundNumber = number !== 0 && /0{3,}$/.test(digits);
    const isAllSameDigits = digits.length >= 3 &&
      [...digits].every((digit) => digit === digits[0]);

    let points = 0;

    if (isPalindrome) {
      points += 2;
      reasons.push("회문 숫자");
    }

    if (hasThreeSameDigits) {
      points += 1;
      reasons.push("같은 숫자 반복");
    }

    if (hasFourSameDigits) points += 1;

    if (hasFiveSameDigits) {
      points += 2;
      reasons.push("같은 숫자 5회 이상");
    }

    if (repeatedBlocks) {
      points += 1;
      reasons.push("반복 패턴");
    }

    if (repeatedThreeBlock) {
      points += 2;
      reasons.push("3자리 반복");
    }

    if (isAscending) {
      points += 2;
      reasons.push("연속 상승");
    }

    if (isDescending) {
      points += 2;
      reasons.push("연속 하강");
    }

    if (isRoundNumber) {
      points += 1;
      reasons.push("큰 단위의 정수");
    }

    if (isAllSameDigits) {
      points += 3;
      reasons.push("올 같은 숫자");
    }

    let level = "common";
    let label = "일반";
    let message = "평범한 숫자가 나왔어.";

    if (points >= 5 || isAllSameDigits || hasFiveSameDigits) {
      level = "legendary";
      label = "전설";
      message = "엄청나게 눈에 띄는 패턴이야!";
    } else if (points >= 3) {
      level = "very-rare";
      label = "매우 희귀";
      message = "오, 꽤 특별한 숫자인데?";
    } else if (points >= 1) {
      level = "rare";
      label = "희귀";
      message = "숫자에서 특별한 패턴이 발견됐어.";
    }

    return {
      number,
      digits,
      points,
      level,
      label,
      message,
      reasons,
      isPalindrome,
      hasFiveSameDigits,
      hasFourSameDigits,
      hasThreeSameDigits,
      repeatedBlocks,
      repeatedThreeBlock,
      isAscending,
      isDescending,
      isRoundNumber,
      isAllSameDigits
    };
  }

  function isPrime(number) {
    if (number < 2) return false;
    if (number === 2) return true;
    if (number % 2 === 0) return false;

    for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
      if (number % divisor === 0) return false;
    }

    return true;
  }

  function getRarityLabel(analysis) {
    if (analysis.level === "legendary") return "전설";
    if (analysis.level === "very-rare") return "매우 희귀";
    if (analysis.level === "rare") return "희귀";
    return "";
  }

  function addToHistory(number, analysis) {
    history.unshift({
      number,
      analysis,
      time: new Date()
    });

    if (history.length > HISTORY_LIMIT) {
      history = history.slice(0, HISTORY_LIMIT);
    }

    totalDraws += 1;

    renderHistory();
    updateAverage();
    updateStatistics();
  }

  function renderHistory() {
    historyList.replaceChildren();

    if (history.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-history";
      empty.textContent = "아직 뽑은 숫자가 없어.";
      historyList.appendChild(empty);
      return;
    }

    history.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "history-item";

      if (entry.analysis.level !== "common") {
        row.classList.add("is-rare");
        row.classList.add(`is-${entry.analysis.level}`);
      }

      const number = document.createElement("span");
      number.className = "history-number";
      number.textContent = formatNumber(entry.number);

      const right = document.createElement("span");
      right.style.display = "flex";
      right.style.alignItems = "center";
      right.style.justifyContent = "flex-end";
      right.style.gap = "6px";

      if (entry.analysis.level !== "common") {
        const tag = document.createElement("span");
        tag.className = "history-tag";
        tag.textContent = getRarityLabel(entry.analysis);
        right.appendChild(tag);
      }

      const time = document.createElement("span");
      time.className = "history-time";
      time.textContent = entry.time.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });

      right.appendChild(time);
      row.append(number, right);
      historyList.appendChild(row);
    });
  }

  function updateAverage() {
    if (history.length === 0) {
      averageNumber.textContent = "—";
      return;
    }

    const sum = history.reduce((total, entry) => total + entry.number, 0);
    averageNumber.textContent = formatNumber(Math.round(sum / history.length));
  }

  function updateStatistics() {
    totalDrawsElement.textContent = formatNumber(totalDraws);

    if (history.length === 0) {
      maxNumber.textContent = "—";
      minNumber.textContent = "—";
      return;
    }

    const numbers = history.map((entry) => entry.number);
    maxNumber.textContent = formatNumber(Math.max(...numbers));
    minNumber.textContent = formatNumber(Math.min(...numbers));
  }

  function clearRarityClasses() {
    resultStage.classList.remove(
      "rarity-rare",
      "rarity-very-rare",
      "rarity-legendary",
      "result-impact",
      "button-impact"
    );

    resultRarity.classList.remove(
      "rarity-rare",
      "rarity-very-rare",
      "rarity-legendary"
    );
  }

  function setResultRarity(analysis) {
    clearRarityClasses();

    if (analysis.level !== "common") {
      resultStage.classList.add(`rarity-${analysis.level}`);
      resultRarity.classList.add(`rarity-${analysis.level}`);
    }

    resultRarity.textContent = analysis.level === "common"
      ? "NUMBER GENERATED"
      : `${analysis.label.toUpperCase()} · ${analysis.reasons[0] || "SPECIAL NUMBER"}`;
  }

  function setResultMessage(number, analysis) {
    const parts = [analysis.message];

    if (analysis.reasons.length > 0) {
      parts.push(analysis.reasons.join(" · "));
    }

    if (isPrime(number)) {
      parts.push("소수");
    }

    resultMessage.textContent = parts.join("  /  ");
  }

  function triggerButtonImpact() {
    resultStage.classList.remove("button-impact");

    // 애니메이션 재시작
    void resultStage.offsetWidth;
    resultStage.classList.add("button-impact");

    scheduleEffectTimeout(() => {
      resultStage.classList.remove("button-impact");
    }, 650);
  }

  function spawnSparks(level) {
    if (settings.effectStrength <= 0) return;

    const baseCounts = {
      common: 5,
      rare: 12,
      "very-rare": 25,
      legendary: 45
    };

    const strengthMultiplier = [0, 0.65, 1, 1.5][settings.effectStrength];
    const count = Math.round(baseCounts[level] * strengthMultiplier);

    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span");
      const isStar = i % (level === "legendary" ? 3 : 5) === 0;

      spark.className = isStar ? "number-spark star" : "number-spark";

      if (isStar) {
        spark.textContent = "✦";
      }

      const angle = Math.random() * Math.PI * 2;
      const distanceBase = level === "legendary" ? 200 : level === "very-rare" ? 150 : 100;
      const distance = distanceBase * (0.45 + Math.random() * 0.75);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const size = isStar
        ? `${9 + Math.random() * (level === "legendary" ? 11 : 6)}px`
        : `${2 + Math.random() * (level === "legendary" ? 5 : 3)}px`;

      spark.style.setProperty("--x", `${48 + Math.random() * 4}%`);
      spark.style.setProperty("--y", `${35 + Math.random() * 30}%`);
      spark.style.setProperty("--dx", `${dx}px`);
      spark.style.setProperty("--dy", `${dy}px`);
      spark.style.setProperty("--size", size);
      spark.style.setProperty("--duration", `${0.65 + Math.random() * 0.8}s`);

      resultStage.appendChild(spark);

      scheduleEffectTimeout(() => {
        spark.remove();
      }, 1600);
    }
  }

  function triggerResultImpact(analysis) {
    const strength = settings.effectStrength;

    if (strength <= 0) return;

    resultStage.classList.remove("result-impact");
    void resultStage.offsetWidth;
    resultStage.classList.add("result-impact");

    const duration = analysis.level === "legendary" ? 1400 :
      analysis.level === "very-rare" ? 1000 : 650;

    scheduleEffectTimeout(() => {
      resultStage.classList.remove("result-impact");
    }, duration);

    if (settings.rareEffects || analysis.level === "common") {
      spawnSparks(analysis.level);
    }

    if (analysis.level !== "common" && settings.rareEffects) {
      const shakeAmount = {
        rare: 2,
        "very-rare": 4,
        legendary: 7
      }[analysis.level] || 0;

      if (shakeAmount > 0) {
        resultNumber.animate(
          [
            { transform: "translateX(0) scale(1)" },
            { transform: `translateX(-${shakeAmount}px) scale(1.02)` },
            { transform: `translateX(${shakeAmount}px) scale(1.03)` },
            { transform: "translateX(0) scale(1)" }
          ],
          {
            duration: analysis.level === "legendary" ? 550 : 350,
            easing: "ease-out"
          }
        );
      }
    }
  }

  function resetResultDisplay() {
    clearRarityClasses();
    resultStage.classList.remove("is-spinning");
    resultNumber.textContent = "?";
    resultRarity.textContent = "READY TO DRAW";
    resultMessage.textContent = "버튼을 눌러 숫자를 뽑아 봐.";
  }

  function finishDraw(number) {
    drawBusy = false;
    clearDrawTimeouts();

    const analysis = analyzeNumber(number);

    resultNumber.textContent = formatNumber(number);
    setResultRarity(analysis);
    setResultMessage(number, analysis);

    addToHistory(number, analysis);
    triggerResultImpact(analysis);

    drawButton.disabled = autoRunning;
    instantButton.disabled = autoRunning;

    if (autoRunning) {
      autoDrawCount += 1;
      lastAutoNumber = number;
      updateAutoStatus();
      checkAutoStopConditions(analysis);
    }

    return analysis;
  }

  function drawWithAnimation(source = "manual") {
    if (drawBusy || (autoRunning && source === "manual")) return;

    drawBusy = true;
    drawButton.disabled = true;
    instantButton.disabled = true;

    clearDrawTimeouts();
    resultStage.classList.remove("is-spinning");
    triggerButtonImpact();

    const number = getRandomNumber();
    const digits = String(number);
    const speed = SPEEDS[settings.rollSpeed] || SPEEDS[1];

    resultStage.classList.add("is-spinning");
    resultRarity.textContent = "GENERATING...";

    let step = 0;

    function spinStep() {
      if (!drawBusy) return;

      if (step < 6) {
        const preview = getRandomNumber();
        resultNumber.textContent = formatNumber(preview);
        step += 1;

        scheduleDrawTimeout(spinStep, speed.interval);
        return;
      }

      // 숫자 자릿수를 하나씩 천천히 보여 주는 마무리 단계
      const finalText = formatNumber(number);
      let displayed = "";
      let charIndex = 0;

      function revealNextCharacter() {
        if (!drawBusy) return;

        if (charIndex >= finalText.length) {
          resultStage.classList.remove("is-spinning");
          finishDraw(number);
          return;
        }

        displayed += finalText[charIndex];
        resultNumber.textContent = displayed;
        charIndex += 1;

        scheduleDrawTimeout(revealNextCharacter, speed.spin);
      }

      revealNextCharacter();
    }

    scheduleDrawTimeout(spinStep, speed.start);
  }

  function instantDraw(source = "manual") {
    if (drawBusy || (autoRunning && source === "manual")) return;

    clearDrawTimeouts();
    drawBusy = true;

    drawButton.disabled = true;
    instantButton.disabled = true;

    resultStage.classList.remove("is-spinning");
    triggerButtonImpact();

    const number = getRandomNumber();
    finishDraw(number);
  }

  function getRarityThreshold() {
    return RARITY_ORDER[settings.autoRarity] ?? RARITY_ORDER.rare;
  }

  function updateAutoStatus() {
    autoStatus.hidden = !autoRunning;

    if (!autoRunning) {
      autoButton.classList.remove("is-running");
      autoButton.innerHTML = "<span>⟳</span> 자동 뽑기";
      autoButton.disabled = false;

      if (!drawBusy) {
        drawButton.disabled = false;
        instantButton.disabled = false;
      }

      return;
    }

    autoButton.classList.add("is-running");
    autoButton.innerHTML = "<span>Ⅱ</span> 자동 실행 중";
    autoButton.disabled = true;

    autoStatusText.textContent = "자동 뽑기 실행 중";
    autoCount.textContent = `${autoDrawCount}회`;

    const totalDuration = settings.autoDuration * 1000;
    const elapsed = Math.max(0, totalDuration - (autoDeadline - Date.now()));
    const percentage = Math.min(100, (elapsed / totalDuration) * 100);

    autoProgress.style.width = `${percentage}%`;
  }

  function startAutoDraw() {
    if (autoRunning || drawBusy) {
      showToast("현재 숫자 뽑기가 진행 중이야.");
      return;
    }

    readSettingsControls();
    saveSettingsToStorage();
    applySettings();

    autoRunning = true;
    autoDrawCount = 0;
    lastAutoNumber = null;
    autoDeadline = Date.now() + settings.autoDuration * 1000;

    autoStatus.hidden = false;
    autoProgress.style.width = "0%";
    updateAutoStatus();

    showToast("자동 뽑기를 시작했어!");

    // 첫 숫자는 즉시 뽑기
    instantDraw("auto");

    if (!autoRunning) return;

    scheduleNextAutoDraw();
    scheduleAutoDeadlineCheck();
  }

  function scheduleNextAutoDraw() {
    if (!autoRunning) return;

    if (autoTimer !== null) {
      clearTimeout(autoTimer);
    }

    autoTimer = setTimeout(() => {
      autoTimer = null;

      if (!autoRunning) return;

      if (Date.now() >= autoDeadline) {
        stopAutoDraw("시간이 끝나 자동 뽑기를 종료했어.");
        return;
      }

      if (drawBusy) {
        scheduleNextAutoDraw();
        return;
      }

      instantDraw("auto");

      if (autoRunning) {
        scheduleNextAutoDraw();
      }
    }, settings.autoInterval * 1000);
  }

  function scheduleAutoDeadlineCheck() {
    const check = () => {
      if (!autoRunning) return;

      const remaining = autoDeadline - Date.now();

      if (remaining <= 0) {
        stopAutoDraw("설정한 시간이 끝나 자동 뽑기를 종료했어.");
        return;
      }

      updateAutoStatus();

      autoTimer = setTimeout(check, Math.min(250, remaining));
    };

    // 반복 뽑기와 시간 제한을 한 타이머로 관리하지 않도록
    // 별도의 타이머를 사용해 종료 조건을 안정적으로 확인해.
    if (autoDeadlineTimer !== null) {
      clearTimeout(autoDeadlineTimer);
    }

    autoDeadlineTimer = setTimeout(check, 250);
  }

  let autoDeadlineTimer = null;

  function checkAutoStopConditions(analysis) {
    if (!autoRunning) return;

    if (
      settings.autoStopRare &&
      RARITY_ORDER[analysis.level] >= getRarityThreshold()
    ) {
      stopAutoDraw(`희귀도 조건에 맞는 숫자 ${formatNumber(analysis.number)}이 나와 멈췄어!`);
      return;
    }

    if (
      settings.autoMaxDraws > 0 &&
      autoDrawCount >= settings.autoMaxDraws
    ) {
      stopAutoDraw(`최대 뽑기 횟수 ${settings.autoMaxDraws}회에 도달했어.`);
      return;
    }

    if (Date.now() >= autoDeadline) {
      stopAutoDraw("설정한 시간이 끝나 자동 뽑기를 종료했어.");
    }
  }

  function stopAutoDraw(message = "자동 뽑기를 중지했어.") {
    if (autoTimer !== null) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }

    if (autoDeadlineTimer !== null) {
      clearTimeout(autoDeadlineTimer);
      autoDeadlineTimer = null;
    }

    autoRunning = false;
    updateAutoStatus();

    if (!drawBusy) {
      drawButton.disabled = false;
      instantButton.disabled = false;
    }

    autoStatus.hidden = true;
    autoProgress.style.width = "0%";

    if (message) showToast(message);
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function initializeParticles() {
    particles = [];

    for (let i = 0; i < settings.particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0.5 + Math.random() * 1.7,
        alpha: 0.15 + Math.random() * 0.48,
        vx: (Math.random() - 0.5) * 0.23,
        vy: -0.1 - Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.002 + Math.random() * 0.009
      });
    }
  }

  function animateParticles(timestamp = 0) {
    canvasAnimationId = requestAnimationFrame(animateParticles);

    const delta = lastFrameTime ? Math.min(timestamp - lastFrameTime, 40) : 16;
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.phase += particle.twinkle * delta;

      if (particle.y < -5) {
        particle.y = window.innerHeight + 5;
        particle.x = Math.random() * window.innerWidth;
      }

      if (particle.x < -5) particle.x = window.innerWidth + 5;
      if (particle.x > window.innerWidth + 5) particle.x = -5;

      const alpha = particle.alpha * (
        0.65 + 0.35 * Math.sin(particle.phase)
      );

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 145, 255, ${alpha})`;
      ctx.shadowBlur = particle.radius > 1.4 ? 8 : 3;
      ctx.shadowColor = "rgba(161, 98, 255, 0.6)";
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  function bindEvents() {
    drawButton.addEventListener("click", () => {
      drawWithAnimation("manual");
    });

    instantButton.addEventListener("click", () => {
      instantDraw("manual");
    });

    autoButton.addEventListener("click", startAutoDraw);

    stopAutoButton.addEventListener("click", () => {
      stopAutoDraw("자동 뽑기를 직접 중지했어.");
    });

    settingsButton.addEventListener("click", openSettings);
    closeSettingsButton.addEventListener("click", closeSettings);

    settingsOverlay.addEventListener("click", (event) => {
      if (event.target === settingsOverlay) {
        closeSettings();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !settingsOverlay.hidden) {
        closeSettings();
      }
    });

    [
      particleCountInput,
      rollSpeedInput,
      effectStrengthInput
    ].forEach((input) => {
      input.addEventListener("input", updateSettingLabels);
    });

    autoStopRareInput.addEventListener("change", updateAutoRarityVisibility);

    saveSettingsButton.addEventListener("click", () => {
      readSettingsControls();
      saveSettingsToStorage();
      applySettings();
      closeSettings();
      showToast("설정을 저장했어!");
    });

    resetSettingsButton.addEventListener("click", () => {
      settings = { ...DEFAULT_SETTINGS };
      populateSettingsControls();
      applySettings();
      showToast("설정을 기본값으로 바꿨어. 저장하기를 눌러 적용해 줘.");
    });

    window.addEventListener("resize", () => {
      resizeCanvas();
    });

    window.addEventListener("beforeunload", () => {
      if (canvasAnimationId !== null) {
        cancelAnimationFrame(canvasAnimationId);
      }

      clearDrawTimeouts();
      clearEffectTimeouts();

      if (autoTimer !== null) clearTimeout(autoTimer);
      if (autoDeadlineTimer !== null) clearTimeout(autoDeadlineTimer);
    });
  }

  function initialize() {
    loadSettings();
    populateSettingsControls();
    applySettings();

    renderHistory();
    updateAverage();
    updateStatistics();
    resetResultDisplay();

    bindEvents();
    animateParticles();
  }

  initialize();
});
