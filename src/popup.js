document.addEventListener("DOMContentLoaded", () => {
  const popupContent = document.getElementById("popup-content");

  function updateUI(status) {
    if (status === "Blocking this site") {
      document.getElementById("block-site").style.display = "none";
      document.getElementById("block-page").style.display = "none";
      document.getElementById("turnoff").style.display = "block";
      document.getElementById("status").style.color = "green";
    }

    if (status === "Blocking this page") {
      document.getElementById("block-site").style.display = "block";
      document.getElementById("block-page").style.display = "none";
      document.getElementById("turnoff").style.display = "block";
      document.getElementById("status").style.color = "green";
    }

    if (status === "Blocking disabled") {
      document.getElementById("block-site").style.display = "block";
      document.getElementById("block-page").style.display = "block";
      document.getElementById("status").style.color = "#dc4e49";
      document.getElementById("turnoff").style.display = "none";
    }

    if (!status) {
      document.getElementById("status").style.color = "#dc4e49";
    }

    document.getElementById("status").innerText = status || "Blocking disabled";
    popupContent.style.display = "block";
  }

  // Handle blocking site
  document.getElementById("block-site").addEventListener("click", () => {
    chrome.alarms.create("blockAdSelectors", { periodInMinutes: 0.05 });
    chrome.runtime.sendMessage({ action: "blockAdSelectors" }, (response) => {
      if (response?.status) {
        console.log(response.status);
        chrome.storage.local.set({
          status: response.status,
        });
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
          chrome.storage.local.set({
            status: response.status,
          });
          updateUI(response.status);
          // Update storage with blocked URL and status
        }
      },
    );
  });

  // Handle turning off blocker
  document.getElementById("turnoff").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "turnOffBlocker" }, (response) => {
      if (response?.status) {
        updateUI(response.status); // Clear blocked URL and update status
        // Update storage with cleared values
        chrome.storage.local.set({ status: response.status });
      }
    });
  });

  function loadInitialState() {
    chrome.alarms.get("blockAdSelectors", (alarm) => {
      if (alarm) {
        chrome.storage.local.get("status", (result) => {
          const { status } = result;
          updateUI(status || "");
        });
      } else {
        updateUI("");
      }
    });
  }

  loadInitialState();
});
