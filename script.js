
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const el = {
    canvas: $("particle-canvas"),
    resultCard: $("result-card"),
    resultNumber: $("result-number"),
    resultRarity: $("result-rarity"),
    resultMessage: $("result-message"),
    drawButton: $("draw-button"),
    instantButton: $("instant-button"),
    settingsButton: $("settings-button"),
    settingsOverlay: $("settings-overlay"),
    closeSettings: $("close-settings"),
    saveSettings: $("save-settings"),
    resetSettings: $("reset-settings"),
    settingsNotice: $("settings-notice"),
    historyList: $("history-list"),
    maxNumber: $("max-number"),
    minNumber: $("min-number"),
    totalDraws: $("total-draws"),
    averageNumber: $("average-number"),
    particleCount: $("particle-count"),
    particleCountValue: $("particle-count-value"),
    effectStrength: $("effect-strength"),
    effectStrengthValue: $("effect-strength-value"),
    drawSpeed: $("draw-speed"),
    drawSpeedValue: $("draw-speed-value"),
    rareEffects: $("rare-effects"),
    autoDuration: $("auto-duration"),
    autoDurationValue: $("auto-duration-value"),
    autoInterval: $("auto-interval"),
    autoIntervalValue: $("auto-interval-value"),
    autoMaxDraws: $("auto-max-draws"),
    stopOnRare: $("stop-on-rare"),
    rareStopLevel: $("rare-stop-level"),
    autoStartButton: $("auto-start-button"),
    autoStopButton: $("auto-stop-button"),
    autoStatus: $("auto-status"),
    autoIndicator: $("auto-indicator"),
    flashOverlay: $("flash-overlay"),
    toast: $("toast")
  };

  const MAX_NUMBER = 9_999_999;
  const SETTINGS_KEY = "violetRandomSettingsV3";

  const defaults = {
    particles: 70,
    effect: 2,
    speed: 1,
    rareEffects: true,
    autoDuration: 30,
    autoInterval: 3,
    autoMaxDraws: 0,
    stopOnRare: false,
    rareStopLevel: 2
  };

  let settings = loadSettings();
  let history = [];
  let totalDraws = 0;
  let maxDrawn = null;
  let minDrawn = null;

  let isRolling = false;
  let isAutoRunning = false;
  let rollTimeouts = [];
  let autoIntervalId = null;
  let autoStopTimeout = null;
  let autoStartedAt = 0;
  let autoDrawCount = 0;
  let toastTimeout = null;
  let flashTimeout = null;

  const ctx = el.canvas.getContext("2d");
  let particles = [];
  let bursts = [];
  let animationFrame = null;
  let lastFrame = 0;

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return { ...defaults, ...saved };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      showToast("설정을 저장하지 못했어. 브라우저 저장 공간을 확인해 줘.");
    }
  }

  function formatNumber(number) {
    return Number(number).toLocaleString("ko-KR");
  }

  function randomInt(max) {
    // Rejection sampling: 0부터 max까지 균등하게 추첨.
    const range = max + 1;
    const uintRange = 0x100000000;
    const limit = Math.floor(uintRange / range) * range;
    const array = new Uint32Array(1);

    do {
      crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return array[0] % range;
  }

  function analyzeRarity(number) {
    const s = String(number);
    const digits = s.split("").map(Number);
    const counts = new Map();

    digits.forEach((digit) => {
      counts.set(digit, (counts.get(digit) || 0) + 1);
    });

    const maxRepeat = Math.max(...counts.values());
    const allSame = maxRepeat === digits.length && digits.length >= 3;
    const palindrome = s.length >= 3 && s === s.split("").reverse().join("");

    const ascending = digits.length >= 4 &&
      digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);

    const descending = digits.length >= 4 &&
      digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);

    const roundZeros = /0{3,}$/.test(s) && s.length >= 4;

    let repeatedBlock = false;
    for (let blockLength = 2; blockLength <= 3; blockLength++) {
      if (s.length >= blockLength * 2) {
        const block = s.slice(0, blockLength);
        const remainder = s.slice(blockLength);

        if (remainder.length > 0 &&
            (block + block).startsWith(s) &&
            remainder === block.repeat(Math.ceil(remainder.length / blockLength))
              .slice(0, remainder.length)) {
          repeatedBlock = true;
        }
      }
    }

    const consecutiveSame = /(.)\1{2,}/.test(s);
    const fourOrMoreSame = maxRepeat >= 4 && s.length >= 5;
    const specialSequence = ascending || descending;
    const exactSevenDigits = s.length === 7;

    // 점수는 실제 확률이 아니라, 패턴을 기준으로 한 게임식 희귀도야.
    let score = 0;
    const reasons = [];

    if (allSame) {
      score += 5;
      reasons.push("같은 숫자 반복");
    } else if (fourOrMoreSame) {
      score += 3;
      reasons.push("숫자 반복");
    } else if (consecutiveSame) {
      score += 2;
      reasons.push("연속 반복");
    }

    if (palindrome) {
      score += 3;
      reasons.push("회문 숫자");
    }

    if (specialSequence) {
      score += 5;
      reasons.push(ascending ? "오름차순" : "내림차순");
    }

    if (roundZeros) {
      score += 3;
      reasons.push("둥근 숫자");
    }

    if (repeatedBlock) {
      score += 3;
      reasons.push("반복 패턴");
    }

    if (number === 0) {
      score += 5;
      reasons.push("제로");
    }

    if (number === 1_000_000 || number === MAX_NUMBER) {
      score += 3;
      reasons.push("특별한 경계값");
    }

    // 숫자가 짧다는 이유만으로 무조건 최상위 희귀도로 분류하지 않도록 함.
    if (exactSevenDigits && score === 0) {
      score = 0;
    }

    let level = 1;
    let label = "일반";
    let message = "평범한 숫자야. 다음 결과를 기대해 봐!";

    if (score >= 7) {
      level = 4;
      label = "극도로 희귀";
      message = "믿기 어려운 패턴이 나타났어!";
    } else if (score >= 5) {
      level = 3;
      label = "매우 희귀";
      message = "오, 꽤 특별한 숫자가 나왔어!";
    } else if (score >= 3) {
      level = 2;
      label = "희귀";
      message = "평범하지 않은 숫자야!";
    }

    return {
      level,
      score,
      label,
      message,
      reasons: [...new Set(reasons)]
    };
  }

  function clearRollTimeouts() {
    rollTimeouts.forEach(clearTimeout);
    rollTimeouts = [];
  }

  function scheduleRollTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    rollTimeouts.push(id);
    return id;
  }

  function showToast(message) {
    clearTimeout(toastTimeout);
    el.toast.textContent = message;
    el.toast.classList.add("visible");

    toastTimeout = setTimeout(() => {
      el.toast.classList.remove("visible");
    }, 2600);
  }

  function triggerButtonImpact(button) {
    button.classList.remove("button-impact");
    void button.offsetWidth;
    button.classList.add("button-impact");

    setTimeout(() => button.classList.remove("button-impact"), 400);
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.55, 12, 1);
  }

  function triggerResultImpact(level) {
    if (settings.effect <= 0) return;

    const strength = settings.effect;
    const amount = [0, 10, 25, 45, 75][Math.min(level + strength - 1, 4)];
    const finalAmount = Math.round(amount * strength / 2);

    spawnBurst(
      window.innerWidth / 2,
      Math.min(window.innerHeight * 0.47, 420),
      finalAmount,
      level
    );

    if (settings.rareEffects && level >= 3) {
      el.flashOverlay.classList.remove("flash");
      void el.flashOverlay.offsetWidth;
      el.flashOverlay.classList.add("flash");

      clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        el.flashOverlay.classList.remove("flash");
      }, 750);
    }
  }

  function showResult(number, isAuto = false) {
    const rarity = analyzeRarity(number);

    el.resultNumber.textContent = formatNumber(number);
    el.resultRarity.textContent = rarity.level > 1
      ? `✦ ${rarity.label.toUpperCase()} ✦`
      : "COMMON NUMBER";

    const reasonText = rarity.reasons.length
      ? ` · ${rarity.reasons.join(" · ")}`
      : "";

    el.resultMessage.textContent =
      rarity.message + reasonText + (isAuto ? " · 자동 뽑기" : "");

    el.resultCard.className = "result-card";
    if (rarity.level > 1) {
      el.resultCard.classList.add(`rarity-${rarity.level}`);
    }

    el.resultNumber.classList.remove("number-pop");
    void el.resultNumber.offsetWidth;
    el.resultNumber.classList.add("number-pop");

    triggerResultImpact(rarity.level);
    addToHistory(number, rarity);

    return rarity;
  }

  function addToHistory(number, rarity) {
    history.unshift({ number, rarity });
    history = history.slice(0, 10);

    totalDraws += 1;
    maxDrawn = maxDrawn === null ? number : Math.max(maxDrawn, number);
    minDrawn = minDrawn === null ? number : Math.min(minDrawn, number);

    renderHistory();
    updateStatistics();
  }

  function renderHistory() {
    el.historyList.replaceChildren();

    if (history.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "아직 뽑은 숫자가 없어.";
      el.historyList.appendChild(empty);
      return;
    }

    history.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";

      if (item.rarity.level > 1) {
        row.classList.add(`rarity-${item.rarity.level}`);
      }

      const number = document.createElement("span");
      number.className = "history-number";
      number.textContent = `${index + 1}. ${formatNumber(item.number)}`;

      const badge = document.createElement("span");
      badge.className = "history-badge";
      badge.textContent = item.rarity.level > 1
        ? item.rarity.label
        : "일반";

      row.append(number, badge);
      el.historyList.appendChild(row);
    });
  }

  function updateStatistics() {
    el.maxNumber.textContent = maxDrawn === null ? "—" : formatNumber(maxDrawn);
    el.minNumber.textContent = minDrawn === null ? "—" : formatNumber(minDrawn);
    el.totalDraws.textContent = formatNumber(totalDraws);

    if (history.length === 0) {
      el.averageNumber.textContent = "—";
    } else {
      const average = history.reduce((sum, item) => sum + item.number, 0)
        / history.length;
      el.averageNumber.textContent = formatNumber(Math.round(average));
    }
  }

  function finishDraw(number, isAuto = false) {
    isRolling = false;
    el.resultCard.classList.remove("rolling");
    el.drawButton.disabled = isAuto || isAutoRunning;
    el.instantButton.disabled = isAuto || isAutoRunning;

    const rarity = showResult(number, isAuto);

    if (isAuto) {
      autoDrawCount += 1;
      updateAutoStatus();

      if (
        settings.stopOnRare &&
        rarity.level >= Number(settings.rareStopLevel)
      ) {
        stopAuto(`희귀도 조건 달성! ${rarity.label} 숫자가 나왔어.`);
        return;
      }

      if (
        Number(settings.autoMaxDraws) > 0 &&
        autoDrawCount >= Number(settings.autoMaxDraws)
      ) {
        stopAuto("설정한 최대 뽑기 횟수에 도달했어.");
      }
    }
  }

  function drawWithAnimation(isAuto = false) {
    if (isRolling) return;

    isRolling = true;
    el.drawButton.disabled = true;
    el.instantButton.disabled = true;
    el.resultCard.classList.add("rolling");
    el.resultRarity.textContent = "DRAWING...";
    el.resultMessage.textContent = "숫자를 추첨하고 있어...";
    triggerButtonImpact(el.drawButton);

    const result = randomInt(MAX_NUMBER);

    const speedTable = {
      1: { duration: 7000, steps: 10 },
      2: { duration: 5500, steps: 9 },
      3: { duration: 4000, steps: 8 },
      4: { duration: 2800, steps: 7 },
      5: { duration: 1800, steps: 6 }
    };

    const config = speedTable[settings.speed] || speedTable[1];
    const started = performance.now();
    let step = 0;

    function tick() {
      step += 1;
      el.resultNumber.textContent = formatNumber(randomInt(MAX_NUMBER));

      const elapsed = performance.now() - started;
      const progress = Math.min(1, elapsed / config.duration);

      if (step >= config.steps && progress >= 1) {
        finishDraw(result, isAuto);
        return;
      }

      const delay = Math.max(
        80,
        config.duration / config.steps * (0.6 + progress * 1.1)
      );

      scheduleRollTimeout(tick, delay);
    }

    scheduleRollTimeout(tick, 100);
  }

  function instantDraw() {
    if (isRolling || isAutoRunning) return;

    clearRollTimeouts();
    const result = randomInt(MAX_NUMBER);
    triggerButtonImpact(el.instantButton);
    finishDraw(result, false);
  }

  function populateSettingsControls() {
    el.particleCount.value = settings.particles;
    el.effectStrength.value = settings.effect;
    el.drawSpeed.value = settings.speed;
    el.rareEffects.checked = settings.rareEffects;

    el.autoDuration.value = settings.autoDuration;
    el.autoInterval.value = settings.autoInterval;
    el.autoMaxDraws.value = String(settings.autoMaxDraws);
    el.stopOnRare.checked = settings.stopOnRare;
    el.rareStopLevel.value = String(settings.rareStopLevel);

    updateSettingLabels();
  }

  function updateSettingLabels() {
    el.particleCountValue.textContent = el.particleCount.value;
    el.effectStrengthValue.textContent = el.effectStrength.value;
    el.drawSpeedValue.textContent = el.drawSpeed.value;
    el.autoDurationValue.textContent = `${el.autoDuration.value}초`;
    el.autoIntervalValue.textContent = `${el.autoInterval.value}초`;
  }

  function readSettingsFromControls() {
    settings = {
      particles: Number(el.particleCount.value),
      effect: Number(el.effectStrength.value),
      speed: Number(el.drawSpeed.value),
      rareEffects: el.rareEffects.checked,
      autoDuration: Number(el.autoDuration.value),
      autoInterval: Number(el.autoInterval.value),
      autoMaxDraws: Number(el.autoMaxDraws.value),
      stopOnRare: el.stopOnRare.checked,
      rareStopLevel: Number(el.rareStopLevel.value)
    };
  }

  function applySettings() {
    updateSettingLabels();
    resizeCanvas();
  }

  function openSettings() {
    el.settingsNotice.textContent = "";
    populateSettingsControls();
    el.settingsOverlay.hidden = false;
    el.closeSettings.focus();
  }

  function closeSettings() {
    el.settingsOverlay.hidden = true;
    el.settingsButton.focus();
  }

  function saveSettings() {
    readSettingsFromControls();
    saveSettingsToStorage();
    applySettings();
    el.settingsNotice.textContent = "설정을 저장했어!";
    showToast("설정을 저장했어. 💜");
  }

  function resetSettings() {
    settings = { ...defaults };
    populateSettingsControls();
    applySettings();
    saveSettingsToStorage();
    el.settingsNotice.textContent = "기본 설정으로 초기화했어.";
  }

  function updateAutoStatus() {
    if (!isAutoRunning) return;

    const elapsed = Math.floor((Date.now() - autoStartedAt) / 1000);
    const remaining = Math.max(0, settings.autoDuration - elapsed);

    el.autoStatus.textContent =
      `${autoDrawCount}회 뽑음 · 남은 시간 약 ${remaining}초`;
  }

  function startAuto() {
    if (isAutoRunning || isRolling) {
      showToast("현재 진행 중인 뽑기가 끝난 뒤 시작해 줘.");
      return;
    }

    readSettingsFromControlsIfOpen();
    isAutoRunning = true;
    autoDrawCount = 0;
    autoStartedAt = Date.now();

    el.autoStartButton.disabled = true;
    el.autoStopButton.disabled = false;
    el.drawButton.disabled = true;
    el.instantButton.disabled = true;
    el.autoIndicator.textContent = "실행 중";
    el.autoIndicator.classList.add("active");

    updateAutoStatus();

    // 첫 추첨은 바로 시작하고, 이후에는 설정한 간격마다 추첨.
    drawWithAnimation(true);

    autoIntervalId = setInterval(() => {
      if (!isAutoRunning || isRolling) return;
      drawWithAnimation(true);
    }, settings.autoInterval * 1000);

    autoStopTimeout = setTimeout(() => {
      stopAuto("설정한 자동 뽑기 시간이 끝났어.");
    }, settings.autoDuration * 1000);
  }

  function readSettingsFromControlsIfOpen() {
    if (!el.settingsOverlay.hidden) {
      readSettingsFromControls();
      saveSettingsToStorage();
      applySettings();
    }
  }

  function stopAuto(message = "자동 뽑기를 중지했어.") {
    if (!isAutoRunning) return;

    isAutoRunning = false;
    clearInterval(autoIntervalId);
    clearTimeout(autoStopTimeout);
    autoIntervalId = null;
    autoStopTimeout = null;

    el.autoStartButton.disabled = false;
    el.autoStopButton.disabled = true;
    el.autoIndicator.textContent = "대기 중";
    el.autoIndicator.classList.remove("active");
    el.autoStatus.textContent = `${autoDrawCount}회 뽑음 · 종료됨`;

    if (!isRolling) {
      el.drawButton.disabled = false;
      el.instantButton.disabled = false;
    }

    showToast(message);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.canvas.width = Math.floor(window.innerWidth * dpr);
    el.canvas.height = Math.floor(window.innerHeight * dpr);
    el.canvas.style.width = `${window.innerWidth}px`;
    el.canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(0, Math.min(150, Number(settings.particles)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.8 + 0.5,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.45 + 0.12,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function spawnBurst(x, y, count, level = 1) {
    const cappedCount = Math.max(0, Math.min(100, count));

    for (let i = 0; i < cappedCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2 + 0.8) * (1 + level * 0.35);

      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.018 + 0.012,
        size: Math.random() * 2.8 + 1,
        hue: level >= 4 ? 38 + Math.random() * 30 : 260 + Math.random() * 50
      });
    }

    if (bursts.length > 500) {
      bursts = bursts.slice(-500);
    }
  }

  function drawStar(x, y, size, alpha, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(performance.now() * 0.0004);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 100%, 78%)`;
    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? size : size * 0.25;
      const angle = (Math.PI / 4) * i;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animateParticles(timestamp = 0) {
    if (document.hidden) {
      animationFrame = requestAnimationFrame(animateParticles);
      return;
    }

    const delta = lastFrame ? Math.min(2, (timestamp - lastFrame) / 16.67) : 1;
    lastFrame = timestamp;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.y -= particle.speed * delta;
      particle.x += particle.drift * delta;
      particle.phase += 0.018 * delta;

      if (particle.y < -5) {
        particle.y = window.innerHeight + 5;
        particle.x = Math.random() * window.innerWidth;
      }

      if (particle.x < -5) particle.x = window.innerWidth + 5;
      if (particle.x > window.innerWidth + 5) particle.x = -5;

      const alpha = particle.alpha * (0.7 + Math.sin(particle.phase) * 0.3);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 143, 255, ${alpha})`;
      ctx.fill();
    });

    bursts = bursts.filter((particle) => particle.life > 0);

    bursts.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.life -= particle.decay * delta;

      if (Math.random() < 0.12) {
        drawStar(
          particle.x,
          particle.y,
          particle.size * 1.5,
          particle.life,
          particle.hue
        );
      }

      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        Math.max(0.2, particle.size * particle.life),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `hsla(${particle.hue}, 100%, 78%, ${Math.max(0, particle.life)})`;
      ctx.fill();
    });

    animationFrame = requestAnimationFrame(animateParticles);
  }

  el.drawButton.addEventListener("click", () => {
    if (!isRolling && !isAutoRunning) drawWithAnimation(false);
  });

  el.instantButton.addEventListener("click", instantDraw);
  el.settingsButton.addEventListener("click", openSettings);
  el.closeSettings.addEventListener("click", closeSettings);
  el.saveSettings.addEventListener("click", saveSettings);
  el.resetSettings.addEventListener("click", resetSettings);

  el.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === el.settingsOverlay) closeSettings();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.settingsOverlay.hidden) {
      closeSettings();
    }
  });

  [
    el.particleCount,
    el.effectStrength,
    el.drawSpeed,
    el.autoDuration,
    el.autoInterval
  ].forEach((input) => {
    input.addEventListener("input", updateSettingLabels);
  });

  el.autoStartButton.addEventListener("click", startAuto);
  el.autoStopButton.addEventListener("click", () => stopAuto());

  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isAutoRunning) {
      // 백그라운드 탭에서 자동 추첨이 폭주하지 않도록 안전하게 정지.
      stopAuto("페이지를 벗어나 자동 뽑기를 정지했어.");
    }
  });

  populateSettingsControls();
  applySettings();
  renderHistory();
  updateStatistics();
  resizeCanvas();
  animationFrame = requestAnimationFrame(animateParticles);
});
