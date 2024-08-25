let adSelectors = [];
let adDomains = [];
let blockedUrls = [];

// Fetch ad domains from the server
const fetchAdDomains = async () => {
  try {
    const response = await fetch("http://170.64.237.140/ad-domains");
    const data = await response.json();

    // Filter ad domains and selectors from the fetched data
    adDomains = data.domains.filter(
      (domain) => !domain.startsWith("##") && !domain.startsWith("###"),
    );
    adSelectors = data.domains
      .filter((domain) => domain.startsWith("##"))
      .map((domain) => domain.substring(2));

    const updateRulesInChunks = async (blockUrls) => {
      let ruleCount = 0; // Initialize rule count
      const chunkSize = 10000; // Chunk size for batching
      const numChunks = Math.ceil(blockUrls.length / chunkSize);

      for (let i = 0; i < numChunks; i++) {
        if (ruleCount >= 30000) break; // Stop the loop when rule count reaches 30,000

        const startIndex = i * chunkSize;
        const endIndex = Math.min((i + 1) * chunkSize, blockUrls.length);

        const chunkUrls = blockUrls.slice(startIndex, endIndex);

        const rules = chunkUrls
          .map((domain, index) => {
            if (typeof domain !== "string") {
              console.error(
                `Invalid domain type at index ${startIndex + index}:`,
                domain,
              );
              return null; // Skip invalid domains
            }

            // Create rules based on domain format
            if (domain.startsWith("||") && domain[domain.length - 1] === "^") {
              const domainRule = domain.substring(2).slice(0, -1);
              return {
                id: startIndex + index + 1,
                priority: 1,
                action: { type: "block" },
                condition: {
                  urlFilter: `*://${domainRule}*`,
                  resourceTypes: ["main_frame"],
                },
              };
            }
            return {
              id: startIndex + index + 1,
              priority: 1,
              action: { type: "block" },
              condition: { urlFilter: domain, resourceTypes: ["main_frame"] },
            };
          })
          .filter((rule) => rule !== null); // Filter out null rules

        ruleCount += rules.length; // Update rule count

        try {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map((rule) => rule.id),
            addRules: rules,
          });
        } catch (error) {
          console.error(error);
        }
      }
    }; // Update rules and set up a daily refresh alarm

    await updateRulesInChunks(adDomains);
    chrome.alarms.create("refreshAdDomains", { delayInMinutes: 1440 });
  } catch (error) {
    console.error("Error fetching ad domains:", error);
  }
};

// Run fetchAdDomains on installation and daily
chrome.runtime.onInstalled.addListener(() => {
  fetchAdDomains();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshAdDomains") {
    fetchAdDomains();
  }

  if (alarm.name === "blockAdSelectors") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(
          activeTab.id,
          {
            action: "applySelectors",
            selectors: adSelectors,
            domains: adDomains,
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              chrome.storage.local.get("blockedUrls", (result) => {
                if (result.blockedUrls) {
                  blockedUrls = result.blockedUrls;
                }
              });
            }
          },
        );
      } else {
        console.log("No active tab found or unable to access tab.");
      }
    });
  }
});

// Get base URL from full URL
function getBaseUrl(url) {
  const baseUrl = new URL(url);
  return `${baseUrl.origin}/`;
}

// Message listener for turning off the blocker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "turnOffBlocker") {
    chrome.alarms.clear("blockAdSelectors");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.url) {
        blockedUrls = blockedUrls.filter(
          (tabUrl) =>
            tabUrl !== getBaseUrl(activeTab.url) || tabUrl !== activeTab.url,
        );
        chrome.storage.local.set({ blockedUrls: blockedUrls }).catch((err) => {
          console.error(err);
        });
      }
    });

    sendResponse({ status: "Blocking disabled" });
  }
});

// Message listener for fetching ad selectors
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchAdSelectors") {
    sendResponse({ status: adSelectors });
  }
});

// Store the blocked URLs in Chrome storage
function storeBlockedUrls() {
  chrome.storage.local.set({ blockedUrls: blockedUrls }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting blockedUrls:", chrome.runtime.lastError);
    }
  });
}

// Load blocked URLs from Chrome storage
function loadBlockedUrls() {
  chrome.storage.local.get("blockedUrls", (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving blockedUrls:", chrome.runtime.lastError);
    } else {
      blockedUrls = result.blockedUrls || [];
    }
  });
}

// Initialize blocked URLs on extension startup
loadBlockedUrls();

// Message listener for blocking ad selectors
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    request.action === "blockAdSelectors" ||
    request.action === "blockAdSelectorsPage"
  ) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.url) {
        const blockMethod = request.action;
        const url =
          request.action === "blockAdSelectors"
            ? getBaseUrl(activeTab.url)
            : activeTab.url;
        blockedUrls.push(url);
        storeBlockedUrls(); // Update storage immediately

        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ["public/contentScript.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Script injection error:",
                chrome.runtime.lastError,
              );
              sendResponse({ status: "Failed to inject content script" });
            } else {
              chrome.tabs.sendMessage(
                activeTab.id,
                {
                  action: "applySelectors",
                  selectors: adSelectors,
                  domains: adDomains,
                },
                () => {
                  chrome.alarms.clear("blockAdSelectors");
                  chrome.alarms.create("blockAdSelectors", {
                    periodInMinutes: 0.05,
                  });
                  sendResponse({
                    status:
                      blockMethod === "blockAdSelectors"
                        ? "Blocking this site"
                        : "Blocking this page",
                  });
                },
              );
            }
          },
        );
      } else {
        sendResponse({ status: "No active tab found" });
      }
    });
    return true; // Indicates an asynchronous response
  }
});

// Handle tab activation and updates
const handleTabAlarm = (tabUrl) => {
  if (
    blockedUrls.includes(tabUrl) ||
    blockedUrls.includes(getBaseUrl(tabUrl))
  ) {
    chrome.alarms.create("blockAdSelectors", {
      delayInMinutes: 0,
      periodInMinutes: 0.083,
    });
  } else {
    chrome.alarms.clear("blockAdSelectors");
  }
};

// Listener for tab activation
chrome.tabs.onActivated.addListener(() => {
  if (blockedUrls.length) {
    chrome.alarms.clear("blockAdSelectors");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.url) {
        handleTabAlarm(activeTab.url);
      }
    });
  }
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener(async (changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  chrome.alarms.clear("blockAdSelectors");
  handleTabAlarm(tab.url);
});
