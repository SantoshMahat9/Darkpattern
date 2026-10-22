/**
 * DarkPattern-AI Shield - Popup Logic
 * Interacts with content script, manages tab telemetry, and presents security scores.
 */

document.addEventListener('DOMContentLoaded', () => {
  const headerActiveDot = document.getElementById('headerActiveDot');
  const masterShieldBanner = document.getElementById('masterShieldBanner');
  const masterTitle = document.getElementById('masterTitle');
  const masterSubtitle = document.getElementById('masterSubtitle');
  const toggleMasterShield = document.getElementById('toggleMasterShield');

  const domainChip = document.getElementById('domainChip');
  const riskTitle = document.getElementById('riskTitle');
  const scoreValue = document.getElementById('scoreValue');
  const threatCount = document.getElementById('threatCount');
  const regRisk = document.getElementById('regRisk');
  const patternsBadge = document.getElementById('patternsBadge');
  const detectionsContainer = document.getElementById('detectionsContainer');
  const toggleHighlights = document.getElementById('toggleHighlights');
  const btnNeutralizeAll = document.getElementById('btnNeutralizeAll');
  const btnRescan = document.getElementById('btnRescan');
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');

  let currentTabId = null;

  // Update Master Switch UI state
  function updateMasterSwitchUI(isEnabled) {
    if (toggleMasterShield) toggleMasterShield.checked = isEnabled;
    if (headerActiveDot) {
      headerActiveDot.style.background = isEnabled ? 'var(--emerald)' : '#64748b';
      headerActiveDot.title = isEnabled ? 'Live Engine Active' : 'Shield Paused (Manual Mode)';
    }

    if (isEnabled) {
      masterShieldBanner?.classList.remove('is-disabled');
      if (masterTitle) masterTitle.innerText = 'Protection Active';
      if (masterSubtitle) masterSubtitle.innerText = 'Real-time auto-scanning is ON';
      if (btnRescan) btnRescan.innerText = '🔄 Re-Scan';
    } else {
      masterShieldBanner?.classList.add('is-disabled');
      if (masterTitle) masterTitle.innerText = 'Protection Paused';
      if (masterSubtitle) masterSubtitle.innerText = 'Manual mode: Click scan to inspect';
      if (btnRescan) btnRescan.innerText = '🔍 Manual Scan';
    }
  }

  // Render UI with scan data
  function renderScanData(data, tab, isEnabled = true) {
    if (tab && tab.url) {
      try {
        const urlObj = new URL(tab.url);
        domainChip.innerText = urlObj.hostname;
      } catch {
        domainChip.innerText = 'Active Tab';
      }
    }

    if (!data || !data.detections || data.detections.length === 0) {
      riskTitle.className = 'score-risk-title risk-clean';
      riskTitle.innerHTML = isEnabled ? '<span>Protected</span>' : '<span>Paused</span>';
      scoreValue.innerText = isEnabled ? '98' : '--';
      scoreValue.style.color = isEnabled ? '#10b981' : '#94a3b8';
      threatCount.innerText = '0';
      threatCount.style.color = '#10b981';
      regRisk.innerText = isEnabled ? 'CLEAN' : 'MANUAL';
      regRisk.style.color = isEnabled ? '#10b981' : '#94a3b8';
      patternsBadge.innerText = '0 items';

      detectionsContainer.innerHTML = isEnabled ? `
        <div class="empty-state">
          <div style="font-size: 26px; margin-bottom: 6px;">✨</div>
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 2px;">No Deceptions Detected</div>
          <div style="font-size: 11px;">This page respects transparent user interaction principles.</div>
        </div>
      ` : `
        <div class="empty-state">
          <div style="font-size: 26px; margin-bottom: 6px;">⏸️</div>
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 2px;">Shield is in Manual Mode</div>
          <div style="font-size: 11px;">Real-time auto-scanning is paused. Click <strong>🔍 Manual Scan</strong> below to inspect this page on demand.</div>
        </div>
      `;
      return;
    }

    const detections = data.detections;
    const count = detections.length;
    const hasCritical = detections.some(d => d.severity === 'CRITICAL');
    const hasHigh = detections.some(d => d.severity === 'HIGH');

    // Risk calculation
    const penalty = detections.reduce((acc, d) => {
      if (d.severity === 'CRITICAL') return acc + 30;
      if (d.severity === 'HIGH') return acc + 20;
      if (d.severity === 'MEDIUM') return acc + 10;
      return acc + 5;
    }, 0);

    const safetyScore = Math.max(12, 100 - penalty);
    scoreValue.innerText = String(safetyScore);

    if (hasCritical || safetyScore < 50) {
      riskTitle.className = 'score-risk-title risk-critical';
      riskTitle.innerHTML = '<span>Critical Risk</span>';
      scoreValue.style.color = '#f43f5e';
      regRisk.innerText = 'HIGH RISK';
      regRisk.style.color = '#f43f5e';
    } else if (hasHigh || safetyScore < 75) {
      riskTitle.className = 'score-risk-title risk-moderate';
      riskTitle.innerHTML = '<span>Moderate Risk</span>';
      scoreValue.style.color = '#f97316';
      regRisk.innerText = 'ELEVATED';
      regRisk.style.color = '#f97316';
    } else {
      riskTitle.className = 'score-risk-title risk-clean';
      riskTitle.innerHTML = '<span>Low Concern</span>';
      scoreValue.style.color = '#eab308';
      regRisk.innerText = 'LOW';
      regRisk.style.color = '#eab308';
    }

    threatCount.innerText = String(count);
    threatCount.style.color = hasCritical ? '#f43f5e' : '#f97316';
    patternsBadge.innerText = `${count} item${count > 1 ? 's' : ''}`;

    detectionsContainer.innerHTML = detections.map(item => `
      <div class="pattern-card">
        <div class="card-head">
          <span class="card-title">${item.title || item.category}</span>
          <span class="badge-severity badge-${item.severity}">${item.severity}</span>
        </div>
        <div class="card-desc">${item.description}</div>
        <div class="card-actions">
          <button class="btn-action-sm btn-inspect" data-id="${item.id}">🎯 Scroll to Element</button>
        </div>
      </div>
    `).join('');

    // Attach inspect click handlers
    detectionsContainer.querySelectorAll('.btn-inspect').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (currentTabId && id) {
          chrome.tabs.sendMessage(currentTabId, { action: 'SCROLL_TO_ITEM', id });
        }
      });
    });
  }

  // Load Active Tab telemetry
  function loadActiveTabData() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      currentTabId = tabs[0].id;
      const tab = tabs[0];

      // Retrieve stored telemetry
      chrome.storage.local.get([`tab_scan_${tab.id}`, 'lastScanResult', 'highlightsEnabled', 'extensionEnabled'], (res) => {
        const isEnabled = res.extensionEnabled !== false;
        updateMasterSwitchUI(isEnabled);

        if (res.highlightsEnabled !== undefined) {
          toggleHighlights.checked = res.highlightsEnabled;
        }

        const data = res[`tab_scan_${tab.id}`] || res.lastScanResult;
        renderScanData(data, tab, isEnabled);
      });
    });
  }

  // Toggle Master Shield ON / OFF
  toggleMasterShield?.addEventListener('change', () => {
    const isChecked = toggleMasterShield.checked;
    updateMasterSwitchUI(isChecked);
    chrome.storage.local.set({ extensionEnabled: isChecked });
    chrome.runtime.sendMessage({ action: 'SET_EXTENSION_ENABLED', enabled: isChecked });

    if (currentTabId) {
      chrome.tabs.sendMessage(currentTabId, { action: 'TOGGLE_MASTER_SHIELD', enabled: isChecked }, () => {
        setTimeout(loadActiveTabData, 400);
      });
    }
  });

  // Re-Scan / Manual Scan Button
  btnRescan?.addEventListener('click', () => {
    const isEnabled = toggleMasterShield?.checked ?? true;
    btnRescan.innerText = 'Scanning...';
    if (currentTabId) {
      chrome.tabs.sendMessage(currentTabId, { action: 'FORCE_SCAN' }, () => {
        setTimeout(() => {
          btnRescan.innerText = isEnabled ? '🔄 Re-Scan' : '🔍 Manual Scan';
          loadActiveTabData();
        }, 500);
      });
    } else {
      setTimeout(() => {
        btnRescan.innerText = isEnabled ? '🔄 Re-Scan' : '🔍 Manual Scan';
        loadActiveTabData();
      }, 500);
    }
  });

  // Toggle Highlights
  toggleHighlights?.addEventListener('change', () => {
    const isChecked = toggleHighlights.checked;
    chrome.storage.local.set({ highlightsEnabled: isChecked });
    if (currentTabId) {
      chrome.tabs.sendMessage(currentTabId, { action: 'TOGGLE_HIGHLIGHTS', enabled: isChecked });
    }
  });

  // Neutralize All
  btnNeutralizeAll?.addEventListener('click', () => {
    if (currentTabId) {
      btnNeutralizeAll.innerText = 'Neutralizing...';
      chrome.tabs.sendMessage(currentTabId, { action: 'NEUTRALIZE_ALL' }, () => {
        setTimeout(() => {
          btnNeutralizeAll.innerText = '⚡ Neutralize All';
          loadActiveTabData();
        }, 400);
      });
    }
  });

  // Open Full Web Dashboard
  btnOpenDashboard?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  // Initialize
  loadActiveTabData();
});
