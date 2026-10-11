/* =========================================
   VIOLET RANDOM - ACHIEVEMENTS SYSTEM
   기존 script.js와 style.css는 수정하지 않음
   ========================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "violetRandomAchievementsV1";
  const PROGRESS_KEY = "violetRandomProgress";

  const ACHIEVEMENTS = [
    {
      id: "first-draw",
      title: "첫 뽑기를 하세요.",
      description: "뽑기 수 1회 달성.",
      icon: "✦",
      type: "count",
      target: 1
    },
    {
      id: "oddity",
      title: "Oddity 를 뽑으세요.",
      description: "Oddity 등급 뽑기.",
      icon: "✧",
      type: "rarity",
      rarity: "oddity"
    },
    {
      id: "rare",
      title: "숫자의 특이함을 느껴보세요.",
      description: "Rare 등급 뽑기.",
      icon: "◇",
      type: "rarity",
      rarity: "rare"
    },
    {
      id: "hundred",
      title: "이제 시작입니다.",
      description: "뽑기 수 100회 달성.",
      icon: "Ⅰ",
      type: "count",
      target: 100
    },
    {
      id: "glorious",
      title: "좀 하시네요.",
      description: "Glorious 등급 뽑기.",
      icon: "✦",
      type: "rarity",
      rarity: "glorious"
    },
    {
      id: "mythic",
      title: "대칭대칭",
      description: "Mythic 등급 뽑기.",
      icon: "◇",
      type: "rarity",
      rarity: "mythic"
    },
    {
      id: "ten-thousand",
      title: "님아 그 강을 건너지 마세요.",
      description: "10,000회 뽑기.",
      icon: "Ⅱ",
      type: "count",
      target: 10000
    },
    {
      id: "prismatic",
      title: "운이 좋군요.",
      description: "Prismatic 등급 뽑기.",
      icon: "✧",
      type: "rarity",
      rarity: "prismatic"
    },
    {
      id: "celestial",
      title: "홀수 밖에.",
      description: "Celestial 등급 뽑기.",
      icon: "☼",
      type: "rarity",
      rarity: "celestial"
    },
    {
      id: "hundred-thousand",
      title: "아니요, 강을 넘었어요.",
      description: "100,000회 뽑기.",
      icon: "Ⅲ",
      type: "count",
      target: 100000
    },
    {
      id: "omniversal",
      title: "대칭대칭대칭대칭",
      description: "Omniversal 등급 뽑기.",
      icon: "∞",
      type: "rarity",
      rarity: "omniversal"
    },
    {
      id: "million",
      title: "흠.. 난 몰라.",
      description: "1,000,000회 뽑기.",
      icon: "Ⅳ",
      type: "count",
      target: 1000000
    },
    {
      id: "hallow",
      title: "없어요.",
      description: "Hallow 등급 뽑기.",
      icon: "☾",
      type: "rarity",
      rarity: "hallow"
    },
    {
      id: "math",
      title: "나는 수학이 좋아.",
      description: "원주율, e, 황금비 등급 전부 뽑기.",
      icon: "π",
      type: "math"
    },
    {
      id: "eclipse",
      title: "같다.",
      description: "Eclipse 등급 뽑기.",
      icon: "●",
      type: "rarity",
      rarity: "eclipse"
    },
    {
      id: "jackpot",
      title: "I just hit the Jackpot!",
      description: "Jackpot 등급 뽑기.",
      icon: "★",
      type: "rarity",
      rarity: "jackpot"
    },
    {
      id: "ten-million",
      title: "와.",
      description: "10,000,000회 뽑기.",
      icon: "Ⅴ",
      type: "count",
      target: 10000000
    },
    {
      id: "special",
      title: "어케 뽑았노.",
      description: "Special 등급 뽑기.",
      icon: "!",
      type: "rarity",
      rarity: "special"
    },
    {
      id: "reverse-special",
      title: "아니, 이건 또 어케.",
      description: "Reverse Special 등급 뽑기.",
      icon: "↶",
      type: "rarity",
      rarity: "reverse-special"
    },
    {
      id: "ultimate",
      title: "? 왓더.",
      description: "Ultimate 등급 뽑기.",
      icon: "⚝",
      type: "rarity",
      rarity: "ultimate"
    },
    {
      id: "password",
      title: "아니, 어케 알았지?",
      description: "비밀번호 맞추기.",
      icon: "⌘",
      type: "password"
    },

    /* =====================================
       추가 업적 1~8: 뽑기 횟수
       ===================================== */

    {
      id: "ten-draws",
      title: "워밍업 완료",
      description: "뽑기 10회 달성.",
      icon: "Ⅰ",
      type: "count",
      target: 10
    },
    {
      id: "fifty-draws",
      title: "조금씩 쌓이는 운",
      description: "뽑기 50회 달성.",
      icon: "Ⅱ",
      type: "count",
      target: 50
    },
    {
      id: "five-hundred-draws",
      title: "500번의 선택",
      description: "뽑기 500회 달성.",
      icon: "Ⅲ",
      type: "count",
      target: 500
    },
    {
      id: "one-thousand-draws",
      title: "네 자릿수의 기록",
      description: "뽑기 1,000회 달성.",
      icon: "Ⅳ",
      type: "count",
      target: 1000
    },
    {
      id: "five-thousand-draws",
      title: "숫자에 진심",
      description: "뽑기 5,000회 달성.",
      icon: "Ⅴ",
      type: "count",
      target: 5000
    },
    {
      id: "fifty-thousand-draws",
      title: "멈추지 않는 손",
      description: "뽑기 50,000회 달성.",
      icon: "✧",
      type: "count",
      target: 50000
    },
    {
      id: "five-hundred-thousand-draws",
      title: "운명의 단골손님",
      description: "뽑기 500,000회 달성.",
      icon: "✦",
      type: "count",
      target: 500000
    },
    {
      id: "five-million-draws",
      title: "오백만 번의 운명",
      description: "뽑기 5,000,000회 달성.",
      icon: "∞",
      type: "count",
      target: 5000000
    },

    /* =====================================
       추가 업적 9~20: 새로운 희귀도
       ===================================== */

    {
      id: "aurora",
      title: "오로라를 만나다",
      description: "Aurora 등급 숫자를 뽑으세요.",
      icon: "✧",
      type: "rarity",
      rarity: "aurora"
    },
    {
      id: "apex",
      title: "정점에 도달하다",
      description: "Apex 등급 숫자를 뽑으세요.",
      icon: "▲",
      type: "rarity",
      rarity: "apex"
    },
    {
      id: "divine",
      title: "신성한 숫자",
      description: "Divine 등급 숫자를 뽑으세요.",
      icon: "☼",
      type: "rarity",
      rarity: "divine"
    },
    {
      id: "genesis",
      title: "시작의 숫자",
      description: "Genesis 등급 숫자를 뽑으세요.",
      icon: "✦",
      type: "rarity",
      rarity: "genesis"
    },
    {
      id: "quantum",
      title: "양자 도약",
      description: "Quantum 등급 숫자를 뽑으세요.",
      icon: "⚛",
      type: "rarity",
      rarity: "quantum"
    },
    {
      id: "paradox",
      title: "역설의 숫자",
      description: "Paradox 등급 숫자를 뽑으세요.",
      icon: "⟳",
      type: "rarity",
      rarity: "paradox"
    },
    {
      id: "legendary",
      title: "한 자리의 전설",
      description: "Legendary 등급 숫자를 뽑으세요.",
      icon: "★",
      type: "rarity",
      rarity: "legendary"
    },
    {
      id: "seraph",
      title: "천사의 합",
      description: "Seraph 등급 숫자를 뽑으세요.",
      icon: "♢",
      type: "rarity",
      rarity: "seraph"
    },
    {
      id: "phantom",
      title: "환영의 반복",
      description: "Phantom 등급 숫자를 뽑으세요.",
      icon: "☾",
      type: "rarity",
      rarity: "phantom"
    },
    {
      id: "noteworthy",
      title: "주목할 만한 숫자",
      description: "Noteworthy 등급 숫자를 뽑으세요.",
      icon: "◇",
      type: "rarity",
      rarity: "noteworthy"
    },
    {
      id: "curious",
      title: "호기심 자극",
      description: "Curious 등급 숫자를 뽑으세요.",
      icon: "?",
      type: "rarity",
      rarity: "curious"
    },
    {
      id: "uncommon",
      title: "흔하지 않은 발견",
      description: "Uncommon 등급 숫자를 뽑으세요.",
      icon: "◇",
      type: "rarity",
      rarity: "uncommon"
    },

    /* =====================================
       추가 업적 21~23: 누적 통계
       ===================================== */

    {
      id: "prime-ten",
      title: "소수 수집가",
      description: "소수를 총 10번 뽑으세요.",
      icon: "π",
      type: "stat",
      stat: "prime",
      target: 10
    },
    {
      id: "even-hundred",
      title: "짝수의 편",
      description: "짝수를 총 100번 뽑으세요.",
      icon: "Ⅱ",
      type: "stat",
      stat: "even",
      target: 100
    },
    {
      id: "odd-hundred",
      title: "홀수의 편",
      description: "홀수를 총 100번 뽑으세요.",
      icon: "Ⅲ",
      type: "stat",
      stat: "odd",
      target: 100
    },

    /* =====================================
       추가 업적 24~25: 숫자 패턴
       ===================================== */

    {
      id: "unique-seven-digits",
      title: "숫자 중복 금지",
      description: "모든 자릿수가 서로 다른 7자리 숫자를 뽑으세요.",
      icon: "⑦",
      type: "property",
      property: "unique-seven-digits"
    },
    {
      id: "prime-streak",
      title: "소수의 행진",
      description: "소수가 연속으로 3번 나오도록 하세요.",
      icon: "Ⅲ",
      type: "property",
      property: "prime-streak"
    }
  ];

  const MATH_RARITIES = [
    "pi",
    "euler",
    "golden-light"
  ];

  const RARITY_ACHIEVEMENT_MAP = {
    oddity: "oddity",
    rare: "rare",
    glorious: "glorious",
    mythic: "mythic",
    prismatic: "prismatic",
    celestial: "celestial",
    omniversal: "omniversal",
    hallow: "hallow",
    eclipse: "eclipse",
    jackpot: "jackpot",
    special: "special",
    "reverse-special": "reverse-special",
    ultimate: "ultimate",

    aurora: "aurora",
    apex: "apex",
    divine: "divine",
    genesis: "genesis",
    quantum: "quantum",
    paradox: "paradox",
    legendary: "legendary",
    seraph: "seraph",
    phantom: "phantom",
    noteworthy: "noteworthy",
    curious: "curious",
    uncommon: "uncommon"
  };

  const $ = id => document.getElementById(id);

  function readProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getCurrentDrawCount() {
    const element = $("total-draws");

    if (!element) return 0;

    const value = Number(
      element.textContent.replace(/[^\d]/g, "")
    );

    return Number.isFinite(value) ? value : 0;
  }

  function getRarityCounts() {
    const progress = readProgress();
    const rarities = progress?.drawStats?.rarities;

    return rarities && typeof rarities === "object"
      ? { ...rarities }
      : {};
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return {
          initialized: false,
          unlocked: [],
          drawsSinceReset: 0
        };
      }

      const saved = JSON.parse(raw);

      return {
        initialized: true,
        unlocked: Array.isArray(saved?.unlocked)
          ? saved.unlocked.filter(id =>
              ACHIEVEMENTS.some(item => item.id === id)
            )
          : [],
        drawsSinceReset:
          Number.isFinite(saved?.drawsSinceReset)
            ? Math.max(0, saved.drawsSinceReset)
            : 0
      };
    } catch {
      return {
        initialized: true,
        unlocked: [],
        drawsSinceReset: 0
      };
    }
  }

  let state = loadState();
  let lastObservedDrawCount = 0;
  let lastRarityCounts = getRarityCounts();
  let notificationsEnabled = false;

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn("업적 기록 저장 실패:", error);
    }
  }

  function isUnlocked(id) {
    return state.unlocked.includes(id);
  }

  function unlock(id) {
    if (isUnlocked(id)) return;

    state.unlocked.push(id);
    saveState();
    renderAchievements();

    if (notificationsEnabled) {
      const achievement = ACHIEVEMENTS.find(
        item => item.id === id
      );

      if (achievement) {
        showAchievementToast(achievement);
      }
    }
  }

  function checkCountAchievements(count) {
    ACHIEVEMENTS
      .filter(item =>
        item.type === "count" &&
        count >= item.target
      )
      .forEach(item => unlock(item.id));
  }

  function checkRarityAchievements(rarityCounts) {
    Object.entries(RARITY_ACHIEVEMENT_MAP).forEach(
      ([rarity, achievementId]) => {
        if (Number(rarityCounts[rarity]) > 0) {
          unlock(achievementId);
        }
      }
    );

    const hasAllMathRarities = MATH_RARITIES.every(
      rarity => Number(rarityCounts[rarity]) > 0
    );

    if (hasAllMathRarities) {
      unlock("math");
    }
  }

  /* =====================================
     새 업적 조건 검사
     ===================================== */

  function isPrimeNumber(value) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 2) {
      return false;
    }

    if (number === 2) return true;
    if (number % 2 === 0) return false;

    for (
      let divisor = 3;
      divisor * divisor <= number;
      divisor += 2
    ) {
      if (number % divisor === 0) {
        return false;
      }
    }

    return true;
  }

  function propertyAchievementSatisfied(property, rawHistory) {
    if (!Array.isArray(rawHistory)) return false;

    const values = rawHistory
      .map(value => Number(value))
      .filter(value =>
        Number.isFinite(value) &&
        value >= 0
      );

    if (property === "unique-seven-digits") {
      return values.some(value => {
        const digits = String(value);

        return (
          digits.length === 7 &&
          new Set(digits).size === 7
        );
      });
    }

    if (property === "prime-streak") {
      for (
        let index = 0;
        index <= values.length - 3;
        index++
      ) {
        const threeValues = values.slice(index, index + 3);

        if (threeValues.every(isPrimeNumber)) {
          return true;
        }
      }
    }

    return false;
  }

  function checkAdditionalAchievements(progress = readProgress()) {
    if (!progress || typeof progress !== "object") {
      return;
    }

    const statistics = progress.drawStats || {};
    const history = progress.history;

    ACHIEVEMENTS.forEach(achievement => {
      if (achievement.type === "stat") {
        const actual =
          Number(statistics[achievement.stat]) || 0;

        if (actual >= achievement.target) {
          unlock(achievement.id);
        }
      }

      if (
        achievement.type === "property" &&
        propertyAchievementSatisfied(
          achievement.property,
          history
        )
      ) {
        unlock(achievement.id);
      }
    });
  }

  function seedExistingProgress() {
    const count = getCurrentDrawCount();
    const rarities = getRarityCounts();

    state.drawsSinceReset = count;

    checkCountAchievements(count);
    checkRarityAchievements(rarities);

    state.initialized = true;
    saveState();
  }

  function ensureStylesheet() {
    if (
      !document.querySelector(
        'link[data-achievements-stylesheet="true"]'
      )
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "achievements.css";
      link.dataset.achievementsStylesheet = "true";

      document.head.appendChild(link);
    }
  }

  /* =====================================
     업적 달성 알림
     오른쪽 위에 잠시 표시
     ===================================== */

  function ensureToastStyles() {
    if ($("vr-achievement-toast-styles")) return;

    const style = document.createElement("style");
    style.id = "vr-achievement-toast-styles";

    style.textContent = `
      #vr-achievement-toast-container {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: min(370px, calc(100vw - 28px));
        pointer-events: none;
      }

      .vr-achievement-toast {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 14px 16px;
        overflow: hidden;
        border: 1px solid rgba(190, 133, 255, 0.58);
        border-radius: 15px;
        background: linear-gradient(
          135deg,
          rgba(39, 24, 57, 0.97),
          rgba(14, 10, 22, 0.98)
        );
        box-shadow:
          0 12px 36px rgba(0, 0, 0, 0.38),
          0 0 24px rgba(151, 82, 235, 0.22),
          inset 0 0 18px rgba(155, 93, 229, 0.08);
        color: #f4edff;
        animation:
          vr-achievement-toast-in
          260ms cubic-bezier(.2, .8, .2, 1) both;
      }

      .vr-achievement-toast.is-leaving {
        animation: vr-achievement-toast-out 240ms ease-in both;
      }

      .vr-achievement-toast-icon {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        flex: 0 0 42px;
        border: 1px solid rgba(195, 151, 255, 0.48);
        border-radius: 12px;
        background: rgba(147, 82, 226, 0.18);
        color: #e8d4ff;
        font-size: 21px;
        text-shadow: 0 0 15px rgba(185, 125, 255, 0.6);
      }

      .vr-achievement-toast-copy {
        min-width: 0;
      }

      .vr-achievement-toast-label {
        display: block;
        margin-bottom: 4px;
        color: #bd8cff;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.5px;
      }

      .vr-achievement-toast-title {
        display: block;
        overflow-wrap: anywhere;
        color: #fff;
        font-size: 14px;
        font-weight: 800;
      }

      .vr-achievement-toast-description {
        display: block;
        margin-top: 3px;
        color: #b7a6cc;
        font-size: 11px;
        line-height: 1.45;
      }

      @keyframes vr-achievement-toast-in {
        from {
          opacity: 0;
          transform: translateX(22px) scale(.97);
        }

        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes vr-achievement-toast-out {
        from {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        to {
          opacity: 0;
          transform: translateX(18px) scale(.98);
        }
      }

      @media (max-width: 520px) {
        #vr-achievement-toast-container {
          top: 10px;
          right: 10px;
          width: calc(100vw - 20px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function showAchievementToast(achievement) {
    let container = $("vr-achievement-toast-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "vr-achievement-toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "false");

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "vr-achievement-toast";

    const icon = document.createElement("div");
    icon.className = "vr-achievement-toast-icon";
    icon.textContent = achievement.icon;

    const copy = document.createElement("div");
    copy.className = "vr-achievement-toast-copy";

    const label = document.createElement("span");
    label.className = "vr-achievement-toast-label";
    label.textContent = "ACHIEVEMENT UNLOCKED";

    const title = document.createElement("strong");
    title.className = "vr-achievement-toast-title";
    title.textContent = achievement.title;

    const description = document.createElement("span");
    description.className = "vr-achievement-toast-description";
    description.textContent = achievement.description;

    copy.append(label, title, description);
    toast.append(icon, copy);
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");

      window.setTimeout(() => {
        toast.remove();

        if (
          container.isConnected &&
          container.childElementCount === 0
        ) {
          container.remove();
        }
      }, 260);
    }, 4200);
  }

  /* =====================================
     업적 버튼
     순서: 업적 → 설정 → 초기화
     ===================================== */

  function createAchievementsButton() {
    const topActions = document.querySelector(".top-actions");
    const resetButton = $("reset-button");
    const settingsButton = $("settings-button");

    if (!topActions || !resetButton || !settingsButton) {
      console.warn("업적 버튼을 추가할 위치를 찾지 못했어.");
      return;
    }

    let button = $("achievements-button");

    if (!button) {
      button = document.createElement("button");
      button.id = "achievements-button";
      button.className = "settings-button achievements-open-button";
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute(
        "aria-controls",
        "achievements-overlay"
      );
      button.textContent = "🏆 업적";
    }

    // 버튼 순서: 업적 → 설정 → 초기화
    topActions.insertBefore(settingsButton, resetButton);
    topActions.insertBefore(button, settingsButton);
  }

  function createAchievementsModal() {
    if ($("achievements-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "achievements-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("section");
    panel.className = "achievements-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute(
      "aria-labelledby",
      "achievements-title"
    );

    const header = document.createElement("div");
    header.className = "achievements-header";

    const heading = document.createElement("div");

    const eyebrow = document.createElement("p");
    eyebrow.className = "achievements-eyebrow";
    eyebrow.textContent = "VIOLET RANDOM · ACHIEVEMENTS";

    const title = document.createElement("h2");
    title.id = "achievements-title";
    title.className = "achievements-title";
    title.textContent = "업적";

    heading.append(eyebrow, title);

    const closeButton = document.createElement("button");
    closeButton.id = "close-achievements";
    closeButton.className = "achievements-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "업적 창 닫기");
    closeButton.textContent = "✕";

    header.append(heading, closeButton);

    const description = document.createElement("p");
    description.className = "achievements-description";
    description.textContent =
      "Violet Random에서 다양한 업적을 달성해 봐. " +
      "달성한 업적은 초록색으로 표시돼.";

    const progress = document.createElement("div");
    progress.className = "achievements-progress";

    const progressText = document.createElement("div");
    progressText.className = "achievements-progress-text";

    const progressLabel = document.createElement("span");
    progressLabel.textContent = "업적 달성률";

    const progressCount = document.createElement("span");
    progressCount.id = "achievements-progress-count";
    progressCount.textContent = "0 / 46";

    progressText.append(progressLabel, progressCount);

    const progressTrack = document.createElement("div");
    progressTrack.className = "achievements-progress-track";

    const progressFill = document.createElement("div");
    progressFill.id = "achievements-progress-fill";
    progressFill.className = "achievements-progress-fill";

    progressTrack.appendChild(progressFill);
    progress.append(progressText, progressTrack);

    const grid = document.createElement("div");
    grid.id = "achievements-grid";
    grid.className = "achievements-grid";

    panel.append(
      header,
      description,
      progress,
      grid
    );

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    $("achievements-button")?.addEventListener(
      "click",
      openAchievements
    );

    closeButton.addEventListener(
      "click",
      closeAchievements
    );

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeAchievements();
      }
    });
  }

  function renderAchievements() {
    const grid = $("achievements-grid");
    if (!grid) return;

    grid.replaceChildren();

    ACHIEVEMENTS.forEach(achievement => {
      const unlocked = isUnlocked(achievement.id);

      const card = document.createElement("article");
      card.className = "achievement-card";

      if (unlocked) {
        card.classList.add("unlocked");
      }

      const icon = document.createElement("div");
      icon.className = "achievement-icon";
      icon.textContent = achievement.icon;

      const name = document.createElement("h3");
      name.className = "achievement-name";
      name.textContent = achievement.title;

      const description = document.createElement("p");
      description.className = "achievement-description";
      description.textContent = achievement.description;

      const status = document.createElement("span");
      status.className = "achievement-status";
      status.textContent = unlocked
        ? "달성 완료"
        : "미달성";

      card.append(icon, name, description, status);
      grid.appendChild(card);
    });

    const unlockedCount = state.unlocked.length;
    const totalCount = ACHIEVEMENTS.length;
    const percentage =
      (unlockedCount / totalCount) * 100;

    const count = $("achievements-progress-count");
    const fill = $("achievements-progress-fill");

    if (count) {
      count.textContent =
        `${unlockedCount} / ${totalCount}`;
    }

    if (fill) {
      fill.style.width = `${percentage}%`;
    }
  }

  function openAchievements() {
    const overlay = $("achievements-overlay");
    const button = $("achievements-button");

    if (!overlay) return;

    renderAchievements();

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    button?.setAttribute("aria-expanded", "true");
    $("close-achievements")?.focus();
  }

  function closeAchievements() {
    const overlay = $("achievements-overlay");
    const button = $("achievements-button");

    if (!overlay) return;

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    button?.setAttribute("aria-expanded", "false");
    button?.focus();
  }

  function createAchievementResetButton() {
    const resetPanel = document.querySelector(
      "#reset-overlay .reset-panel"
    );

    const resetMessage = $("reset-message");

    if (!resetPanel || !resetMessage) return;

    if ($("reset-achievements")) return;

    const row = document.createElement("div");
    row.className = "settings-actions reset-action-row";

    const button = document.createElement("button");
    button.id = "reset-achievements";
    button.className =
      "secondary-button reset-action-button";
    button.type = "button";
    button.textContent = "업적 초기화";

    button.addEventListener("click", () => {
      const confirmed = window.confirm(
        "달성한 업적을 모두 초기화할까? 이 작업은 되돌릴 수 없어."
      );

      if (!confirmed) return;

      state.unlocked = [];
      state.drawsSinceReset = 0;

      lastObservedDrawCount = getCurrentDrawCount();
      lastRarityCounts = getRarityCounts();

      saveState();
      renderAchievements();

      const message = $("reset-message");

      if (message) {
        message.textContent =
          "업적 기록을 초기화했어. 다음 업적에 다시 도전해 봐! 💜";
      }
    });

    row.appendChild(button);
    resetPanel.insertBefore(row, resetMessage);
  }

  function processProgressChange() {
    const currentCount = getCurrentDrawCount();

    if (currentCount < lastObservedDrawCount) {
      lastObservedDrawCount = currentCount;
      lastRarityCounts = getRarityCounts();
      return;
    }

    if (currentCount > lastObservedDrawCount) {
      const difference =
        currentCount - lastObservedDrawCount;

      const previousProgressCount =
        state.drawsSinceReset;

      state.drawsSinceReset += difference;

      const newlyReachedCount =
        state.drawsSinceReset;

      ACHIEVEMENTS
        .filter(item =>
          item.type === "count" &&
          previousProgressCount < item.target &&
          newlyReachedCount >= item.target
        )
        .forEach(item => unlock(item.id));

      lastObservedDrawCount = currentCount;
    }

    const currentRarityCounts = getRarityCounts();

    Object.entries(RARITY_ACHIEVEMENT_MAP).forEach(
      ([rarity, achievementId]) => {
        const previous = Number(lastRarityCounts[rarity]) || 0;
        const current = Number(currentRarityCounts[rarity]) || 0;

        if (current > previous) {
          unlock(achievementId);
        }
      }
    );

    const allMathRaritiesUnlocked =
      MATH_RARITIES.every(rarity =>
        isRarityPreviouslyDrawn(rarity, currentRarityCounts)
      );

    if (allMathRaritiesUnlocked) {
      unlock("math");
    }

    lastRarityCounts = currentRarityCounts;
    saveState();

    // 소수·짝수·홀수 누적 통계와 숫자 패턴 업적 검사
    checkAdditionalAchievements(readProgress());
  }

  function isRarityPreviouslyDrawn(rarity, rarityCounts) {
    return Number(rarityCounts[rarity]) > 0;
  }

  function handleCorrectPasswordAttempt(event) {
    const target = event.target;

    const isSubmitButton =
      target instanceof Element &&
      target.closest("#submit-password");

    const isEnterKey =
      event.type === "keydown" &&
      target?.id === "password-input" &&
      event.key === "Enter";

    if (!isSubmitButton && !isEnterKey) return;

    const passwordInput = $("password-input");

    if (
      passwordInput &&
      passwordInput.value === "0708"
    ) {
      unlock("password");
    }
  }

  function setupObservers() {
    const totalDraws = $("total-draws");

    if (totalDraws) {
      const observer = new MutationObserver(() => {
        processProgressChange();
      });

      observer.observe(totalDraws, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    const passwordInput = $("password-input");

    document.addEventListener(
      "click",
      handleCorrectPasswordAttempt,
      true
    );

    if (passwordInput) {
      passwordInput.addEventListener(
        "keydown",
        handleCorrectPasswordAttempt,
        true
      );
    }

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        $("achievements-overlay")?.classList.contains("is-open")
      ) {
        closeAchievements();
      }
    });
  }

  function initialize() {
    ensureStylesheet();
    ensureToastStyles();
    createAchievementsButton();
    createAchievementsModal();
    createAchievementResetButton();

    renderAchievements();

    if (!state.initialized) {
      seedExistingProgress();
    } else {
      checkCountAchievements(state.drawsSinceReset);
      checkRarityAchievements(lastRarityCounts);
    }

    // 과거에 달성한 업적은 조용히 반영하고,
    // 이제부터 새로 달성하는 업적에만 알림을 표시한다.
    checkAdditionalAchievements(readProgress());

    lastObservedDrawCount = getCurrentDrawCount();

    setupObservers();
    renderAchievements();

    notificationsEnabled = true;
  }

  initialize();
})();
