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
  { 
    id: 'task-sin', 
    title: 'Apply for a Social Insurance Number (SIN)', 
    category: 'First Steps',
    details: 'Your SIN is a 9-digit number that you need to work in Canada or to access government programs and benefits. You can apply online, by mail, or in-person at a Service Canada office. Bring your passport and your original work/study permit or PR card.',
    done: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'task-bank', 
    title: 'Open a Canadian Bank Account', 
    category: 'First Steps',
    details: 'You need a local account to receive your salary and pay rent. The "Big Five" banks (RBC, TD, Scotiabank, BMO, CIBC) all offer specialized "Newcomer to Canada" packages with no monthly fees for the first year. Bring your passport, SIN, and immigration document.',
    done: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'task-phone', 
    title: 'Get a Canadian Phone Carrier', 
    category: 'First Steps',
    details: 'Having a local number is essential for job hunting and signing a lease. Major providers are Bell, Rogers, and Telus (premium/expensive), while their subsidiaries Virgin Plus, Fido, and Koodo offer more affordable plans. Bring your passport and a credit card.',
    done: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'task-housing', 
    title: 'Look for a Home or Apartment', 
    category: 'Settlement & Living',
    details: 'Rentals move fast. Use websites like Realtor.ca, Zumper, PadMapper, and Facebook Marketplace. Be prepared to provide an employment letter, bank statements, and a credit report. Be wary of scams: never wire money before seeing an apartment in person.',
    done: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'task-tax', 
    title: 'File your First Income Tax Return', 
    category: 'Taxes & Finance',
    details: 'The tax year runs from Jan 1 to Dec 31, and taxes are typically due by April 30 of the following year. Even if you made no income, filing taxes is required to get GST/HST refund credits and Canada Child Benefits. You can use free software like Wealthsimple Tax or TurboTax.',
    done: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'task-shopping', 
    title: 'Where to Buy Groceries and Essentials', 
    category: 'Settlement & Living',
    details: 'For budget groceries: No Frills, FreshCo, Food Basics, or Walmart. For premium: Loblaws, Sobeys, Metro. For bulk items: Costco. For household items and furniture: IKEA, Canadian Tire, or Dollarama. Download the "Flipp" app to compare weekly flyers and price-match.',
    done: false, 
    createdAt: new Date().toISOString() 
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
  // If the user already has saved categorized tasks, we shouldn't necessarily wipe them 
  // every time profile updates. But since the previous version just generated them dynamically:
  // we'll just return the powerful combined default set.
  
  const tasks: Task[] = [...DEFAULT_TASKS]

  if (profile.goal === 'pr') {
    tasks.push(task('gather-identity', 'Gather identity documents', 'Immigration', 'Includes passport, birth certificate, and marriage certificate (if applicable). Document translations must be certified.'))

    if (score.hasEnoughData) {
      score.improvements.slice(0, 3).forEach((imp, i) => {
        tasks.push(task(`improvement-${i}`, imp.label, 'Immigration', imp.action))
      })
    } else {
      tasks.push(task('complete-profile', 'Complete your PR profile to unlock your CRS score', 'Immigration', 'Navigate to the onboarding flow and finish inputting your data.'))
    }

    if (profile.ecaCompleted === 'no') {
      tasks.push(task('eca', 'Apply for Educational Credential Assessment (ECA)', 'Immigration', 'Create an account on the WES Canada website and request your university send the physical transcripts to them.'))
    }
  }

  tasks.push(task('consultant', 'Find a licensed RCIC or immigration lawyer', 'Legal', 'Ensure the consultant is officially registered with CICC or the provincial law society. Check the Navly Partner Network.'))
  
  return tasks
}
