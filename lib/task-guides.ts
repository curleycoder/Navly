/**
 * Rich guide content for each default task.
 * Shown on the /dashboard/tasks/[id] sub-page.
 */

export type ServiceOption = {
  name: string
  tag?: string          // e.g. "Best for newcomers", "Budget pick"
  description: string
  url: string
  type: 'official' | 'recommended' | 'budget'
}

export type TaskStep = {
  title: string
  detail: string
}

export type ProvinceInfo = {
  provinces: string[]   // e.g. ['ON'] or ['ON', 'BC']
  label: string
  info: string
  url?: string
}

export type TaskGuide = {
  taskId: string
  overview: string
  timeEstimate?: string
  steps: TaskStep[]
  services?: ServiceOption[]
  provinceInfo?: ProvinceInfo[]
  findNearbyUrl?: string
  findNearbyLabel?: string
  tips?: string[]
}

export const TASK_GUIDES: Record<string, TaskGuide> = {

  'task-sin': {
    taskId: 'task-sin',
    overview: 'Your Social Insurance Number (SIN) is a 9-digit number issued by the Government of Canada. You need it to work legally in Canada, file taxes, and access government programs like Employment Insurance and the Canada Pension Plan.',
    timeEstimate: 'Same day in person · 10–20 business days by mail · 5–10 days online',
    steps: [
      { title: 'Gather your documents', detail: 'Primary document: valid passport. Secondary: your work permit, study permit, or PR card. You need originals — photocopies are not accepted.' },
      { title: 'Choose your application method', detail: 'In person at a Service Canada office is fastest — you get your SIN the same day. Online is available for eligible applicants. Mail takes 10–20 business days.' },
      { title: 'Find your nearest Service Canada office', detail: 'Use the Government of Canada\'s Service Canada office locator (link below) to find the closest office to you. Bring originals of all documents.' },
      { title: 'Protect your SIN', detail: 'Your SIN is confidential. Only share it with your employer, CRA, and financial institutions. Never share it with landlords or on social media.' },
    ],
    services: [
      {
        name: 'Service Canada — Online Application',
        tag: 'Fastest if eligible',
        description: 'Apply online if you have a valid work or study permit. Processing takes 5–10 business days and your SIN arrives by mail.',
        url: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
        type: 'official',
      },
      {
        name: 'Service Canada — In Person',
        tag: 'Same-day SIN',
        description: 'Walk into any Service Canada Centre with your original documents. No appointment needed. You leave with your SIN the same day.',
        url: 'https://www.servicecanada.gc.ca/tbsc-fsco/sc-hme.jsp?lang=eng',
        type: 'official',
      },
    ],
    findNearbyUrl: 'https://www.servicecanada.gc.ca/tbsc-fsco/sc-hme.jsp?lang=eng',
    findNearbyLabel: 'Find nearest Service Canada office',
    tips: [
      'Go in person if you need your SIN urgently — it is issued the same day.',
      'If you lose your SIN card, you can request a confirmation letter from Service Canada.',
      'Keep your SIN private — sharing it unnecessarily increases your risk of identity theft.',
    ],
  },

  'task-bank': {
    taskId: 'task-bank',
    overview: 'Opening a Canadian bank account lets you receive your salary, pay rent, and start building a Canadian credit history. All major banks offer Newcomer packages with free banking for the first 1–2 years. You don\'t need a credit score or Canadian credit history to open one.',
    timeEstimate: '30–60 minutes at a branch',
    steps: [
      { title: 'Gather your documents', detail: 'Bring your passport, SIN (if you already have one), and your immigration document (work permit, study permit, or PR card). A Canadian address helps but some banks allow a foreign address to start.' },
      { title: 'Compare Newcomer packages', detail: 'All Big Five banks have free Newcomer accounts for 1–2 years. Compare included features: number of free transactions, e-transfer limits, credit card offers, and welcome bonuses.' },
      { title: 'Visit a branch or apply online', detail: 'Most banks allow Newcomers to start an application online and complete verification at a branch. Book an appointment to avoid long waits.' },
      { title: 'Set up direct deposit and Interac e-Transfer', detail: 'Give your employer your transit number, institution number, and account number for direct deposit. Enable e-Transfer for sending and receiving money instantly.' },
    ],
    services: [
      {
        name: 'RBC Newcomer Advantage',
        tag: 'Most branches',
        description: 'Free banking for 12 months, unlimited transactions, and a credit card for newcomers with no Canadian credit history required. Large branch and ATM network.',
        url: 'https://www.rbc.com/newcomers/',
        type: 'recommended',
      },
      {
        name: 'TD New to Canada Banking',
        tag: 'Strong digital app',
        description: 'Free chequing for 6 months, credit card available immediately, and a solid mobile app. TD has extended hours at many locations.',
        url: 'https://www.td.com/ca/en/personal-banking/solutions/new-to-canada/',
        type: 'recommended',
      },
      {
        name: 'Scotiabank StartRight',
        tag: 'Best for international transfers',
        description: 'Free banking for 12 months, a credit card for newcomers, and preferred rates on international money transfers — useful for sending money home.',
        url: 'https://www.scotiabank.com/ca/en/personal/startright.html',
        type: 'recommended',
      },
      {
        name: 'BMO NewStart',
        tag: 'No fees for 1 year',
        description: 'No monthly fees for 12 months, unlimited transactions, and a credit card for newcomers. Good customer service in many languages.',
        url: 'https://www.bmo.com/en-ca/main/personal/newcomers-to-canada/',
        type: 'recommended',
      },
      {
        name: 'CIBC Welcome to Canada',
        tag: 'Flexible package',
        description: 'No monthly fee for 12 months, credit card with no credit history required, and Apple Pay / Google Pay from day one.',
        url: 'https://www.cibc.com/en/personal-banking/ways-to-bank/newcomers-to-canada.html',
        type: 'recommended',
      },
      {
        name: 'Neo Financial',
        tag: 'Budget — no branch',
        description: 'Online-only bank with a high-interest savings account (2.25%+). No monthly fees ever. Good for a secondary savings account after you open a Big Five chequing account.',
        url: 'https://www.neofinancial.com/',
        type: 'budget',
      },
    ],
    tips: [
      'Open your account as early as possible — your credit history starts the day you open the account.',
      'Ask about a secured credit card at the same time. Getting one immediately helps build your credit score faster.',
      'Keep your Newcomer package active for the full free period before comparing other accounts.',
    ],
  },

  'task-phone': {
    taskId: 'task-phone',
    overview: 'A Canadian phone number is essential from day one — you need it for job applications, two-factor authentication, signing leases, and everyday life. Canada\'s telecom market is dominated by three large carriers (Bell, Rogers, Telus) and their budget subsidiaries.',
    timeEstimate: '30–60 minutes in store or online',
    steps: [
      { title: 'Choose between postpaid and prepaid', detail: 'Postpaid (monthly plan) gives you a better device selection and more data for the price. Prepaid (pay-as-you-go) requires no credit check and is good while you\'re getting settled.' },
      { title: 'Compare plans', detail: 'Look at: data allowance, whether data is throttled after the cap, Canada-wide vs. provincial calling, international calling add-ons, and roaming options if you travel.' },
      { title: 'Bring your own device or buy new', detail: 'If your phone is unlocked, you can use it with any Canadian SIM. Buy a SIM card from any carrier ($10–$15) and activate a plan online or in store.' },
      { title: 'Activate and test', detail: 'Activate your SIM online or in store. Send a test text and call to confirm the number is working before you leave.' },
    ],
    services: [
      {
        name: 'Fido (Rogers subsidiary)',
        tag: 'Best value mid-range',
        description: 'Competitive data plans, often cheaper than the Big Three. Frequently runs promotions for new activations. Good coverage using the Rogers network.',
        url: 'https://www.fido.ca/',
        type: 'recommended',
      },
      {
        name: 'Koodo (Telus subsidiary)',
        tag: 'Reliable coverage',
        description: 'Flexible plans with a "Tab" system to spread device cost. Uses the Telus network — strong rural coverage. Easy online management.',
        url: 'https://www.koodomobile.com/',
        type: 'recommended',
      },
      {
        name: 'Virgin Plus (Bell subsidiary)',
        tag: 'Bell network quality',
        description: 'Good promotions, uses the Bell network. Offers a points rewards program. Slightly pricier than Fido or Koodo but strong network quality.',
        url: 'https://www.virginplus.ca/',
        type: 'recommended',
      },
      {
        name: 'Public Mobile (Telus)',
        tag: 'Budget pick',
        description: '90-day prepaid plans from ~$25–$40/month. No physical stores — managed entirely online. Rewards for paying on time and referring friends. Uses Telus network.',
        url: 'https://www.publicmobile.ca/',
        type: 'budget',
      },
      {
        name: 'Lucky Mobile (Bell)',
        tag: 'Budget pick',
        description: 'Budget prepaid plans from ~$25/month with unlimited Canada-wide talk and text. Uses Bell\'s network. Good for basic needs while getting established.',
        url: 'https://www.luckymobile.ca/',
        type: 'budget',
      },
      {
        name: 'Bell / Rogers / Telus',
        tag: 'Premium — best coverage',
        description: 'Best coverage in rural and remote areas. Highest prices. Worth it if you travel outside major cities frequently or need the most reliable connection for work.',
        url: 'https://www.bell.ca/',
        type: 'recommended',
      },
    ],
    tips: [
      'Use WhistleOut.ca or PlanHub.ca to compare Canadian phone plans side by side.',
      'Avoid signing a 2-year contract until you know your situation is stable — prepaid or month-to-month gives more flexibility.',
      'After 6–12 months of on-time payments, you may qualify for better plans and device financing.',
    ],
  },

  'task-health': {
    taskId: 'task-health',
    overview: 'Provincial health insurance covers doctor visits, hospital care, and most medical services at no cost. Each province runs its own plan with different rules, waiting periods, and covered services. Most provinces have a 3-month waiting period after you establish residency.',
    timeEstimate: 'Apply within first week of arrival · Coverage starts after waiting period',
    steps: [
      { title: 'Identify your province\'s health plan', detail: 'Each province has a different plan name and application process. Find yours in the province information below.' },
      { title: 'Apply immediately on arrival', detail: 'Even though most provinces have a 3-month wait, apply as soon as you arrive to start the waiting period clock. Bring your passport, immigration document, and proof of local address.' },
      { title: 'Get interim private coverage for the waiting period', detail: 'During the 3-month gap, private health insurance is essential. Manulife, Sun Life, and Blue Cross all offer short-term coverage for newcomers.' },
      { title: 'Register your dependents', detail: 'Register your spouse and children at the same time. Children under 19 are usually covered under the family application.' },
    ],
    services: [
      {
        name: 'Manulife CoverMe Travel Insurance',
        tag: 'For the waiting period',
        description: 'Short-term health coverage for newcomers during the provincial waiting period. Covers emergency medical, hospitalization, and prescription drugs.',
        url: 'https://www.manulife.ca/personal/insurance/travel-insurance.html',
        type: 'recommended',
      },
      {
        name: 'Blue Cross Newcomer Coverage',
        tag: 'For the waiting period',
        description: 'Provincial Blue Cross plans offer health coverage specifically designed for immigrants during the waiting period. Available in most provinces.',
        url: 'https://www.bluecross.ca/',
        type: 'recommended',
      },
    ],
    provinceInfo: [
      {
        provinces: ['ON'],
        label: 'OHIP — Ontario',
        info: '3-month waiting period. Apply at a ServiceOntario location with your passport, immigration document, and proof of Ontario address. Card arrives by mail in 1–2 weeks after waiting period.',
        url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card',
      },
      {
        provinces: ['BC'],
        label: 'MSP — British Columbia',
        info: '3-month waiting period. Apply online at Health Insurance BC. Coverage begins the first day of the third month after you establish residency. Enrol online immediately.',
        url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol',
      },
      {
        provinces: ['AB'],
        label: 'AHCIP — Alberta',
        info: 'No waiting period for eligible immigrants. Apply online or by mail within 3 months of establishing Alberta residency. Coverage starts immediately upon approval.',
        url: 'https://www.alberta.ca/ahcip-apply',
      },
      {
        provinces: ['QC'],
        label: 'RAMQ — Quebec',
        info: '3-month waiting period. Register at a RAMQ office or online. Quebec has its own provincial drug insurance plan — you may need to enrol separately.',
        url: 'https://www.ramq.gouv.qc.ca/en/citizens/health-insurance/register',
      },
      {
        provinces: ['MB'],
        label: 'Manitoba Health — Manitoba',
        info: '3-month waiting period. Apply by mail or in person at a Manitoba Health office. Bring proof of Manitoba address and immigration document.',
        url: 'https://www.gov.mb.ca/health/mhsip/',
      },
      {
        provinces: ['SK'],
        label: 'Saskatchewan Health — Saskatchewan',
        info: '3-month waiting period. Register online at eHealth Saskatchewan or by mail.',
        url: 'https://www.ehealthsask.ca/residents/health-cards/Pages/Apply-for-Health-Coverage.aspx',
      },
      {
        provinces: ['NS', 'NB', 'PE', 'NL'],
        label: 'Atlantic Provinces',
        info: '3-month waiting period in most Atlantic provinces. Contact your provincial health authority for the specific enrolment form and office location.',
        url: 'https://www.canada.ca/en/health-canada/services/health-care-system/provincial-territorial-health-links.html',
      },
    ],
    findNearbyUrl: 'https://www.canada.ca/en/health-canada/services/health-care-system/provincial-territorial-health-links.html',
    findNearbyLabel: 'Find your provincial health authority',
    tips: [
      'Alberta is the only province with no waiting period — a major advantage if you are relocating there.',
      'Keep all receipts from private health insurance premiums — they are tax-deductible.',
      'Emergency services are covered even during the waiting period in most provinces, though you may receive a bill first.',
    ],
  },

  'task-housing': {
    taskId: 'task-housing',
    overview: 'Finding rental housing in Canada\'s major cities is competitive. Listings move fast, especially in Toronto and Vancouver. Having your documents ready and acting quickly is essential. Never transfer money without seeing a unit in person.',
    timeEstimate: '1–4 weeks depending on city and budget',
    steps: [
      { title: 'Set your budget', detail: 'A general guideline is to spend no more than 30–35% of your gross monthly income on rent. Factor in utilities (hydro, heat, water) which may or may not be included.' },
      { title: 'Prepare your rental package', detail: 'Most landlords want: a letter of employment or offer letter, 2–3 recent pay stubs (or bank statements if new), a reference letter, and a credit report. Without Canadian credit history, offer 1–2 months extra upfront.' },
      { title: 'Search on multiple platforms', detail: 'List your search on all major platforms simultaneously. Set up alerts for new listings in your target neighbourhood. Act within hours on listings you like.' },
      { title: 'View in person before paying anything', detail: 'Never send a deposit or first/last month\'s rent via e-Transfer without seeing the unit in person. Rental scams are common on Facebook Marketplace and Kijiji. Verify the landlord owns the unit.' },
      { title: 'Sign the lease carefully', detail: 'Read the entire lease. Confirm what utilities are included, rules about guests and subletting, and the notice period required for moving out. In most provinces, standard lease forms are mandated by law.' },
    ],
    services: [
      {
        name: 'Realtor.ca',
        tag: 'Most complete listings',
        description: 'Canada\'s official real estate listing platform. Includes rentals from property managers and agents. More verified listings than consumer platforms.',
        url: 'https://www.realtor.ca/',
        type: 'official',
      },
      {
        name: 'Zumper',
        tag: 'Best search filters',
        description: 'Strong search filters for price, bedroom count, pet-friendly, and neighbourhood. Good email alert system for new listings.',
        url: 'https://www.zumper.com/apartments-for-rent/canada',
        type: 'recommended',
      },
      {
        name: 'PadMapper',
        tag: 'Map-based search',
        description: 'Aggregates listings from multiple sources and shows them on a map. Good for visualising commute distances from your workplace.',
        url: 'https://www.padmapper.com/',
        type: 'recommended',
      },
      {
        name: 'Kijiji',
        tag: 'Private landlords',
        description: 'Many private landlords (as opposed to property management companies) list here. More flexible negotiation but also more risk of scams — verify carefully.',
        url: 'https://www.kijiji.ca/b-apartments-condos/canada/c37l0',
        type: 'recommended',
      },
      {
        name: 'Facebook Marketplace',
        tag: 'Newest listings fastest',
        description: 'Many listings appear here first. High scam risk — only deal with verified Facebook profiles and always view in person before paying.',
        url: 'https://www.facebook.com/marketplace/category/propertyrentals',
        type: 'budget',
      },
    ],
    tips: [
      'In Ontario, landlords must use the Standard Lease form — if they refuse, you can withhold one month\'s rent after 21 days.',
      'Get renter\'s insurance (from $15–$30/month) — it covers your belongings and liability.',
      'Newcomer settlement agencies in your city often have rental resources and can sometimes provide references for landlords.',
    ],
  },

  'task-tax': {
    taskId: 'task-tax',
    overview: 'The Canadian tax year runs January 1 to December 31. The deadline to file is April 30. Even if you had no income in Canada, filing is important — it unlocks GST/HST credits, the Canada Child Benefit, and establishes your tax residency for future benefits.',
    timeEstimate: '1–3 hours for a first return · April 30 deadline',
    steps: [
      { title: 'Gather your slips', detail: 'Your employer sends a T4 slip by the end of February. You may also have: T4A (self-employment or scholarship), T5 (investment income), RRSP receipts, and charitable donation receipts.' },
      { title: 'Get a CRA My Account', detail: 'Register at the CRA website to access your tax records, benefit payments, and direct deposit setup. You\'ll need a SIN to register.' },
      { title: 'Choose your filing software', detail: 'Use CRA-certified NETFILE software. Several options are free for simple returns. See options below.' },
      { title: 'File before April 30', detail: 'The CRA charges a 5% late-filing penalty on any balance owing, plus 1% per month after. File on time even if you can\'t pay immediately.' },
    ],
    services: [
      {
        name: 'Wealthsimple Tax',
        tag: 'Best free option',
        description: 'Completely free, no income limit. Simple interview-style process. NETFILE certified. Supports most common tax situations including first-year returns.',
        url: 'https://www.wealthsimple.com/en-ca/tax',
        type: 'recommended',
      },
      {
        name: 'TurboTax Free',
        tag: 'Free for simple returns',
        description: 'Free for simple tax situations (T4 income only, no rental income). Step-by-step guidance with explanations. Paid tiers available for more complex returns.',
        url: 'https://turbotax.intuit.ca/',
        type: 'recommended',
      },
      {
        name: 'StudioTax',
        tag: 'Free · desktop app',
        description: 'Free NETFILE-certified desktop software. No subscription, no ads, supports all provinces. Good for those who prefer offline filing.',
        url: 'https://www.studiotax.com/',
        type: 'budget',
      },
      {
        name: 'CRA Auto-fill',
        tag: 'Official',
        description: 'If you have a CRA My Account, most filing software can auto-import your slips directly from the CRA. This saves significant time and reduces errors.',
        url: 'https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/netfile-overview.html',
        type: 'official',
      },
    ],
    tips: [
      'File even if you have no Canadian income — it unlocks the GST/HST credit (up to $500+ per year for individuals).',
      'First-time filers cannot use CRA Auto-fill — you must enter your information manually the first year.',
      'Keep all tax documents for 6 years in case CRA audits your return.',
    ],
  },

  'task-credit': {
    taskId: 'task-credit',
    overview: 'Canadian credit history does not carry over from other countries. You start from scratch regardless of your credit score at home. The fastest way to build credit is to get a credit card immediately, use it for small regular purchases, and pay the full balance every month.',
    timeEstimate: '6–12 months to reach a good score (700+)',
    steps: [
      { title: 'Open a bank account first', detail: 'You need a Canadian bank account before applying for most credit cards. Open your Newcomer bank account (see the Bank Account task) on arrival.' },
      { title: 'Get a secured or Newcomer credit card', detail: 'A secured card requires a cash deposit as collateral. A Newcomer card is an unsecured card specifically for new immigrants — your bank will offer one when you open your account.' },
      { title: 'Use it every month for small purchases', detail: 'Put regular small expenses on the card (groceries, transit, subscriptions). Keep your balance below 30% of the credit limit — this is called credit utilisation and is a major factor in your score.' },
      { title: 'Pay the full balance every month', detail: 'Never miss a payment. Set up automatic payment for the full statement balance to avoid interest charges and protect your credit score.' },
      { title: 'Graduate to an unsecured card after 6–12 months', detail: 'After 6–12 months of on-time payments, you\'ll qualify for regular unsecured cards with better rewards and higher limits.' },
    ],
    services: [
      {
        name: 'Neo Financial Secured Card',
        tag: 'Best newcomer pick',
        description: 'No annual fee, guaranteed approval with a deposit, and one of the highest cash back rates (5% at Neo partners, 1% elsewhere). Full app experience, no branch needed.',
        url: 'https://www.neofinancial.com/products/secured-card',
        type: 'recommended',
      },
      {
        name: 'Capital One Guaranteed Mastercard',
        tag: 'Guaranteed approval',
        description: 'No credit check required. $75 annual fee. Requires a $75 security deposit. Reports to both Equifax and TransUnion, building your credit file across both bureaus.',
        url: 'https://www.capitalone.ca/credit-cards/secured-mastercard/',
        type: 'recommended',
      },
      {
        name: 'Your bank\'s Newcomer credit card',
        tag: 'Easiest to get',
        description: 'RBC, TD, Scotiabank, BMO, and CIBC all offer entry-level credit cards for newcomers when you open a Newcomer account — no credit history required. Apply at the same time as your bank account.',
        url: 'https://www.rbc.com/newcomers/',
        type: 'recommended',
      },
      {
        name: 'Borrowell / Credit Karma',
        tag: 'Free credit monitoring',
        description: 'Free tools to check your credit score and monitor your credit report monthly. Borrowell pulls your Equifax score; Credit Karma pulls your TransUnion score. Both are free and do not affect your score.',
        url: 'https://www.borrowell.com/',
        type: 'budget',
      },
    ],
    tips: [
      'Check your credit score for free every month with Borrowell (Equifax) and Credit Karma (TransUnion). Monitoring does not hurt your score.',
      'Never apply for multiple credit cards at the same time — each application creates a "hard inquiry" that temporarily lowers your score.',
      'A good credit score (700+) unlocks better rental applications, lower insurance rates, and better mortgage rates.',
    ],
  },

  'task-drivers-license': {
    taskId: 'task-drivers-license',
    overview: 'You can drive on a valid foreign license for 60–90 days after arriving in most provinces. After that, you need a Canadian license. Many countries have reciprocal agreements allowing direct exchange without testing — check if your country qualifies.',
    timeEstimate: '1 day if country has reciprocal agreement · 2–12 months if full testing required',
    steps: [
      { title: 'Check if your country qualifies for a direct exchange', detail: 'Countries with reciprocal agreements include the USA, UK, Germany, France, South Korea, Japan, Australia, and others. The list varies by province. Check your provincial licensing authority website.' },
      { title: 'Gather your documents', detail: 'Bring your valid foreign license, passport, proof of Canadian address, and your immigration document. Some provinces also require a driving abstract from your home country.' },
      { title: 'Visit a provincial licensing office', detail: 'In Ontario: DriveTest. In BC: ICBC. In Alberta: a registry agent. In Quebec: SAAQ. Bring all original documents — no photocopies.' },
      { title: 'If testing is required', detail: 'If your country does not have a reciprocal agreement, you must pass a written knowledge test and a road test. You may receive credit for driving experience that reduces the graduated licensing wait time.' },
    ],
    provinceInfo: [
      {
        provinces: ['ON'],
        label: 'DriveTest — Ontario',
        info: 'Visit a DriveTest centre. USA, UK, Germany, France, South Korea, Japan, Switzerland, and Austria have full exchange agreements. Other countries may receive partial credit. Book an appointment online.',
        url: 'https://drivetest.ca/',
      },
      {
        provinces: ['BC'],
        label: 'ICBC — British Columbia',
        info: 'Visit an ICBC driver licensing office. Countries with full exchange: USA, UK, Germany, South Korea, Japan, France, and others. BC requires you to surrender your foreign license permanently.',
        url: 'https://www.icbc.com/driver-licensing/moving-bc/Pages/Moving-to-BC.aspx',
      },
      {
        provinces: ['AB'],
        label: 'Registry Agent — Alberta',
        info: 'Visit any authorized Alberta registry agent (not a government office). Many countries qualify for direct exchange including USA, UK, Germany, France, South Korea, Japan, and others.',
        url: 'https://www.alberta.ca/exchange-foreign-licence',
      },
      {
        provinces: ['QC'],
        label: 'SAAQ — Quebec',
        info: 'Visit a SAAQ service point. France, Belgium, and Switzerland have full exchange agreements with Quebec specifically. Other countries may require testing.',
        url: 'https://saaq.gouv.qc.ca/en/drivers-licences/foreign-drivers-licence/',
      },
      {
        provinces: ['MB'],
        label: 'MPI — Manitoba',
        info: 'Visit a Manitoba Public Insurance office. USA, UK, Germany, South Korea, Japan, France, and others qualify for direct exchange.',
        url: 'https://www.mpi.mb.ca/Pages/newresident.aspx',
      },
    ],
    services: [
      {
        name: 'ICBC — British Columbia',
        tag: 'BC only',
        description: 'ICBC (Insurance Corporation of British Columbia) handles driver licensing and provincial ID in BC. Visit an ICBC driver licensing office to exchange your foreign license, get a new BC ID card, or apply for a BCID (non-driver photo ID). Bring your passport, immigration document, and proof of BC address. You must surrender your foreign license permanently.',
        url: 'https://www.icbc.com/driver-licensing/moving-bc/Pages/Moving-to-BC.aspx',
        type: 'official',
      },
      {
        name: 'DriveTest — Ontario',
        tag: 'ON only',
        description: 'DriveTest centres handle G1/G2/G license testing and foreign license exchanges in Ontario. Book your road test or knowledge test appointment online. Ontario photo card (non-driver ID) is issued at ServiceOntario.',
        url: 'https://drivetest.ca/',
        type: 'official',
      },
      {
        name: 'SAAQ — Quebec',
        tag: 'QC only',
        description: 'Société de l\'assurance automobile du Québec issues driver\'s licenses and Quebec photo ID cards. French and English service available. Book an appointment online at a SAAQ service point.',
        url: 'https://saaq.gouv.qc.ca/en/drivers-licences/foreign-drivers-licence/',
        type: 'official',
      },
      {
        name: 'Registry Agents — Alberta',
        tag: 'AB only',
        description: 'Alberta driver\'s licenses and Alberta ID cards are issued through private registry agent offices, not a government office. Find any authorized registry agent near you — no appointment usually needed.',
        url: 'https://www.alberta.ca/exchange-foreign-licence',
        type: 'official',
      },
      {
        name: 'MPI — Manitoba',
        tag: 'MB only',
        description: 'Manitoba Public Insurance handles driver\'s licenses and Manitoba ID in the province. Visit an MPI Autopac agent or service centre to exchange your license or get a Manitoba ID card.',
        url: 'https://www.mpi.mb.ca/Pages/newresident.aspx',
        type: 'official',
      },
    ],
    findNearbyUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/driving.html',
    findNearbyLabel: 'Find your provincial licensing office',
    tips: [
      'Do not wait until the 90-day limit to start the process — lineups at licensing offices can be long.',
      'Request a driving abstract from your home country\'s licensing authority before you leave — some provinces require it for the exchange.',
      'Some provinces issue a temporary paper license immediately and mail the plastic card in 2–4 weeks.',
      'ICBC (BC) and SAAQ (QC) also issue provincial photo ID cards — useful if you don\'t drive but need government-issued Canadian ID.',
    ],
  },

  'task-shopping': {
    taskId: 'task-shopping',
    overview: 'Knowing where to shop in Canada helps you save significantly on everyday expenses. Grocery costs vary widely between store chains. Loyalty programs and price-matching can save you $100+ per month.',
    timeEstimate: 'Ongoing',
    steps: [
      { title: 'Download the Flipp app', detail: 'Flipp aggregates weekly flyers from all major Canadian grocery and retail chains. You can price-match at many stores — show the Flipp price on your phone at checkout.' },
      { title: 'Sign up for loyalty programs', detail: 'PC Optimum (Loblaws, No Frills, Shoppers Drug Mart) and Scene+ (Sobeys, IGA, Safeway, Empire) are the two major grocery loyalty programs. Both are free and earn points on every purchase.' },
      { title: 'Learn which stores carry what', detail: 'Budget groceries at No Frills or FreshCo. Ethnic groceries (often cheaper and more variety) at local supermarkets by neighbourhood — Chinatown, Little India, and other areas typically have competitive prices.' },
    ],
    services: [
      { name: 'No Frills / FreshCo / Food Basics', tag: 'Budget groceries', description: 'Discount grocery chains owned by Loblaws/Sobeys. No-frills format, but the same quality food at 20–40% less than regular supermarkets.', url: 'https://www.nofrills.ca/', type: 'budget' },
      { name: 'Walmart Grocery', tag: 'Everyday low prices', description: 'Competitive on staples, household items, and frozen food. Price-match available in store. Pickup and delivery options in most cities.', url: 'https://www.walmart.ca/', type: 'budget' },
      { name: 'Costco', tag: 'Bulk savings', description: 'Annual membership (~$65) pays for itself quickly if you buy in bulk. Best for: meat, coffee, laundry detergent, and household staples. Not practical without a car and storage space.', url: 'https://www.costco.ca/', type: 'recommended' },
      { name: 'IKEA', tag: 'Affordable furniture', description: 'Best value for furnishing a new home on a budget. Most major cities have a location. Buy used IKEA items from Facebook Marketplace for even better prices.', url: 'https://www.ikea.com/ca/en/', type: 'recommended' },
      { name: 'Dollarama', tag: 'Household essentials', description: 'Canada\'s largest dollar store. Good for: cleaning supplies, kitchen utensils, party supplies, and seasonal items. Most items under $5.', url: 'https://www.dollarama.com/', type: 'budget' },
    ],
    tips: [
      'Price-matching is widely accepted at Walmart, No Frills, and many other chains — just show the competitor\'s flyer on your phone.',
      'PC Optimum points are worth 1 cent each — 10,000 points = $10 in free groceries.',
      'Buy meat in bulk from Costco or on sale at a discount chain, then divide and freeze it at home.',
    ],
  },
}

/** Returns the guide for a task ID, or null if not found. */
export function getTaskGuide(taskId: string): TaskGuide | null {
  return TASK_GUIDES[taskId] ?? null
}
