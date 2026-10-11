/* =========================================
   VIOLET RANDOM - NUMBER CODEX
   도감 창 / 희귀도 자동 수집 / 수동 추가
   기존 script.js와 style.css는 직접 수정하지 않음
   ========================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "violetRandomCodexV1";
  const PROGRESS_KEY = "violetRandomProgress";

  const MAX_ENTRIES = 10000;
  const MAX_VISIBLE_ENTRIES = 250;

  const $ = id => document.getElementById(id);

  const RARITIES = [
    { id: "ultimate", label: "Ultimate", icon: "✧" },
    { id: "reverse-special", label: "Reverse Special", icon: "↶" },
    { id: "special", label: "Special", icon: "✦" },
    { id: "jackpot", label: "Jackpot", icon: "★" },
    { id: "eclipse", label: "Eclipse", icon: "☾" },
    { id: "pi", label: "π · 원주율", icon: "π" },
    { id: "euler", label: "e · 자연상수", icon: "e" },
    { id: "golden-light", label: "황금빛 · 황금비", icon: "φ" },
    { id: "aurora", label: "Aurora", icon: "✧" },
    { id: "hallow", label: "Hallow", icon: "☽" },
    { id: "apex", label: "Apex", icon: "▲" },
    { id: "omniversal", label: "Omniversal", icon: "∞" },
    { id: "divine", label: "Divine", icon: "☼" },
    { id: "genesis", label: "Genesis", icon: "✦" },
    { id: "celestial", label: "Celestial", icon: "☼" },
    { id: "quantum", label: "Quantum", icon: "⚛" },
    { id: "paradox", label: "Paradox", icon: "⟳" },
    { id: "prismatic", label: "Prismatic", icon: "◇" },
    { id: "legendary", label: "Legendary", icon: "★" },
    { id: "mythic", label: "Mythic", icon: "◇" },
    { id: "seraph", label: "Seraph", icon: "♢" },
    { id: "phantom", label: "Phantom", icon: "☾" },
    { id: "glorious", label: "Glorious", icon: "✦" },
    { id: "rare", label: "Rare", icon: "◇" },
    { id: "noteworthy", label: "Noteworthy", icon: "!" },
    { id: "curious", label: "Curious", icon: "?" },
    { id: "oddity", label: "Oddity", icon: "✧" },
    { id: "uncommon", label: "Uncommon", icon: "◇" },
    { id: "common", label: "Common", icon: "·" }
  ];

  const RARITY_LOOKUP = new Map(
    RARITIES.map(item => [item.id, item])
  );

  const DEFAULT_SELECTED_RARITIES = RARITIES
    .filter(item => item.id !== "common")
    .map(item => item.id);

  let state = loadState();
  let entriesByValue = new Map();
  let pendingSaveTimer = null;
  let fallbackObserver = null;
  let wrappedDrawTracker = false;
  let lastFallbackDrawCount = 0;
  let isOpen = false;

  rebuildEntryIndex();

  /* =========================================
     저장 및 불러오기
     ========================================= */

  function createDefaultState() {
    return {
      autoEnabled: true,
      selectedRarities: [...DEFAULT_SELECTED_RARITIES],
      entries: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return createDefaultState();
      }

      const saved = JSON.parse(raw);

      const savedEntries = Array.isArray(saved.entries)
        ? saved.entries
            .filter(entry =>
              entry &&
              Number.isInteger(Number(entry.value)) &&
              Number(entry.value) >= 0 &&
              Number(entry.value) <= 9999999 &&
              typeof entry.rarity === "string" &&
              RARITY_LOOKUP.has(entry.rarity)
            )
            .map(entry => ({
              value: Number(entry.value),
              rarity: entry.rarity,
              count: Math.max(
                1,
                Math.floor(Number(entry.count) || 1)
              ),
              firstCollectedAt:
                Number(entry.firstCollectedAt) || Date.now(),
              lastCollectedAt:
                Number(entry.lastCollectedAt) || Date.now(),
              manualAdded: Boolean(entry.manualAdded)
            }))
            .slice(0, MAX_ENTRIES)
        : [];

      const savedSelected = Array.isArray(saved.selectedRarities)
        ? saved.selectedRarities.filter(rarity =>
            RARITY_LOOKUP.has(rarity)
          )
        : [...DEFAULT_SELECTED_RARITIES];

      return {
        autoEnabled: saved.autoEnabled !== false,
        selectedRarities: [...new Set(savedSelected)],
        entries: savedEntries
      };
    } catch (error) {
      console.warn("도감 기록을 불러오지 못했어:", error);
      return createDefaultState();
    }
  }

  function rebuildEntryIndex() {
    entriesByValue = new Map();

    state.entries.forEach(entry => {
      entriesByValue.set(String(entry.value), entry);
    });
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

      return true;
    } catch (error) {
      console.warn("도감 기록 저장 실패:", error);

      setMessage(
        "저장 공간이 부족하거나 브라우저에서 저장을 허용하지 않아. 💜",
        "error"
      );

      return false;
    }
  }

  function readProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /* =========================================
     숫자와 희귀도 확인
     ========================================= */

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function getRarityInfo(value) {
    let pattern = null;

    /*
      Violet Random의 기존 희귀도 판정 함수를 사용해.
      별도의 판정 기준을 만들어 기존 등급과 달라지는 일을 피한다.
    */

    try {
      if (typeof window.getRarePattern === "function") {
        pattern = window.getRarePattern(String(value));
      }
    } catch (error) {
      console.warn("희귀도를 확인하지 못했어:", error);
    }

    const rarityId =
      pattern?.level && RARITY_LOOKUP.has(pattern.level)
        ? pattern.level
        : "common";

    const rarity = RARITY_LOOKUP.get(rarityId);

    return {
      id: rarity.id,
      label: pattern?.title || rarity.label,
      icon: rarity.icon
    };
  }

  function getDisplayedNumber() {
    const progress = readProgress();
    const hasPreviousResult =
      Number(progress?.totalDraws) > 0 ||
      (Array.isArray(progress?.history) &&
        progress.history.length > 0);

    if (!hasPreviousResult) {
      return null;
    }

    const numberElement = $("number");

    if (numberElement) {
      const digits = Array.from(
        numberElement.querySelectorAll("span")
      )
        .map(span => span.textContent.trim())
        .join("");

      if (/^\d{1,7}$/.test(digits)) {
        const value = Number(digits);

        if (
          Number.isInteger(value) &&
          value >= 0 &&
          value <= 9999999
        ) {
          return value;
        }
      }
    }

    const lastResult = progress?.lastResult;

    if (
      typeof lastResult === "string" &&
      /^\d{1,7}$/.test(lastResult)
    ) {
      return Number(lastResult);
    }

    return null;
  }

  /* =========================================
     도감에 숫자 추가
     ========================================= */

  function addEntry(value, source = "manual") {
    const numericValue = Number(value);

    if (
      !Number.isInteger(numericValue) ||
      numericValue < 0 ||
      numericValue > 9999999
    ) {
      return false;
    }

    const rarityInfo = getRarityInfo(numericValue);
    const key = String(numericValue);
    const now = Date.now();

    let entry = entriesByValue.get(key);

    if (entry) {
      entry.count += 1;
      entry.lastCollectedAt = now;

      if (source === "manual") {
        entry.manualAdded = true;
      }

      /*
        이미 수집한 숫자는 중복 카드로 만들지 않고,
        발견 횟수만 늘린다.
      */
    } else {
      if (state.entries.length >= MAX_ENTRIES) {
        const oldest = state.entries.pop();

        if (oldest) {
          entriesByValue.delete(String(oldest.value));
        }
      }

      entry = {
        value: numericValue,
        rarity: rarityInfo.id,
        count: 1,
        firstCollectedAt: now,
        lastCollectedAt: now,
        manualAdded: source === "manual"
      };

      state.entries.unshift(entry);
      entriesByValue.set(key, entry);
    }

    return true;
  }

  function addCurrentNumber() {
    const value = getDisplayedNumber();

    if (value === null) {
      setMessage(
        "먼저 숫자를 하나 뽑아 줘. 그러면 도감에 추가할 수 있어!",
        "warning"
      );
      return;
    }

    addEntry(value, "manual");

    const saved = saveState();
    renderCodexList();
    renderCodexStats();

    if (saved) {
      const rarity = getRarityInfo(value);

      setMessage(
        `${formatNumber(value)} · ${rarity.label} 숫자를 도감에 추가했어! 💜`,
        "success"
      );
    }
  }

  /* =========================================
     자동 수집
     ========================================= */

  function collectAutomatically(value) {
    if (!state.autoEnabled) return;

    const rarity = getRarityInfo(value);

    if (!state.selectedRarities.includes(rarity.id)) {
      return;
    }

    const added = addEntry(value, "auto");

    if (added) {
      scheduleSaveAndRender();
    }
  }

  /*
    실제 추첨 기록 함수에 연결한다.
    기존 함수는 그대로 실행하고 그 결과만 도감으로 전달한다.
    초고속 추첨에서도 개별 결과를 확인할 수 있어.
  */

  function installDrawTrackerHook() {
    const originalTracker = window.trackDrawStatistics;

    if (
      typeof originalTracker !== "function" ||
      originalTracker.__codexWrapped === true
    ) {
      return false;
    }

    function wrappedTracker(result, options) {
      const returnedValue = originalTracker.apply(
        this,
        arguments
      );

      try {
        const value = Number(result);

        if (
          Number.isInteger(value) &&
          value >= 0 &&
          value <= 9999999
        ) {
          collectAutomatically(value);
        }
      } catch (error) {
        console.warn("자동 도감 수집 중 문제가 발생했어:", error);
      }

      return returnedValue;
    }

    wrappedTracker.__codexWrapped = true;
    window.trackDrawStatistics = wrappedTracker;

    wrappedDrawTracker = true;
    return true;
  }

  /*
    혹시 기존 추첨 함수에 접근할 수 없는 환경이면
    최근 추첨 기록을 관찰하는 대체 방식을 사용한다.
    대체 방식에서는 한 번에 많은 추첨이 이뤄진 경우
    최근 기록에 남은 결과만 확인할 수 있어.
  */

  function installFallbackObserver() {
    if (wrappedDrawTracker) return;

    const historyList = $("history-list");

    if (!historyList || fallbackObserver) return;

    const progress = readProgress();

    lastFallbackDrawCount = Number(progress?.totalDraws) || 0;

    fallbackObserver = new MutationObserver(() => {
      const currentProgress = readProgress();
      const currentCount =
        Number(currentProgress?.totalDraws) || 0;

      if (currentCount <= lastFallbackDrawCount) {
        lastFallbackDrawCount = currentCount;
        return;
      }

      const difference = currentCount - lastFallbackDrawCount;
      lastFallbackDrawCount = currentCount;

      const recentHistory = Array.isArray(currentProgress?.history)
        ? currentProgress.history
        : [];

      const numberToInspect = Math.min(
        difference,
        recentHistory.length,
        10
      );

      recentHistory
        .slice(0, numberToInspect)
        .reverse()
        .forEach(value => {
          collectAutomatically(Number(value));
        });
    });

    fallbackObserver.observe(historyList, {
      childList: true,
      subtree: true
    });
  }

  function scheduleSaveAndRender() {
    if (pendingSaveTimer !== null) return;

    pendingSaveTimer = window.setTimeout(() => {
      pendingSaveTimer = null;

      saveState();
      renderCodexStats();
      renderCodexList();
    }, 150);
  }

  /* =========================================
     스타일시트 연결
     ========================================= */

  function ensureStylesheet() {
    if (
      document.querySelector(
        'link[data-codex-stylesheet="true"]'
      )
    ) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "codex.css";
    link.dataset.codexStylesheet = "true";

    document.head.appendChild(link);
  }

  /* =========================================
     도감 버튼
     순서: 업적 → 도감 → 설정 → 초기화
     ========================================= */

  function createCodexButton() {
    const topActions = document.querySelector(".top-actions");

    if (!topActions) {
      console.warn("도감 버튼을 배치할 영역을 찾지 못했어.");
      return;
    }

    let button = $("codex-button");

    if (!button) {
      button = document.createElement("button");
      button.id = "codex-button";
      button.className = "settings-button codex-open-button";
      button.type = "button";
      button.textContent = "📖 도감";
      button.title = "숫자 도감";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "codex-overlay");
    }

    const achievementsButton = $("achievements-button");
    const settingsButton = $("settings-button");

    if (achievementsButton) {
      achievementsButton.insertAdjacentElement(
        "afterend",
        button
      );
    } else if (settingsButton) {
      topActions.insertBefore(button, settingsButton);
    } else {
      topActions.appendChild(button);
    }

    button.addEventListener("click", openCodex);
  }

  /* =========================================
     희귀도 선택 목록
     ========================================= */

  function createRarityOptions() {
    const container = $("codex-rarity-options");

    if (!container) return;

    container.replaceChildren();

    RARITIES.forEach(rarity => {
      const label = document.createElement("label");
      label.className = "codex-rarity-option";
      label.dataset.rarity = rarity.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = rarity.id;
      checkbox.dataset.codexRarity = rarity.id;
      checkbox.checked =
        state.selectedRarities.includes(rarity.id);

      const icon = document.createElement("span");
      icon.className = "codex-rarity-option-icon";
      icon.textContent = rarity.icon;

      const name = document.createElement("span");
      name.className = "codex-rarity-option-name";
      name.textContent = rarity.label;

      label.append(checkbox, icon, name);
      container.appendChild(label);
    });
  }

  function syncRarityOptions() {
    const checkboxes = document.querySelectorAll(
      "[data-codex-rarity]"
    );

    checkboxes.forEach(checkbox => {
      checkbox.checked =
        state.selectedRarities.includes(checkbox.value);
    });
  }

  function readSelectedRaritiesFromUI() {
    state.selectedRarities = Array.from(
      document.querySelectorAll("[data-codex-rarity]:checked")
    ).map(checkbox => checkbox.value);

    saveState();

    setMessage(
      `자동 수집 대상 등급 ${state.selectedRarities.length}개를 저장했어.`,
      "success"
    );
  }

  /* =========================================
     도감 창 생성
     ========================================= */

  function createCodexModal() {
    if ($("codex-overlay")) return;

    const
