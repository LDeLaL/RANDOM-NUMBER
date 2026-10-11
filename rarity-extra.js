/* =========================================
   VIOLET RANDOM — RARITY EXTRA
   추가 희귀도 10종 / 전용 임팩트 / 효과음
   기존 테마와 추첨 로직 유지
========================================= */

(() => {
  "use strict";

  if (window.__violetRarityExtraLoaded) return;
  window.__violetRarityExtraLoaded = true;

  const CUSTOM_RARITIES = {
    luminous: {
      label: "Luminous",
      detail: "Luminous · 빛의 파동",
      title: "✦ LUMINOUS · 빛의 파동 ✦",
      color: "#c6a5ff",
      symbol: "✧",
      power: 1,
      sound: 660
    },
    starlight: {
      label: "Starlight",
      detail: "Starlight · 별빛의 흔적",
      title: "✦ STARLIGHT · 별빛의 흔적 ✦",
      color: "#b7c9ff",
      symbol: "✦",
      power: 1,
      sound: 720
    },
    crystal: {
      label: "Crystal",
      detail: "Crystal · 수정 공명",
      title: "✧ CRYSTAL · 수정 공명 ✧",
      color: "#8de8ff",
      symbol: "◇",
      power: 1,
      sound: 780
    },
    orbit: {
      label: "Orbit",
      detail: "Orbit · 궤도의 조화",
      title: "◎ ORBIT · 궤도의 조화 ◎",
      color: "#8ca7ff",
      symbol: "◎",
      power: 1,
      sound: 620
    },
    spectrum: {
      label: "Spectrum",
      detail: "Spectrum · 빛의 스펙트럼",
      title: "✧ SPECTRUM · 빛의 스펙트럼 ✧",
      color: "#ffb6ef",
      symbol: "◇",
      power: 1,
      sound: 840
    },
    nebula: {
      label: "Nebula",
      detail: "Nebula · 성운의 파편",
      title: "☄ NEBULA · 성운의 파편 ☄",
      color: "#d6a2ff",
      symbol: "☄",
      power: 1,
      sound: 700
    },
    nova: {
      label: "Nova",
      detail: "Nova · 별의 섬광",
      title: "✹ NOVA · 별의 섬광 ✹",
      color: "#ffe0a6",
      symbol: "✹",
      power: 1,
      sound: 880
    },
    astral: {
      label: "Astral",
      detail: "Astral · 성계의 각성",
      title: "✦ ASTRAL · 성계의 각성 ✦",
      color: "#73f0e8",
      symbol: "✦",
      power: 2,
      sound: 960
    },
    infinity: {
      label: "Infinity",
      detail: "Infinity · 무한의 경계",
      title: "∞ INFINITY · 무한의 경계 ∞",
      color: "#ff9fe9",
      symbol: "∞",
      power: 3,
      sound: 1080
    },
    singularity: {
      label: "Singularity",
      detail: "Singularity · 특이점의 도래",
      title: "⟡ SINGULARITY · 특이점의 도래 ⟡",
      color: "#fff0ad",
      symbol: "⟡",
      power: 4,
      sound: 1320
    }
  };

  const CUSTOM_LEVELS = Object.keys(CUSTOM_RARITIES);

  const SUM_TO_LEVEL = {
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

  const $ = id => document.getElementById(id);

  /* =========================================
     1. 새 희귀도 판정
  ========================================= */

  function getCustomPattern(value) {
    const number = Number(value);

    if (
      !Number.isInteger(number) ||
      number < 0 ||
      number > 9999999
    ) {
      return null;
    }

    const normalized = String(number);

    // 지정된 단 하나의 숫자
    if (normalized === "1029384") {
      const rarity = CUSTOM_RARITIES.singularity;

      return {
        level: "singularity",
        title: rarity.title,
        detail: rarity.detail
      };
    }

    // 그 밖의 추가 등급은 7자리 숫자에서만 판정
    if (!/^\d{7}$/.test(normalized)) {
      return null;
    }

    const digits = normalized.split("").map(Number);

    // 모든 숫자가 서로 달라야 한다.
    if (new Set(digits).size !== 7) {
      return null;
    }

    // 기존의 오름차순·내림차순 패턴을 제외한다.
    if (
      "0123456789".includes(normalized) ||
      "9876543210".includes(normalized)
    ) {
      return null;
    }

    const sum = digits.reduce(
      (total, digit) => total + digit,
      0
    );

    const level = SUM_TO_LEVEL[sum];

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
    기존 희귀도 판정을 먼저 실행한다.
    기존 판정 결과가 있으면 그 결과를 우선한다.
  */

  const originalGetRarePattern = window.getRarePattern;

  if (typeof originalGetRarePattern === "function") {
    window.getRarePattern = function (value) {
      const originalPattern =
        originalGetRarePattern.apply(this, arguments);

      if (originalPattern) {
        return originalPattern;
      }

      return getCustomPattern(value);
    };
  } else {
    console.error(
      "[Violet Random] 기존 getRarePattern 함수를 찾지 못했어. " +
      "script.js 경로와 실행 오류를 확인해 줘."
    );
  }

  /* =========================================
     2. 희귀도 순서·이름·통계 연결
  ========================================= */

  function insertLevelsBefore(anchor, levels) {
    if (
      typeof RARITY_ORDER === "undefined" ||
      !Array.isArray(RARITY_ORDER)
    ) {
      return;
    }

    let index = RARITY_ORDER.indexOf(anchor);

    if (index < 0) {
      index = RARITY_ORDER.length - 1;
    }

    levels.forEach(level => {
      if (RARITY_ORDER.includes(level)) {
        return;
      }

      RARITY_ORDER.splice(index, 0, level);
      index++;
    });
  }

  function installRarityMetadata() {
    if (typeof RARITY_ORDER === "undefined") {
      console.error(
        "[Violet Random] RARITY_ORDER를 찾지 못했어."
      );
      return false;
    }

    // 최상위 추가 희귀도
    insertLevelsBefore(
      "reverse-special",
      ["singularity"]
    );

    // 상위 추가 희귀도
    insertLevelsBefore(
      "celestial",
      ["infinity", "astral"]
    );

    // 중간 추가 희귀도
    insertLevelsBefore(
      "legendary",
      [
        "nova",
        "nebula",
        "spectrum",
        "orbit",
        "crystal",
        "starlight",
        "luminous"
      ]
    );

    if (typeof RARITY_LABELS !== "undefined") {
      Object.entries(CUSTOM_RARITIES).forEach(
        ([level, rarity]) => {
          RARITY_LABELS[level] = rarity.label;
        }
      );
    }

    if (
      typeof DEFAULT_RARE_HISTORY_LEVELS !== "undefined"
    ) {
      CUSTOM_LEVELS.forEach(level => {
        DEFAULT_RARE_HISTORY_LEVELS.add(level);
      });
    }

    /*
      기존에 저장된 통계가 있으면 새 희귀도 항목도 복구한다.
      기존 통계와 다른 저장 데이터는 삭제하지 않는다.
    */

    if (
      typeof drawStats !== "undefined" &&
      drawStats.rarities
    ) {
      let savedProgress = null;

      try {
        savedProgress = JSON.parse(
          localStorage.getItem("violetRandomProgress") || "null"
        );
      } catch (error) {
        console.warn(
          "[Violet Random] 기존 통계를 읽지 못했어.",
          error
        );
      }

      const savedRarities =
        savedProgress?.drawStats?.rarities || {};

      CUSTOM_LEVELS.forEach(level => {
        if (
          !Number.isFinite(drawStats.rarities[level])
        ) {
          drawStats.rarities[level] = 0;
        }

        const savedValue = Number(savedRarities[level]);

        if (
          Number.isFinite(savedValue) &&
          savedValue >= 0
        ) {
          drawStats.rarities[level] = savedValue;
        }
      });
    }

    return true;
  }

  /* =========================================
     3. 새 희귀도 전용 CSS
  ========================================= */

  function installStyles() {
    if ($("violet-rarity-extra-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "violet-rarity-extra-style";

    style.textContent = `
      .vrx-particle {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        user-select: none;
        font-family: Georgia, serif;
        font-weight: 700;
        line-height: 1;
        text-shadow:
          0 0 9px currentColor,
          0 0 20px currentColor;
        animation:
          vrx-particle-flight
          var(--vrx-duration, 1500ms)
          cubic-bezier(.12,.65,.25,1)
          forwards;
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

      ${Object.entries(CUSTOM_RARITIES).map(
        ([level, rarity]) => `
          .rarity-badge.${level} {
            color: ${rarity.color};
            border-color: ${rarity.color}99;
            background: rgba(125, 78, 170, 0.12);
          }

          .number-box.rare-${level} {
            border-color: ${rarity.color}bb;
            box-shadow:
              0 0 30px ${rarity.color}35,
              inset 0 0 28px ${rarity.color}12;
          }
        `
      ).join("")}

      @media (prefers-reduced-motion: reduce) {
        .vrx-particle,
        .vrx-screen-flash,
        .vrx-ring {
          animation-duration: 250ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================
     4. 새 희귀도 효과음
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

      oscillator.type = power >= 3 ? "sine" : "triangle";

      oscillator.frequency.setValueAtTime(
        rarity.sound,
        now
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(100, rarity.sound * 0.68),
        now + 0.32
      );

      gain.gain.setValueAtTime(0.0001, now);

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

      if (power >= 2) {
        const second = audioContext.createOscillator();
        const secondGain = audioContext.createGain();

        second.type = "sine";

        second.frequency.setValueAtTime(
          rarity.sound * 1.5,
          now + 0.04
        );

        secondGain.gain.setValueAtTime(0.0001, now);

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
     5. 새 희귀도 전용 시각 효과
  ========================================= */

  function getResultPosition() {
    const numberBox = $("number-box");

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

    const counts = {
      1: 18,
      2: 32,
      3: 48,
      4: 70
    };

    const count = counts[rarity.power] || 18;

    const symbols = [
      rarity.symbol,
      "✦",
      "✧",
      "◇",
      "⋆",
      "∴"
    ];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");

      particle.className = "vrx-particle";

      particle.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      const angle = Math.random() * Math.PI * 2;

      const distance =
        75 + Math.random() * (100 + rarity.power * 65);

      particle.style.left = `${position.x}px`;
      particle.style.top = `${position.y}px`;
      particle.style.color = rarity.color;

      particle.style.fontSize =
        `${12 + Math.random() * (10 + rarity.power * 5)}px`;

      particle.style.setProperty(
        "--vrx-x",
        `${Math.cos(angle) * distance}px`
      );

      particle.style.setProperty(
        "--vrx-y",
        `${Math.sin(angle) * distance}px`
      );

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
    const count = rarity.power >= 3 ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const ring = document.createElement("div");

      ring.className = "vrx-ring";
      ring.style.left = `${position.x}px`;
      ring.style.top = `${position.y}px`;

      ring.style.setProperty(
        "--vrx-color",
        rarity.color
      );

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

    createCustomParticles(level);
    createCustomRing(level);
    createCustomFlash(level);
    playCustomSound(level);

    const numberBox = $("number-box");

    if (numberBox) {
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
  }

  /* =========================================
     6. 기존 추첨 연출과 연결
  ========================================= */

  const originalTriggerNextResultEffect =
    window.triggerNextResultEffect;

  if (typeof originalTriggerNextResultEffect === "function") {
    window.triggerNextResultEffect = function (
      actualPattern,
      result
    ) {
      const previewWasSelected =
        typeof pendingEffectOverride !== "undefined" &&
        Boolean(pendingEffectOverride);

      const returnedPattern =
        originalTriggerNextResultEffect.apply(
          this,
          arguments
        );

      const effectPattern =
        returnedPattern || actualPattern;

      const effectsAllowed =
        previewWasSelected ||
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
      "[Violet Random] 기존 임팩트 함수를 찾지 못했어."
    );
  }

  /* =========================================
     7. 희귀 숫자 기록 필터에 추가
  ========================================= */

  const EXTRA_FILTER_MIGRATION_KEY =
    "violetRandomExtraRarityFiltersAddedV1";

  function installRareHistoryFilters() {
    const grid = document.querySelector(
      ".rare-history-filter-grid"
    );

    if (
      !grid ||
      typeof rareHistoryFilterInputs === "undefined" ||
      !Array.isArray(rareHistoryFilterInputs)
    ) {
      return;
    }

    let savedLevels = null;

    try {
      savedLevels = JSON.parse(
        localStorage.getItem(RARE_HISTORY_FILTER_KEY) || "null"
      );
    } catch {
      savedLevels = null;
    }

    const firstMigration =
      localStorage.getItem(EXTRA_FILTER_MIGRATION_KEY) !== "1";

    let selectedLevels;

    if (Array.isArray(savedLevels)) {
      selectedLevels = savedLevels.filter(level =>
        RARITY_ORDER.includes(level) &&
        level !== "common"
      );
    } else {
      selectedLevels = RARITY_ORDER.filter(
        level => level !== "common"
      );
    }

    // 처음 설치할 때는 신규 등급들을 기본 선택한다.
    if (firstMigration) {
      CUSTOM_LEVELS.forEach(level => {
        if (!selectedLevels.includes(level)) {
          selectedLevels.push(level);
        }
      });
    }

    rareHistoryLevels = new Set(selectedLevels);

    CUSTOM_LEVELS.forEach(level => {
      const rarity = CUSTOM_RARITIES[level];

      let input = grid.querySelector(
        `input[name="rare-history-rarity"][value="${level}"]`
      );

      if (!input) {
        const label = document.createElement("label");
        input = document.createElement("input");

        const badge = document.createElement("span");

        input.type = "checkbox";
        input.name = "rare-history-rarity";
        input.value = level;

        badge.className = `rarity-badge ${level}`;
        badge.textContent = rarity.label;

        label.append(input, badge);
        grid.appendChild(label);
      }

      if (!rareHistoryFilterInputs.includes(input)) {
        rareHistoryFilterInputs.push(input);
      }

      input.checked = rareHistoryLevels.has(level);

      if (input.dataset.violetExtraBound !== "true") {
        input.dataset.violetExtraBound = "true";

        input.addEventListener("change", () => {
          if (typeof saveRareHistoryLevels === "function") {
            saveRareHistoryLevels();
          }
        });
      }
    });

    applyRareHistoryFilterControls();

    try {
      localStorage.setItem(
        RARE_HISTORY_FILTER_KEY,
        JSON.stringify([...rareHistoryLevels])
      );

      localStorage.setItem(
        EXTRA_FILTER_MIGRATION_KEY,
        "1"
      );
    } catch (error) {
      console.warn(
        "[Violet Random] 희귀 기록 필터 저장 실패:",
        error
      );
    }

    if (typeof renderRareHistory === "function") {
      renderRareHistory();
    }
  }

  /* =========================================
     8. 자동 추첨 중지 조건에 추가
  ========================================= */

  function installAutoStopOptions() {
    const grid = document.querySelector(".auto-rarity-grid");

    if (!grid) return;

    CUSTOM_LEVELS.forEach(level => {
      if (
        grid.querySelector(
          `input[name="auto-stop-rarity"][value="${level}"]`
        )
      ) {
        return;
      }

      const rarity = CUSTOM_RARITIES[level];

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

  /* =========================================
     9. 연출 미리보기에 추가
  ========================================= */

  function installReplayOptions() {
    const grid = document.querySelector(".replay-grid");

    if (!grid) return;

    CUSTOM_LEVELS.forEach(level => {
      if (
        grid.querySelector(
          `[data-preview-rarity="${level}"]`
        )
      ) {
        return;
      }

      const rarity = CUSTOM_RARITIES[level];

      const button = document.createElement("button");
      button.type = "button";
      button.className = "replay-rarity-button";
      button.dataset.previewRarity = level;

      const badge = document.createElement("span");
      badge.className = `rarity-badge ${level}`;
      badge.textContent = rarity.label;

      const detail = document.createElement("small");
      detail.textContent = rarity.detail;

      button.append(badge, detail);

      button.addEventListener("click", () => {
        if (
          typeof pendingEffectOverride === "undefined" ||
          typeof RARITY_ORDER === "undefined"
        ) {
          return;
        }

        pendingEffectOverride = {
          title: rarity.title,
          level,
          detail: rarity.detail
        };

        document.querySelectorAll(
          "[data-preview-rarity]"
        ).forEach(item => {
          item.classList.toggle(
            "selected",
            item === button
          );
        });

        const message = $("replay-message");

        if (message) {
          message.textContent =
            `${rarity.label} 연출을 선택했어. ` +
            "창을 닫고 다음 숫자를 뽑으면 적용돼!";
        }

        if (typeof closeReplay === "function") {
          closeReplay();
        }

        const status = $("status");

        if (status) {
          status.textContent =
            `다음 추첨에 ${rarity.label} 연출이 예약됐어.`;
        }
      });

      grid.appendChild(button);
    });
  }

  /* =========================================
     10. 희귀도 표에 추가
  ========================================= */

  const TABLE_ROWS = [
    {
      level: "singularity",
      before: "reverse-special",
      condition: "1029384",
      description: "지정된 단 하나의 숫자 · 초희귀"
    },
    {
      level: "infinity",
      before: "celestial",
      condition: "서로 다른 7자리 숫자 · 합 34",
      description: "상위 희귀도 · 무한의 경계"
    },
    {
      level: "astral",
      before: "celestial",
      condition: "서로 다른 7자리 숫자 · 합 33",
      description: "상위 희귀도 · 성계의 각성"
    },
    {
      level: "nova",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 31",
      description: "중간 희귀도 · 별의 섬광"
    },
    {
      level: "nebula",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 30",
      description: "중간 희귀도 · 성운의 파편"
    },
    {
      level: "spectrum",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 29",
      description: "중간 희귀도 · 빛의 스펙트럼"
    },
    {
      level: "orbit",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 28",
      description: "중간 희귀도 · 궤도의 조화"
    },
    {
      level: "crystal",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 27",
      description: "중간 희귀도 · 수정 공명"
    },
    {
      level: "starlight",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 26",
      description: "중간 희귀도 · 별빛의 흔적"
    },
    {
      level: "luminous",
      before: "legendary",
      condition: "서로 다른 7자리 숫자 · 합 25",
      description: "중간 희귀도 · 빛의 파동"
    }
  ];

  function createTableRow(item) {
    const rarity = CUSTOM_RARITIES[item.level];

    const row = document.createElement("tr");
    row.dataset.extraRarityRow = item.level;

    const conditionCell = document.createElement("td");

    const order = document.createElement("span");
    order.className = "rarity-order";
    order.textContent = "—";

    conditionCell.append(order);
    conditionCell.append(
      document.createTextNode(` ${item.condition}`)
    );

    const rarityCell = document.createElement("td");

    const badge = document.createElement("span");
    badge.className = `rarity-badge ${item.level}`;
    badge.textContent = rarity.label;

    rarityCell.appendChild(badge);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;

    row.append(
      conditionCell,
      rarityCell,
      descriptionCell
    );

    return row;
  }

  function installRarityTableRows() {
    const tableBody = document.querySelector(
      "#rarity-overlay .rarity-table tbody"
    );

    if (!tableBody) return;

    TABLE_ROWS.forEach(item => {
      if (
        tableBody.querySelector(
          `[data-extra-rarity-row="${item.level}"]`
        )
      ) {
        return;
      }

      const row = createTableRow(item);

      const anchorBadge = tableBody.querySelector(
        `.rarity-badge.${item.before}`
      );

      const anchorRow = anchorBadge?.closest("tr");

      if (anchorRow) {
        tableBody.insertBefore(row, anchorRow);
      } else {
        tableBody.appendChild(row);
      }
    });

    // 기존 표와 추가된 행의 순서 번호를 다시 맞춘다.
    tableBody.querySelectorAll("tr").forEach((row, index) => {
      const order = row.querySelector(".rarity-order");

      if (order) {
        order.textContent =
          String(index + 1).padStart(2, "0");
      }
    });

    const note = document.querySelector(
      "#rarity-overlay .settings-message"
    );

    if (note) {
      note.textContent =
        "새 희귀도 10종은 지정된 숫자와 자릿수 조건으로 판정돼. " +
        "기존 희귀도 조건에 해당하면 기존 등급이 우선 적용돼.";
    }
  }

  /* =========================================
     11. 현재 통계와 기록 갱신
  ========================================= */

  function refreshCurrentRarityData() {
    // 복원되어 있던 최근 희귀 기록의 등급 표시를 갱신한다.
    if (
      typeof rareHistory !== "undefined" &&
      Array.isArray(rareHistory)
    ) {
      rareHistory = rareHistory.map(entry => {
        const value = Number(entry.value);

        const updatedPattern =
          window.getRarePattern(String(value)) ||
          entry.pattern;

        return {
          ...entry,
          value,
          pattern: updatedPattern
        };
      });
    }

    if (typeof renderRareHistory === "function") {
      renderRareHistory();
    }

    if (typeof renderStatistics === "function") {
      renderStatistics();
    }

    if (typeof saveProgress === "function") {
      saveProgress();
    }
  }

  /* =========================================
     12. 모듈 초기화
  ========================================= */

  function initializeExtraRarities() {
    const metadataInstalled = installRarityMetadata();

    installStyles();

    if (!metadataInstalled) {
      console.error(
        "[Violet Random] 추가 희귀도 목록을 연결하지 못했어."
      );
      return;
    }

    installRareHistoryFilters();
    installAutoStopOptions();
    installReplayOptions();
    installRarityTableRows();
    refreshCurrentRarityData();

    window.VioletRandomExtraRarities = {
      rarities: CUSTOM_RARITIES,
      getCustomPattern,
      playCustomImpact,
      version: "2.0.0"
    };

    console.info(
      "[Violet Random] 추가 희귀도 10종 연결 완료."
    );
  }

  initializeExtraRarities();
})();
