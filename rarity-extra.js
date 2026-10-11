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
      const returnedPattern =
        originalTriggerNextResultEffect.apply(this, arguments);

      const effectPattern =
        returnedPattern || actualPattern;

      if (
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
     7. 외부 파일에서 사용할 수 있는 정보
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
