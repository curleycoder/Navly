import type { IntakeData } from './profile'
import type { ScoreResult } from './scoring'

export type Task = {
  id: string
  title: string
  done: boolean
  createdAt: string // ISO timestamp
}

const KEY = 'navly_tasks'

const DEFAULT_TASKS: Task[] = [
  { id: 'task-1', title: 'Gather all identity documents (passport, birth certificate)', done: false, createdAt: new Date().toISOString() },
  { id: 'task-2', title: 'Locate current immigration status document', done: false, createdAt: new Date().toISOString() },
  { id: 'task-3', title: 'Book a language test (IELTS / TEF)', done: false, createdAt: new Date().toISOString() },
  { id: 'task-4', title: 'Request employment letter from employer', done: false, createdAt: new Date().toISOString() },
  { id: 'task-5', title: 'Download last 2 years of tax returns (CRA)', done: false, createdAt: new Date().toISOString() },
  { id: 'task-6', title: 'Find a licensed immigration consultant or lawyer', done: false, createdAt: new Date().toISOString() },
]

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return DEFAULT_TASKS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : DEFAULT_TASKS
  } catch {
    return DEFAULT_TASKS
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

function task(id: string, title: string): Task {
  return { id, title, done: false, createdAt: new Date().toISOString() }
}

export function generateTasks(profile: IntakeData, score: ScoreResult): Task[] {
  const tasks: Task[] = []

  if (profile.goal === 'pr') {
    tasks.push(task('gather-identity', 'Gather identity documents (passport, birth certificate)'))

    if (score.hasEnoughData) {
      score.improvements.slice(0, 3).forEach((imp, i) => {
        tasks.push(task(`improvement-${i}`, imp.action))
      })

      const cec = score.pathways.find((p) => p.id === 'cec')
      if (cec?.status === 'not-yet') {
        tasks.push(task('cec-work', 'Accumulate 12 months of skilled Canadian work experience (TEER 0–3)'))
      }

      const fsw = score.pathways.find((p) => p.id === 'fsw')
      if (fsw?.status === 'not-yet' && !score.fsw?.meetsWorkRequirement) {
        tasks.push(task('fsw-work', 'Build 1+ year of TEER 0–3 skilled work experience for FSW eligibility'))
      }
    } else {
      tasks.push(task('complete-profile', 'Complete your PR profile to unlock your CRS score and pathway plan'))
    }

    if (profile.ecaCompleted === 'no') {
      tasks.push(task('eca', 'Apply for Educational Credential Assessment (ECA) — e.g. WES or IQAS'))
    }
  } else if (profile.goal === 'work-permit') {
    tasks.push(task('locate-permit', 'Locate your current work permit and check the expiry date'))
    tasks.push(task('employer-letter', 'Request an updated employment letter from your employer'))
    tasks.push(task('gather-docs', 'Gather recent pay stubs and last 2 years of tax returns'))
  } else if (profile.goal === 'study-permit') {
    tasks.push(task('acceptance', 'Confirm or obtain acceptance letter from your DLI'))
    tasks.push(task('financial', 'Prepare proof of funds for tuition and living expenses'))
    tasks.push(task('transcripts', 'Request official transcripts from your current or last school'))
  } else if (profile.goal === 'citizenship') {
    tasks.push(task('physical-presence', 'Calculate your physical presence days (need 1,095 of 1,825 days)'))
    tasks.push(task('tax-compliance', 'Confirm tax filing compliance for last 3 years'))
    tasks.push(task('language-proof', 'Gather language test results or approved evidence (CLB 4+)'))
  } else {
    return DEFAULT_TASKS
  }

  tasks.push(task('consultant', 'Find a licensed RCIC or immigration lawyer for your situation'))
  return tasks
}
