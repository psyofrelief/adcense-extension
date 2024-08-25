// Listener for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applySelectors" && request.selectors) {
    // Respond to the background script indicating that selectors are being applied
    sendResponse({ status: "Selectors applied" });

    // Extract and add the custom selector
    const selectors = [...request.selectors, ".elementor-widget-container"];

    // Iterate over each selector and remove matching elements from the page
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        console.log(element);
        element.remove(); // Remove the element from the DOM
      }
    }
  }
});
