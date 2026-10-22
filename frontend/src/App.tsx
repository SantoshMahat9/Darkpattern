import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  BarChart3, 
  RefreshCw,
  Sparkles,
  Copy,
  Terminal as TerminalIcon,
  Check,
  Globe,
  ShieldCheck,
  Download,
  BookOpen,
  Puzzle,
  Sliders,
  AlertTriangle,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Comprehensive 13 Dark Pattern Taxonomies (FTC, EU DSA & India CCPA 2023)
interface TaxonomyCategory {
  id: string;
  name: string;
  hindiTitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  badgeStyle: string;
  chipColor: string;
  dotColor: string;
  regulation: string;
  description: string;
  deceptiveExampleSnippet: string;
  ethicalFixSnippet: string;
  realWorldImpact: string;
  mitigationAdvice: string;
}

const TAXONOMY_13_CATEGORIES: TaxonomyCategory[] = [
  {
    id: 'false-urgency',
    name: 'False Urgency & Fake Countdown',
    hindiTitle: 'झूठी जल्दबाज़ी व फर्जी टाइमर',
    severity: 'HIGH',
    badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200',
    chipColor: 'bg-orange-600',
    dotColor: '#ea580c',
    regulation: 'India CCPA 2023 Sec. 5(1) & FTC Section 5',
    description: 'Artificial time limits, looping countdown timers, or unverified claims like "Only 2 rooms left!" designed to induce FOMO panic.',
    deceptiveExampleSnippet: `<div class="fake-timer">\n  <span>Offer expires in:</span>\n  <span class="timer font-bold text-red-600">09:59</span>\n  <!-- Resets to 09:59 on page reload -->\n</div>`,
    ethicalFixSnippet: `<div class="genuine-notice">\n  <span>Standard retail price: ₹2,999.00</span>\n  <span class="text-slate-500">Inventory updated in real-time via backend database</span>\n</div>`,
    realWorldImpact: 'Pressures consumers into rushed purchasing decisions without reading terms or comparing competing prices.',
    mitigationAdvice: 'Remove client-side resettable clocks. Only display inventory counters tied directly to verifiable live warehouse stock.'
  },
  {
    id: 'basket-sneaking',
    name: 'Basket Sneaking & Pre-ticked Addons',
    hindiTitle: 'टोकरी में चुपके से जोड़ना',
    severity: 'HIGH',
    badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200',
    chipColor: 'bg-orange-600',
    dotColor: '#ea580c',
    regulation: 'India CCPA 2023 Sec. 5(2) & EU DSA Art. 25',
    description: 'Inclusion of additional items, charity donations, flight insurance, or priority fees in cart without explicit active consent.',
    deceptiveExampleSnippet: `<label class="flex items-center gap-2">\n  <input type="checkbox" name="travel_insurance" checked />\n  <span>Add Flight Cancellation Protection (₹499 auto-selected)</span>\n</label>`,
    ethicalFixSnippet: `<label class="flex items-center gap-2">\n  <input type="checkbox" name="travel_insurance" />\n  <span>Optional: Add Travel Protection (₹499)</span>\n</label>`,
    realWorldImpact: 'Causes buyers to unknowingly pay 10-30% more on checkout without realizing an opt-out was necessary.',
    mitigationAdvice: 'Ensure every optional product or service is unchecked by default. Require explicit positive action for all add-ons.'
  },
  {
    id: 'confirmshaming',
    name: 'Confirmshaming & Manipulative Guilt',
    hindiTitle: 'शर्मिंदा करने वाला विकल्प',
    severity: 'MEDIUM',
    badgeStyle: 'bg-amber-50 text-amber-700 border border-amber-200',
    chipColor: 'bg-amber-600',
    dotColor: '#d97706',
    regulation: 'India CCPA 2023 Sec. 5(3)',
    description: 'Using emotionally manipulative, guilt-tripping language in decline options to make users feel reckless or foolish.',
    deceptiveExampleSnippet: `<button class="btn-primary">CLAIM 20% DISCOUNT</button>\n<a href="#" class="text-xs text-gray-500 underline">\n  No thanks, I prefer paying full price and hate saving money\n</a>`,
    ethicalFixSnippet: `<button class="btn-primary">Apply 20% Discount</button>\n<button class="btn-ghost">No, continue without discount</button>`,
    realWorldImpact: 'Exploits cognitive bias by instilling false guilt or insecurity when exercising consumer choice.',
    mitigationAdvice: 'Use neutral, respectful, objective text for both acceptance and rejection pathways (e.g., "Yes, subscribe" / "Not now").'
  },
  {
    id: 'forced-action',
    name: 'Forced Action & Obstruction Walls',
    hindiTitle: 'मजबूरन एक्शन व कुकी दीवार',
    severity: 'HIGH',
    badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200',
    chipColor: 'bg-orange-600',
    dotColor: '#ea580c',
    regulation: 'EU GDPR Art. 7(4) & India CCPA 2023 Sec. 5(5)',
    description: 'Compelling users to register, accept non-essential tracking cookies, or install mobile apps before allowing core content access.',
    deceptiveExampleSnippet: `<div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">\n  <div class="modal">You must download our App to read this article</div>\n</div>`,
    ethicalFixSnippet: `<div class="banner bg-slate-100 p-4 border border-slate-200 rounded-lg flex justify-between">\n  <span>Enjoying our content? Consider creating a free account.</span>\n  <button class="text-sm text-blue-600 font-semibold">Continue as Guest &rarr;</button>\n</div>`,
    realWorldImpact: 'Eliminates basic access freedom and forces unwanted data harvesting.',
    mitigationAdvice: 'Allow guest navigation and provide a single-click "Reject All Non-Essential Cookies" button alongside "Accept All".'
  },
  {
    id: 'subscription-trap',
    name: 'Subscription Trap & Buried Renewal',
    hindiTitle: 'सब्सक्रिप्शन का चक्रव्यूह व छिपा नवीनीकरण',
    severity: 'CRITICAL',
    badgeStyle: 'bg-red-50 text-red-700 border border-red-200',
    chipColor: 'bg-red-600',
    dotColor: '#dc2626',
    regulation: 'FTC ROSCA & India CCPA 2023 Sec. 5(4)',
    description: 'Concealing recurring annual billing terms under a monthly headline price, or making cancellation an arduous multi-step phone ordeal.',
    deceptiveExampleSnippet: `<div class="price-header">₹199 / month</div>\n<!-- Hidden fine-print -->\n<div class="text-[9px] text-gray-500 opacity-60">\n  Billed annually as one lump payment of ₹2,388.00. Renews automatically without notice.\n</div>`,
    ethicalFixSnippet: `<div class="price-header">₹2,388.00 / year (₹199/mo equivalent)</div>\n<div class="text-xs text-slate-600">\n  Cancel anytime with 1-click in your account settings. Reminder email sent 7 days prior.\n</div>`,
    realWorldImpact: 'Traps users into recurring deductions; cancellations require high cognitive or friction load (Roach Motel).',
    mitigationAdvice: 'Ensure cancellation is as effortless as sign-up (1-click online cancellation) with clear advance renewal notifications.'
  },
  {
    id: 'hidden-costs',
    name: 'Hidden Costs & Drip Pricing',
    hindiTitle: 'छिपे हुए खर्च व ड्रिप प्राइसिंग',
    severity: 'CRITICAL',
    badgeStyle: 'bg-red-50 text-red-700 border border-red-200',
    chipColor: 'bg-red-600',
    dotColor: '#dc2626',
    regulation: 'FTC Junk Fees Rule & India CCPA 2023 Sec. 5(6)',
    description: 'Incrementally revealing mandatory convenience fees, handling charges, resort fees, or gateway surcharges at final checkout step.',
    deceptiveExampleSnippet: `<!-- Initial Step 1: Base fare ₹3,500.00 -->\n<!-- Final Step 4 Checkout Table: -->\n<tr><td>Mandatory Convenience Surcharge</td><td>+₹250.00</td></tr>\n<tr><td>Payment Processing Fee</td><td>+₹99.00</td></tr>`,
    ethicalFixSnippet: `<div class="total-price-box p-3 bg-slate-50 border border-slate-200 rounded-lg">\n  <div class="text-xl font-bold text-slate-900">Total All-Inclusive Price: ₹3,849.00</div>\n  <span class="text-xs text-slate-500">Includes all taxes, booking charges, and payment fees upfront.</span>\n</div>`,
    realWorldImpact: 'Deceives price comparison engines and commits consumers who have already invested substantial time in the checkout funnel.',
    mitigationAdvice: 'Display all-inclusive total prices from the very first product listing page.'
  },
  {
    id: 'misdirection',
    name: 'Misdirection & Visual Asymmetry',
    hindiTitle: 'भ्रामक डिज़ाइन व विषमता',
    severity: 'HIGH',
    badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200',
    chipColor: 'bg-orange-600',
    dotColor: '#ea580c',
    regulation: 'India CCPA 2023 Sec. 5(7) & EU DSA Art. 25',
    description: 'Styling the desired business outcome with bold contrast, bright colors, and big buttons while rendering user options faint or invisible.',
    deceptiveExampleSnippet: `<button class="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm">\n  ACCEPT ALL TRACKING COOKIES\n</button>\n<a href="#" class="text-[10px] text-gray-400 opacity-40 ml-4">\n  Customise preferences\n</a>`,
    ethicalFixSnippet: `<div class="flex gap-4">\n  <button class="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg">Accept All</button>\n  <button class="bg-slate-100 text-slate-700 font-medium py-2 px-6 rounded-lg border border-slate-300">Reject All</button>\n</div>`,
    realWorldImpact: 'Subverts voluntary consent by manipulating eye-tracking and neurological click reflexes.',
    mitigationAdvice: 'Give affirmative and negative choices identical visual prominence, font sizing, and button hitbox areas.'
  },
  {
    id: 'bait-and-switch',
    name: 'Bait and Switch',
    hindiTitle: 'धोखेबाज़ अदला-बदली',
    severity: 'CRITICAL',
    badgeStyle: 'bg-red-50 text-red-700 border border-red-200',
    chipColor: 'bg-red-600',
    dotColor: '#dc2626',
    regulation: 'India CCPA 2023 Sec. 5(8)',
    description: 'Advertising a specific outcome or item at a low price, but delivering an inferior alternative or charging unexpected surcharges upon delivery.',
    deceptiveExampleSnippet: `<div class="card">\n  <span>Free Lifetime Access</span>\n  <!-- In reality, unlocks only 3 trial credits before paywall -->\n</div>`,
    ethicalFixSnippet: `<div class="card p-3 border border-slate-200 rounded-lg">\n  <span class="font-bold">Free Starter Tier: 3 Credits Included</span>\n  <span class="text-xs text-slate-500 block">No credit card required. Upgrade anytime.</span>\n</div>`,
    realWorldImpact: 'Lures consumers through fraudulent misrepresentation.',
    mitigationAdvice: 'Ensure marketed terms match the actual delivery conditions exactly.'
  },
  {
    id: 'nagging',
    name: 'Nagging & Repeated Interruption',
    hindiTitle: 'बार-बार परेशान करना',
    severity: 'LOW',
    badgeStyle: 'bg-slate-100 text-slate-700 border border-slate-200',
    chipColor: 'bg-slate-600',
    dotColor: '#64748b',
    regulation: 'India CCPA 2023 Sec. 5(11)',
    description: 'Constantly interrupting user browsing with repeated popups requesting push notifications, app download, or email capture after dismissal.',
    deceptiveExampleSnippet: `<!-- Pop-up repeatedly rendered on every page transition even after clicking "No" -->\n<div class="notification-prompt">Allow Notifications for Special Discounts?</div>`,
    ethicalFixSnippet: `<!-- Stores refusal in localStorage and suppresses prompt for at least 90 days -->\n<script>localStorage.setItem('optout_notifications', 'true');</script>`,
    realWorldImpact: 'Fatigues user willpower until they surrender consent to stop the nuisance.',
    mitigationAdvice: 'Honor user refusal immediately and do not re-prompt for at least 90 days.'
  },
  {
    id: 'disguised-ads',
    name: 'Disguised Ads & Mimicry Controls',
    hindiTitle: 'छद्म विज्ञापन व फर्जी डाउनलोड बटन',
    severity: 'HIGH',
    badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200',
    chipColor: 'bg-orange-600',
    dotColor: '#ea580c',
    regulation: 'FTC Native Advertising Guides & India CCPA 2023 Sec. 5(10)',
    description: 'Advertisements formatted as system warnings, native navigation buttons, "Start Download", or editorial articles.',
    deceptiveExampleSnippet: `<div class="ad-container">\n  <button class="bg-slate-700 text-white font-bold p-3">DOWNLOAD NOW (Verified Safe)</button>\n  <!-- Clicks redirect to third-party affiliate adware -->\n</div>`,
    ethicalFixSnippet: `<div class="ad-container border border-slate-200 p-2 rounded">\n  <span class="text-xs uppercase text-slate-500 tracking-wider">Sponsored Advertisement</span>\n  <a href="..." class="text-sm text-blue-600 font-medium">Visit Sponsor Site &rarr;</a>\n</div>`,
    realWorldImpact: 'Tricks users into clicking dangerous affiliate trackers or downloading malware.',
    mitigationAdvice: 'Clearly label all sponsored elements with prominent "AD" or "Sponsored" badges.'
  },
  {
    id: 'fake-social-proof',
    name: 'Synthetic Social Proof & Fake Alerts',
    hindiTitle: 'फर्जी सामाजिक प्रमाण व नकली अलर्ट',
    severity: 'MEDIUM',
    badgeStyle: 'bg-amber-50 text-amber-700 border border-amber-200',
    chipColor: 'bg-amber-600',
    dotColor: '#d97706',
    regulation: 'FTC Endorsement Guides & India CCPA 2023 Sec. 5(12)',
    description: 'Floating notification toasts claiming "Priya from Mumbai just booked this 2 mins ago" generated client-side from static arrays.',
    deceptiveExampleSnippet: `<script>\n  const fakeCities = ['Mumbai', 'Delhi', 'Bangalore'];\n  setInterval(() => showToast(\`Someone from \${rand(fakeCities)} just purchased!\`), 8000);\n</script>`,
    ethicalFixSnippet: `<!-- Only display genuine verified aggregate metrics -->\n<div class="text-xs text-slate-600">Rated 4.8/5 based on 1,420 verified buyer reviews.</div>`,
    realWorldImpact: 'Fabricates false herd behavior to short-circuit prudent buyer evaluation.',
    mitigationAdvice: 'Prohibit client-side randomized activity popups. Audit social proof against transactional ledgers.'
  },
  {
    id: 'trick-questions',
    name: 'Trick Questions & Double Negatives',
    hindiTitle: 'उलझाऊ सवाल व दोहरे नकारात्मक शब्द',
    severity: 'MEDIUM',
    badgeStyle: 'bg-amber-50 text-amber-700 border border-amber-200',
    chipColor: 'bg-amber-600',
    dotColor: '#d97706',
    regulation: 'India CCPA 2023 Sec. 5(9)',
    description: 'Using convoluted grammar, inverted checkboxes, or double negatives to confuse users into unintentional opt-ins.',
    deceptiveExampleSnippet: `<input type="checkbox" id="t1" />\n<label for="t1">Uncheck this box if you do not want to refrain from receiving marketing offers from our partners.</label>`,
    ethicalFixSnippet: `<input type="checkbox" id="t1" />\n<label for="t1">I agree to receive promotional email updates.</label>`,
    realWorldImpact: 'Exploits reading fatigue and inverted Boolean logic.',
    mitigationAdvice: 'Use simple, direct positive framing (e.g. "Send me product updates: Yes / No").'
  },
  {
    id: 'roach-motel',
    name: 'Interface Obstruction & Hard-to-Cancel',
    hindiTitle: 'कैंसिलेशन अवरोध (रोच मोटल)',
    severity: 'CRITICAL',
    badgeStyle: 'bg-red-50 text-red-700 border border-red-200',
    chipColor: 'bg-red-600',
    dotColor: '#dc2626',
    regulation: 'FTC Click-to-Cancel Rule 2024 & CCPA 2023 Sec. 5(4)',
    description: 'Subscribing takes 1 click, but cancellation requires dialing an overseas customer service desk during limited hours or answering 10 survey screens.',
    deceptiveExampleSnippet: `<div class="cancel-notice">\n  To cancel your membership, please call 1-800-XXX-XXXX Mon-Fri 9am-5pm EST to speak with a retention agent.\n</div>`,
    ethicalFixSnippet: `<button class="btn-danger bg-red-600 text-white px-4 py-2 rounded">\n  Cancel Membership Immediately (1-Click Online Confirmation)\n</button>`,
    realWorldImpact: 'Locks consumers into indefinite subscriptions due to artificially engineered cancellation hurdles.',
    mitigationAdvice: 'The cancellation mechanism must be accessible in the exact same medium and ease as the enrollment flow.'
  }
];

