/* =========================================
   VIOLET RANDOM - EXTRA FEATURES
   개별 도감 삭제 / 도감 전체 삭제
   통계 초기화 / 전체 초기화
   기존 script.js와 style.css는 수정하지 않음
========================================= */

(() => {
  "use strict";

  const PROGRESS_KEY = "violetRandomProgress";
  const CODEX_KEY = "violetRandomCodexV1";
  const ACHIEVEMENTS_KEY = "violetRandomAchievementsV1";

  const $ = id => document.getElementById(id);

  let pendingExtraAction = null;
  let pendingDeleteValue = null;
  let codexObserver = null;
  let codexButtonObserver = null;

  /* =========================================
     1. 스타일
  ========================================= */

  function installExtraStyles() {
    if ($("codex-extras-styles")) return;

    const style = document.createElement("style");
    style.id = "codex-extras-styles";

    style.textContent = `
      [hidden] {
        display: none !important;
      }

      /* 개별 숫자 삭제 버튼 */

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
        transition:
          background 0.15s ease,
          border-color 0.15s ease;
      }

      .codex-delete-entry:hover {
        background: rgba(140, 44, 75, 0.2);
        border-color: rgba(225, 135, 159, 0.55);
      }

      .codex-delete-entry:focus-visible,
      .codex-delete-all-button:focus-visible {
        outline: 2px solid #c99aff;
        outline-offset: 3px;
      }

      /* 도감 전체 삭제 버튼 */

      .codex-delete-all-row {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0;
      }

      .codex-delete-all-button {
        padding: 9px 13px;
        border: 1px solid rgba(220, 105, 135, 0.38);
        border-radius: 9px;
        background: rgba(140, 44, 75, 0.12);
        color: #e8a8ba;
        font: inherit;
        font-size: 11px;
        font-weight: 750;
        cursor: pointer;
        transition:
          background 0.15s ease,
          border-color 0.15s ease,
          transform 0.15s ease;
      }

      .codex-delete-all-button:hover {
        background: rgba(140, 44, 75, 0.24);
        border-color: rgba(225, 135, 159, 0.62);
      }

      .codex-delete-all-button:active {
        transform: translateY(1px);
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

      /* =====================================
         도감 삭제 확인 창
      ===================================== */

      .codex-delete-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 12000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(5, 3, 10, 0.82);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .codex-delete-confirm-overlay.is-open {
        display: flex;
        animation: codex-delete-overlay-in 180ms ease-out both;
      }

      .codex-delete-confirm-panel {
        width: min(100%, 390px);
        padding: 25px;
        border: 1px solid rgba(190, 133, 255, 0.38);
        border-radius: 19px;
        background:
          radial-gradient(
            ellipse at 85% 0%,
            rgba(116, 60, 175, 0.17),
            transparent 48%
          ),
          linear-gradient(
            145deg,
            #21152e 0%,
            #130e1b 55%,
            #0c0912 100%
          );
        box-shadow:
          0 25px 80px rgba(0, 0, 0, 0.5),
          0 0 40px rgba(128, 59, 199, 0.17);
        color: #f4edff;
        animation:
          codex-delete-panel-in
          230ms cubic-bezier(.2, .8, .2, 1) both;
      }

      .codex-delete-confirm-eyebrow {
        margin: 0 0 9px;
        color: #bc8aff;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .codex-delete-confirm-title {
        margin: 0;
        color: #f4edff;
        font-size: 23px;
        font-weight: 800;
      }

      .codex-delete-confirm-description {
        margin: 14px 0 0;
        color: #b3a2c8;
        font-size: 12px;
        line-height: 1.8;
        overflow-wrap: anywhere;
      }

      .codex-delete-confirm-number {
        display: block;
        margin-top: 15px;
        padding: 13px;
        border: 1px solid rgba(181, 135, 241, 0.19);
        border-radius: 10px;
        background: rgba(155, 93, 229, 0.08);
        color: #e4ccff;
        font-size: 25px;
        font-weight: 850;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }

      .codex-delete-confirm-number[hidden] {
        display: none !important;
      }

      .codex-delete-confirm-actions {
        display: flex;
        gap: 9px;
        margin-top: 21px;
      }

      .codex-delete-confirm-actions button {
        min-height: 42px;
        flex: 1;
        padding: 10px 12px;
        border-radius: 9px;
        font: inherit;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
        transition:
          filter 140ms ease,
          transform 140ms ease;
      }

      .codex-delete-confirm-actions button:hover {
        filter: brightness(1.13);
      }

      .codex-delete-confirm-actions button:active {
        transform: translateY(1px);
      }

      .codex-delete-cancel {
        border: 1px solid rgba(181, 135, 241, 0.22);
        background: rgba(155, 93, 229, 0.08);
        color: #d4c1ea;
      }

      .codex-delete-approve {
        border: 1px solid rgba(225, 135, 159, 0.4);
        background: linear-gradient(
          110deg,
          #682b49,
          #9d4267
        );
        color: #fff1f5;
      }

      @keyframes codex-delete-overlay-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes codex-delete-panel-in {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.97);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* 업적 창 열기 애니메이션 */

      #achievements-overlay.is-open {
        animation: violet-achievements-overlay-in 200ms ease-out both;
      }

      #achievements-overlay.is-open .achievements-panel {
        animation:
          violet-achievements-panel-in
          260ms cubic-bezier(.2, .8, .2, 1) both;
      }

      @keyframes violet-achievements-overlay-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes violet-achievements-panel-in {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.975);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .codex-delete-confirm-overlay.is-open,
        .codex-delete-confirm-panel,
        #achievements-overlay.is-open,
        #achievements-overlay.is-open .achievements-panel {
          animation-duration: 0.01ms !important;
        }
      }

      @media (max-width: 520px) {
        .codex-delete-all-row {
          justify-content: stretch;
        }

        .codex-delete-all-button {
          width: 100%;
        }

        .codex-delete-confirm-panel {
          padding: 21px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================
     2. 공통 삭제 확인 창
  ========================================= */

  function createDeleteConfirmModal() {
    if ($("codex-delete-confirm-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "codex-delete-confirm-overlay";
    overlay.className = "codex-delete-confirm-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("section");
    panel.className = "codex-delete-confirm-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute(
      "aria-labelledby",
      "codex-delete-confirm-title"
    );

    const eyebrow = document.createElement("p");
    eyebrow.className = "codex-delete-confirm-eyebrow";
    eyebrow.textContent = "VIOLET RANDOM · CODEX";

    const title = document.createElement("h2");
    title.id = "codex-delete-confirm-title";
    title.className = "codex-delete-confirm-title";
    title.textContent = "숫자 기록 삭제";

    const description = document.createElement("p");
    description.id = "codex-delete-confirm-description";
    description.className = "codex-delete-confirm-description";
    description.textContent =
      "이 숫자의 도감 기록을 삭제할까? 삭제한 기록은 복구할 수 없어.";

    const number = document.createElement("strong");
    number.id = "codex-delete-confirm-number";
    number.className = "codex-delete-confirm-number";

    const actions = document.createElement("div");
    actions.className = "codex-delete-confirm-actions";

    const cancel = document.createElement("button");
    cancel.id = "codex-delete-cancel";
    cancel.type = "button";
    cancel.className = "codex-delete-cancel";
    cancel.textContent = "취소";

    const approve = document.createElement("button");
    approve.id = "codex-delete-approve";
    approve.type = "button";
    approve.className = "codex-delete-approve";
    approve.textContent = "삭제하기";

    actions.append(cancel, approve);
    panel.append(eyebrow, title, description, number, actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    cancel.addEventListener("click", closeDeleteConfirm);
    approve.addEventListener("click", confirmDeleteAction);

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeDeleteConfirm();
      }
    });
  }

  function openDeleteConfirm(value) {
    pendingExtraAction = "delete-entry";
    pendingDeleteValue = value;

    const overlay = $("codex-delete-confirm-overlay");
    const title = $("codex-delete-confirm-title");
    const description = $("codex-delete-confirm-description");
    const number = $("codex-delete-confirm-number");
    const approve = $("codex-delete-approve");

    if (!overlay || !number) return;

    title.textContent = "숫자 기록 삭제";
    description.textContent =
      "이 숫자의 도감 기록을 삭제할까? 삭제한 기록은 복구할 수 없어.";

    number.hidden = false;
    number.textContent = value.toLocaleString("en-US");
    approve.textContent = "삭제하기";

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    approve.focus();
  }

  function openDeleteAllCodexConfirm() {
    pendingExtraAction = "delete-codex";
    pendingDeleteValue = null;

    const overlay = $("codex-delete-confirm-overlay");
    const title = $("codex-delete-confirm-title");
    const description = $("codex-delete-confirm-description");
    const number = $("codex-delete-confirm-number");
    const approve = $("codex-delete-approve");

    if (!overlay) return;

    title.textContent = "도감 전체 삭제";
    description.textContent =
      "수집한 모든 숫자의 도감 기록을 삭제할까? " +
      "이 작업은 되돌릴 수 없어. " +
      "추첨 횟수, 통계, 업적 기록은 유지돼.";

    number.hidden = true;
    number.textContent = "";
    approve.textContent = "전체 삭제";

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    approve.focus();
  }

  function closeDeleteConfirm() {
    const overlay = $("codex-delete-confirm-overlay");

    pendingDeleteValue = null;
    pendingExtraAction = null;

    if (!overlay) return;

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  /*
    같은 페이지에서 도감 저장 데이터를 변경한 경우,
    codex.js가 가지고 있는 메모리 상태도 다시 불러오도록 알린다.
  */

  function notifyCodexStorageChanged() {
    try {
      const event = new StorageEvent("storage", {
        key: CODEX_KEY,
        newValue: localStorage.getItem(CODEX_KEY),
        storageArea: localStorage
      });

      window.dispatchEvent(event);
    } catch (error) {
      console.warn(
        "도감 상태를 동기화하지 못했어. 페이지를 새로고침할게.",
        error
      );

      window.location.reload();
    }
  }

  /* =========================================
     3. 도감 카드 개별 삭제 버튼
  ========================================= */

  function addDeleteButtons() {
    const grid = $("codex-grid");

    if (!grid) return;

    grid.querySelectorAll(".codex-entry").forEach(card => {
      if (card.querySelector(".codex-delete-entry")) return;

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
        `${value.toLocaleString("en-US")} 도감 기록 삭제`
      );

      card.appendChild(button);
    });
  }

  /* =========================================
     4. 도감 전체 삭제 버튼
  ========================================= */

  function addDeleteAllCodexButton() {
    const overlay = $("codex-overlay");
    const grid = $("codex-grid");

    if (!overlay || !grid || !grid.parentElement) return;

    let row = $("codex-delete-all-row");

    if (!row) {
      row = document.createElement("div");
      row.id = "codex-delete-all-row";
      row.className = "codex-delete-all-row";

      const button = document.createElement("button");
      button.id = "codex-delete-all-button";
      button.type = "button";
      button.className = "codex-delete-all-button";
      button.textContent = "🗑 도감 전체 삭제";
      button.setAttribute(
        "aria-label",
        "모든 도감 숫자 기록 삭제"
      );

      button.addEventListener(
        "click",
        openDeleteAllCodexConfirm
      );

      row.appendChild(button);

      // 도감 목록 바로 위에 버튼을 배치한다.
      grid.parentElement.insertBefore(row, grid);
    }
  }

  function installCodexDelete() {
    addDeleteButtons();
    addDeleteAllCodexButton();

    const grid = $("codex-grid");

    if (grid && !codexObserver) {
      codexObserver = new MutationObserver(() => {
        addDeleteButtons();
        addDeleteAllCodexButton();
      });

      codexObserver.observe(grid, {
        childList: true,
        subtree: true
      });
    }

    if (!codexButtonObserver) {
      codexButtonObserver = new MutationObserver(() => {
        addDeleteAllCodexButton();
        addDeleteButtons();
      });

      const overlay = $("codex-overlay");

      if (overlay) {
        codexButtonObserver.observe(overlay, {
          childList: true,
          subtree: true
        });
      }
    }

    // 이벤트 위임으로 동적으로 생성된 카드도 처리한다.
    document.addEventListener("click", event => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const button = target.closest(".codex-delete-entry");
      if (!button) return;

      const value = Number(button.dataset.codexDeleteValue);

      if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > 9999999
      ) {
        return;
      }

      openDeleteConfirm(value);
    });
  }

  /* =========================================
     5. 개별 삭제 실행
  ========================================= */

  function confirmDeleteEntry(value) {
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 9999999
    ) {
      closeDeleteConfirm();
      return;
    }

    const raw = localStorage.getItem(CODEX_KEY);
    const saved = raw ? JSON.parse(raw) : null;

    if (!saved || !Array.isArray(saved.entries)) {
      alert("도감 기록을 찾지 못했어.");
      closeDeleteConfirm();
      return;
    }

    const previousLength = saved.entries.length;

    saved.entries = saved.entries.filter(
      entry => Number(entry.value) !== value
    );

    if (saved.entries.length === previousLength) {
      alert("해당 숫자의 기록이 이미 없어.");
      closeDeleteConfirm();
      return;
    }

    localStorage.setItem(
      CODEX_KEY,
      JSON.stringify(saved)
    );

    const grid = $("codex-grid");

    if (grid) {
      grid.querySelectorAll(".codex-entry").forEach(card => {
        const numberElement = card.querySelector(
          ".codex-entry-number"
        );

        if (!numberElement) return;

        const cardValue = Number(
          numberElement.textContent.replace(/,/g, "").trim()
        );

        if (cardValue === value) {
          card.remove();
        }
      });
    }

    updateCodexVisibleCount();
    updateCodexTotalCount(saved.entries.length);

    closeDeleteConfirm();

    const message = document.querySelector(".codex-message");

    if (message) {
      message.textContent =
        `${value.toLocaleString("en-US")} 기록을 삭제했어. 💜`;
    }

    // 도감 JS의 메모리에 남은 과거 기록을 다시 불러온다.
    notifyCodexStorageChanged();
  }

  /* =========================================
     6. 도감 전체 삭제 실행
  ========================================= */

  function confirmDeleteAllCodex() {
    const raw = localStorage.getItem(CODEX_KEY);

    if (!raw) {
      alert("삭제할 도감 기록이 없어.");
      closeDeleteConfirm();
      return;
    }

    const saved = JSON.parse(raw);

    if (!saved || !Array.isArray(saved.entries)) {
      alert("도감 기록을 읽을 수 없어.");
      closeDeleteConfirm();
      return;
    }

    const deletedCount = saved.entries.length;

    // 다른 도감 설정과 메타데이터는 유지하고 숫자 목록만 비운다.
    saved.entries = [];

    localStorage.setItem(
      CODEX_KEY,
      JSON.stringify(saved)
    );

    const grid = $("codex-grid");

    if (grid) {
      grid.querySelectorAll(".codex-entry").forEach(card => {
        card.remove();
      });
    }

    updateCodexVisibleCount();
    updateCodexTotalCount(0);

    closeDeleteConfirm();

    const message = document.querySelector(".codex-message");

    if (message) {
      message.textContent = deletedCount > 0
        ? `도감 기록 ${deletedCount.toLocaleString("en-US")}개를 모두 삭제했어. 💜`
        : "도감에 삭제할 기록이 없었어.";
    }

    // 전체 삭제 후에도 메모리 상태와 저장 상태가 일치하도록 한다.
    notifyCodexStorageChanged();
  }

  function confirmDeleteAction() {
    const action = pendingExtraAction;
    const value = pendingDeleteValue;

    try {
      if (action === "delete-entry") {
        confirmDeleteEntry(value);
        return;
      }

      if (action === "delete-codex") {
        confirmDeleteAllCodex();
        return;
      }

      closeDeleteConfirm();
    } catch (error) {
      console.error("도감 삭제 실패:", error);

      alert("도감 기록을 삭제하지 못했어. 다시 시도해 줘.");
      closeDeleteConfirm();
    }
  }

  /* =========================================
     7. 도감 표시 개수 갱신
  ========================================= */

  function updateCodexVisibleCount() {
    const grid = $("codex-grid");
    if (!grid) return;

    const count = grid.querySelectorAll(".codex-entry").length;
    const resultCount = document.querySelector(".codex-result-count");

    if (resultCount) {
      resultCount.textContent =
        `${count.toLocaleString("en-US")}개 표시`;
    }
  }

  function updateCodexTotalCount(total) {
    const statValues = document.querySelectorAll(
      "#codex-overlay .codex-stat-value"
    );

    /*
      첫 번째 요약 숫자를 전체 수집 숫자와 동기화한다.
      나머지 통계의 의미는 변경하지 않는다.
    */

    if (statValues.length > 0) {
      statValues[0].textContent =
        total.toLocaleString("en-US");
    }
  }

  /* =========================================
     8. 초기화 메뉴 버튼
     통계 초기화가 위, 전체 초기화가 아래
  ========================================= */

  function addResetButtons() {
    const overlay = $("reset-overlay");
    const message = $("reset-message");
    const panel = overlay?.querySelector(".reset-panel");

    if (!overlay || !message || !panel) return;

    if (!$("reset-statistics-data")) {
      const row = document.createElement("div");
      row.className = "settings-actions reset-action-row";

      const button = document.createElement("button");
      button.id = "reset-statistics-data";
      button.type = "button";
      button.className =
        "secondary-button reset-action-button " +
        "reset-extra-action reset-stats-button";
      button.textContent = "▤ 통계 초기화";

      row.appendChild(button);
      panel.insertBefore(row, message);

      button.addEventListener("click", () => {
        requestExtraReset("statistics");
      });
    }

    if (!$("reset-all-data")) {
      const row = document.createElement("div");
      row.className = "settings-actions reset-action-row";

      const button = document.createElement("button");
      button.id = "reset-all-data";
      button.type = "button";
      button.className =
        "secondary-button reset-action-button " +
        "reset-extra-action reset-all-button";
      button.textContent = "⚠ 전체 초기화";

      row.appendChild(button);
      panel.insertBefore(row, message);

      button.addEventListener("click", () => {
        requestExtraReset("all");
      });
    }
  }

  /* =========================================
     9. 초기화 확인 창 연결
     정확히 '초기화'를 입력해야 실행
  ========================================= */

  function requestExtraReset(action) {
    const confirmOverlay = $("reset-confirm-overlay");
    const description = $("reset-confirm-description");
    const input = $("reset-confirm-input");
    const message = $("reset-confirm-message");

    if (!confirmOverlay || !description || !input || !message) {
      alert(
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
    message.textContent = "'초기화'를 입력해야 진행할 수 있어.";

    confirmOverlay.hidden = false;
    input.focus();
  }

  /* =========================================
     10. 통계 초기화
     숫자 기록과 추첨 횟수는 유지
  ========================================= */

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

  /* =========================================
     11. 전체 초기화
     설정은 유지
  ========================================= */

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
    }
  }

  function handleExtraConfirmation(event) {
    if (!pendingExtraAction) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const input = $("reset-confirm-input");
    const message = $("reset-confirm-message");

    if (!input || !message) return;

    if (input.value.trim() !== "초기화") {
      message.textContent =
        "입력 내용이 달라. '초기화'라고 정확히 입력해 줘.";
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
     12. 초기화
  ========================================= */

  function initialize() {
    installExtraStyles();
    createDeleteConfirmModal();

    installCodexDelete();
    addResetButtons();

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
        if (
          event.key !== "Enter" ||
          !pendingExtraAction
        ) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        handleExtraConfirmation(event);
      },
      true
    );

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        if (
          pendingDeleteValue !== null ||
          pendingExtraAction === "delete-codex"
        ) {
          closeDeleteConfirm();
        } else {
          cancelExtraConfirmation();
        }
      }
    });
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
