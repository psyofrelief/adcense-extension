document.addEventListener("DOMContentLoaded", () => {
  const popupContent = document.getElementById("popup-content");

  // Update UI based on status
  function updateUI(status) {
    const displayState = {
      "Blocking this site": ["none", "none", "block", "green"],
      "Blocking this page": ["block", "none", "block", "green"],
      "Blocking disabled": ["block", "block", "none", "#dc4e49"],
    };

    const [siteDisplay, pageDisplay, turnoffDisplay, statusColor] =
      displayState[status] || ["block", "block", "none", "#dc4e49"];

    document.getElementById("block-site").style.display = siteDisplay;
    document.getElementById("block-page").style.display = pageDisplay;
    document.getElementById("turnoff").style.display = turnoffDisplay;
    document.getElementById("status").style.color = statusColor;
    document.getElementById("status").innerText = status || "Blocking disabled";
    popupContent.style.display = "block";
  }

  // Handle blocking site
  document.getElementById("block-site").addEventListener("click", () => {
    chrome.alarms.create("blockAdSelectors", { periodInMinutes: 0.05 });
    chrome.runtime.sendMessage({ action: "blockAdSelectors" }, (response) => {
      if (response?.status) {
        chrome.storage.local.set({ status: response.status });
        updateUI(response.status);
      }
    });
  });

  // Handle blocking page
  document.getElementById("block-page").addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { action: "blockAdSelectorsPage" },
      (response) => {
        if (response?.status) {
          chrome.storage.local.set({ status: response.status });
          updateUI(response.status);
        }
      },
    );
  });

  // Handle turning off blocker
  document.getElementById("turnoff").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "turnOffBlocker" }, (response) => {
      if (response?.status) {
        updateUI(response.status);
        chrome.storage.local.set({ status: response.status });
      }
    });
  });

  // Load the initial state
  function loadInitialState() {
    chrome.alarms.get("blockAdSelectors", (alarm) => {
      if (alarm) {
        chrome.storage.local.get("status", (result) => {
          updateUI(result.status || "");
        });
      } else {
        updateUI("");
      }
    });
  }

  loadInitialState();
});
