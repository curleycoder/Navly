import type { IntakeData } from './profile'
import type { ScoreResult } from './scoring'

export type TaskCategory = "First Steps" | "Settlement & Living" | "Immigration" | "Legal" | "Taxes & Finance";

export type Task = {
  id: string
  title: string
  category: TaskCategory
  details?: string
  done: boolean
  createdAt: string
}

const KEY = 'navly_tasks'

const DEFAULT_TASKS: Task[] = [
  // First Steps
  {
    id: 'task-sin',
    title: 'Apply for a Social Insurance Number (SIN)',
    category: 'First Steps',
    details: 'Your SIN is a 9-digit number required to work in Canada or access government programs. Apply online at canada.ca, by mail, or in person at a Service Canada office — same-day processing in person. Bring your original passport and your work/study permit or PR card. You need your SIN before your first payday.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-bank',
    title: 'Open a Canadian Bank Account',
    category: 'First Steps',
    details: 'A local account is needed to receive salary, pay rent, and start building Canadian credit history. The Big Five (RBC, TD, Scotiabank, BMO, CIBC) all offer Newcomer packages with no monthly fees for 1–2 years. Bring your passport, SIN, and immigration document. Opening an account immediately starts your credit file — critical for future apartment applications and loans.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-phone',
    title: 'Get a Canadian Phone Number',
    category: 'First Steps',
    details: 'A local number is essential for job hunting, two-factor authentication, and signing leases. Premium carriers: Bell, Rogers, Telus. Budget options: their subsidiaries Virgin Plus, Fido, Koodo, or smaller providers like Public Mobile and Lucky Mobile. Start on a monthly plan — you can lock in a better rate once you have 6+ months of credit history.',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-health',
    title: 'Register for Provincial Health Insurance',
    category: 'First Steps',
    details: 'Each province has its own plan: OHIP (Ontario), MSP (BC), AHCIP (Alberta — no wait period), RAMQ (Quebec). Most provinces have a 3-month waiting period after you arrive or change status. Get private interim health coverage for the gap — check Manulife, Sun Life, or Blue Cross. Apply as soon as you arrive; bring your immigration document and proof of local address.',
    done: false,
    createdAt: new Date().toISOString(),
  },
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
        'Explore options for a valid Canadian job offer',
        'Immigration',
        'A valid job offer from a Canadian employer adds 50–200 CRS points. It must be for a permanent, full-time, non-seasonal role. Most qualifying offers are LMIA-backed (employer proves no Canadian was available) or LMIA-exempt under an international agreement. Talk to your employer about whether they are willing to support a formal offer for IRCC.',
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

  // Visa / permit expiry reminder
  const expiryDate = profile.visaExpiryDate || (profile.permitExpiry ? profile.permitExpiry + '-01' : '')
  if (expiryDate) {
    const daysLeft = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 90) {
      const urgency = daysLeft <= 30 ? '⚠️ Urgent — ' : ''
      tasks.push(task(
        'visa-expiry',
        `${urgency}Renew your visa or permit — expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        'Immigration',
        `Your current visa or permit expires on ${expiryDate}. Start your renewal application at least 30 days before the expiry date to maintain valid status. If you are inside Canada, apply for an extension before the expiry — this gives you "maintained status" while IRCC processes your application. Do not wait until the last minute; processing times vary by permit type.`,
      ))
    }
  }

  tasks.push(task(
    'consultant',
    'Book a consultation with a licensed RCIC or immigration lawyer',
    'Legal',
    'A Regulated Canadian Immigration Consultant (RCIC) is licensed by the College of Immigration and Citizenship Consultants (CICC). A lawyer is licensed by their provincial Law Society. Before hiring anyone, verify their registration number on the CICC or Law Society website. Be cautious of "immigration consultants" or "notaries" who are not officially licensed — using an unauthorized representative can jeopardize your application.',
  ))

  return tasks
}
