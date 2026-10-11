/* =========================================
   VIOLET RANDOM - CODEX SYSTEM
   1단계: 도감 버튼 생성
   기존 디자인과 기능은 유지
   ========================================= */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  /* =========================================
     도감 버튼 생성
     버튼 순서: 업적 → 도감 → 설정 → 초기화
     ========================================= */

  function createCodexButton() {
    const topActions = document.querySelector(".top-actions");

    const achievementsButton = $("achievements-button");
    const settingsButton = $("settings-button");

    if (!topActions) {
      console.warn(
        "Violet Random: 버튼을 추가할 영역을 찾을 수 없어."
      );
      return;
    }

    // 버튼이 이미 있다면 새로 만들지 않는다.
    let codexButton = $("codex-button");

    if (!codexButton) {
      codexButton = document.createElement("button");

      codexButton.id = "codex-button";
      codexButton.className = "settings-button codex-open-button";
      codexButton.type = "button";
      codexButton.textContent = "📖 도감";
      codexButton.title = "숫자 도감";
    }

    // 업적 버튼이 존재하면 바로 뒤에 도감 버튼을 배치한다.
    if (achievementsButton) {
      if (
        codexButton.parentElement !== topActions ||
        achievementsButton.nextElementSibling !== codexButton
      ) {
        achievementsButton.insertAdjacentElement(
          "afterend",
          codexButton
        );
      }

      return;
    }

    // 업적 버튼을 찾지 못하면 설정 버튼 앞에 배치한다.
    if (settingsButton) {
      topActions.insertBefore(
        codexButton,
        settingsButton
      );

      return;
    }

    // 다른 기준 버튼도 없다면 버튼 영역 맨 뒤에 추가한다.
    topActions.appendChild(codexButton);
  }

  /* =========================================
     도감 버튼 임시 동작
     실제 도감 창은 다음 단계에서 연결
     ========================================= */

  function handleCodexButtonClick() {
    window.alert(
      "📖 숫자 도감\n\n" +
      "도감은 아직 준비 중이야!\n" +
      "다음 단계에서 도감 창과 수집 기능을 추가할게. 💜"
    );
  }

  /* =========================================
     초기화
     ========================================= */

  function initializeCodex() {
    createCodexButton();

    const codexButton = $("codex-button");

    if (
      codexButton &&
      codexButton.dataset.codexInitialized !== "true"
    ) {
      codexButton.addEventListener(
        "click",
        handleCodexButtonClick
      );

      codexButton.dataset.codexInitialized = "true";
    }
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
