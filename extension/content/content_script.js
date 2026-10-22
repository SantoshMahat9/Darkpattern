/**
 * DarkPattern-AI Shield - Advanced In-Browser Real-Time Detection Engine
 * Scans active DOM, analyzes visual and textual heuristics for all 13 dark pattern classes,
 * injects non-intrusive interactive HUD and high-visibility indicator overlays.
 */

(function () {
  'use strict';

  // Prevent multiple injections in same frame
  if (window.__DP_AI_SHIELD_LOADED__) return;
  window.__DP_AI_SHIELD_LOADED__ = true;

  console.log('[DarkPattern-AI Shield] Engine active on:', window.location.hostname);

  // Regulatory / Taxonomy Reference Database
  const PATTERN_DEFINITIONS = {
    URGENCY_SCARCITY: {
      category: 'False Urgency & Fake Scarcity',
      severity: 'HIGH',
      regulation: 'FTC Deceptive Advertising & India CCPA 2023 Sec. 5(1)',
      advice: 'Artificially induced FOMO. Verify if stock limits or countdown clocks reset upon browser refresh.'
    },
    SNEAKY_SUBSCRIPTION: {
      category: 'Sneaky Subscription & Buried Renewal',
      severity: 'CRITICAL',
      regulation: 'FTC Restore Online Shoppers\' Confidence Act (ROSCA) & CCPA 2023 Sec. 5(4)',
      advice: 'Concealed auto-renewal terms. Always confirm the recurring frequency and cancellation policy.'
    },
    BASKET_SNEAKING: {
      category: 'Pre-ticked Add-ons & Basket Sneaking',
      severity: 'HIGH',
      regulation: 'India CCPA 2023 Sec. 5(2) & EU Digital Services Act Art. 25',
      advice: 'Items or fees automatically added without active opt-in. Uncheck pre-selected checkboxes.'
    },
    CONFIRMSHAMING: {
      category: 'Confirmshaming & Manipulative Guilt',
      severity: 'MEDIUM',
      regulation: 'India CCPA 2023 Sec. 5(3)',
      advice: 'Emotional coercion and guilt-tripping language used in decline buttons to manipulate consent.'
    },
    FORCED_ACTION: {
      category: 'Forced Action & Obstruction Wall',
      severity: 'HIGH',
      regulation: 'EU GDPR Art. 7(4) & India CCPA 2023 Sec. 5(5)',
      advice: 'Forcing registration, contact sharing, or non-essential cookies to perform basic page access.'
    },
    HIDDEN_COSTS: {
      category: 'Hidden Costs & Drip Pricing',
      severity: 'CRITICAL',
      regulation: 'FTC Junk Fees Prevention Act & India CCPA 2023 Sec. 5(6)',
      advice: 'Undisclosed fees, convenience surcharges, or processing taxes revealed late in checkout.'
    },
    MISDIRECTION: {
      category: 'Misdirection & Visual Asymmetry',
      severity: 'HIGH',
      regulation: 'India CCPA 2023 Sec. 5(7) & EU DSA Art. 25',
      advice: 'Visual hierarchy designed to guide user toward higher-cost or tracked options while suppressing alternatives.'
    },
    FAKE_SOCIAL_PROOF: {
      category: 'Synthetic Social Proof & Fake Activity',
      severity: 'MEDIUM',
      regulation: 'FTC Endorsement Guides & India CCPA 2023 Sec. 5(8)',
      advice: 'Unverified live buyer alerts or synthetic viewer counts designed to fabricate peer pressure.'
    },
    TRICK_QUESTIONS: {
      category: 'Trick Questions & Double Negatives',
      severity: 'MEDIUM',
      regulation: 'India CCPA 2023 Sec. 5(9)',
      advice: 'Confusing opt-out phrasing or double negatives meant to cause inadvertent consent.'
    },
    DISGUISED_ADS: {
      category: 'Disguised Ads & Mimicry Controls',
      severity: 'HIGH',
      regulation: 'FTC Native Advertising & India CCPA 2023 Sec. 5(10)',
      advice: 'Sponsored advertorials or fake system download buttons styled to mimic native interface components.'
    },
    BAIT_AND_SWITCH: {
      category: 'Bait and Switch & Misleading Claims',
      severity: 'CRITICAL',
      regulation: 'India CCPA 2023 Sec. 5(8) & FTC Act Section 5',
      advice: 'Promising free access or low initial price, then secretly enforcing paywalls, recurring cards, or substitutions.'
    },
    NAGGING: {
      category: 'Nagging & Repeated Interruption',
      severity: 'LOW',
      regulation: 'India CCPA 2023 Sec. 5(11)',
      advice: 'Repeatedly harassing users with push notification prompts or newsletter popups after dismissal.'
    }
  };

  // State
  let shieldEnabled = true;
  let detectedPatterns = [];
  let highlightsVisible = true;
  let hudDrawerOpen = false;

  /**
   * Remove all highlights, badges, and floating HUD overlays from the page
   */
  function clearAllOverlays() {
    document.querySelectorAll('.dp-element-badge, .dp-popover-tooltip').forEach(el => el.remove());
    document.querySelectorAll('.dp-element-highlight').forEach(el => {
      el.classList.remove('dp-element-highlight', 'dp-severity-CRITICAL', 'dp-severity-HIGH', 'dp-severity-MEDIUM', 'dp-severity-LOW');
    });
    const existingHud = document.getElementById('dp-floating-hud');
    if (existingHud) existingHud.remove();
  }

  /**
   * Helper to identify if an element belongs to our extension UI
   */
  function isExtensionElement(el) {
    if (!el) return false;
    if (el.nodeType !== Node.ELEMENT_NODE) return false;
    return !!(
      (el.closest && (el.closest('#dp-floating-hud') || el.closest('.dp-element-badge') || el.closest('.dp-popover-tooltip'))) ||
      (el.classList && Array.from(el.classList).some(c => typeof c === 'string' && c.startsWith('dp-'))) ||
      (el.id && typeof el.id === 'string' && el.id.startsWith('dp-'))
    );
  }

  /**
   * Helper to safely extract inner text without extension badges polluting it
   */
  function cleanElementText(el) {
    if (!el || isExtensionElement(el)) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.dp-element-badge, .dp-popover-tooltip, #dp-floating-hud, [class*="dp-"]').forEach(n => n.remove());
    return (clone.innerText || clone.textContent || '').trim();
  }

  /**
   * Core Scanning Engine: Evaluates the active DOM against all 11 dark pattern heuristics
   */
  function scanPageDOM() {
    // 0. Remove any old extension badges before scanning so innerText is completely clean
    document.querySelectorAll('.dp-element-badge, .dp-popover-tooltip').forEach(el => el.remove());

    const findings = [];
    const seenElements = new Set();

    // 1. BASKET SNEAKING & PRE-TICKED ADDONS
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]');
    checkboxes.forEach((cb) => {
      if (seenElements.has(cb) || isExtensionElement(cb)) return;
      const textContext = getSurroundingText(cb, 180).toLowerCase();
      const matchKey = ['insurance', 'protection', 'warranty', 'donation', 'tip', 'newsletter', 'priority', 'carbon', 'addon', 'rush', 'cover', 'premium support']
        .find(kw => textContext.includes(kw));

      if (matchKey) {
        seenElements.add(cb);
        findings.push({
          id: 'bs-' + Math.random().toString(36).substring(2, 8),
          type: 'BASKET_SNEAKING',
          ...PATTERN_DEFINITIONS.BASKET_SNEAKING,
          element: cb,
          elementSelector: generateSelector(cb),
          title: `Pre-checked Addon: "${matchKey}"`,
          description: `Checkbox was pre-selected by default without explicit user consent for optional ${matchKey}.`,
          matchedTerms: [matchKey, 'checked=true'],
          canNeutralize: true,
          neutralizeAction: 'UNCHECK'
        });
      }
    });

    // 2. CONFIRMSHAMING / MANIPULATIVE GUILT
    const clickableElements = document.querySelectorAll('button, a, [role="button"], span, div');
    const confirmshamingRegex = /\b(no\s*thanks,?\s*i\s*(prefer|like|hate|don't)\b|i\s*prefer\s*paying\s*full|i\s*don'?t\s*care\s*about\s*saving|i\s*don'?t\s*want\s*discounts|skip\s*and\s*risk\s*it|i'll\s*pay\s*full\s*price|no\s*i\s*hate\s*deals|i\s*don'?t\s*want\s*to\s*save|no,?\s*i\s*want\s*to\s*remain\s*unprotected|i\s*don'?t\s*deserve\s*discounts)\b/i;

    clickableElements.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      if (el.children.length > 2) return; // Leaf or near-leaf elements
      const txt = cleanElementText(el);
      if (txt.length > 4 && txt.length < 120 && confirmshamingRegex.test(txt)) {
        seenElements.add(el);
        findings.push({
          id: 'cs-' + Math.random().toString(36).substring(2, 8),
          type: 'CONFIRMSHAMING',
          ...PATTERN_DEFINITIONS.CONFIRMSHAMING,
          element: el,
          elementSelector: generateSelector(el),
          title: 'Confirmshaming Language',
          description: `Guilt-inducing decline phrase: "${txt.substring(0, 60)}" designed to emotionally manipulate users into compliance.`,
          matchedTerms: [txt.substring(0, 40)],
          canNeutralize: true,
          neutralizeAction: 'REDUCE_OPACITY'
        });
      }
    });

    // 3. FALSE URGENCY & FAKE COUNTDOWN TIMERS
    const allTextBlocks = document.querySelectorAll('div, span, p, section, h3, h4');
    const countdownRegex = /\b(\d{1,2}:\d{2}(:\d{2})?)\b/;
    const urgencyKeywordsRegex = /\b(only\s*[1-9]\s*(items?|tickets?|seats?|rooms?|left)|in\s*high\s*demand|hurry,?|expires\s*in|selling\s*fast|almost\s*gone|offer\s*ends\s*in|limited\s*time\s*only|price\s*increases\s*in|flash\s*deal\s*expires)\b/i;

    allTextBlocks.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      if (el.children.length > 3) return;
      const txt = cleanElementText(el);
      if (!txt || txt.length > 150) return;

      const hasTimer = countdownRegex.test(txt);
      const hasUrgencyWord = urgencyKeywordsRegex.test(txt);

      if (hasTimer || hasUrgencyWord) {
        seenElements.add(el);
        findings.push({
          id: 'urg-' + Math.random().toString(36).substring(2, 8),
          type: 'URGENCY_SCARCITY',
          ...PATTERN_DEFINITIONS.URGENCY_SCARCITY,
          element: el,
          elementSelector: generateSelector(el),
          title: hasTimer ? 'Active Countdown Timer' : 'Scarcity Pressure Claim',
          description: `Synthetic urgency mechanism detected: "${txt.substring(0, 70)}". Induces artificial FOMO to speed up decision-making.`,
          matchedTerms: hasTimer ? ['countdown_clock', txt.match(countdownRegex)?.[0]] : ['scarcity_keywords', txt.match(urgencyKeywordsRegex)?.[0]],
          canNeutralize: true,
          neutralizeAction: 'STOP_TIMER'
        });
      }
    });

    // 4. SNEAKY SUBSCRIPTIONS & BURIED RECURRING BILLING (SUBSCRIPTION TRAP)
    const subscriptionRegex = /\b(billed\s*annually|auto-renew(s|al|ing)?|renews\s*automatically|recurring\s*charge|billed\s*as\s*one\s*payment|cancel\s*anytime\s*before\s*trial|automatically\s*charged\s*each|subsequent\s*months\s*at|trial\s*converts\s*to\s*paid)\b/i;
    allTextBlocks.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      if (el.children.length > 3) return;
      const txt = cleanElementText(el);
      if (txt.length > 10 && txt.length < 250 && subscriptionRegex.test(txt)) {
        const style = window.getComputedStyle(el);
        const isSmallFont = parseFloat(style.fontSize) <= 12;
        const isDim = parseFloat(style.opacity) < 0.85 || style.color.includes('150') || style.color.includes('148');

        seenElements.add(el);
        findings.push({
          id: 'sub-' + Math.random().toString(36).substring(2, 8),
          type: 'SNEAKY_SUBSCRIPTION',
          ...PATTERN_DEFINITIONS.SNEAKY_SUBSCRIPTION,
          element: el,
          elementSelector: generateSelector(el),
          title: 'Buried Recurring Billing Clause',
          description: `Concealed auto-renewal clause${isSmallFont || isDim ? ' in subdued fine-print' : ''}: "${txt.substring(0, 80)}"`,
          matchedTerms: [txt.match(subscriptionRegex)?.[0] || 'auto-renew'],
          canNeutralize: true,
          neutralizeAction: 'HIGHLIGHT_TRAP'
        });
      }
    });

    // 5. HIDDEN COSTS & DRIP PRICING SURCHARGES
    const hiddenCostRegex = /\b(convenience\s*(fee|surcharge)|processing\s*fee|service\s*(fee|surcharge)|resort\s*fee|booking\s*fee|handling\s*charge|mandatory\s*(fee|surcharge)|payment\s*surcharge)\b/i;
    allTextBlocks.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      if (el.children.length > 2) return;
      const txt = cleanElementText(el);
      if (txt.length > 5 && txt.length < 120 && hiddenCostRegex.test(txt)) {
        seenElements.add(el);
        findings.push({
          id: 'hc-' + Math.random().toString(36).substring(2, 8),
          type: 'HIDDEN_COSTS',
          ...PATTERN_DEFINITIONS.HIDDEN_COSTS,
          element: el,
          elementSelector: generateSelector(el),
          title: 'Undisclosed Fee / Surcharge',
          description: `Drip pricing component added at checkout: "${txt.substring(0, 60)}"`,
          matchedTerms: [txt.match(hiddenCostRegex)?.[0] || 'fee'],
          canNeutralize: true,
          neutralizeAction: 'FLAG_SURCHARGE'
        });
      }
    });

    // 6. SYNTHETIC SOCIAL PROOF TOASTS
    const floatingToasts = document.querySelectorAll('[class*="toast"], [class*="popup"], [class*="notification"], [class*="alert"]');
    floatingToasts.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      const txt = cleanElementText(el).toLowerCase();
      if (txt.includes('just bought') || txt.includes('just booked') || txt.includes('purchased') || txt.includes('looking at this') || txt.includes('booked this')) {
        seenElements.add(el);
        findings.push({
          id: 'sp-' + Math.random().toString(36).substring(2, 8),
          type: 'FAKE_SOCIAL_PROOF',
          ...PATTERN_DEFINITIONS.FAKE_SOCIAL_PROOF,
          element: el,
          elementSelector: generateSelector(el),
          title: 'Synthetic Live Purchase Alert',
          description: `Simulated social proof banner: "${cleanElementText(el).substring(0, 60)}"`,
          matchedTerms: ['social_proof_toast'],
          canNeutralize: true,
          neutralizeAction: 'HIDE_ELEMENT'
        });
      }
    });

    // 7. MISDIRECTION / ASYMMETRIC CONTRAST BUTTONS
    const consentContainers = document.querySelectorAll('[id*="cookie"], [class*="cookie"], [class*="consent"], [id*="banner"], [class*="modal"]');
    consentContainers.forEach((container) => {
      if (isExtensionElement(container)) return;
      const buttons = container.querySelectorAll('button, a.btn, [role="button"]');
      if (buttons.length >= 2) {
        let acceptBtn = null;
        let rejectBtn = null;
        buttons.forEach(b => {
          if (isExtensionElement(b)) return;
          const t = cleanElementText(b).toLowerCase();
          if (t.includes('accept') || t.includes('agree') || t.includes('allow all')) acceptBtn = b;
          if (t.includes('reject') || t.includes('decline') || t.includes('manage') || t.includes('customize')) rejectBtn = b;
        });

        if (acceptBtn && rejectBtn && !seenElements.has(acceptBtn)) {
          const styleAccept = window.getComputedStyle(acceptBtn);
          const styleReject = window.getComputedStyle(rejectBtn);

          if (styleAccept.backgroundColor !== 'rgba(0, 0, 0, 0)' && (styleReject.backgroundColor === 'rgba(0, 0, 0, 0)' || styleReject.color.includes('150') || styleReject.tagName === 'A')) {
            seenElements.add(acceptBtn);
            seenElements.add(rejectBtn);
            findings.push({
              id: 'mis-' + Math.random().toString(36).substring(2, 8),
              type: 'MISDIRECTION',
              ...PATTERN_DEFINITIONS.MISDIRECTION,
              element: acceptBtn,
              elementSelector: generateSelector(acceptBtn),
              title: 'Asymmetric Consent Styling',
              description: 'Visual bias: "Accept" has prominent color contrast while "Reject/Manage" is de-emphasized to steer user consent.',
              matchedTerms: ['visual_contrast_asymmetry', 'cookie_gate'],
              canNeutralize: true,
              neutralizeAction: 'EQUALIZE_BUTTONS'
            });
          }
        }
      }
    });

    // 8. FORCED ACTION & CONTENT WALLS
    const forcedActionOverlays = document.querySelectorAll('.forced-action-modal, [class*="paywall"], [class*="gatekeeper"], [class*="lockout"], [id*="gate"]');
    forcedActionOverlays.forEach((overlay) => {
      if (seenElements.has(overlay) || isExtensionElement(overlay)) return;
      const text = cleanElementText(overlay).toLowerCase();
      if (text.includes('download our app to') || text.includes('must create account') || text.includes('sign in to read') || text.includes('must register to view')) {
        seenElements.add(overlay);
        findings.push({
          id: 'fa-' + Math.random().toString(36).substring(2, 8),
          type: 'FORCED_ACTION',
          ...PATTERN_DEFINITIONS.FORCED_ACTION,
          element: overlay,
          elementSelector: generateSelector(overlay),
          title: 'Forced Action Obstruction Wall',
          description: `Content blocked by mandatory gatekeeper requiring registration or app install to access basic content.`,
          matchedTerms: ['forced_registration_or_app_wall'],
          canNeutralize: true,
          neutralizeAction: 'REMOVE_WALL'
        });
      }
    });

    // 9. BAIT AND SWITCH / DECEPTIVE FREE PROMISES
    const baitSwitchElements = document.querySelectorAll('button, a, div.interactive-demo-box, [class*="card"]');
    baitSwitchElements.forEach((el) => {
      if (seenElements.has(el) || isExtensionElement(el)) return;
      const txt = cleanElementText(el).toLowerCase();
      if ((txt.includes('100% free') || txt.includes('free lifetime access') || txt.includes('get for free') || txt.includes('free download')) &&
          (txt.includes('credit card') || txt.includes('$') || txt.includes('billed after') || txt.includes('subscription required') || txt.includes('/ month'))) {
        seenElements.add(el);
        findings.push({
          id: 'bas-' + Math.random().toString(36).substring(2, 8),
          type: 'BAIT_AND_SWITCH',
          ...PATTERN_DEFINITIONS.BAIT_AND_SWITCH,
          element: el,
          elementSelector: generateSelector(el),
          title: 'Bait and Switch Claim',
          description: `Marketed as "Free" but conditions enforce mandatory credit card billing or covert paid subscription conversions.`,
          matchedTerms: ['free_headline_vs_paid_terms'],
          canNeutralize: true,
          neutralizeAction: 'EXPOSE_PRICE'
        });
      }
    });

    // 10. DISGUISED ADVERTISEMENTS / MIMICRY CONTROLS
    const adContainers = document.querySelectorAll('[class*="ad-"], [class*="sponsored"], [id*="ad-"], .disguised-ad-sim');
    adContainers.forEach((ad) => {
      if (seenElements.has(ad) || isExtensionElement(ad)) return;
      const txt = cleanElementText(ad).toLowerCase();
      if (txt.includes('download now') || txt.includes('start download') || txt.includes('click to install') || txt.includes('play now') || txt.includes('update available')) {
        seenElements.add(ad);
        findings.push({
          id: 'da-' + Math.random().toString(36).substring(2, 8),
          type: 'DISGUISED_ADS',
          ...PATTERN_DEFINITIONS.DISGUISED_ADS,
          element: ad,
          elementSelector: generateSelector(ad),
          title: 'Disguised Advertisement Button',
          description: `Third-party advertisement or affiliate sponsor styled to mimic an operating system button or native software installer.`,
          matchedTerms: ['mimicry_download_button', 'disguised_ad'],
          canNeutralize: true,
          neutralizeAction: 'LABEL_AD'
        });
      }
    });

    // 11. TRICK QUESTIONS & DOUBLE NEGATIVES
    const questionLabels = document.querySelectorAll('label, .trick-question-box, p, span');
    const trickQuestionRegex = /\b(uncheck\s*(this\s*box\s*)?if\s*you\s*(do\s*not|don't)\s*want\s*to\s*(refrain|opt-out|avoid)|do\s*not\s*uncheck\s*unless\s*you\s*wish\s*to\s*not|refrain\s*from\s*not\s*receiving|opt-out\s*of\s*not\s*getting)\b/i;
    questionLabels.forEach((lbl) => {
      if (seenElements.has(lbl) || isExtensionElement(lbl)) return;
      const txt = cleanElementText(lbl);
      if (txt.length > 15 && txt.length < 220 && trickQuestionRegex.test(txt)) {
        seenElements.add(lbl);
        findings.push({
          id: 'tq-' + Math.random().toString(36).substring(2, 8),
          type: 'TRICK_QUESTIONS',
          ...PATTERN_DEFINITIONS.TRICK_QUESTIONS,
          element: lbl,
          elementSelector: generateSelector(lbl),
          title: 'Trick Question / Double Negative',
          description: `Convoluted double-negative phrasing intentionally designed to induce inadvertent consent: "${txt.substring(0, 65)}"`,
          matchedTerms: ['double_negative_syntax', txt.match(trickQuestionRegex)?.[0] || 'confusing_optout'],
          canNeutralize: true,
          neutralizeAction: 'CLARIFY_CHECKBOX'
        });
      }
    });

    // 12. NAGGING & REPEATED INTERRUPTIONS
    const naggingModals = document.querySelectorAll('.nagging-toast-sim, [class*="nag-"], [id*="nag-"]');
    naggingModals.forEach((nag) => {
      if (seenElements.has(nag) || isExtensionElement(nag)) return;
      const txt = cleanElementText(nag).toLowerCase();
      if (txt.includes('turn on notifications') || txt.includes('allow notifications') || txt.includes('stay updated with daily alerts') || txt.includes('subscribe before you go')) {
        seenElements.add(nag);
        findings.push({
          id: 'nag-' + Math.random().toString(36).substring(2, 8),
          type: 'NAGGING',
          ...PATTERN_DEFINITIONS.NAGGING,
          element: nag,
          elementSelector: generateSelector(nag),
          title: 'Nagging Interruption Prompt',
          description: `Repeated notification/subscription capture disrupting primary workflow.`,
          matchedTerms: ['repeated_nagging_prompt'],
          canNeutralize: true,
          neutralizeAction: 'DISMISS_NAG'
        });
      }
    });

    // Deduplicate findings:
    // 1) Eliminate duplicate elements
    // 2) Prune ancestor containers when an inner child is already flagged for the same pattern category
    const deduplicated = findings.filter((f1, idx) => {
      const firstIdx = findings.findIndex(f => f.element === f1.element && f.type === f1.type);
      if (firstIdx !== idx) return false;

      const hasDeeperChildMatch = findings.some(f2 => f1 !== f2 && f1.type === f2.type && f1.element.contains(f2.element));
      return !hasDeeperChildMatch;
    });

    return deduplicated;
  }

  /**
   * Helper to inspect surrounding text context for checkboxes
   */
  function getSurroundingText(el, maxChars = 200) {
    let parent = el.closest('label') || el.closest('div') || el.parentElement;
    if (!parent) return '';
    return cleanElementText(parent).substring(0, maxChars);
  }

  /**
   * Helper to generate a reliable CSS selector for messaging popup
   */
  function generateSelector(el) {
    if (el.id) return `#${el.id}`;
    let path = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && path.length < 3) {
      let selector = current.nodeName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const firstClass = current.className.trim().split(/\s+/)[0];
        if (firstClass && !firstClass.startsWith('dp-')) {
          selector += `.${firstClass}`;
        }
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  /**
   * Render Highlights and Badges over the Offending Elements
   */
  function renderHighlights(items) {
    // Clear old badges
    document.querySelectorAll('.dp-element-badge, .dp-popover-tooltip').forEach(el => el.remove());
    document.querySelectorAll('.dp-element-highlight').forEach(el => {
      el.classList.remove('dp-element-highlight', 'dp-severity-CRITICAL', 'dp-severity-HIGH', 'dp-severity-MEDIUM', 'dp-severity-LOW');
    });

    if (!highlightsVisible) return;

    items.forEach((item) => {
      const el = item.element;
      if (!el || !document.body.contains(el)) return;

      el.classList.add('dp-element-highlight', `dp-severity-${item.severity}`);

      // Create Badge
      const badge = document.createElement('div');
      badge.className = `dp-element-badge dp-badge-${item.severity}`;
      badge.innerHTML = `<span>⚠️ ${item.category}</span>`;
      
      // Click or Hover shows details
      let tooltip = null;
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
          return;
        }

        tooltip = document.createElement('div');
        tooltip.className = 'dp-popover-tooltip';
        tooltip.innerHTML = `
          <div class="dp-tooltip-title">
            <span>${item.title}</span>
            <span style="font-size: 10px; color: #f43f5e; font-weight: 800;">${item.severity}</span>
          </div>
          <div class="dp-tooltip-desc">${item.description}</div>
          <div class="dp-tooltip-remedy">
            <strong>Legal Reference:</strong> ${item.regulation}<br/>
            <strong>Remedy:</strong> ${item.advice}
          </div>
          ${item.canNeutralize ? `<button class="dp-neutralize-btn" id="btn-fix-${item.id}">🛡️ Neutralize This Pattern</button>` : ''}
        `;

        badge.appendChild(tooltip);

        if (item.canNeutralize) {
          const btn = tooltip.querySelector(`#btn-fix-${item.id}`);
          btn?.addEventListener('click', (ev) => {
            ev.stopPropagation();
            executeNeutralization(item);
            tooltip.remove();
            tooltip = null;
          });
        }
      });

      // Position badge
      if (window.getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      el.appendChild(badge);
    });
  }

  /**
   * Neutralizes a dark pattern on page
   */
  function executeNeutralization(item) {
    const el = item.element;
    if (!el) return;

    if (item.neutralizeAction === 'UNCHECK') {
      el.checked = false;
      el.removeAttribute('checked');
      el.dispatchEvent(new Event('change', { bubbles: true }));
      flashNotification(`✅ Unchecked sneaky add-on: "${item.title}"`);
    } else if (item.neutralizeAction === 'STOP_TIMER') {
      el.style.textDecoration = 'line-through';
      el.style.opacity = '0.5';
      const mark = document.createElement('span');
      mark.className = 'dp-neutralized-mark';
      mark.style.cssText = 'color: #10b981; font-weight: bold; margin-left: 6px; font-size: 11px;';
      mark.innerText = '[Bypassed Fake Urgency]';
      el.appendChild(mark);
      flashNotification('✅ Neutralized fake countdown timer pressure.');
    } else if (item.neutralizeAction === 'HIDE_ELEMENT') {
      el.style.display = 'none';
      flashNotification('✅ Removed synthetic social proof banner.');
    } else if (item.neutralizeAction === 'REDUCE_OPACITY') {
      el.style.opacity = '0.4';
      flashNotification('✅ Neutralized confirmshaming emotional guilt.');
    } else if (item.neutralizeAction === 'EQUALIZE_BUTTONS') {
      el.style.filter = 'grayscale(0.7)';
      flashNotification('✅ Equalized button visual misdirection.');
    } else if (item.neutralizeAction === 'REMOVE_WALL') {
      el.style.display = 'none';
      document.body.style.overflow = 'auto';
      flashNotification('✅ Removed forced obstruction wall.');
    } else if (item.neutralizeAction === 'HIGHLIGHT_TRAP') {
      el.style.border = '2px dashed #f43f5e';
      el.style.background = 'rgba(244, 63, 94, 0.1)';
      el.style.opacity = '1';
      flashNotification('⚠️ Exposed buried subscription trap clause.');
    } else if (item.neutralizeAction === 'FLAG_SURCHARGE') {
      el.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      el.style.outline = '1px solid #ef4444';
      flashNotification('⚠️ Flagged hidden drip surcharge.');
    } else if (item.neutralizeAction === 'LABEL_AD') {
      el.style.outline = '2px dashed #f59e0b';
      const label = document.createElement('div');
      label.style.cssText = 'background: #f59e0b; color: #000; font-size: 10px; font-weight: 800; padding: 2px 6px; text-transform: uppercase; width: fit-content; border-radius: 4px; margin-bottom: 4px;';
      label.innerText = '⚠️ Sponsored Ad / Not Native';
      el.parentElement?.insertBefore(label, el);
      flashNotification('✅ Exposed disguised advertisement button.');
    } else if (item.neutralizeAction === 'CLARIFY_CHECKBOX') {
      const cb = el.querySelector('input[type="checkbox"]') || el;
      if (cb && 'checked' in cb) {
        cb.checked = false;
      }
      el.style.textDecoration = 'none';
      el.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      flashNotification('✅ Clarified double-negative trick question.');
    } else if (item.neutralizeAction === 'EXPOSE_PRICE') {
      el.style.border = '2px solid #ef4444';
      flashNotification('⚠️ Flagged bait-and-switch misleading claim.');
    } else if (item.neutralizeAction === 'DISMISS_NAG') {
      el.style.display = 'none';
      flashNotification('✅ Dismissed nagging interruption prompt.');
    }
  }

  /**
   * Floating HUD Bar at Bottom Right
   */
  function renderFloatingHUD(items) {
    let existingHud = document.getElementById('dp-floating-hud');
    if (existingHud) existingHud.remove();

    const hud = document.createElement('div');
    hud.id = 'dp-floating-hud';

    const count = items.length;
    const isClean = count === 0;

    hud.innerHTML = `
      <div class="dp-hud-pill" id="dp-hud-trigger">
        <div class="dp-hud-icon-wrap">🛡️</div>
        <div class="dp-hud-text">${isClean ? 'Page Protected' : `${count} Dark Pattern${count > 1 ? 's' : ''}`}</div>
        <div class="dp-hud-count ${isClean ? 'clean' : ''}">${isClean ? '0' : count}</div>
      </div>

      <div class="dp-hud-drawer" id="dp-hud-drawer" style="display: none;">
        <div class="dp-drawer-header">
          <div class="dp-drawer-title">
            <span>🛡️ DarkPattern Shield</span>
            <span style="font-size: 11px; color: ${isClean ? '#10b981' : '#f43f5e'}; font-weight: 700;">
              ${isClean ? 'CLEAN PAGE' : 'ACTIVE THREATS'}
            </span>
          </div>
          <button class="dp-drawer-close" id="dp-drawer-close-btn">&times;</button>
        </div>

        <div class="dp-drawer-body">
          ${isClean ? `
            <div style="text-align: center; padding: 24px 8px; color: #94a3b8; font-size: 12px;">
              <div style="font-size: 28px; margin-bottom: 8px;">✨</div>
              <strong>No deceptive patterns detected.</strong><br/>
              This site respects user autonomy.
            </div>
          ` : items.map((item, idx) => `
            <div class="dp-drawer-item" data-id="${item.id}" data-idx="${idx}">
              <div class="dp-item-top">
                <span class="dp-item-category">${item.title}</span>
                <span class="dp-item-badge ${item.severity}">${item.severity}</span>
              </div>
              <div class="dp-item-desc">${item.description}</div>
              ${item.canNeutralize ? `
                <button class="dp-neutralize-btn" data-action="neutralize" data-idx="${idx}" style="margin-top: 6px;">
                  🛡️ Auto-Neutralize
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="dp-drawer-footer">
          <span>DarkPattern-AI v2.0</span>
          <span class="dp-footer-link" id="dp-open-full-dashboard">Full Analytics &rarr;</span>
        </div>
      </div>
    `;

    document.body.appendChild(hud);

    // Event Listeners
    const trigger = hud.querySelector('#dp-hud-trigger');
    const drawer = hud.querySelector('#dp-hud-drawer');
    const closeBtn = hud.querySelector('#dp-drawer-close-btn');
    const fullDashBtn = hud.querySelector('#dp-open-full-dashboard');

    trigger?.addEventListener('click', () => {
      hudDrawerOpen = !hudDrawerOpen;
      drawer.style.display = hudDrawerOpen ? 'flex' : 'none';
    });

    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      hudDrawerOpen = false;
      drawer.style.display = 'none';
    });

    fullDashBtn?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'OPEN_WEB_DASHBOARD' });
    });

    // Drawer item click -> Scroll to element
    hud.querySelectorAll('.dp-drawer-item').forEach((itemNode) => {
      itemNode.addEventListener('click', (e) => {
        const targetBtn = (e.target).closest('[data-action="neutralize"]');
        const idx = parseInt(itemNode.getAttribute('data-idx') || '0', 10);
        const item = items[idx];

        if (targetBtn) {
          e.stopPropagation();
          executeNeutralization(item);
          return;
        }

        if (item && item.element) {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          item.element.style.transform = 'scale(1.03)';
          setTimeout(() => { item.element.style.transform = ''; }, 600);
        }
      });
    });
  }

  function flashNotification(text) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--dp-font);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 2147483647;
      animation: dp-badge-pulse 0.3s ease;
    `;
    toast.innerText = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /**
   * Main scan coordinator
   */
  function executeFullScan(isManual = false) {
    if (!shieldEnabled && !isManual) {
      clearAllOverlays();
      return;
    }

    detectedPatterns = scanPageDOM();
    renderHighlights(detectedPatterns);
    renderFloatingHUD(detectedPatterns);

    // Sync with background service worker
    const serializableDetections = detectedPatterns.map(d => ({
      id: d.id,
      category: d.category,
      severity: d.severity,
      title: d.title,
      description: d.description,
      regulation: d.regulation,
      advice: d.advice,
      matchedTerms: d.matchedTerms,
      elementSelector: d.elementSelector,
      canNeutralize: d.canNeutralize
    }));

    chrome.runtime.sendMessage({
      action: 'SCAN_COMPLETED',
      url: window.location.href,
      domain: window.location.hostname,
      count: detectedPatterns.length,
      detections: serializableDetections
    });
  }

  // Engine Startup - Check if Auto-Shield is enabled in storage
  function initializeEngine() {
    chrome.storage.local.get(['extensionEnabled', 'highlightsEnabled'], (res) => {
      if (res.extensionEnabled !== undefined) {
        shieldEnabled = res.extensionEnabled;
      }
      if (res.highlightsEnabled !== undefined) {
        highlightsVisible = res.highlightsEnabled;
      }

      if (shieldEnabled) {
        executeFullScan();
      } else {
        clearAllOverlays();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEngine);
  } else {
    initializeEngine();
  }

  // MutationObserver to detect dynamically mounted modals, timers, or toasts
  let mutationTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // If shield is paused (manual mode), do not perform auto scans
    if (!shieldEnabled) return;

    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && !(node).classList?.contains('dp-element-badge') && !(node).id?.startsWith('dp-')) {
            shouldScan = true;
            break;
          }
        }
      }
    }

    if (shouldScan) {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        executeFullScan();
      }, 700);
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  // Communication with Extension Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TOGGLE_MASTER_SHIELD') {
      shieldEnabled = !!request.enabled;
      if (shieldEnabled) {
        executeFullScan();
        flashNotification('🛡️ Shield Active: Auto-Scanning Enabled');
      } else {
        clearAllOverlays();
        flashNotification('⏸️ Shield Paused: Manual Mode Enabled');
      }
      sendResponse({ success: true, enabled: shieldEnabled });
    } else if (request.action === 'FORCE_SCAN') {
      // Manual Scan: Always execute scan on demand regardless of auto-mode
      executeFullScan(true);
      flashNotification(`🔍 Manual Scan: ${detectedPatterns.length} pattern${detectedPatterns.length === 1 ? '' : 's'} identified`);
      sendResponse({ success: true, count: detectedPatterns.length });
    } else if (request.action === 'TOGGLE_HIGHLIGHTS') {
      highlightsVisible = request.enabled;
      renderHighlights(detectedPatterns);
      sendResponse({ success: true });
    } else if (request.action === 'NEUTRALIZE_ALL') {
      detectedPatterns.forEach(d => {
        if (d.canNeutralize) executeNeutralization(d);
      });
      sendResponse({ success: true });
    } else if (request.action === 'SCROLL_TO_ITEM') {
      const match = detectedPatterns.find(d => d.id === request.id);
      if (match && match.element) {
        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        match.element.style.transform = 'scale(1.04)';
        setTimeout(() => { match.element.style.transform = ''; }, 700);
        sendResponse({ success: true });
      }
    }
  });

})();
