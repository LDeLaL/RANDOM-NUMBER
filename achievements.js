
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
    ultimate: "ultimate"
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
      document.querySelector(
        'link[data-achievements-stylesheet="true"]'
      )
    ) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "achievements.css";
    link.dataset.achievementsStylesheet = "true";

    document.head.appendChild(link);
  }

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

    /*
      기존 버튼 순서:
      초기화 → 설정

      변경할 버튼 순서:
      설정 → 업적 → 초기화
    */

    topActions.insertBefore(settingsButton, resetButton);
    topActions.insertBefore(button, resetButton);
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
    progressCount.textContent = "0 / 21";

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

    lastObservedDrawCount = getCurrentDrawCount();

    setupObservers();
    renderAchievements();
  }

  initialize();
})();
