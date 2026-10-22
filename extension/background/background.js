/**
 * DarkPattern-AI Shield - Background Service Worker (Manifest V3)
 * Manages tab tracking, toolbar badge counts, storage synchronization, and web dashboard opening.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[DarkPattern-AI Shield] Extension installed successfully.');
  chrome.storage.local.set({
    extensionEnabled: true,
    highlightsEnabled: true,
    autoNeutralizeEnabled: false,
    totalScansCompleted: 0
  });
});

// Update Badge UI on the extension icon in Chrome toolbar
function updateTabBadge(tabId, count, isEnabled = true) {
  if (!tabId || tabId < 0) return;

  if (!isEnabled) {
    chrome.action.setBadgeText({ text: 'OFF', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#64748b', tabId });
    return;
  }

  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#f43f5e', tabId });
  } else {
    chrome.action.setBadgeText({ text: '✓', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId });
  }
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab ? sender.tab.id : null;

  if (request.action === 'SET_EXTENSION_ENABLED') {
    const isEnabled = !!request.enabled;
    chrome.storage.local.set({ extensionEnabled: isEnabled });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]?.id) {
        chrome.storage.local.get([`tab_scan_${tabs[0].id}`], (sRes) => {
          const tabScan = sRes[`tab_scan_${tabs[0].id}`];
          updateTabBadge(tabs[0].id, tabScan?.count || 0, isEnabled);
        });
      }
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'SCAN_COMPLETED') {
    const count = request.count || 0;
    if (tabId) {
      chrome.storage.local.get(['extensionEnabled'], (res) => {
        const isEnabled = res.extensionEnabled !== false;
        updateTabBadge(tabId, count, isEnabled);
      });
      // Store scan for tab
      const tabKey = `tab_scan_${tabId}`;
      const payload = {
        tabId,
        url: request.url,
        domain: request.domain,
        count,
        detections: request.detections || [],
        timestamp: Date.now()
      };
      chrome.storage.local.set({ [tabKey]: payload, lastScanResult: payload });
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'OPEN_WEB_DASHBOARD') {
    chrome.tabs.create({ url: 'http://localhost:5173' });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'GET_ACTIVE_TAB_DATA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      const activeTabId = tabs[0].id;
      const tabKey = `tab_scan_${activeTabId}`;
      chrome.storage.local.get([tabKey, 'lastScanResult', 'extensionEnabled'], (res) => {
        const data = res[tabKey] || res.lastScanResult || null;
        sendResponse({ success: true, tab: tabs[0], data, extensionEnabled: res.extensionEnabled !== false });
      });
    });
    return true; // Keep channel open for async response
  }
});

// When user switches tabs, update badge or trigger re-scan check
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(['extensionEnabled', `tab_scan_${activeInfo.tabId}`], (res) => {
    const isEnabled = res.extensionEnabled !== false;
    const tabData = res[`tab_scan_${activeInfo.tabId}`];
    updateTabBadge(activeInfo.tabId, tabData ? (tabData.count || 0) : 0, isEnabled);
  });
});