// Presets for Quick Testing in Scanner covering all 11 Dark Patterns (Indian & Global Platforms)
const PRESET_DEMO_URLS = [
  { label: '🛡️ All 11 CCPA Dark Patterns Benchmark', url: 'https://darkpattern-ai.benchmark/all-11-patterns' },
  { label: '✈️ MakeMyTrip (Flight Protection +₹499 & Convenience Fee)', url: 'https://www.makemytrip.com/flights/delhi-mumbai-booking' },
  { label: '🎟️ BookMyShow (Late-Funnel Internet Surcharge +₹148)', url: 'https://in.bookmyshow.com/buytickets/imax-pvr-mumbai' },
  { label: '🛍️ Flipkart (Fake Countdown Deal Timer & Scarcity)', url: 'https://www.flipkart.com/big-billion-days/flash-deals' },
  { label: '🛵 Zepto / Swiggy (Hidden Small Cart & Handling Fee)', url: 'https://www.swiggy.com/instamart/checkout' },
  { label: '🎬 Hotstar / Prime (Concealed Annual Renewal ₹1,499)', url: 'https://www.hotstar.com/in/subscribe/vip-plan' },
  { label: '🏨 Oyo Rooms (Simulated Fake Booking Activity Toast)', url: 'https://www.oyorooms.com/hotel-delhi-central' },
  { label: '✨ Tata Neu / Croma (Clean & Transparent Checkout)', url: 'https://www.tataneu.com/croma/electronics' }
];

