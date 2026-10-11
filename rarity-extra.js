```javascript
/* =========================================
   VIOLET RANDOM — RARITY EXTRA
   추가 희귀도 10종 / 전용 임팩트 / 효과음
   기존 script.js 및 style.css 수정 없이 확장
========================================= */

(() => {
  "use strict";

  if (window.__violetRarityExtraLoaded) return;
  window.__violetRarityExtraLoaded = true;

  /* =========================================
     1. 추가 희귀도 설정
  ========================================= */

  const CUSTOM_RARITIES = {
    luminous: {
      label: "Luminous",
      title: "✦ LUMINOUS · 빛의 파동 ✦",
      detail: "Luminous · 빛의 파동",
      symbol: "✧",
      color: "#c6a5ff",
      power: 1,
      sound: 660
    },

    starlight: {
      label: "Starlight",
      title: "✦ STARLIGHT · 별빛의 흔적 ✦",
      detail: "Starlight · 별빛의 흔적",
      symbol: "✦",
      color: "#b7c9ff",
      power: 1,
      sound: 720
    },

    crystal: {
      label: "Crystal",
      title: "✧ CRYSTAL · 수정 공명 ✧",
      detail: "Crystal · 수정 공명",
      symbol: "◇",
      color: "#8de8ff",
      power: 1,
      sound: 780
    },

    orbit: {
      label: "Orbit",
      title: "◎ ORBIT · 궤도의 조화 ◎",
      detail: "Orbit · 궤도의 조화",
      symbol: "◎",
      color: "#8ca7ff",
      power: 1,
      sound: 620
    },

    spectrum: {
      label: "Spectrum",
      title: "✧ SPECTRUM · 빛의 스펙트럼 ✧",
      detail: "Spectrum · 빛의 스펙트럼",
      symbol: "◇",
      color: "#ffb6ef",
      power: 1,
      sound: 840
    },

    nebula: {
      label: "Nebula",
      title: "☄ NEBULA · 성운의 파편 ☄",
      detail: "Nebula · 성운의 파편",
      symbol: "☄",
      color: "#d6a2ff",
      power: 1,
      sound: 700
    },

    nova: {
      label: "Nova",
      title: "✹ NOVA · 별의 섬광 ✹",
      detail: "Nova · 별의 섬광",
      symbol: "✹",
      color: "#ffe0a6",
      power: 1,
      sound: 880
    },

    astral: {
      label: "Astral",
      title: "✦ ASTRAL · 성계의 각성 ✦",
      detail: "Astral · 성계의 각성",
      symbol: "✦",
      color: "#73f0e8",
      power: 2,
      sound: 960
    },

    infinity: {
      label: "Infinity",
      title: "∞ INFINITY · 무한의 경계 ∞",
      detail: "Infinity · 무한의 경계",
      symbol: "∞",
      color: "#ff9fe9",
      power: 3,
      sound: 1080
    },

    singularity: {
      label: "Singularity",
      title: "⟡ SINGULARITY · 특이점의 도래 ⟡",
      detail: "Singularity · 특이점의 도래",
      symbol: "⟡",
      color: "#fff0ad",
      power: 4,
      sound: 1320
    }
  };

  /*
    일반 희귀도 7종:
    Luminous, Starlight, Crystal, Orbit,
    Spectrum, Nebula, Nova

    상위 희귀도 2종:
    Astral, Infinity

    초희귀도 1종:
    Singularity
  */

  /* =========================================
     2. 숫자 희귀도 판정 확장
  ========================================= */

  const originalGetRarePattern = window.getRarePattern;

  function getCustomPattern(value) {
    const normalized = String(Number(value));

    // 특이점: 지정된 단 하나의 숫자
    if (normalized === "1029384") {
      return {
        level: "singularity",
        title: CUSTOM_RARITIES.singularity.title,
        detail: CUSTOM_RARITIES.singularity.detail
      };
    }

    // 추가 등급은 7자리 숫자에서만 판정
    if (!/^\d{7}$/.test(normalized)) {
      return null;
    }

    const digits = normalized.split("").map(Number);
    const uniqueDigits = new Set(digits).size;

    // 기존 등급과의 충돌을 줄이기 위해 모든 숫자가 달라야 함
    if (uniqueDigits !== 7) {
      return null;
    }

    // 앞뒤 숫자가 같으면 기존 대칭 패턴을 우선함
    if (digits[0] === digits[6]) {
      return null;
    }

    // 이미 존재하는 오름차순·내림차순 패턴은 제외
    const ascending = "0123456789";
    const descending = "9876543210";

    if (
      ascending.includes(normalized) ||
      descending.includes(normalized)
    ) {
      return null;
    }

    const sum = digits.reduce((total, digit) => total + digit, 0);

    /*
      기존 희귀도 판정 이후에만 추가 등급을 적용한다.
      각 조건은 숫자 7개의 합으로 구분한다.
    */

    const sumToLevel = {
      25: "luminous",
      26: "starlight",
      27: "crystal",
      28: "orbit",
      29: "spectrum",
      30: "nebula",
      31: "nova",
      33: "astral",
      34: "infinity"
    };

    const level = sumToLevel[sum];

    if (!level) {
      return null;
    }

    const rarity = CUSTOM_RARITIES[level];

    return {
      level,
      title: rarity.title,
      detail: rarity.detail
    };
  }

  /*
    기존 판정 결과가 있으면 그대로 사용한다.
    기존 등급을 새 등급이 덮어쓰지 않도록 한다.
  */

  if (typeof originalGetRarePattern === "function") {
    window.getRarePattern = function (value) {
      const originalPattern = originalGetRarePattern(value);

      if (originalPattern) {
        return originalPattern;
      }

      return getCustomPattern(value);
    };
  } else {
    console.warn(
      "[Violet Random] 기존 getRarePattern 함수를 찾지 못했어."
    );
  }

  /* =========================================
     3. 전용 효과 CSS 추가
     style.css 파일은 수정하지 않는다.
  ========================================= */

  const effectStyle = document.createElement("style");

  effectStyle.id = "violet-rarity-extra-style";

  effectStyle.textContent = `
    .vrx-particle {
      position: fixed;
      z-index: 99999;
      pointer-events: none;
      user-select: none;
      font-family: Georgia, serif;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 0 9px currentColor,
                   0 0 20px currentColor;
      animation: vrx-particle-flight var(--vrx-duration, 1500ms)
                 cubic-bezier(.12,.65,.25,1) forwards;
      will-change: transform, opacity;
    }

    @keyframes vrx-particle-flight {
      0% {
        opacity: 0;
        transform:
          translate(-50%, -50%)
          scale(.25)
          rotate(0deg);
      }

      12% {
        opacity: 1;
      }

      75% {
        opacity: .9;
      }

      100% {
        opacity: 0;
        transform:
          translate(
            calc(-50% + var(--vrx-x)),
            calc(-50% + var(--vrx-y))
          )
          scale(var(--vrx-scale, 1))
          rotate(var(--vrx-rotation, 180deg));
      }
    }

    .vrx-screen-flash {
      position: fixed;
      inset: 0;
      z-index: 99990;
      pointer-events: none;
      opacity: 0;
      animation: vrx-screen-flash 900ms ease-out forwards;
    }

    @keyframes vrx-screen-flash {
      0% { opacity: 0; }
      15% { opacity: .2; }
      100% { opacity: 0; }
    }

    .vrx-ring {
      position: fixed;
      z-index: 99991;
      width: 30px;
      height: 30px;
      border: 2px solid var(--vrx-color);
      border-radius: 50%;
      pointer-events: none;
      box-shadow: 0 0 18px var(--vrx-color);
      animation: vrx-ring-expand 1000ms ease-out forwards;
    }

    @keyframes vrx-ring-expand {
      from {
        opacity: .95;
        transform: translate(-50%, -50%) scale(.2);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(12);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .vrx-particle,
      .vrx-screen-flash,
      .vrx-ring {
        animation-duration: 250ms !important;
      }
    }
  `;

  document.head.appendChild(effectStyle);

  /* =========================================
     4. 효과음
     Web Audio API로 소리를 생성한다.
  ========================================= */

  let audioContext = null;

  function playCustomSound(level) {
    const rarity = CUSTOM_RARITIES[level];

    if (!rarity) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      const now = audioContext.currentTime;
      const power = rarity.power;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type =
        power >= 3 ? "sine" : "triangle";

      oscillator.frequency.setValueAtTime(
        rarity.sound,
        now
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(100, rarity.sound * 0.68),
        now + 0.32
      );

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.12 + power * 0.025,
        now + 0.025
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.48 + power * 0.08
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.6 + power * 0.08);

      // 상위 등급은 한 음을 추가해 더 풍성하게 만든다.
      if (power >= 2) {
        const second = audioContext.createOscillator();
        const secondGain = audioContext.createGain();

        second.type = "sine";

        second.frequency.setValueAtTime(
          rarity.sound * 1.5,
          now + 0.04
        );

        secondGain.gain.setValueAtTime(
          0.0001,
          now
        );

        secondGain.gain.exponentialRampToValueAtTime(
          0.07,
          now + 0.04
        );

        secondGain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + 0.5
        );

        second.connect(secondGain);
        secondGain.connect(audioContext.destination);

        second.start(now + 0.04);
        second.stop(now + 0.55);
      }
    } catch (error) {
      console.warn(
        "[Violet Random] 추가 효과음을 재생하지 못했어.",
        error
      );
    }
  }

  /* =========================================
     5. 전용 시각 효과
  ========================================= */

  function getResultPosition() {
    const numberBox = document.getElementById("number-box");

    if (numberBox) {
      const rect = numberBox.getBoundingClientRect();

      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  function createCustomParticles(level) {
    const rarity = CUSTOM_RARITIES[level];

    if (!rarity) return;

    const position = getResultPosition();

    const countByPower = {
      1: 18,
      2: 32,
      3: 48,
      4: 70
    };

    const particleCount = countByPower[rarity.power] || 18;

    const symbols = [
      rarity.symbol,
      "✦",
      "✧",
      "◇",
      "⋆",
      "∴"
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("span");

      particle.className = "vrx-particle";

      particle.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      const angle = Math.random() * Math.PI * 2;

      const distance =
        75 + Math.random() * (100 + rarity.power * 65);

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.left = `${position.x}px`;
      particle.style.top = `${position.y}px`;
      particle.style.color = rarity.color;

      particle.style.fontSize =
        `${12 + Math.random() * (10 + rarity.power * 5)}px`;

      particle.style.setProperty("--vrx-x", `${x}px`);
      particle.style.setProperty("--vrx-y", `${y}px`);

      particle.style.setProperty(
        "--vrx-scale",
        String(0.7 + Math.random() * 1.2)
      );

      particle.style.setProperty(
        "--vrx-rotation",
        `${Math.random() * 540 - 270}deg`
      );

      particle.style.setProperty(
        "--vrx-duration",
        `${1000 + Math.random() * 700 + rarity.power * 180}ms`
      );

      document.body.appendChild(particle);

      particle.addEventListener(
        "animationend",
        () => particle.remove(),
        { once: true }
      );
    }
  }

  function createCustomRing(level) {
    const rarity = CUSTOM_RARITIES[level];

    if (!rarity) return;

    const position = getResultPosition();

    const ringCount = rarity.power >= 3 ? 3 : 1;

    for (let i = 0; i < ringCount; i++) {
      const ring = document.createElement("div");

      ring.className = "vrx-ring";

      ring.style.left = `${position.x}px`;
      ring.style.top = `${position.y}px`;
      ring.style.setProperty("--vrx-color", rarity.color);

      ring.style.animationDelay = `${i * 140}ms`;

      document.body.appendChild(ring);

      ring.addEventListener(
        "animationend",
        () => ring.remove(),
        { once: true }
      );
    }
  }

  function createCustomFlash(level) {
    const rarity = CUSTOM_RARITIES[level];

    if (!rarity || rarity.power < 2) return;

    const flash = document.createElement("div");

    flash.className = "vrx-screen-flash";

    flash.style.background =
      `radial-gradient(
        circle at center,
        ${rarity.color} 0%,
        transparent 72%
      )`;

    flash.style.animationDuration =
      rarity.power >= 4 ? "1400ms" : "900ms";

    document.body.appendChild(flash);

    flash.addEventListener(
      "animationend",
      () => flash.remove(),
      { once: true }
    );
  }

  function playCustomImpact(level) {
    const rarity = CUSTOM_RARITIES[level];

    if (!rarity) return;

    // 상위 등급일수록 시각 효과를 더 강하게 적용한다.
    createCustomParticles(level);
    createCustomRing(level);
    createCustomFlash(level);
    playCustomSound(level);

    const numberBox = document.getElementById("number-box");

    if (numberBox) {
      numberBox.style.setProperty(
        "--vrx-rarity-color",
        rarity.color
      );

      numberBox.animate(
        [
          {
            filter: "brightness(1)",
            transform: "scale(1)"
          },
          {
            filter: `brightness(${1.15 + rarity.power * 0.12})`,
            transform: `scale(${1.015 + rarity.power * 0.012})`
          },
          {
            filter: "brightness(1)",
            transform: "scale(1)"
          }
        ],
        {
          duration: 350 + rarity.power * 100,
          easing: "ease-out"
        }
      );
    }

    console.info(
      `[Violet Random] ${rarity.label} 등급 효과 실행`,
      level
    );
  }

  /* =========================================
     6. 기존 임팩트 함수와 연결
     기존 함수를 제거하거나 새로 대체하지 않는다.
  ========================================= */

  const originalTriggerNextResultEffect =
    window.triggerNextResultEffect;

  if (typeof originalTriggerNextResultEffect === "function") {
    window.triggerNextResultEffect = function (
      actualPattern,
      result
    ) {
      // 미리 보기 효과는 설정과 관계없이 한 번 실행한다.
      const hadPreviewOverride =
        typeof pendingEffectOverride !== "undefined" &&
        Boolean(pendingEffectOverride);

      const returnedPattern =
        originalTriggerNextResultEffect.apply(this, arguments);

      const effectPattern =
        returnedPattern || actualPattern;

      const effectsAllowed =
        hadPreviewOverride ||
        typeof settings === "undefined" ||
        settings.rareEffects !== false;

      if (
        effectsAllowed &&
        effectPattern &&
        CUSTOM_RARITIES[effectPattern.level]
      ) {
        playCustomImpact(effectPattern.level);
      }

      return returnedPattern;
    };
  } else {
    console.warn(
      "[Violet Random] 기존 임팩트 함수를 찾지 못했어. " +
      "추가 효과 연결은 확인이 필요해."
    );
  }

  /* =========================================
     7. 기존 희귀도 목록·통계·필터와 연결
     기존 script.js의 추첨 로직을 대체하지 않는다.
  ========================================= */

  const EXTRA_HISTORY_FILTER_KEY =
    "violetRandomExtraRareHistoryFilterV1";

  function restoreExtendedRareHistory() {
    // 메인 JS가 먼저 읽다가 놓친 확장 희귀도 기록을 다시 판정한다.
    try {
      const rawProgress = localStorage.getItem("violetRandomProgress");
      const savedProgress = rawProgress
        ? JSON.parse(rawProgress)
        : null;

      const savedRareHistory = savedProgress?.rareHistory;

      if (
        !Array.isArray(savedRareHistory) ||
        typeof rareHistory === "undefined" ||
        typeof renderRareHistory !== "function"
      ) {
        return;
      }

      const rebuilt = savedRareHistory
        .filter(entry =>
          entry &&
          Number.isFinite(Number(entry.value)) &&
          Number(entry.value) >= 0 &&
          Number(entry.value) <= 9999999
        )
        .map(entry => {
          const value = Number(entry.value);
          const pattern = window.getRarePattern(String(value));

          if (!pattern || pattern.level === "common") {
            return null;
          }

          return { value, pattern };
        })
        .filter(Boolean)
        .slice(0, 10);

      rareHistory = rebuilt;

      renderRareHistory();

      if (typeof saveProgress === "function") {
        saveProgress();
      }
    } catch (error) {
      console.warn(
        "[Violet Random] 희귀 기록을 다시 판정하지 못했어.",
        error
      );
    }
  }

  function installRarityDataIntegration() {
    // 메인 JS가 관리하는 등급 배열에 확장 등급을 추가한다.
    if (
      typeof RARITY_ORDER !== "undefined" &&
      Array.isArray(RARITY_ORDER)
    ) {
      const highRarities = [
        "singularity",
        "infinity",
        "astral"
      ];

      const middleRarities = [
        "nova",
        "nebula",
        "spectrum",
        "orbit",
        "crystal",
        "starlight",
        "luminous"
      ];

      const highMissing = highRarities.filter(
        level => !RARITY_ORDER.includes(level)
      );

      if (highMissing.length > 0) {
        RARITY_ORDER.splice(0, 0, ...highMissing);
      }

      const middleMissing = middleRarities.filter(
        level => !RARITY_ORDER.includes(level)
      );

      if (middleMissing.length > 0) {
        let insertAt = RARITY_ORDER.indexOf("seraph");

        if (insertAt < 0) {
          insertAt = Math.max(0, RARITY_ORDER.length - 1);
        }

        RARITY_ORDER.splice(insertAt, 0, ...middleMissing);
      }
    }

    // 통계 객체에도 모든 추가 등급의 항목을 만든다.
    if (
      typeof drawStats !== "undefined" &&
      drawStats &&
      drawStats.rarities &&
      typeof drawStats.rarities === "object"
    ) {
      Object.keys(CUSTOM_RARITIES).forEach(level => {
        if (!Number.isFinite(drawStats.rarities[level])) {
          drawStats.rarities[level] = 0;
        }
      });
    }

    // 새 등급의 이름이 Common으로 표시되는 것을 방지한다.
    if (
      typeof RARITY_LABELS !== "undefined" &&
      RARITY_LABELS &&
      typeof RARITY_LABELS === "object"
    ) {
      Object.entries(CUSTOM_RARITIES).forEach(([level, rarity]) => {
        RARITY_LABELS[level] = rarity.label;
      });
    }

    // 저장된 확장 희귀도 통계가 있다면 복구한다.
    try {
      const rawProgress = localStorage.getItem("violetRandomProgress");
      const savedProgress = rawProgress
        ? JSON.parse(rawProgress)
        : null;

      const savedRarities = savedProgress?.drawStats?.rarities;

      if (
        savedRarities &&
        typeof savedRarities === "object" &&
        typeof drawStats !== "undefined" &&
        drawStats.rarities
      ) {
        Object.keys(CUSTOM_RARITIES).forEach(level => {
          const savedValue = Number(savedRarities[level]);

          if (Number.isFinite(savedValue) && savedValue >= 0) {
            drawStats.rarities[level] = savedValue;
          }
        });
      }
    } catch (error) {
      console.warn(
        "[Violet Random] 확장 희귀도 통계를 복구하지 못했어.",
        error
      );
    }

    restoreExtendedRareHistory();

    // 확장 등급이 통계 화면에 표시되도록 갱신한다.
    if (typeof renderStatistics === "function") {
      try {
        renderStatistics();
      } catch (error) {
        console.warn(
          "[Violet Random] 확장 희귀도 통계 갱신을 건너뛰었어.",
          error
        );
      }
    }

    if (typeof syncRarityTableConditions === "function") {
      try {
        syncRarityTableConditions();
      } catch (error) {
        console.warn(
          "[Violet Random] 희귀도 표 동기화를 건너뛰었어.",
          error
        );
      }
    }
  }

  function getStoredExtraHistorySelection() {
    try {
      const raw = localStorage.getItem(EXTRA_HISTORY_FILTER_KEY);

      if (raw === null) return null;

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) return null;

      return parsed.filter(level =>
        Object.prototype.hasOwnProperty.call(CUSTOM_RARITIES, level)
      );
    } catch (error) {
      console.warn(
        "[Violet Random] 추가 희귀 기록 설정을 읽지 못했어.",
        error
      );

      return null;
    }
  }

  function saveExtraHistorySelection() {
    const grid = document.querySelector(".rare-history-filter-grid");

    if (!grid) return;

    const selected = Array.from(
      grid.querySelectorAll(
        'input[name="rare-history-rarity"]:checked'
      )
    )
      .map(input => input.value)
      .filter(level =>
        Object.prototype.hasOwnProperty.call(CUSTOM_RARITIES, level)
      );

    try {
      localStorage.setItem(
        EXTRA_HISTORY_FILTER_KEY,
        JSON.stringify(selected)
      );
    } catch (error) {
      console.warn(
        "[Violet Random] 추가 희귀 기록 설정을 저장하지 못했어.",
        error
      );
    }
  }

  function createRarityBadgeLabel(level, title) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const badge = document.createElement("span");

    input.type = "checkbox";
    input.name = "rare-history-rarity";
    input.value = level;

    badge.className = `rarity-badge ${level}`;
    badge.textContent = title;

    label.append(input, badge);

    return { label, input };
  }

  function installRareHistoryFilterOptions() {
    const grid = document.querySelector(".rare-history-filter-grid");

    if (
      !grid ||
      typeof rareHistoryFilterInputs === "undefined" ||
      !Array.isArray(rareHistoryFilterInputs)
    ) {
      return;
    }

    const storedSelection = getStoredExtraHistorySelection();
    const isFirstSetup = storedSelection === null;

    Object.entries(CUSTOM_RARITIES).forEach(([level, rarity]) => {
      let input = grid.querySelector(
        `input[name="rare-history-rarity"][value="${level}"]`
      );

      if (!input) {
        const created = createRarityBadgeLabel(
          level,
          rarity.label
        );

        input = created.input;
        grid.appendChild(created.label);
      }

      // 기존 메인 JS의 배열에도 포함시킨다.
      if (!rareHistoryFilterInputs.includes(input)) {
        rareHistoryFilterInputs.push(input);
      }

      input.checked = isFirstSetup
        ? true
        : storedSelection.includes(level);

      // 새 입력 요소에는 직접 이벤트를 연결한다.
      input.addEventListener("change", () => {
        if (typeof saveRareHistoryLevels === "function") {
          saveRareHistoryLevels();
        }

        saveExtraHistorySelection();
      });
    });

    // 전체 선택 / 전체 해제 이후 확장 등급 설정도 저장한다.
    const saveAfterBulkChange = () => {
      window.setTimeout(saveExtraHistorySelection, 0);
    };

    document
      .getElementById("rare-history-filter-all")
      ?.addEventListener("click", saveAfterBulkChange);

    document
      .getElementById("rare-history-filter-none")
      ?.addEventListener("click", saveAfterBulkChange);

    // 필터 내부 상태와 저장 데이터를 동기화한다.
    if (typeof saveRareHistoryLevels === "function") {
      saveRareHistoryLevels();
    }

    // 확장 기능을 처음 설치한 경우 새 등급은 기본 선택한다.
    if (isFirstSetup) {
      saveExtraHistorySelection();
    }
  }

  function installAutoStopOptions() {
    const grid = document.querySelector(".auto-rarity-grid");

    if (!grid) return;

    Object.entries(CUSTOM_RARITIES).forEach(([level, rarity]) => {
      if (
        grid.querySelector(
          `input[name="auto-stop-rarity"][value="${level}"]`
        )
      ) {
        return;
      }

      const label = document.createElement("label");
      const input = document.createElement("input");
      const badge = document.createElement("span");

      input.type = "checkbox";
      input.name = "auto-stop-rarity";
      input.value = level;

      badge.className = `rarity-badge ${level}`;
      badge.textContent = rarity.label;

      label.append(input, badge);
      grid.appendChild(label);
    });
  }

  function installReplayPreviewOptions() {
    const grid = document.querySelector(".replay-grid");

    if (!grid) return;

    Object.entries(CUSTOM_RARITIES).forEach(([level, rarity]) => {
      if (
        grid.querySelector(`[data-preview-rarity="${level}"]`)
      ) {
        return;
      }

      const button = document.createElement("button");

      button.type = "button";
      button.className = "replay-rarity-button";
      button.dataset.previewRarity = level;

      const badge = document.createElement("span");

      badge.className = `rarity-badge ${level}`;
      badge.textContent = rarity.label;

      const description = document.createElement("small");

      description.textContent = rarity.detail;

      button.append(badge, description);

      // 동적으로 추가한 버튼에도 기존과 같은 미리보기 동작을 연결한다.
      button.addEventListener("click", () => {
        if (
          typeof RARITY_ORDER !== "undefined" &&
          !RARITY_ORDER.includes(level)
        ) {
          return;
        }

        if (typeof pendingEffectOverride !== "undefined") {
          pendingEffectOverride = {
            title: `✦ ${rarity.label.toUpperCase()} EFFECT ✦`,
            level,
            detail: rarity.detail
          };
        }

        document
          .querySelectorAll("[data-preview-rarity]")
          .forEach(item => {
            item.classList.toggle("selected", item === button);
          });

        const message = document.getElementById("replay-message");

        if (message) {
          message.textContent =
            `${rarity.label} 연출을 선택했어. 창을 닫고 다음 숫자를 뽑으면 적용돼!`;
        }

        if (typeof closeReplay === "function") {
          closeReplay();
        }

        const status = document.getElementById("status");

        if (status) {
          status.textContent =
            `다음 추첨에 ${rarity.label} 연출이 예약됐어.`;
        }
      });

      grid.appendChild(button);
    });
  }

  function installExtendedRarityIntegrations() {
    try {
      installRarityDataIntegration();
      installRareHistoryFilterOptions();
      installAutoStopOptions();
      installReplayPreviewOptions();
    } catch (error) {
      console.error(
        "[Violet Random] 추가 희귀도 연동 중 오류가 발생했어.",
        error
      );
    }
  }

  installExtendedRarityIntegrations();

  /* =========================================
     8. 외부 파일에서 사용할 수 있는 정보
  ========================================= */

  window.VioletRandomExtraRarities = {
    rarities: CUSTOM_RARITIES,
    getCustomPattern,
    playCustomImpact,
    version: "1.0.0"
  };

  console.info(
    "[Violet Random] 추가 희귀도 모듈이 준비됐어."
  );
})();
```
