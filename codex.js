```javascript
/* =========================================
   VIOLET RANDOM - NUMBER CODEX
   도감 창 / 자동 수집 / 직접 추가 / 검색 / 저장
   기존 script.js와 style.css는 수정하지 않음
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
    { id: "golden-light", label: "황금비", icon: "φ" },
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

    // 추가 희귀도 7종 · 중간 등급
    { id: "luminous", label: "Luminous · 빛의 파동", icon: "✧" },
    { id: "starlight", label: "Starlight · 별빛의 흔적", icon: "✦" },
    { id: "crystal", label: "Crystal · 수정 공명", icon: "◇" },
    { id: "orbit", label: "Orbit · 궤도의 조화", icon: "◎" },
    { id: "spectrum", label: "Spectrum · 빛의 스펙트럼", icon: "◇" },
    { id: "nebula", label: "Nebula · 성운의 파편", icon: "☄" },
    { id: "nova", label: "Nova · 별의 섬광", icon: "✹" },

    // 추가 희귀도 2종 · 상위 등급
    { id: "astral", label: "Astral · 성계의 각성", icon: "✦" },
    { id: "infinity", label: "Infinity · 무한의 경계", icon: "∞" },

    // 추가 희귀도 1종 · 초희귀 등급
    { id: "singularity", label: "Singularity · 특이점의 도래", icon: "⟡" },

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
  let drawHookInstalled = false;
  let lastFallbackDrawCount = 0;

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

      const entries = Array.isArray(saved.entries)
        ? saved.entries
            .filter(entry =>
              entry &&
              Number.isInteger(Number(entry.value)) &&
              Number(entry.value) >= 0 &&
              Number(entry.value) <= 9999999 &&
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

      const selected = Array.isArray(saved.selectedRarities)
        ? saved.selectedRarities.filter(id =>
            RARITY_LOOKUP.has(id)
          )
        : [...DEFAULT_SELECTED_RARITIES];

      return {
        autoEnabled: saved.autoEnabled !== false,
        selectedRarities: [...new Set(selected)],
        entries
      };
    } catch (error) {
      console.warn("도감 데이터를 불러오지 못했어:", error);
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
      console.warn("도감 저장에 실패했어:", error);

      setMessage(
        "도감을 저장하지 못했어. 브라우저 저장 공간을 확인해 줘.",
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

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  /* =========================================
     기존 Violet Random의 희귀도 판정 사용
     ========================================= */

  function getRarityInfo(value) {
    let pattern = null;

    try {
      if (typeof window.getRarePattern === "function") {
        pattern = window.getRarePattern(String(value));
      }
    } catch (error) {
      console.warn("숫자의 희귀도를 확인하지 못했어:", error);
    }

    const rarityId =
      pattern?.level && RARITY_LOOKUP.has(pattern.level)
        ? pattern.level
        : "common";

    const rarity = RARITY_LOOKUP.get(rarityId);

    return {
      id: rarity.id,
      // codex.js 내부에서는 기존 명칭 오타를 "황금비"로 통일한다.
      label:
        pattern?.level === "golden-light"
          ? "황금비"
          : pattern?.title || rarity.label,
      icon: rarity.icon
    };
  }

  /* =========================================
     현재 화면의 숫자 읽기
     ========================================= */

  function getDisplayedNumber() {
    const progress = readProgress();

    const hasDrawn =
      Number(progress?.totalDraws) > 0 ||
      (
        Array.isArray(progress?.history) &&
        progress.history.length > 0
      );

    if (!hasDrawn) {
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

    const previousResult = progress?.lastResult;

    if (
      typeof previousResult === "string" &&
      /^\d{1,7}$/.test(previousResult)
    ) {
      return Number(previousResult);
    }

    return null;
  }

  /* =========================================
     도감에 숫자 추가
     ========================================= */

  function addEntry(value, source = "manual") {
    const number = Number(value);

    if (
      !Number.isInteger(number) ||
      number < 0 ||
      number > 9999999
    ) {
      return false;
    }

    const rarity = getRarityInfo(number);
    const key = String(number);
    const now = Date.now();

    const existing = entriesByValue.get(key);

    if (existing) {
      existing.count += 1;
      existing.lastCollectedAt = now;

      if (source === "manual") {
        existing.manualAdded = true;
      }

      return true;
    }

    if (state.entries.length >= MAX_ENTRIES) {
      const oldest = state.entries.pop();

      if (oldest) {
        entriesByValue.delete(String(oldest.value));
      }
    }

    const entry = {
      value: number,
      rarity: rarity.id,
      count: 1,
      firstCollectedAt: now,
      lastCollectedAt: now,
      manualAdded: source === "manual"
    };

    state.entries.unshift(entry);
    entriesByValue.set(key, entry);

    return true;
  }

  function addCurrentNumber() {
    const value = getDisplayedNumber();

    if (value === null) {
      setMessage(
        "먼저 숫자를 뽑아 줘. 그러면 도감에 추가할 수 있어!",
        "warning"
      );

      return;
    }

    addEntry(value, "manual");

    if (saveState()) {
      renderCodex();

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
    if (!state.autoEnabled) {
      return;
    }

    const number = Number(value);

    if (
      !Number.isInteger(number) ||
      number < 0 ||
      number > 9999999
    ) {
      return;
    }

    const rarity = getRarityInfo(number);

    if (!state.selectedRarities.includes(rarity.id)) {
      return;
    }

    if (addEntry(number, "auto")) {
      scheduleSaveAndRender();
    }
  }

  function scheduleSaveAndRender() {
    if (pendingSaveTimer !== null) {
      return;
    }

    pendingSaveTimer = window.setTimeout(() => {
      pendingSaveTimer = null;

      saveState();
      renderCodex();
    }, 150);
  }

  /*
    원래 통계 함수는 먼저 실행한 뒤
    같은 추첨 결과를 도감 수집기에 전달한다.

    기존 통계와 숫자 추첨 로직을 새로 작성하거나
    대체하지 않는다.
  */

  function installDrawHook() {
    const original = window.trackDrawStatistics;

    if (typeof original !== "function") {
      return false;
    }

    if (original.__codexWrapped === true) {
      return true;
    }

    function wrappedTrackDrawStatistics(result) {
      const response = original.apply(this, arguments);

      try {
        collectAutomatically(Number(result));
      } catch (error) {
        console.warn("도감 자동 수집 오류:", error);
      }

      return response;
    }

    wrappedTrackDrawStatistics.__codexWrapped = true;

    window.trackDrawStatistics =
      wrappedTrackDrawStatistics;

    return true;
  }

  /*
    추첨 함수에 연결할 수 없는 경우의 대체 방식.
    이 방식은 최근 추첨 목록에 남아 있는 숫자를 확인한다.
  */

  function installFallbackObserver() {
    if (drawHookInstalled || fallbackObserver) {
      return;
    }

    const historyList = $("history-list");

    if (!historyList) {
      return;
    }

    const progress = readProgress();

    lastFallbackDrawCount =
      Number(progress?.totalDraws) || 0;

    fallbackObserver = new MutationObserver(() => {
      const currentProgress = readProgress();

      const currentCount =
        Number(currentProgress?.totalDraws) || 0;

      if (currentCount <= lastFallbackDrawCount) {
        lastFallbackDrawCount = currentCount;
        return;
      }

      const difference =
        currentCount - lastFallbackDrawCount;

      lastFallbackDrawCount = currentCount;

      const history = Array.isArray(currentProgress?.history)
        ? currentProgress.history
        : [];

      const inspectCount = Math.min(
        difference,
        history.length,
        10
      );

      history
        .slice(0, inspectCount)
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

  /* =========================================
     도감 CSS 자동 연결
     ========================================= */

  function ensureStylesheet() {
    const existing = document.querySelector(
      'link[data-codex-stylesheet="true"]'
    );

    if (existing) {
      return;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = "codex.css";
    link.dataset.codexStylesheet = "true";

    document.head.appendChild(link);
  }

  /* =========================================
     도감 버튼 생성
     업적 → 도감 → 설정 순서
     ========================================= */

  function createCodexButton() {
    const topActions = document.querySelector(".top-actions");

    if (!topActions) {
      console.warn("도감 버튼을 배치할 영역을 찾지 못했어.");
      return null;
    }

    let button = $("codex-button");

    if (!button) {
      button = document.createElement("button");

      button.id = "codex-button";
      button.className =
        "settings-button codex-open-button";
      button.type = "button";
      button.textContent = "📖 도감";
      button.title = "숫자 도감";
    }

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "codex-overlay");

    const achievementsButton = $("achievements-button");
    const settingsButton = $("settings-button");

    if (achievementsButton) {
      achievementsButton.insertAdjacentElement(
        "afterend",
        button
      );
    } else if (settingsButton) {
      topActions.insertBefore(button, settingsButton);
    } else if (button.parentElement !== topActions) {
      topActions.appendChild(button);
    }

    return button;
  }

  /* =========================================
     통계 카드 생성
     ========================================= */

  function createStat(labelText, id) {
    const card = document.createElement("div");
    card.className = "codex-stat-card";

    const label = document.createElement("span");
    label.className = "codex-stat-label";
    label.textContent = labelText;

    const value = document.createElement("strong");
    value.className = "codex-stat-value";
    value.id = id;
    value.textContent = "0";

    card.append(label, value);

    return card;
  }

  /* =========================================
     도감 창 생성
     ========================================= */

  function createCodexModal() {
    if ($("codex-overlay")) {
      return;
    }

    const overlay = document.createElement("div");

    overlay.id = "codex-overlay";
    overlay.className = "codex-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("section");

    panel.className = "codex-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "codex-title");

    /* 제목 */

    const header = document.createElement("header");
    header.className = "codex-header";

    const heading = document.createElement("div");
    heading.className = "codex-heading";

    const eyebrow = document.createElement("p");
    eyebrow.className = "codex-eyebrow";
    eyebrow.textContent = "VIOLET RANDOM · NUMBER CODEX";

    const title = document.createElement("h2");
    title.id = "codex-title";
    title.className = "codex-title";
    title.textContent = "숫자 도감";

    const subtitle = document.createElement("p");
    subtitle.className = "codex-subtitle";
    subtitle.textContent =
      "특별한 숫자를 모으고, 네 도감을 완성해 봐.";

    heading.append(eyebrow, title, subtitle);

    const closeButton = document.createElement("button");

    closeButton.id = "codex-close";
    closeButton.className = "codex-close";
    closeButton.type = "button";
    closeButton.textContent = "✕";
    closeButton.setAttribute("aria-label", "도감 닫기");

    header.append(heading, closeButton);

    /* 통계 */

    const stats = document.createElement("div");
    stats.className = "codex-stats";

    stats.append(
      createStat("수집한 숫자", "codex-stat-unique"),
      createStat("발견 횟수", "codex-stat-total"),
      createStat("수집한 등급", "codex-stat-rarities")
    );

    /* 검색 */

    const toolbar = document.createElement("div");
    toolbar.className = "codex-toolbar";

    const search = document.createElement("input");

    search.id = "codex-search";
    search.className = "codex-search";
    search.type = "search";
    search.placeholder = "숫자 또는 희귀도 검색...";
    search.autocomplete = "off";
    search.setAttribute("aria-label", "도감 검색");

    const filter = document.createElement("select");

    filter.id = "codex-filter";
    filter.className = "codex-filter";
    filter.setAttribute("aria-label", "희귀도 필터");

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "전체 등급";

    filter.appendChild(allOption);

    RARITIES.forEach(rarity => {
      const option = document.createElement("option");

      option.value = rarity.id;
      option.textContent = rarity.label;

      filter.appendChild(option);
    });

    const addButton = document.createElement("button");

    addButton.id = "codex-add-current";
    addButton.className = "codex-primary-button";
    addButton.type = "button";
    addButton.textContent = "＋ 현재 숫자 추가";

    toolbar.append(search, filter, addButton);

    /* 좌우 레이아웃 */

    const layout = document.createElement("div");
    layout.className = "codex-layout";

    const sidebar = document.createElement("aside");
    sidebar.className = "codex-sidebar";

    /* 자동 수집 카드 */

    const autoCard = document.createElement("section");
    autoCard.className = "codex-side-card codex-auto-card";

    const autoHeading = document.createElement("div");
    autoHeading.className = "codex-card-heading";

    const autoTitle = document.createElement("h3");
    autoTitle.textContent = "자동 수집";

    const autoStatus = document.createElement("span");
    autoStatus.id = "codex-auto-status";
    autoStatus.className = "codex-auto-status";

    autoHeading.append(autoTitle, autoStatus);

    const switchLabel = document.createElement("label");
    switchLabel.className = "codex-switch-row";

    const switchCopy = document.createElement("span");
    switchCopy.className = "codex-switch-copy";

    const switchTitle = document.createElement("strong");
    switchTitle.textContent = "자동으로 모으기";

    const switchDescription = document.createElement("small");
    switchDescription.textContent =
      "선택한 등급이 나오면 도감에 자동으로 추가돼.";

    switchCopy.append(switchTitle, switchDescription);

    const autoToggle = document.createElement("input");

    autoToggle.id = "codex-auto-enabled";
    autoToggle.type = "checkbox";
    autoToggle.checked = state.autoEnabled;

    switchLabel.append(switchCopy, autoToggle);
    autoCard.append(autoHeading, switchLabel);

    /* 희귀도 선택 카드 */

    const rarityCard = document.createElement("section");
    rarityCard.className = "codex-side-card";

    const rarityHeading = document.createElement("div");
    rarityHeading.className = "codex-card-heading";

    const rarityTitle = document.createElement("h3");
    rarityTitle.textContent = "수집할 희귀도";

    const selectedCount = document.createElement("span");
    selectedCount.id = "codex-selected-count";
    selectedCount.className = "codex-muted-count";

    rarityHeading.append(rarityTitle, selectedCount);

    const help = document.createElement("p");
    help.className = "codex-help";
    help.textContent =
      "체크한 등급만 자동 수집해. 직접 추가는 모든 등급에서 가능해.";

    const rarityActions = document.createElement("div");
    rarityActions.className = "codex-rarity-actions";

    const selectAll = document.createElement("button");

    selectAll.id = "codex-select-all";
    selectAll.type = "button";
    selectAll.textContent = "전체 선택";

    const selectNone = document.createElement("button");

    selectNone.id = "codex-select-none";
    selectNone.type = "button";
    selectNone.textContent = "전체 해제";

    rarityActions.append(selectAll, selectNone);

    const rarityOptions = document.createElement("div");

    rarityOptions.id = "codex-rarity-options";
    rarityOptions.className = "codex-rarity-options";

    rarityCard.append(
      rarityHeading,
      help,
      rarityActions,
      rarityOptions
    );

    sidebar.append(autoCard, rarityCard);

    /* 수집 목록 */

    const collection = document.createElement("section");
    collection.className = "codex-collection";

    const collectionHeader = document.createElement("div");
    collectionHeader.className = "codex-collection-header";

    const collectionHeading = document.createElement("div");

    const collectionTitle = document.createElement("h3");
    collectionTitle.textContent = "수집 목록";

    const collectionDescription = document.createElement("p");
    collectionDescription.textContent =
      "같은 숫자를 다시 발견하면 발견 횟수가 올라가.";

    collectionHeading.append(
      collectionTitle,
      collectionDescription
    );

    const resultCount = document.createElement("span");

    resultCount.id = "codex-result-count";
    resultCount.className = "codex-result-count";
    resultCount.textContent = "0개";

    collectionHeader.append(
      collectionHeading,
      resultCount
    );

    const grid = document.createElement("div");

    grid.id = "codex-grid";
    grid.className = "codex-grid";

    const listNote = document.createElement("p");

    listNote.id = "codex-list-note";
    listNote.className = "codex-list-note";

    collection.append(
      collectionHeader,
      grid,
      listNote
    );

    layout.append(sidebar, collection);

    /* 하단 메시지 */

    const footer = document.createElement("footer");
    footer.className = "codex-footer";

    const message = document.createElement("p");

    message.id = "codex-message";
    message.className = "codex-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.textContent = "네 숫자 도감을 채워 보자! 💜";

    const footerActions = document.createElement("div");
    footerActions.className = "codex-footer-actions";

    const clearButton = document.createElement("button");

    clearButton.id = "codex-clear";
    clearButton.className = "codex-clear-button";
    clearButton.type = "button";
    clearButton.textContent = "도감 기록 초기화";

    footerActions.appendChild(clearButton);
    footer.append(message, footerActions);

    panel.append(
      header,
      stats,
      toolbar,
      layout,
      footer
    );

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  /* =========================================
     희귀도 체크박스 생성
     ========================================= */

  function createRarityOptions() {
    const container = $("codex-rarity-options");

    if (!container) {
      return;
    }

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
    document.querySelectorAll("[data-codex-rarity]")
      .forEach(checkbox => {
        checkbox.checked =
          state.selectedRarities.includes(checkbox.value);
      });
  }

  /* =========================================
     도감 통계 표시
     ========================================= */

  function renderCodexStats() {
    const uniqueElement = $("codex-stat-unique");
    const totalElement = $("codex-stat-total");
    const raritiesElement = $("codex-stat-rarities");
    const selectedCount = $("codex-selected-count");
    const autoStatus = $("codex-auto-status");
    const autoToggle = $("codex-auto-enabled");

    const uniqueCount = state.entries.length;

    const totalCount = state.entries.reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    const rarityCount = new Set(
      state.entries.map(entry => entry.rarity)
    ).size;

    if (uniqueElement) {
      uniqueElement.textContent = formatNumber(uniqueCount);
    }

    if (totalElement) {
      totalElement.textContent = formatNumber(totalCount);
    }

    if (raritiesElement) {
      raritiesElement.textContent =
        `${rarityCount} / ${RARITIES.length}`;
    }

    if (selectedCount) {
      selectedCount.textContent =
        `${state.selectedRarities.length}개 선택`;
    }

    if (autoStatus) {
      autoStatus.textContent =
        state.autoEnabled ? "ON" : "OFF";

      autoStatus.classList.toggle(
        "is-active",
        state.autoEnabled
      );
    }

    if (autoToggle) {
      autoToggle.checked = state.autoEnabled;
    }
  }

  /* =========================================
     개별 숫자 카드
     ========================================= */

  function createEntryCard(entry) {
    const rarity = RARITY_LOOKUP.get(entry.rarity);

    const card = document.createElement("article");

    card.className = "codex-entry";
    card.dataset.rarity = entry.rarity;

    const top = document.createElement("div");
    top.className = "codex-entry-top";

    const icon = document.createElement("span");
    icon.className = "codex-entry-icon";
    icon.textContent = rarity.icon;

    const badge = document.createElement("span");
    badge.className = "codex-entry-rarity";
    badge.textContent = rarity.label;

    top.append(icon, badge);

    const number = document.createElement("strong");

    number.className = "codex-entry-number";
    number.textContent = formatNumber(entry.value);

    const bottom = document.createElement("div");
    bottom.className = "codex-entry-bottom";

    const count = document.createElement("span");

    count.className = "codex-entry-count";
    count.textContent =
      `발견 ${formatNumber(entry.count)}회`;

    const source = document.createElement("span");

    source.className = "codex-entry-source";
    source.textContent =
      entry.manualAdded ? "직접 추가" : "자동 수집";

    bottom.append(count, source);
    card.append(top, number, bottom);

    return card;
  }

  /* =========================================
     도감 목록 표시
     ========================================= */

  function renderCodexList() {
    const grid = $("codex-grid");

    if (!grid) {
      return;
    }

    grid.replaceChildren();

    const query = (
      $("codex-search")?.value || ""
    ).trim().toLowerCase();

    const filter = $("codex-filter")?.value || "all";

    const filtered = state.entries.filter(entry => {
      if (
        filter !== "all" &&
        entry.rarity !== filter
      ) {
        return false;
      }

      const rarity = RARITY_LOOKUP.get(entry.rarity);

      return (
        String(entry.value).includes(query) ||
        formatNumber(entry.value).includes(query) ||
        rarity.label.toLowerCase().includes(query)
      );
    });

    const visible = filtered.slice(
      0,
      MAX_VISIBLE_ENTRIES
    );

    const resultCount = $("codex-result-count");

    if (resultCount) {
      resultCount.textContent =
        `${formatNumber(filtered.length)}개`;
    }

    const note = $("codex-list-note");

    if (note) {
      note.textContent =
        filtered.length > MAX_VISIBLE_ENTRIES
          ? `검색 결과 ${formatNumber(filtered.length)}개 중 최근 ${MAX_VISIBLE_ENTRIES}개를 표시하고 있어.`
          : "도감은 이 브라우저에 자동 저장돼.";
    }

    if (visible.length === 0) {
      const empty = document.createElement("div");

      empty.className = "codex-empty";

      const icon = document.createElement("span");

      icon.className = "codex-empty-icon";
      icon.textContent = "✧";

      const title = document.createElement("strong");

      title.textContent =
        state.entries.length === 0
          ? "아직 모은 숫자가 없어."
          : "검색 결과가 없어.";

      const description = document.createElement("p");

      description.textContent =
        state.entries.length === 0
          ? "자동 수집을 켜거나 현재 숫자를 직접 추가해 봐."
          : "다른 숫자나 희귀도를 검색해 봐.";

      empty.append(icon, title, description);
      grid.appendChild(empty);

      return;
    }

    visible.forEach(entry => {
      grid.appendChild(createEntryCard(entry));
    });
  }

  function renderCodex() {
    syncRarityOptions();
    renderCodexStats();
    renderCodexList();
  }

  /* =========================================
     안내 메시지
     ========================================= */

  function setMessage(message, type = "normal") {
    const element = $("codex-message");

    if (!element) {
      return;
    }

    element.textContent = message;
    element.dataset.type = type;
  }

  /* =========================================
     도감 열기 / 닫기
     ========================================= */

  function openCodex() {
    const overlay = $("codex-overlay");

    if (!overlay) {
      return;
    }

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    $("codex-button")?.setAttribute(
      "aria-expanded",
      "true"
    );

    renderCodex();

    $("codex-close")?.focus();
  }

  function closeCodex() {
    const overlay = $("codex-overlay");

    if (!overlay) {
      return;
    }

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    $("codex-button")?.setAttribute(
      "aria-expanded",
      "false"
    );

    $("codex-button")?.focus();
  }

  /* =========================================
     도감 기록 초기화
     ========================================= */

  function clearCodex() {
    const confirmed = window.confirm(
      "도감에 모은 숫자를 모두 삭제할까? 이 작업은 되돌릴 수 없어."
    );

    if (!confirmed) {
      return;
    }

    state.entries = [];

    rebuildEntryIndex();
    saveState();
    renderCodex();

    setMessage(
      "도감 기록을 초기화했어. 다시 수집해 보자! 💜",
      "success"
    );
  }

  /* =========================================
     이벤트 연결
     ========================================= */

  function bindEvents() {
    const closeButton = $("codex-close");

    closeButton?.addEventListener(
      "click",
      closeCodex
    );

    $("codex-overlay")?.addEventListener(
      "click",
      event => {
        if (event.target === $("codex-overlay")) {
          closeCodex();
        }
      }
    );

    $("codex-add-current")?.addEventListener(
      "click",
      addCurrentNumber
    );

    $("codex-search")?.addEventListener(
      "input",
      renderCodexList
    );

    $("codex-filter")?.addEventListener(
      "change",
      renderCodexList
    );

    $("codex-auto-enabled")?.addEventListener(
      "change",
      event => {
        state.autoEnabled = event.target.checked;

        saveState();
        renderCodexStats();

        setMessage(
          state.autoEnabled
            ? "자동 수집을 켰어. 선택한 등급을 모을게! 💜"
            : "자동 수집을 껐어. 직접 추가는 계속 사용할 수 있어.",
          "success"
        );
      }
    );

    $("codex-rarity-options")?.addEventListener(
      "change",
      event => {
        if (
          !event.target.matches("[data-codex-rarity]")
        ) {
          return;
        }

        state.selectedRarities = Array.from(
          document.querySelectorAll(
            "[data-codex-rarity]:checked"
          )
        ).map(checkbox => checkbox.value);

        saveState();
        renderCodexStats();

        setMessage(
          `자동 수집 대상 등급 ${state.selectedRarities.length}개를 저장했어.`,
          "success"
        );
      }
    );

    $("codex-select-all")?.addEventListener(
      "click",
      () => {
        state.selectedRarities = RARITIES.map(
          rarity => rarity.id
        );

        syncRarityOptions();
        saveState();
        renderCodexStats();

        setMessage(
          "모든 등급을 자동 수집 대상으로 선택했어.",
          "success"
        );
      }
    );

    $("codex-select-none")?.addEventListener(
      "click",
      () => {
        state.selectedRarities = [];

        syncRarityOptions();
        saveState();
        renderCodexStats();

        setMessage(
          "자동 수집 등급을 모두 해제했어. 직접 추가는 가능해.",
          "success"
        );
      }
    );

    $("codex-clear")?.addEventListener(
      "click",
      clearCodex
    );

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        $("codex-overlay")?.classList.contains("is-open")
      ) {
        closeCodex();
      }
    });
  }

  /* =========================================
     초기화
     ========================================= */

  function initializeCodex() {
    ensureStylesheet();

    const button = createCodexButton();

    createCodexModal();
    createRarityOptions();
    bindEvents();

    renderCodex();

    /*
      버튼만 만드는 것이 아니라,
      실제 도감 창을 생성하고 버튼 클릭과 연결한다.
    */

    if (button) {
      button.addEventListener("click", openCodex);
    }

    drawHookInstalled = installDrawHook();

    if (!drawHookInstalled) {
      installFallbackObserver();
    }

    window.addEventListener("storage", event => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      state = loadState();

      rebuildEntryIndex();
      renderCodex();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCodex,
      { once: true }
    );
  } else {
    initializeCodex();
  }
})();
