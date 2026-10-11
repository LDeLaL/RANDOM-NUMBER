/* =========================================
   VIOLET RANDOM - EXTRA FEATURES
   개별 도감 삭제 / 전체 초기화 / 통계 초기화
   기존 파일과 테마를 최대한 그대로 유지
   ========================================= */

(() => {
  "use strict";

  const PROGRESS_KEY = "violetRandomProgress";
  const CODEX_KEY = "violetRandomCodexV1";
  const ACHIEVEMENTS_KEY = "violetRandomAchievementsV1";

  const $ = id => document.getElementById(id);

  let pendingExtraAction = null;
  let codexObserver = null;

  /* =========================================
     숨김 처리 문제 수정 + 추가 스타일
     ========================================= */

  function installExtraStyles() {
    if ($("codex-extras-styles")) return;

    const style = document.createElement("style");
    style.id = "codex-extras-styles";

    style.textContent = `
      /* hidden 속성이 CSS에 의해 무시되는 문제 방지 */
      [hidden] {
        display: none !important;
      }

      /* 도감의 개별 숫자 삭제 버튼 */
      .codex-delete-entry {
        display: block;
        width: 100%;
        margin-top: 10px;
        padding: 7px 9px;
        border: 1px solid rgba(205, 115, 139, 0.28);
        border-radius: 7px;
        background: rgba(140, 44, 75, 0.09);
        color: #d9a7ba;
        font: inherit;
        font-size: 10px;
        cursor: pointer;
        transition: background 0.15s ease,
                    border-color 0.15s ease;
      }

      .codex-delete-entry:hover {
        background: rgba(140, 44, 75, 0.2);
        border-color: rgba(225, 135, 159, 0.55);
      }

      .codex-delete-entry:focus-visible {
        outline: 2px solid #c99aff;
        outline-offset: 3px;
      }

      /* 추가 초기화 버튼 */
      .reset-extra-action {
        margin-top: 8px;
      }

      .reset-extra-action.reset-all-button {
        border-color: rgba(220, 105, 135, 0.4);
        color: #e8a8ba;
      }

      .reset-extra-action.reset-stats-button {
        border-color: rgba(171, 112, 255, 0.35);
        color: #d3b5ff;
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================
     1. 도감 숫자별 삭제 버튼
     ========================================= */

  function addDeleteButtons() {
    const grid = $("codex-grid");

    if (!grid) return;

    grid.querySelectorAll(".codex-entry").forEach(card => {
      if (card.querySelector(".codex-delete-entry")) {
        return;
      }

      const numberElement = card.querySelector(
        ".codex-entry-number"
      );

      if (!numberElement) return;

      const rawValue = numberElement.textContent
        .replace(/,/g, "")
        .trim();

      if (!/^\d{1,7}$/.test(rawValue)) return;

      const value = Number(rawValue);

      const button = document.createElement("button");

      button.type = "button";
      button.className = "codex-delete-entry";
      button.dataset.codexDeleteValue = String(value);
      button.textContent = "🗑 이 숫자 삭제";
      button.setAttribute(
        "aria-label",
        `${value} 도감 기록 삭제`
      );

      card.appendChild(button);
    });
  }

  function installCodexDelete() {
    addDeleteButtons();

    const grid = $("codex-grid");

    if (!grid || codexObserver) return;

    codexObserver = new MutationObserver(() => {
      addDeleteButtons();
    });

    codexObserver.observe(grid, {
      childList: true,
      subtree: true
    });

    document.addEventListener("click", event => {
      const button = event.target.closest(
        ".codex-delete-entry"
      );

      if (!button) return;

      const value = Number(button.dataset.codexDeleteValue);

      if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > 9999999
      ) {
        return;
      }

      const confirmed = window.confirm(
        `${value.toLocaleString("en-US")} 숫자를 도감에서 삭제할까?\n\n` +
        "이 숫자의 수집 기록만 삭제돼."
      );

      if (!confirmed) return;

      try {
        const raw = localStorage.getItem(CODEX_KEY);
        const saved = raw ? JSON.parse(raw) : null;

        if (!saved || !Array.isArray(saved.entries)) {
          window.alert("도감 기록을 찾지 못했어.");
          return;
        }

        const previousLength = saved.entries.length;

        saved.entries = saved.entries.filter(
          entry => Number(entry.value) !== value
        );

        if (saved.entries.length === previousLength) {
          window.alert("해당 숫자의 기록이 이미 없어.");
          return;
        }

        localStorage.setItem(
          CODEX_KEY,
          JSON.stringify(saved)
        );

        /*
          도감의 내부 메모리에도 이전 기록이 남지 않도록
          저장 후 페이지를 다시 불러온다.
        */
        window.location.reload();
      } catch (error) {
        console.error("도감 숫자 삭제 실패:", error);

        window.alert(
          "도감 기록을 삭제하지 못했어. 다시 시도해 줘."
        );
      }
    });
  }

  /* =========================================
     2. 초기화 메뉴에 버튼 두 개 추가
     ========================================= */

  function addResetButtons() {
    const overlay = $("reset-overlay");
    const message = $("reset-message");

    if (!overlay || !message) return;

    if (!$("reset-all-data")) {
      const row = document.createElement("div");
      row.className = "settings-actions reset-action-row";

      const button = document.createElement("button");

      button.id = "reset-all-data";
      button.type = "button";
      button.className =
        "secondary-button reset-action-button reset-extra-action reset-all-button";
      button.textContent = "⚠ 전체 초기화";

      row.appendChild(button);
      overlay.querySelector(".reset-panel")
        ?.insertBefore(row, message);
    }

    if (!$("reset-statistics-data")) {
      const row = document.createElement("div");
      row.className = "settings-actions reset-action-row";

      const button = document.createElement("button");

      button.id = "reset-statistics-data";
      button.type = "button";
      button.className =
        "secondary-button reset-action-button reset-extra-action reset-stats-button";
      button.textContent = "▤ 통계 초기화";

      row.appendChild(button);
      overlay.querySelector(".reset-panel")
        ?.insertBefore(row, message);
    }

    $("reset-all-data")?.addEventListener(
      "click",
      () => requestExtraReset("all")
    );

    $("reset-statistics-data")?.addEventListener(
      "click",
      () => requestExtraReset("statistics")
    );
  }

  /* =========================================
     확인 창
     정확히 '초기화'를 입력해야 실행
     ========================================= */

  function requestExtraReset(action) {
    const confirmOverlay = $("reset-confirm-overlay");
    const description = $("reset-confirm-description");
    const input = $("reset-confirm-input");
    const message = $("reset-confirm-message");

    if (!confirmOverlay || !description || !input || !message) {
      window.alert(
        "초기화 확인 창을 찾지 못했어. index.html을 확인해 줘."
      );
      return;
    }

    pendingExtraAction = action;

    if (action === "all") {
      description.textContent =
        "전체 초기화를 진행하면 추첨 기록, 통계, 도감 및 업적 기록이 삭제돼. " +
        "설정은 유지돼. 계속하려면 아래에 초기화라고 정확히 입력해 줘.";
    } else {
      description.textContent =
        "통계 초기화를 진행하면 홀짝, 소수, 자릿수, 끝자리, 희귀도 통계가 초기화돼. " +
        "추첨 횟수와 숫자 기록은 유지돼. 계속하려면 초기화라고 정확히 입력해 줘.";
    }

    input.value = "";
    message.textContent =
      "'초기화'를 입력해야 진행할 수 있어.";

    confirmOverlay.hidden = false;
    input.focus();
  }

  function resetStatisticsOnly() {
    let progress = {};

    try {
      const raw = localStorage.getItem(PROGRESS_KEY);

      if (raw) {
        progress = JSON.parse(raw) || {};
      }
    } catch (error) {
      console.warn("통계 기록을 읽지 못했어:", error);
      throw error;
    }

    const oldStats =
      progress.drawStats &&
      typeof progress.drawStats === "object"
        ? progress.drawStats
        : {};

    const zeroObject = object => {
      const result = {};

      Object.keys(object || {}).forEach(key => {
        result[key] = 0;
      });

      return result;
    };

    const digits = oldStats.digits || {};
    const lastDigits = oldStats.lastDigits || {};
    const rarities = oldStats.rarities || {};

    progress.drawStats = {
      ...oldStats,
      odd: 0,
      even: 0,
      prime: 0,
      composite: 0,
      total: 0,
      sum: 0,
      digits: zeroObject(digits),
      lastDigits: zeroObject(lastDigits),
      rarities: zeroObject(rarities)
    };

    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(progress)
    );
  }

  function executeExtraReset(action) {
    if (action === "statistics") {
      resetStatisticsOnly();
      return;
    }

    if (action === "all") {
      /*
        전체 초기화:
        - 추첨 진행 기록 및 통계
        - 숫자 도감
        - 업적 기록

        설정은 유지한다.
      */
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(CODEX_KEY);
      localStorage.removeItem(ACHIEVEMENTS_KEY);
      return;
    }
  }

  function handleExtraConfirmation(event) {
    if (!pendingExtraAction) return;

    /*
      기존 script.js의 확인 버튼 처리보다 먼저 실행해
      새 초기화 항목을 정확히 처리한다.
    */
    event.preventDefault();
    event.stopImmediatePropagation();

    const input = $("reset-confirm-input");
    const message = $("reset-confirm-message");

    if (!input || !message) return;

    if (input.value.trim() !== "초기화") {
      message.textContent =
        "입력 내용이 달라. '초기화'라고 정확히 입력해 줡.";
      input.focus();
      return;
    }

    const action = pendingExtraAction;

    try {
      executeExtraReset(action);

      pendingExtraAction = null;

      window.location.reload();
    } catch (error) {
      console.error("초기화 실패:", error);

      message.textContent =
        "초기화에 실패했어. 기록은 그대로일 수 있으니 다시 확인해 줘.";
    }
  }

  function cancelExtraConfirmation() {
    pendingExtraAction = null;
  }

  /* =========================================
     초기화
     ========================================= */

  function initialize() {
    installExtraStyles();
    installCodexDelete();
    addResetButtons();

    /*
      capture 단계에서 기존 확인 처리보다 먼저 검사한다.
      새로 추가한 초기화 버튼만 이 처리에서 담당한다.
    */
    $("apply-reset-confirm")?.addEventListener(
      "click",
      handleExtraConfirmation,
      true
    );

    $("cancel-reset-confirm")?.addEventListener(
      "click",
      cancelExtraConfirmation
    );

    $("close-reset-confirm")?.addEventListener(
      "click",
      cancelExtraConfirmation
    );

    $("reset-confirm-input")?.addEventListener(
      "keydown",
      event => {
        if (event.key !== "Enter" || !pendingExtraAction) {
          return;
        }

        event.preventDefault();

        $("apply-reset-confirm")?.click();
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
