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
