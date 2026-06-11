import type { IntakeData } from './profile'
import type { ScoreResult } from './scoring'

export type TaskCategory = "Settlement & Living" | "Immigration" | "Legal" | "Taxes & Finance" | "Arrival Checklist";

export type Task = {
  id: string
  title: string
  category: TaskCategory
  details?: string
  done: boolean
  createdAt: string
  urgency?: 'urgent' | 'soon' | 'now' | 'week' | 'month'
  link?: string
}

const KEY = 'navly_tasks'

const DEFAULT_TASKS: Task[] = [
  // Settlement & Living
  {
    id: 'task-housing',
    title: 'Find Housing or an Apartment',
    category: 'Settlement & Living',
    details: 'Rentals move fast in major cities. Use Realtor.ca, Zumper, PadMapper, Kijiji, and Facebook Marketplace. Landlords typically want: employment letter, recent pay stubs or bank statements, and a credit report. Without Canadian credit history, offer 2–3 months upfront or a co-signer. Never e-transfer money before seeing the unit in person — rental scams are common.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-shopping',
    title: 'Learn Where to Shop for Groceries and Essentials',
    category: 'Settlement & Living',
    details: 'Budget groceries: No Frills, FreshCo, Food Basics, Walmart. Mid-range: Loblaws, Sobeys, Metro. Bulk items: Costco (annual membership ~$65). Household & furniture: IKEA, Canadian Tire, Dollarama. Download the "Flipp" app to compare weekly store flyers and price-match. Sign up for PC Optimum and Scene+ loyalty programs to earn points on everyday purchases.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-drivers-license',
    title: "Exchange or Apply for a Canadian Driver's License",
    category: 'Settlement & Living',
    details: "You can drive on a foreign license for 60–90 days in most provinces. To convert: visit your provincial licensing office (DriveTest in Ontario, ICBC in BC, SAAQ in Quebec, etc.) with your foreign license, passport, and proof of address. Many countries have reciprocal agreements (USA, UK, Germany, France, South Korea, and others) allowing direct exchange without retesting. Check your province's official website for the full list and required documents.",
    done: false,
    createdAt: new Date().toISOString(),
  },
  // Taxes & Finance
  {
    id: 'task-tax',
    title: 'File Your First Income Tax Return',
    category: 'Taxes & Finance',
    details: 'The Canadian tax year is Jan 1–Dec 31; taxes are due April 30. Even with no income, filing is required to receive GST/HST credits and the Canada Child Benefit. Free options: Wealthsimple Tax, TurboTax Free Edition, or CRA-certified NETFILE software. Tip: file even if you arrived mid-year — your first return establishes residency for benefits and unlocks future credits.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-credit',
    title: 'Start Building Canadian Credit History',
    category: 'Taxes & Finance',
    details: "Canadian credit history doesn't transfer from other countries — you start fresh. Get a secured credit card (requires a deposit as collateral) from your bank or a provider like Neo Financial or Capital One Guaranteed. Use it for small monthly purchases and pay the full balance every month. After 6–12 months of on-time payments, apply for an unsecured card. Aim for a credit score above 700 for the best rates.",
    done: false,
    createdAt: new Date().toISOString(),
  },
]

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return DEFAULT_TASKS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_TASKS;
    
    // We seamlessly merge old tasks into the new structure or overwrite if old format
    const parsed = JSON.parse(raw);
    if (parsed.length > 0 && !parsed[0].category) {
       // Legacy wipe out to push the new amazing settlement tasks
       return DEFAULT_TASKS;
    }
    return parsed as Task[];
  } catch {
    return DEFAULT_TASKS
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

function task(id: string, title: string, category: TaskCategory, details?: string): Task {
  return { id, title, category, details, done: false, createdAt: new Date().toISOString() }
}

export function generateTasks(profile: IntakeData, score: ScoreResult): Task[] {
  const tasks: Task[] = [...DEFAULT_TASKS]

  if (profile.goal === 'pr') {
    if (!score.hasEnoughData) {
      tasks.push(task(
        'complete-profile',
        'Complete your profile to unlock your CRS score estimate',
        'Immigration',
        'Go to the onboarding flow and fill in your language test scores, education level, and work experience. These are the three biggest CRS factors and Navly cannot estimate your score without them.',
      ))
    }

    // ECA
    if (profile.ecaCompleted === 'no') {
      tasks.push(task(
        'eca',
        'Apply for an Educational Credential Assessment (ECA)',
        'Immigration',
        'An ECA from WES Canada (or another IRCC-approved body) is required for Express Entry if your degree is from outside Canada. Go to WES.org, create an account, and request your university send official transcripts directly to WES. Processing typically takes 7–20 business days after documents arrive.',
      ))
    }

    // Language improvement
    if (score.hasEnoughData && score.clb) {
      const minCLB = Math.min(score.clb.r, score.clb.w, score.clb.l, score.clb.s)
      if (minCLB < 7) {
        tasks.push(task(
          'lang-clb7',
          'Reach CLB 7 in all four language skills',
          'Immigration',
          'CLB 7 is the minimum for Federal Skilled Worker and most PNP streams. On IELTS General Training, CLB 7 requires roughly: Reading 6.0, Writing 6.0, Listening 6.0, Speaking 6.0. Identify your lowest skill and focus practice on that area first.',
        ))
      } else if (minCLB < 9) {
        tasks.push(task(
          'lang-clb9',
          'Improve language scores to CLB 9',
          'Immigration',
          'CLB 9 is the most impactful single upgrade for your CRS score. On IELTS General, CLB 9 requires: Reading 7.0, Writing 7.0, Listening 8.0, Speaking 7.0. Even improving one skill by one band can add 4–6 CRS points.',
        ))
      }
    }

    // Canadian work experience
    const canMonths = parseFloat(profile.canadianWorkMonths) || 0
    const teer = profile.teerLevel
    if (canMonths < 12 && teer && ['0', '1', '2', '3'].includes(teer)) {
      tasks.push(task(
        'can-work-12',
        `Accumulate 12 months of skilled Canadian work experience`,
        'Immigration',
        `You need 12 months of TEER ${teer} work in Canada to qualify for Canadian Experience Class (CEC). You currently have approximately ${Math.floor(canMonths)} months logged. Keep detailed records: employer name, start/end dates, job title, NOC code, hours per week, and duties. You will need these for your Express Entry application.`,
      ))
    }

    // Job offer
    if (profile.hasJobOffer !== 'yes' && teer && ['1', '2', '3'].includes(teer)) {
      tasks.push(task(
        'job-offer',
        'Explore options for a Canadian job offer (PNP strength)',
        'Immigration',
        'A job offer no longer adds CRS points (removed March 25, 2025), but it can still strengthen eligibility for specific Provincial Nominee Program streams. A qualifying offer must be permanent, full-time, and non-seasonal. Talk to your employer about whether they support PNP-linked offers in your target province.',
      ))
    }

    // PNP check
    if (profile.intendedProvince && profile.intendedProvince !== 'QC') {
      tasks.push(task(
        'pnp-check',
        `Research ${profile.intendedProvince} Provincial Nominee Program streams`,
        'Immigration',
        `Provincial nomination adds 600 CRS points — effectively guaranteeing an Express Entry invitation. Each province manages its own streams with different requirements. Visit the official ${profile.intendedProvince} immigration website, search for streams matching your NOC code and work profile, and note the Expression of Interest (EOI) or direct draw dates.`,
      ))
    }

    // Score improvements from scoring engine
    if (score.hasEnoughData && score.improvements.length > 0) {
      score.improvements.slice(0, 2).forEach((imp, i) => {
        const alreadyExists = tasks.some(t => t.title === imp.label)
        if (!alreadyExists) {
          tasks.push(task(`improvement-${i}`, imp.label, 'Immigration', imp.action))
        }
      })
    }
  }

  // Study path
  if (profile.goal === 'study') {
    tasks.push(task(
      'dli-search',
      'Find a Designated Learning Institution (DLI)',
      'Immigration',
      'Only programs at DLIs qualify you for a study permit and the Post-Graduation Work Permit (PGWP). IRCC publishes the full DLI list at canada.ca. When comparing schools, check if the program length is 8+ months (PGWP eligibility requires this), whether the credential is a degree/diploma/certificate, and the tuition costs.',
    ))
    tasks.push(task(
      'pgwp-plan',
      'Understand your PGWP eligibility and plan your CEC path',
      'Immigration',
      'After completing a full-time program of 8+ months at a DLI, most graduates qualify for a PGWP of up to 3 years. Use the PGWP period to work full-time in a TEER 0–3 occupation for 12 months, then apply for PR through Canadian Experience Class.',
    ))
  }

  // ── Deadline generators ───────────────────────────────────────────────────
  const daysUntil = (dateStr: string): number | null => {
    if (!dateStr) return null
    const d = dateStr.length === 7 ? new Date(dateStr + '-01') : new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  // Permit / visa renewal
  const permitDate = profile.visaExpiryDate || (profile.permitExpiry ? profile.permitExpiry + '-01' : '')
  const daysToPermit = daysUntil(permitDate)
  if (daysToPermit !== null && daysToPermit < 120) {
    const permitType = profile.workPermitType
      ? profile.workPermitType.replace(/-/g, ' ')
      : profile.status === 'student' ? 'study permit' : 'permit'
    tasks.push({
      ...task('renew-permit', `Renew your ${permitType} — expires ${permitDate}`, 'Immigration'),
      urgency: daysToPermit < 60 ? 'urgent' : 'soon',
      details: 'Apply before your permit expires to keep maintained status. Applying late breaks your legal status in Canada even if IRCC has not yet processed your renewal.',
      link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
    })
  }

  // Passport renewal
  const daysToPassport = daysUntil(profile.passportExpiry)
  if (daysToPassport !== null && daysToPassport < 180) {
    tasks.push({
      ...task('renew-passport', `Renew your passport — expires ${profile.passportExpiry}`, 'Immigration'),
      urgency: daysToPassport < 90 ? 'urgent' : 'soon',
      details: "Your passport must be valid for any IRCC application or re-entry to Canada. Renew through your home country's embassy or consulate in Canada.",
    })
  }

  // PR card renewal
  const daysToCard = daysUntil(profile.prCardExpiry)
  if (profile.status === 'pr' && daysToCard !== null && daysToCard < 365) {
    tasks.push({
      ...task('renew-pr-card', `Renew your PR card — expires ${profile.prCardExpiry}`, 'Immigration'),
      urgency: daysToCard < 180 ? 'urgent' : 'soon',
      details: 'You cannot board a flight to Canada without a valid PR card. Apply through IRCC — processing takes 2–3 months.',
      link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
    })
  }

  tasks.push(task(
    'consultant',
    'Book a consultation with a licensed RCIC or immigration lawyer',
    'Legal',
    'A Regulated Canadian Immigration Consultant (RCIC) is licensed by the College of Immigration and Citizenship Consultants (CICC). A lawyer is licensed by their provincial Law Society. Before hiring anyone, verify their registration number on the CICC or Law Society website. Be cautious of "immigration consultants" or "notaries" who are not officially licensed — using an unauthorized representative can jeopardize your application.',
  ))

  return tasks
}

// ── Arrival Checklist ─────────────────────────────────────────────────────────
// Province-specific health card info

const healthCardInfo: Record<string, { name: string; wait: string }> = {
  BC: { name: 'BC Services Card (MSP)', wait: '3-month wait — buy interim health insurance now' },
  ON: { name: 'OHIP',                   wait: '3-month waiting period — buy interim insurance to cover the gap' },
  AB: { name: 'AHCIP',                  wait: 'no waiting period for new Alberta residents' },
  MB: { name: 'Manitoba Health card',   wait: '3-month waiting period' },
  SK: { name: 'Saskatchewan Health card', wait: '3-month waiting period' },
  QC: { name: 'RAMQ card',              wait: '3-month waiting period — buy private insurance for the gap' },
  NS: { name: 'Nova Scotia MSI card',   wait: '3-month waiting period' },
  NB: { name: 'New Brunswick Medicare', wait: '3-month waiting period' },
  NL: { name: 'MCP (NL)',               wait: '3-month waiting period' },
  PE: { name: 'PEI Health card',        wait: '3-month waiting period' },
  NT: { name: 'NWT Health card',        wait: '3-month waiting period' },
  YT: { name: 'Yukon Health Care card', wait: '3-month waiting period' },
  NU: { name: 'Nunavut Health card',    wait: '3-month waiting period' },
}

function arrivalTask(
  id: string,
  title: string,
  urgency: 'now' | 'week' | 'month',
  details: string,
  link?: string,
): Task {
  return {
    id,
    title,
    category: 'Arrival Checklist',
    urgency,
    details,
    link,
    done: false,
    createdAt: new Date().toISOString(),
  }
}

export function generateArrivalTasks(profile: IntakeData): Task[] {
  if (profile.locationStatus !== 'inside') return []

  // Only show for recent arrivals — within the last 90 days.
  // If arrivalDate is not set the user just started Navly and may have arrived recently,
  // so we show the checklist. If it's set and older than 90 days, skip entirely.
  if (profile.arrivalDate) {
    const daysSince = Math.floor((Date.now() - new Date(profile.arrivalDate).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 90) return []
  }

  const tasks: Task[] = []
  const province = profile.province
  const health = healthCardInfo[province]
  const healthTitle = health
    ? `Register for ${health.name} — ${health.wait}`
    : 'Register for provincial health coverage'
  const healthLink = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/new-life-canada/health-care.html'

  const status = profile.status

  // ── Student ──────────────────────────────────────────────────────────────
  if (status === 'student') {
    tasks.push(arrivalTask(
      'arrival-sin',
      'Get your SIN at Service Canada — bring study permit + passport',
      'now',
      'A Social Insurance Number (SIN) is required to work in Canada. Visit a Service Canada location in person with your study permit and passport. Processing is immediate — you will receive your SIN on the spot.',
      'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    ))
    if (profile.schoolName || profile.dliNumber) {
      tasks.push(arrivalTask(
        'arrival-dli-register',
        `Register with your DLI within 90 days of arriving`,
        'now',
        'IRCC requires you to enrol at your Designated Learning Institution (DLI) within 90 days of your permit start date. Missing this deadline can affect your maintained status and PGWP eligibility.',
      ))
    }
    tasks.push(arrivalTask(
      'arrival-health-student',
      healthTitle,
      'now',
      `Provincial health coverage has a waiting period in most provinces. ${health?.wait ? `In ${province}: ${health.wait}.` : ''} Do not skip interim insurance — even a minor emergency without coverage can cost thousands.`,
      healthLink,
    ))
    tasks.push(arrivalTask(
      'arrival-bank',
      'Open a Canadian bank account — bring passport + study permit',
      'now',
      'Most major banks (RBC, TD, Scotiabank, BMO, CIBC) offer student accounts with no monthly fee. Bring your passport, study permit, and a letter of acceptance from your school. A Canadian account is required to receive wages and pay rent.',
    ))
    tasks.push(arrivalTask(
      'arrival-sim',
      'Get a Canadian SIM card',
      'week',
      'Major carriers: Rogers, Bell, Telus (premium). Budget options: Fido, Virgin, Koodo, Freedom, Public Mobile. Compare on planfinder.ca. You will need a Canadian number for IRCC correspondence and banking.',
    ))
  }

  // ── Worker / PGWP ────────────────────────────────────────────────────────
  if (['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(status)) {
    tasks.push(arrivalTask(
      'arrival-wp-validated',
      'Get your work permit validated at your first port of entry',
      'now',
      'CBSA officers stamp and validate your work permit at your first entry to Canada. If you entered as a visitor and later got your permit, confirm it was formally issued — your employer needs the permit number to process payroll legally.',
    ))
    const wasPreviouslyStudent = profile.workPermitType === 'pgwp' || status === 'pgwp'
    if (wasPreviouslyStudent) {
      tasks.push(arrivalTask(
        'arrival-sin-update',
        'Update your SIN record from study to work category',
        'now',
        'If your previous SIN was issued for study purposes with a restricted expiry, visit Service Canada with your PGWP to update it. Your SIN number stays the same but the restriction is removed.',
        'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
      ))
    }
    tasks.push(arrivalTask(
      'arrival-notify-employer',
      'Notify your employer of your work permit number and expiry date',
      'now',
      'Your employer needs your work permit number for payroll, T4 filing, and ROE. Give them a copy of your permit. Set a shared reminder for renewal — your employer cannot legally keep you on after your permit expires.',
    ))
    tasks.push(arrivalTask(
      'arrival-cec-clock',
      'Start tracking Canadian skilled work months — your CEC clock starts now',
      'now',
      `CEC requires 12 months of TEER 0–3 paid skilled work in Canada. Your clock starts from your first day of qualifying work. Record your start date, employer name, NOC code, hours per week, and wage. You will need this documentation for your Express Entry application.`,
    ))
    tasks.push(arrivalTask(
      'arrival-health-worker',
      healthTitle,
      'week',
      `Provincial health coverage has a waiting period in most provinces. ${health?.wait ? `In ${province}: ${health.wait}.` : ''} Do not skip interim insurance during the waiting period.`,
      healthLink,
    ))
  }

  // ── Permanent Resident ───────────────────────────────────────────────────
  if (status === 'pr') {
    tasks.push(arrivalTask(
      'arrival-pr-landing-date',
      'Record your landing date — your 730-day PR obligation clock starts today',
      'now',
      'As a PR, you must spend at least 730 days in Canada in every rolling 5-year period. Your clock starts from your landing date. Record it in Navly and track every trip outside Canada from day one.',
    ))
    tasks.push(arrivalTask(
      'arrival-pr-card',
      'Submit your PR card application — you have 180 days from landing',
      'now',
      'You will not receive a PR card automatically. Apply through your IRCC online account within 180 days of landing. Processing takes 2–3 months. Without a PR card, you cannot board a flight back to Canada from abroad.',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
    ))
    tasks.push(arrivalTask(
      'arrival-pr-sin',
      'Get your SIN — bring your PR confirmation document + passport',
      'now',
      'Visit any Service Canada location with your Confirmation of Permanent Residence (COPR) and passport. You will receive your SIN immediately. A SIN is required for employment, tax filing, and government benefits.',
      'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    ))
    tasks.push(arrivalTask(
      'arrival-health-pr',
      healthTitle,
      'week',
      `Provincial health coverage has a waiting period in most provinces. ${health?.wait ? `In ${province}: ${health.wait}.` : ''} Do not skip interim insurance during the waiting period.`,
      healthLink,
    ))
    tasks.push(arrivalTask(
      'arrival-ircc-address',
      'Update your address with IRCC within 180 days of landing',
      'week',
      'IRCC requires PRs to keep their address current. Log in to your IRCC secure account and update your Canadian address. Missing correspondence from IRCC (including PR card delivery and citizenship notices) can create serious delays.',
      'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
    ))
  }

  return tasks
}

export const ARRIVAL_DONE_KEY = 'navly_arrival_done'