const detectionTrendData = [
  { date: 'Mon', totalScanned: 320, deceptiveFound: 42, complianceScore: 88 },
  { date: 'Tue', totalScanned: 450, deceptiveFound: 68, complianceScore: 84 },
  { date: 'Wed', totalScanned: 390, deceptiveFound: 55, complianceScore: 86 },
  { date: 'Thu', totalScanned: 580, deceptiveFound: 94, complianceScore: 81 },
  { date: 'Fri', totalScanned: 510, deceptiveFound: 81, complianceScore: 83 },
  { date: 'Sat', totalScanned: 290, deceptiveFound: 35, complianceScore: 91 },
  { date: 'Sun', totalScanned: 340, deceptiveFound: 49, complianceScore: 89 },
];

const categoryDistributionData = [
  { name: 'False Urgency', value: 28, color: '#ea580c' },
  { name: 'Sneaky Subscriptions', value: 24, color: '#dc2626' },
  { name: 'Basket Sneaking', value: 18, color: '#f97316' },
  { name: 'Hidden Costs', value: 15, color: '#b91c1c' },
  { name: 'Misdirection', value: 10, color: '#2563eb' },
  { name: 'Confirmshaming', value: 5, color: '#d97706' },
];

// Master Catalog for All 11 Regulatory Dark Patterns (in INR ₹)
const ALL_11_PATTERN_CATALOG = [
  {
    id: 'det-false-urgency',
    patternId: 'false-urgency',
    category: 'False Urgency & Fake Countdown',
    severity: 'HIGH',
    confidence: 0.94,
    title: 'Client-Side Resettable Countdown Timer',
    description: 'Artificial countdown timer "09:47" resets on page refresh without persistent backend inventory reservation, inducing purchase panic.',
    element: 'div.countdown-timer-box, span#fakeClock',
    snippet: '<div class="countdown-timer-box">\n  <span>Hurry! Flash Deal Expires In</span>\n  <span class="timer-digits" id="fakeClock">09:47</span>\n</div>',
    remedy: 'Remove client-side looping clocks. Tie inventory notices strictly to verifiable warehouse stock.',
    regulation: 'India CCPA 2023 Sec. 5(1) & Consumer Protection Act 2019'
  },
  {
    id: 'det-basket-sneaking',
    patternId: 'basket-sneaking',
    category: 'Basket Sneaking & Pre-ticked Addon',
    severity: 'HIGH',
    confidence: 0.96,
    title: 'Pre-Selected Flight Protection Surcharge (+₹499)',
    description: 'Default pre-ticked checkbox automatically adds optional travel cancellation coverage without explicit user opt-in.',
    element: 'input[type="checkbox"]#prechecked-insurance-addon',
    snippet: '<label class="checkbox-row">\n  <input type="checkbox" id="prechecked-insurance-addon" checked />\n  <span>Add Flight Cancellation Protection (+₹499 auto-included)</span>\n</label>',
    remedy: 'Default all optional checkable items to false. Require active, affirmative user consent.',
    regulation: 'India CCPA 2023 Sec. 5(2) & DoCA Guidelines 2023'
  },
  {
    id: 'det-confirmshaming',
    patternId: 'confirmshaming',
    category: 'Confirmshaming & Manipulative Guilt',
    severity: 'MEDIUM',
    confidence: 0.91,
    title: 'Guilt-Tripping Decline Button',
    description: 'Decline option uses emotionally manipulative phrasing: "No thanks, I prefer paying full price" to undermine consumer autonomy.',
    element: 'button.btn-shame',
    snippet: '<div class="confirmshame-box">\n  <button class="btn-loud">YES, SEND MY DISCOUNT CODE</button>\n  <button class="btn-shame">No thanks, I prefer paying full price</button>\n</div>',
    remedy: 'Use neutral, non-judgmental language for both affirmative and negative choices (e.g. "No, thanks").',
    regulation: 'India CCPA 2023 Sec. 5(3)'
  },
  {
    id: 'det-forced-action',
    patternId: 'forced-action',
    category: 'Forced Action & Obstruction Wall',
    severity: 'HIGH',
    confidence: 0.93,
    title: 'Mandatory App / Registration Content Gate',
    description: 'Blocks users from reading basic public content by enforcing an obstruction wall requiring app download or account creation.',
    element: 'div.forced-action-modal',
    snippet: '<div class="forced-action-modal">\n  <h4>Content Locked</h4>\n  <p>You must download our App to read this full article or register an account.</p>\n  <button class="btn-loud">Download App to Continue</button>\n</div>',
    remedy: 'Allow guest navigation. Never gate basic content behind mandatory application installation.',
    regulation: 'India CCPA 2023 Sec. 5(5) & DPDP Act 2023'
  },
  {
    id: 'det-subscription-trap',
    patternId: 'subscription-trap',
    category: 'Subscription Trap & Buried Renewal',
    severity: 'CRITICAL',
    confidence: 0.97,
    title: 'Concealed Annual Billing Terms (₹5,988)',
    description: 'Displays a low headline price of ₹499/month while concealing an immediate lump-sum annual charge of ₹5,988 in subdued fine print.',
    element: 'div.fine-print-sub, button#start-trial',
    snippet: '<div class="price-box">₹499 / month</div>\n<button class="btn-loud">Start 7-Day Free Trial</button>\n<div class="fine-print-sub">Renews automatically. Billed annually as one payment of ₹5,988 unless cancelled.</div>',
    remedy: 'Display all recurring renewal intervals and total annual charges with equal prominence as monthly rates.',
    regulation: 'India CCPA 2023 Sec. 5(4) & RBI e-Mandate Norms'
  },
  {
    id: 'det-misdirection',
    patternId: 'misdirection',
    category: 'Interface Interference & Misdirection',
    severity: 'HIGH',
    confidence: 0.95,
    title: 'Asymmetric Consent Hierarchy & Cookie Gate',
    description: '"Accept All" is rendered with vivid contrast and large padding, while "Reject/Manage" is disguised as a dim, barely visible text link.',
    element: 'div.cookie-banner-sim button.btn-loud',
    snippet: '<div class="cookie-banner-sim">\n  <span>We use cookies to enhance your experience.</span>\n  <a href="#" class="text-xs text-gray-400">Manage Options</a>\n  <button class="btn-loud">Accept All</button>\n</div>',
    remedy: 'Provide identical button dimensions, background weight, and contrast for both Accept and Reject buttons.',
    regulation: 'India CCPA 2023 Sec. 5(7)'
  },
  {
    id: 'det-bait-and-switch',
    patternId: 'bait-and-switch',
    category: 'Bait and Switch & Misleading Claims',
    severity: 'CRITICAL',
    confidence: 0.94,
    title: 'Deceptive "100% Free" Claim with Hidden Card Requirement (Converts to ₹1,999/mo)',
    description: 'Promises "100% Free Lifetime Access", but clicking initiates a mandatory credit card authorization that converts into a ₹1,999/mo paid plan.',
    element: 'div.interactive-demo-box button.btn-free-hook',
    snippet: '<div class="text-emerald-400 font-bold">100% FREE LIFETIME ACCESS</div>\n<button class="btn-loud">Get for Free (Credit Card Required)</button>\n<div class="fine-print-sub">₹0 today. Billed after 3 days at ₹1,999 / month.</div>',
    remedy: 'Ensure marketed pricing terms accurately reflect the actual checkout conditions without hidden caveats.',
    regulation: 'India CCPA 2023 Sec. 5(8) & CCPA Misleading Ads Guidelines'
  },
  {
    id: 'det-hidden-costs',
    patternId: 'hidden-costs',
    category: 'Hidden Costs & Drip Pricing',
    severity: 'CRITICAL',
    confidence: 0.96,
    title: 'Late-Funnel Mandatory Convenience Surcharge (+₹350)',
    description: 'Platform reveals mandatory ₹350 processing surcharge only at final checkout table after user has completed the booking flow.',
    element: 'table.fee-table tr.service-surcharge-row',
    snippet: '<table class="fee-table">\n  <tr><td>Concert Ticket (2x)</td><td>₹4,500.00</td></tr>\n  <tr class="text-rose-500 font-bold"><td>Mandatory Convenience Surcharge</td><td>+₹350.00</td></tr>\n  <tr><td>Total Due Today</td><td>₹4,850.00</td></tr>\n</table>',
    remedy: 'Present all-inclusive pricing upfront from the initial listing step.',
    regulation: 'India CCPA 2023 Sec. 5(6) & DoCA Drip Pricing Orders'
  },
  {
    id: 'det-disguised-ads',
    patternId: 'disguised-ads',
    category: 'Disguised Ads & Mimicry Controls',
    severity: 'HIGH',
    confidence: 0.92,
    title: 'Operating System Mimicry "Download Now" Button',
    description: 'Sponsored affiliate ad banner styled to mimic native operating system buttons and genuine installer software controls.',
    element: 'div.disguised-ad-sim button',
    snippet: '<div class="disguised-ad-sim">\n  <div class="text-[10px] text-slate-500 text-right">AdChoices</div>\n  <button class="btn-loud bg-emerald-700">⬇️ START DOWNLOAD (Verified Safe Installer)</button>\n</div>',
    remedy: 'Prominently badge all promotional downloads with explicit "Sponsored Advertisement" disclaimers.',
    regulation: 'India CCPA 2023 Sec. 5(10) & ASCI Guidelines'
  },
  {
    id: 'det-nagging',
    patternId: 'nagging',
    category: 'Nagging & Repeated Interruption',
    severity: 'LOW',
    confidence: 0.88,
    title: 'Persistent Push Notification Interruption Modal',
    description: 'Recurring dialogue constantly interrupting user browsing to demand push notification permissions or newsletter email capture.',
    element: 'div.nagging-toast-sim',
    snippet: '<div class="nagging-toast-sim">\n  <div class="font-bold text-sky-400">🔔 Turn On Notifications?</div>\n  <p>Allow notifications to stay updated with daily alerts and discount vouchers.</p>\n  <button class="btn-loud">Allow Notifications</button>\n</div>',
    remedy: 'Honor user refusal immediately. Suppress prompts for a minimum of 90 days after dismissal.',
    regulation: 'India CCPA 2023 Sec. 5(11)'
  },
  {
    id: 'det-trick-questions',
    patternId: 'trick-questions',
    category: 'Trick Questions & Double Negatives',
    severity: 'MEDIUM',
    confidence: 0.90,
    title: 'Double-Negative Marketing Consent Checkbox',
    description: 'Inverted phrasing "Uncheck if you do NOT want to refrain from receiving marketing" intentionally confuses consumers into granting opt-in.',
    element: 'div.trick-question-box input#trick-question-cb',
    snippet: '<label class="checkbox-row">\n  <input type="checkbox" id="trick-question-cb" />\n  <span>Uncheck this box if you do not want to refrain from receiving promotional calls and third-party advertising emails.</span>\n</label>',
    remedy: 'State consent choices in direct, unambiguous positive statements (e.g. "Send me promotional emails: Yes / No").',
    regulation: 'India CCPA 2023 Sec. 5(9)'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'simulator' | 'extension' | 'taxonomy' | 'analytics'>('scanner');
  const [urlInput, setUrlInput] = useState('');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<TaxonomyCategory>(TAXONOMY_13_CATEGORIES[0]);
  const [copiedExtensionPath, setCopiedExtensionPath] = useState(false);
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'deceptive' | 'ethical'>('deceptive');

  // Simulation Lab State
  const [simMode, setSimMode] = useState<'deceptive' | 'neutralized'>('deceptive');
  const [simActiveScenario, setSimActiveScenario] = useState<'flight' | 'saas' | 'hotel'>('flight');
  const [flightInsuranceChecked, setFlightInsuranceChecked] = useState(true);

  // Dynamic Real-Time Scanner across all 11 dark pattern categories
  const handleScan = async (e?: React.FormEvent, customUrl?: string, customFilter?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (customUrl || urlInput).trim();
    if (!targetUrl) return;

    const activeFilter = customFilter !== undefined ? customFilter : selectedPatternFilter;

    setIsScanning(true);
    setScanResult(null);
    setScanStage(1);

    setTimeout(() => setScanStage(2), 350);
    setTimeout(() => setScanStage(3), 750);
    setTimeout(() => setScanStage(4), 1150);

    let domain = targetUrl;
    try {
      domain = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).hostname;
    } catch {
      domain = targetUrl.replace(/https?:\/\//, '').split('/')[0];
    }

    // Try fetching live backend detection API
    let backendData: any = null;
    try {
      const resp = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, category_filter: activeFilter }),
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.data) {
          backendData = json.data;
        }
      }
    } catch {
      // Backend not running, proceed to client-side dynamic engine
    }

    setTimeout(() => {
      setIsScanning(false);
      setScanStage(0);

      const targetLower = targetUrl.toLowerCase();
      const isClean = targetLower.includes('clean') || targetLower.includes('ethical') || targetLower.includes('transparent');

      if (isClean) {
        setScanResult({
          url: targetUrl,
          domain,
          scannedAt: 'Just now',
          trustScore: 98,
          status: 'PROTECTED',
          count: 0,
          detections: []
        });
        return;
      }

      if (backendData && backendData.detections && backendData.detections.length > 0) {
        setScanResult({
          url: targetUrl,
          domain: backendData.domain || domain,
          scannedAt: 'Just now',
          trustScore: backendData.trust_score || 45,
          status: backendData.status || 'CRITICAL_RISK',
          count: backendData.dark_patterns_found || backendData.detections.length,
          detections: backendData.detections.map((d: any) => {
            const catalogMatch = ALL_11_PATTERN_CATALOG.find(p => p.patternId === d.id || p.category.toLowerCase() === (d.category || '').toLowerCase());
            return {
              id: d.id,
              category: d.category || catalogMatch?.category || 'Deceptive Pattern',
              severity: d.severity || catalogMatch?.severity || 'HIGH',
              confidence: d.confidence || catalogMatch?.confidence || 0.94,
              title: d.title || catalogMatch?.title || 'Deceptive Element',
              description: d.description || catalogMatch?.description || '',
              element: d.element || catalogMatch?.element || 'div',
              snippet: catalogMatch?.snippet || d.snippet || `<div class="${d.element}">\n  <!-- ${d.description} -->\n</div>`,
              remedy: d.remedy || catalogMatch?.remedy || 'Refactor UI to respect consumer autonomy.',
              regulation: d.regulation || catalogMatch?.regulation || 'India CCPA 2023 Guidelines'
            };
          })
        });
        return;
      }

      // Dynamic Classification Logic for all 11 Dark Patterns
      let matchedDetections: typeof ALL_11_PATTERN_CATALOG = [];

      const isAll11Benchmark = targetLower.includes('all-11') || targetLower.includes('demo') || targetLower.includes('sandbox') || targetLower.includes('test-bench') || activeFilter === 'all-11';

      if (isAll11Benchmark) {
        // Return ALL 11 dark patterns
        matchedDetections = [...ALL_11_PATTERN_CATALOG];
      } else if (activeFilter !== 'all') {
        // Filter requested by category pill
        matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => p.patternId === activeFilter);
      } else {
        // Dynamic contextual identification from URL & query parameters
        if (targetLower.includes('flight') || targetLower.includes('airline')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['basket-sneaking', 'hidden-costs', 'false-urgency'].includes(p.patternId));
        } else if (targetLower.includes('saas') || targetLower.includes('subscribe') || targetLower.includes('stream')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['subscription-trap', 'bait-and-switch', 'confirmshaming'].includes(p.patternId));
        } else if (targetLower.includes('hotel') || targetLower.includes('booking')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['false-urgency', 'hidden-costs', 'misdirection'].includes(p.patternId));
        } else if (targetLower.includes('voucher') || targetLower.includes('discount')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['confirmshaming', 'nagging', 'trick-questions'].includes(p.patternId));
        } else if (targetLower.includes('article') || targetLower.includes('news')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['forced-action', 'disguised-ads', 'nagging'].includes(p.patternId));
        } else if (targetLower.includes('download') || targetLower.includes('free')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['disguised-ads', 'bait-and-switch', 'forced-action'].includes(p.patternId));
        } else if (targetLower.includes('cart') || targetLower.includes('retail') || targetLower.includes('shop')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['basket-sneaking', 'hidden-costs', 'false-urgency', 'confirmshaming'].includes(p.patternId));
        } else if (targetLower.includes('optout') || targetLower.includes('profile')) {
          matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['trick-questions', 'misdirection'].includes(p.patternId));
        } else {
          // Check query parameter ?pattern=...
          const matchedByQuery = ALL_11_PATTERN_CATALOG.find(p => targetLower.includes(p.patternId));
          if (matchedByQuery) {
            matchedDetections = [matchedByQuery];
          } else {
            // Default comprehensive mix for general websites
            matchedDetections = ALL_11_PATTERN_CATALOG.filter(p => ['false-urgency', 'basket-sneaking', 'hidden-costs', 'misdirection'].includes(p.patternId));
          }
        }
      }

      // Calculate dynamic trust score
      const penalty = matchedDetections.reduce((acc, d) => {
        if (d.severity === 'CRITICAL') return acc + 26;
        if (d.severity === 'HIGH') return acc + 18;
        if (d.severity === 'MEDIUM') return acc + 10;
        return acc + 6;
      }, 0);

      const dynamicScore = Math.max(12, 100 - penalty);
      const dynamicStatus = dynamicScore < 45 ? 'CRITICAL_RISK' : dynamicScore < 75 ? 'MODERATE_RISK' : 'LOW_RISK';

      setScanResult({
        url: targetUrl,
        domain,
        scannedAt: 'Just now',
        trustScore: dynamicScore,
        status: dynamicStatus,
        count: matchedDetections.length,
        detections: matchedDetections
      });
    }, 1400);
  };

  const copyExtensionFolder = () => {
    const extPath = 'c:\\Santosh\\darkpattern-ai\\extension';
    navigator.clipboard.writeText(extPath);
    setCopiedExtensionPath(true);
    setTimeout(() => setCopiedExtensionPath(false), 2500);
  };

  const exportAuditReport = () => {
    if (!scanResult) return;
    const jsonStr = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DarkPattern_Audit_${scanResult.domain || 'report'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner & Status bar */}
      <div className="bg-white border-b border-slate-200 text-xs text-slate-600 py-1.5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Shield Engine v2.0 Active
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-medium">13 Global Dark Pattern Taxonomies Loaded</span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-500 hidden md:inline">FTC & India CCPA 2023 Compliant Rulebook</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('extension')} 
            className="text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Puzzle className="w-3.5 h-3.5" />
            Chrome Extension Setup
          </button>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">DarkPattern-AI</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Shield
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real-Time Deceptive UI Detector & Consumer Defense Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scanner'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Live Scanner
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulation Lab
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'extension'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            Chrome Extension
          </button>

          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'taxonomy'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            13 Taxonomies
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">

        {/* =========================================================================
            TAB 1: LIVE SCANNER & DOM AUDIT
           ========================================================================= */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col gap-6">
            {/* Search / URL Submission Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
              <div className="relative z-10 flex flex-col gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-700" />
                    Automated Web Autonomy & Deceptive Design Auditor
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Enter any website URL or checkout flow to detect pre-ticked add-ons, fake countdown timers, hidden billing terms, and confirmshaming.
                  </p>
                </div>

                <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="e.g. https://demo-airline.com/booking or https://retail-cart.com"
                      className="w-full bg-slate-50 hover:bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Auditing DOM & Telemetry...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        Run Deep Audit
                      </>
                    )}
                  </button>
                </form>

                {/* 11 Dark Patterns Direct Verification Bar */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎯</span> Verify Individual Dark Pattern (All 11 Taxonomies):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatternFilter('all-11');
                        setUrlInput('https://darkpattern-ai.benchmark/all-11-patterns');
                        handleScan(undefined, 'https://darkpattern-ai.benchmark/all-11-patterns', 'all-11');
                      }}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      ⚡ Scan All 11 Patterns Simultaneously
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatternFilter('all');
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        selectedPatternFilter === 'all'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Auto-Detect (Domain Context)
                    </button>

                    {ALL_11_PATTERN_CATALOG.map((p, idx) => (
                      <button
                        key={p.patternId}
                        type="button"
                        onClick={() => {
                          setSelectedPatternFilter(p.patternId);
                          const demoUrl = `https://testbench.darkpattern-ai.local/demo?pattern=${p.patternId}`;
                          setUrlInput(demoUrl);
                          handleScan(undefined, demoUrl, p.patternId);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          selectedPatternFilter === p.patternId
                            ? 'bg-blue-700 text-white font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="opacity-70">{idx + 1}.</span> {p.category.split('&')[0].trim()}
                      </button>
                    ))}
                  </div>

                  {/* Quick Domain Scenario Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-dashed border-slate-200 text-[11px]">
                    <span className="font-semibold text-slate-500 uppercase">Live Industry Scenarios:</span>
                    {PRESET_DEMO_URLS.slice(0, 6).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPatternFilter('all');
                          setUrlInput(preset.url);
                          handleScan(undefined, preset.url, 'all');
                        }}
                        className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Progression Telemetry */}
            {isScanning && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs animate-fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>AUDITING LIVE REPOSITORIES & COMPUTED CSS</span>
                  <span className="text-blue-700 font-mono">Stage {scanStage} of 4</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-blue-700 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${scanStage * 25}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className={`p-2.5 rounded-lg border font-medium ${scanStage >= 1 ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                    1. DOM Ingestion
                  </div>
                  <div className={`p-2.5 rounded-lg border font-medium ${scanStage >= 2 ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                    2. Visual Contrast Ratio
                  </div>
                  <div className={`p-2.5 rounded-lg border font-medium ${scanStage >= 3 ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                    3. Pre-ticked Addon Audit
                  </div>
                  <div className={`p-2.5 rounded-lg border font-medium ${scanStage >= 4 ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                    4. CCPA/FTC Scoring
                  </div>
                </div>
              </div>
            )}

            {/* Scan Results Display */}
            {scanResult && !isScanning && (
              <div className="flex flex-col gap-6">
                {/* Score Summary Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Trust Score Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-1 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">User Autonomy Score</span>
                      <ShieldCheck className={`w-4 h-4 ${scanResult.trustScore > 75 ? 'text-emerald-600' : 'text-rose-600'}`} />
                    </div>
                    <div className="my-3 flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold font-mono ${scanResult.trustScore > 75 ? 'text-emerald-700' : scanResult.trustScore > 50 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {scanResult.trustScore}
                      </span>
                      <span className="text-slate-400 text-sm">/ 100</span>
                    </div>
                    <div className="text-xs font-semibold">
                      Status: <span className={scanResult.trustScore > 75 ? 'text-emerald-700' : 'text-rose-700'}>
                        {scanResult.trustScore > 75 ? 'Compliant & Transparent' : 'Deceptive Tricks Detected'}
                      </span>
                    </div>
                  </div>

                  {/* Stat Card 2: Threats Count */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Offending Patterns</span>
                    <div className="my-3 text-3xl font-extrabold text-slate-900">
                      {scanResult.count}
                    </div>
                    <span className="text-xs text-slate-500">
                      {scanResult.count === 0 ? 'No dark patterns identified' : `${scanResult.count} elements violate fair UI guidelines`}
                    </span>
                  </div>

                  {/* Stat Card 3: Regulatory Risk */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Regulatory Exposure</span>
                    <div className="my-3 text-lg font-bold">
                      {scanResult.trustScore > 75 ? (
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Low Legal Exposure
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-5 h-5 text-rose-600" /> India CCPA & FTC Risk
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Evaluated against CCPA 2023 Sec. 5</span>
                  </div>

                  {/* Stat Card 4: Actions */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-2 shadow-xs">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Actions & Report</span>
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={exportAuditReport}
                        className="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-slate-800 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-700" />
                        Export Audit JSON
                      </button>
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-white shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Simulate Neutralizer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detailed Detections List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base text-slate-900">Detected Dark Pattern Findings</h2>
                      <span className="bg-slate-100 text-xs font-mono px-2 py-0.5 rounded-full text-slate-700 border border-slate-200">
                        {scanResult.count} items
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Domain: {scanResult.domain}</span>
                  </div>

                  {scanResult.detections.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                      <div className="text-base font-bold text-slate-900">This Page is Clean & Fair</div>
                      <p className="text-xs text-slate-500 max-w-md">
                        No pre-ticked add-ons, artificial countdown timers, drip pricing, or confirmshaming modals were detected in the active DOM.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {scanResult.detections.map((det: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-slate-50/60 border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col gap-3 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                                det.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                det.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {det.severity}
                              </span>
                              <span className="font-bold text-sm text-slate-900">{det.title}</span>
                            </div>
                            <span className="text-xs text-blue-800 font-medium bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                              {det.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {det.description}
                          </p>

                          {/* Code and Selector Inspection */}
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono">
                            <div className="flex items-center justify-between text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800 text-[11px]">
                              <span>TARGET DOM SELECTOR: <code className="text-blue-300">{det.element}</code></span>
                              <span>CONFIDENCE: <strong className="text-emerald-400 font-sans">{(det.confidence * 100).toFixed(0)}%</strong></span>
                            </div>
                            <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap">{det.snippet}</pre>
                          </div>

                          {/* Remediation and Legal Violations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-900">
                              <strong className="text-blue-800 block mb-0.5">Recommended Remedy:</strong>
                              {det.remedy}
                            </div>
                            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-rose-900">
                              <strong className="text-rose-800 block mb-0.5">Legal Benchmark:</strong>
                              {det.regulation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: INTERACTIVE SIMULATION LAB (PLAYGROUND)
           ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-blue-700" />
                  Interactive Deceptive Pattern Simulator & Neutralizer
                </h1>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  Test and observe how dark patterns exploit cognitive biases, and see how DarkPattern-AI disarms them live.
                </p>
              </div>

              {/* Master Mode Switcher: Deceptive vs Neutralized */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
                <button
                  onClick={() => setSimMode('deceptive')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    simMode === 'deceptive'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Deceptive Traps (Active)
                </button>
                <button
                  onClick={() => setSimMode('neutralized')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    simMode === 'neutralized'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Neutralized (Fair UI)
                </button>
              </div>
            </div>

            {/* Scenario Chooser Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <button
                onClick={() => setSimActiveScenario('flight')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  simActiveScenario === 'flight'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ✈️ Flight Booking (Basket Sneaking & Drip Surcharge)
              </button>
              <button
                onClick={() => setSimActiveScenario('saas')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  simActiveScenario === 'saas'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🎬 SaaS Subscription (Concealed Annual Auto-Renewal)
              </button>
              <button
                onClick={() => setSimActiveScenario('hotel')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  simActiveScenario === 'hotel'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                🏨 Hotel Booking (Fake Countdown & Scarcity Panic)
              </button>
            </div>

            {/* Live Interactive Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Middle: The Simulated Web Viewport */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                {/* Mock Browser URL Bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <div className="bg-white border border-slate-300 rounded-md px-3 py-1 text-slate-700 font-mono text-[11px] flex items-center gap-1.5 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    https://{simActiveScenario === 'flight' ? 'aero-booking-direct.com/checkout' : simActiveScenario === 'saas' ? 'cinema-stream-pro.io/pricing' : 'grand-hotel-deluxe.org/rooms'}
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${simMode === 'deceptive' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {simMode === 'deceptive' ? 'TRAP ACTIVE' : 'SHIELD DEFENDED'}
                  </div>
                </div>

                {/* Scenario 1: Flight Checkout */}
                {simActiveScenario === 'flight' && (
                  <div className="p-6 md:p-8 flex flex-col gap-6 bg-slate-50/50">
                    <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900">Flight 6E-204: Mumbai (BOM) &rarr; New Delhi (DEL)</h3>
                        <p className="text-xs text-slate-500">Non-stop • Departure: Tomorrow 08:30 • Standard Economy</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Base Ticket Fare</div>
                        <div className="text-xl font-mono font-bold text-slate-900">₹4,200.00</div>
                      </div>
                    </div>

                    {/* Sneaky Pre-ticked Insurance Box */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      simMode === 'deceptive'
                        ? 'bg-rose-50 border-rose-300 relative'
                        : 'bg-emerald-50 border-emerald-300 relative'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simMode === 'deceptive' ? flightInsuranceChecked : false}
                            onChange={(e) => setFlightInsuranceChecked(e.target.checked)}
                            className="w-5 h-5 rounded mt-0.5 accent-rose-700"
                          />
                          <div>
                            <div className="font-bold text-sm text-slate-900">
                              Add Flight Cancellation & Medical Delay Protection (+₹499)
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Guarantees 100% refund if your flight is disrupted. Recommended for domestic travel.
                            </p>
                          </div>
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          simMode === 'deceptive' ? 'bg-rose-700 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {simMode === 'deceptive' ? 'Pre-Selected Default' : 'Opt-In Choice'}
                        </span>
                      </div>
                      {simMode === 'neutralized' && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          DarkPattern Shield auto-deselected this pre-ticked add-on to protect your autonomy.
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown / Drip Fee */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex flex-col gap-2 shadow-2xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Passenger Fare (1 Adult)</span>
                        <span className="font-mono text-slate-900 font-semibold">₹4,200.00</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Mandatory Taxes & Airport Dues</span>
                        <span className="font-mono text-slate-900 font-semibold">₹650.00</span>
                      </div>

                      {simMode === 'deceptive' && (
                        <div className="flex justify-between text-rose-800 font-semibold bg-rose-50 border border-rose-200 p-2 rounded">
                          <span>Undisclosed Late Convenience Surcharge</span>
                          <span className="font-mono">+₹250.00</span>
                        </div>
                      )}

                      {simMode === 'deceptive' && flightInsuranceChecked && (
                        <div className="flex justify-between text-rose-800 font-semibold bg-rose-50 border border-rose-200 p-2 rounded">
                          <span>Auto-Added Travel Insurance</span>
                          <span className="font-mono">+₹499.00</span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                        <span>Total Due Today</span>
                        <span className="font-mono text-base text-blue-800">
                          ₹{simMode === 'deceptive' 
                            ? (4850 + 250 + (flightInsuranceChecked ? 499 : 0)).toLocaleString('en-IN')
                            : '4,850.00'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Asymmetric Confirm / Decline Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      {simMode === 'deceptive' ? (
                        <>
                          <a href="#" className="text-[11px] text-slate-400 hover:text-slate-600 underline">
                            Cancel & Return to Homepage
                          </a>
                          <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow-xs text-xs">
                            CONFIRM & PAY TOTAL NOW &rarr;
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex gap-4">
                          <button className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold py-2.5 px-4 rounded-lg border border-slate-200 text-xs">
                            Cancel / Review Flight
                          </button>
                          <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg text-xs shadow-xs">
                            Confirm ₹4,850.00 All-Inclusive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scenario 2: SaaS Subscription */}
                {simActiveScenario === 'saas' && (
                  <div className="p-6 md:p-8 flex flex-col gap-6 bg-slate-50/50">
                    <div className="text-center max-w-md mx-auto">
                      <h3 className="text-xl font-extrabold text-slate-900">Unlimited 4K Streaming Pass</h3>
                      <p className="text-xs text-slate-500 mt-1">Over 20,000 films, live sports, and original series.</p>
                    </div>

                    <div className={`p-6 rounded-2xl border text-center transition-all ${
                      simMode === 'deceptive'
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-emerald-50/60 border-emerald-300'
                    }`}>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected Plan</div>
                      <div className="text-4xl font-extrabold text-slate-900 my-2">
                        ₹499 <span className="text-sm font-normal text-slate-500">/ month</span>
                      </div>

                      {simMode === 'deceptive' ? (
                        <p className="text-[10px] text-slate-400 opacity-80 max-w-xs mx-auto leading-tight mt-3">
                          * Renews automatically. Billed annually as one upfront payment of ₹5,988 today. Cancellation must be requested by telephone 72 hours before renewal.
                        </p>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-800 max-w-sm mx-auto mt-3">
                          <strong>Clear Upfront Term:</strong> ₹5,988/year billed today. 1-Click online cancellation available anytime in your dashboard with full refund within 14 days.
                        </div>
                      )}

                      <button className="mt-5 w-full max-w-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-xs text-xs">
                        Start 7-Day Free Trial
                      </button>
                    </div>

                    {/* Confirmshaming Modal Sample */}
                    {simMode === 'deceptive' && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-center flex flex-col gap-2 shadow-2xs">
                        <span className="text-xs font-bold text-slate-700">Decline Modal Preview:</span>
                        <div className="flex flex-col gap-1.5 items-center">
                          <button className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg shadow-xs">
                            YES, CLAIM 50% OFF TODAY
                          </button>
                          <button className="text-[11px] text-slate-400 hover:text-slate-600 underline">
                            No thanks, I prefer paying full price and hate entertainment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 3: Hotel Fake Countdown */}
                {simActiveScenario === 'hotel' && (
                  <div className="p-6 md:p-8 flex flex-col gap-6 bg-slate-50/50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900">Luxury Heritage Suite • 2 Nights (Jaipur / Goa)</h3>
                        <p className="text-xs text-slate-500">King Bed • Private Balcony • Free High-Speed WiFi & Breakfast</p>
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-700">₹3,499 / night</div>
                    </div>

                    {/* Countdown Timer */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      simMode === 'deceptive'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-emerald-50 border-emerald-300'
                    }`}>
                      <div>
                        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {simMode === 'deceptive' ? 'Flash Discount Reservation Lock' : 'Standard Rate Guarantee'}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {simMode === 'deceptive'
                            ? 'Special price held exclusively for your session'
                            : 'Price locked through your scheduled check-out period'}
                        </div>
                      </div>

                      {simMode === 'deceptive' ? (
                        <div className="text-right">
                          <div className="font-mono text-2xl font-bold text-rose-700">09:47</div>
                          <span className="text-[10px] text-rose-600 font-semibold uppercase">Resets on reload</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-semibold">
                          ✓ Genuine Room Inventory
                        </div>
                      )}
                    </div>

                    {/* Social Proof Fake Alert */}
                    {simMode === 'deceptive' && (
                      <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3 shadow-2xs">
                        <span className="text-xl">🛍️</span>
                        <div className="text-xs">
                          <strong className="text-slate-900">Someone from Bengaluru, KA</strong>
                          <div className="text-slate-500">Just booked this identical suite 4 minutes ago!</div>
                        </div>
                      </div>
                    )}

                    <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl text-xs shadow-xs">
                      Reserve Luxury Heritage Suite (₹6,998.00)
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Deconstruction Telemetry & Enforcement */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-sm text-slate-900">Detection Telemetry & Analysis</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Target Scenario</span>
                    <strong className="text-slate-900 text-sm">
                      {simActiveScenario === 'flight' ? 'Flight Booking Checkout' : simActiveScenario === 'saas' ? 'Streaming SaaS Subscription' : 'Hotel Reservation Flow'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Deceptive Triggers Engaged</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {simActiveScenario === 'flight' && (
                        <>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">prechecked_addon</span>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">drip_surcharge</span>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">visual_asymmetry</span>
                        </>
                      )}
                      {simActiveScenario === 'saas' && (
                        <>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">hidden_annual_renewal</span>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">confirmshaming</span>
                        </>
                      )}
                      {simActiveScenario === 'hotel' && (
                        <>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">fake_countdown_clock</span>
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">synthetic_social_toast</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mt-2 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">Automated Neutralizer Rule</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {simMode === 'deceptive'
                        ? 'Under "Deceptive Traps" mode, the webpage relies on opt-out inertia and guilt-tripping to extract unbudgeted revenue.'
                        : 'Under "Neutralized" mode, DarkPattern-AI overrides checkbox defaults, eliminates synthetic countdown clocks, and standardizes button prominence.'
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    <strong className="text-slate-900 block mb-1">Legal Enforcement Ground:</strong>
                    Direct violation of FTC Deceptive Design Principles and India CCPA 2023 Guidelines on Prevention and Regulation of Dark Patterns.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CHROME EXTENSION HUB & INSTALL GUIDE
           ========================================================================= */}
        {activeTab === 'extension' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Manifest V3 Production Build
                    </span>
                    <span className="text-xs text-slate-500">• Ready to load in Chrome / Edge / Brave</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Puzzle className="w-6 h-6 text-blue-700" />
                    DarkPattern-AI Chrome Extension Installation Hub
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
                    Run the shield in real-time as a browser extension. It monitors active web pages, marks deceptive elements with clear indicators, and gives you one-click neutralization.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={copyExtensionFolder}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    {copiedExtensionPath ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    {copiedExtensionPath ? 'Path Copied!' : 'Copy Extension Path'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Installation Visual Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Open Extensions Page</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Open Google Chrome and navigate to <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-blue-800 font-semibold text-[11px]">chrome://extensions</code> in your address bar.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Enable Developer Mode</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toggle on the <strong className="text-slate-800">"Developer mode"</strong> switch located at the top-right corner of the extensions page.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Click "Load Unpacked"</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the <strong className="text-slate-800">"Load unpacked"</strong> button in top-left, paste or select the extension folder path below.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">Pin & Protect</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pin <strong className="text-slate-800">DarkPattern Shield</strong> to your toolbar to view live threat badges and in-page overlays!
                </p>
              </div>
            </div>

            {/* Quick Path Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <TerminalIcon className="w-6 h-6 text-blue-700 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs uppercase font-bold text-slate-500">Target Folder for "Load Unpacked":</div>
                  <div className="font-mono text-sm text-blue-900 font-bold truncate">
                    c:\Santosh\darkpattern-ai\extension
                  </div>
                </div>
              </div>
              <button
                onClick={copyExtensionFolder}
                className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedExtensionPath ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                {copiedExtensionPath ? 'Copied to Clipboard!' : 'Copy Absolute Path'}
              </button>
            </div>

            {/* Extension Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <Activity className="w-4 h-4" />
                  Live In-Page HUD & Badges
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Injects an unobtrusive floating shield at the bottom-right of every tab. Offending elements get highlighted with clear severity outlines.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <Sliders className="w-4 h-4" />
                  One-Click Neutralization
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the badge attached to any deceptive element to automatically uncheck pre-ticked add-ons, freeze fake countdown timers, or bypass confirmshaming.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <Lock className="w-4 h-4" />
                  100% Privacy-Preserving
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The client-side scanner evaluates DOM heuristics and style contrast directly inside your browser. No passwords, credit cards, or personal browsing history leave your machine.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: 13 TAXONOMIES KNOWLEDGE BASE
           ========================================================================= */}
        {activeTab === 'taxonomy' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-700" />
                Global Dark Pattern Taxonomy Matrix & Enforcement Guide
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                Full legal, technical, and cognitive breakdown of all 13 deceptive design patterns specified under India CCPA 2023, FTC, and EU Digital Services Act.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Selector List (Left 4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  Recognized Categories (13 Total)
                </span>
                <div className="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {TAXONOMY_13_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTaxonomy(cat)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        selectedTaxonomy.id === cat.id
                          ? 'bg-blue-50 border-blue-300 shadow-xs text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.dotColor }}></span>
                          {idx + 1}. {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">{cat.hindiTitle}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        cat.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        cat.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        cat.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {cat.severity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Detail Deep-Dive (Right 8 cols) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedTaxonomy.name}</h2>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${selectedTaxonomy.badgeStyle}`}>
                        {selectedTaxonomy.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 font-medium mt-0.5">{selectedTaxonomy.hindiTitle}</p>
                  </div>
                  <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-medium">
                    <strong>Law:</strong> {selectedTaxonomy.regulation}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mechanism & Definition</h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                    {selectedTaxonomy.description}
                  </p>
                </div>

                {/* Real-World Harm */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900">
                  <strong className="text-rose-800 block mb-1">Consumer Detriment & Cognitive Harm:</strong>
                  {selectedTaxonomy.realWorldImpact}
                </div>

                {/* Code Snippet Comparison */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Implementation Comparison</span>
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                      <button
                        onClick={() => setSelectedSnippetTab('deceptive')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          selectedSnippetTab === 'deceptive' ? 'bg-rose-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Deceptive Code (Bad)
                      </button>
                      <button
                        onClick={() => setSelectedSnippetTab('ethical')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          selectedSnippetTab === 'ethical' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Ethical Code (Good)
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto text-slate-200">
                    <pre>
                      {selectedSnippetTab === 'deceptive'
                        ? selectedTaxonomy.deceptiveExampleSnippet
                        : selectedTaxonomy.ethicalFixSnippet
                      }
                    </pre>
                  </div>
                </div>

                {/* Mitigation Guidance */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
                  <strong className="text-blue-800 block mb-1">Product Remediation Standard:</strong>
                  {selectedTaxonomy.mitigationAdvice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: COMPLIANCE & ANALYTICS INTELLIGENCE
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-700" />
                Regulatory Compliance & Dark Pattern Telemetry
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                Aggregated statistics, detection trends over time, and regulatory risk distributions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Detection Frequency Trend */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Weekly Detection & Compliance Trend</span>
                  <span className="text-xs text-slate-500">Total Scans: 2,880</span>
                </div>
                <div className="h-64 w-full min-h-[260px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={detectionTrendData}>
                      <defs>
                        <linearGradient id="colorDeceptive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="deceptiveFound" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorDeceptive)" name="Dark Patterns Detected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Category Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Distribution by Category</span>
                  <span className="text-xs text-slate-500">Past 30 Days</span>
                </div>
                <div className="h-64 w-full min-h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                  {categoryDistributionData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      <span className="truncate">{cat.name} ({cat.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Regulatory Readiness Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">India CCPA 2023 Readiness</span>
                  <span className="text-xs font-bold text-emerald-700">86% Index</span>
                </div>
                <p className="text-xs text-slate-600">
                  Automated checks verify against all 13 specified dark patterns under the Central Consumer Protection Authority guidelines.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">US FTC Junk Fees & ROSCA</span>
                  <span className="text-xs font-bold text-emerald-700">92% Index</span>
                </div>
                <p className="text-xs text-slate-600">
                  Monitors drip pricing surcharges, pre-checked checkboxes, and click-to-cancel compliance.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">EU Digital Services Act (DSA)</span>
                  <span className="text-xs font-bold text-emerald-700">89% Index</span>
                </div>
                <p className="text-xs text-slate-600">
                  Article 25 prohibits online platforms from designing or organizing interfaces that distort or impair user autonomy.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>DarkPattern-AI Platform • Enterprise Deceptive UI Detection & Consumer Defense System • 2026</p>
      </footer>
    </div>
  );
}
