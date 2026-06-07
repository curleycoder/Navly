'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, ListChecks, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadTasks, saveTasks, generateTasks, type Task, type TaskCategory } from '@/lib/tasks'
import { loadProfile } from '@/lib/profile'
import { calculateScore } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/useToast'
import { Toast } from '@/components/ui/Toast'
import { TASK_GUIDES } from '@/lib/task-guides'
import { useLocale } from '@/lib/i18n'
import { PageTour } from '@/components/dashboard/PageTour'

export default function TasksPage() {
  const { t } = useLocale()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const { message, showToast } = useToast()

  // Track if we've initialized so we don't flash empty state
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('navly_tasks') : null;
    if (saved) {
      setTasks(loadTasks())
    } else {
      const profile = loadProfile()
      if (profile) {
        const score = calculateScore(profile)
        const generated = generateTasks(profile, score)
        setTasks(generated)
        saveTasks(generated) // persist so dashboard and other pages see profile-driven tasks
      } else {
        setTasks(loadTasks())
      }
    }
    setIsLoaded(true)
  }, [])

  function update(updated: Task[]) {
    setTasks(updated)
    saveTasks(updated)
  }

  function toggle(id: string) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    update(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    showToast(task.done ? 'Marked incomplete' : 'Task completed')
  }

  function addTask() {
    const title = newTitle.trim()
    if (!title) return
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      category: 'Settlement & Living',
      done: false,
      createdAt: new Date().toISOString(),
    }
    update([...tasks, task])
    setNewTitle('')
    showToast('Task added')
  }

  const done = tasks.filter((t) => t.done).length
  const total = tasks.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const pendingTasks = tasks.filter(t => !t.done)
  const completedTasks = tasks.filter(t => t.done)

  // Group pending tasks by category using useMemo
  const pendingByCategory = useMemo(() => {
    const map = new Map<TaskCategory, Task[]>()
    pendingTasks.forEach(t => {
      const cat = t.category || 'Settlement & Living';
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(t)
    })
    return map
  }, [pendingTasks])

  if (!isLoaded) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-5 animate-fade-in">
      <PageTour
        tourKey="navly_tour_tasks"
        steps={[
          {
            element: '[data-tour="tasks-progress"]',
            popover: {
              title: 'Your progress',
              description: 'Track how many tasks you\'ve completed. Each task you check off moves you closer to PR readiness.',
              side: 'bottom', align: 'start',
            },
          },
          {
            element: '[data-tour="tasks-add"]',
            popover: {
              title: 'Add custom tasks',
              description: 'Add anything that\'s specific to your situation — a consultation appointment, a test booking, or a document to chase up.',
              side: 'top', align: 'start',
            },
          },
        ]}
      />
      <div className="mb-2">
        <p className="hidden md:block t-eyebrow text-navly-red">{t('tasks.eyebrow')}</p>
        <h1 className="hidden md:block mt-1 t-page-title">{t('tasks.title')}</h1>
        <p className="mt-2 t-body">{t('tasks.subtitle')}</p>
      </div>

      {/* Progress */}
      <Card data-tour="tasks-progress" className="mb-8 rounded-2xl border-subtle bg-surface-card">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="t-section-title">
              {done} {t('tasks.ofTotal')} {total} {t('tasks.tasksComplete')}
            </p>
            <span className="t-section-title text-navly-red">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-subtle">
            <div
              className="h-2 rounded-full bg-navly-red transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Categories */}
      {Array.from(pendingByCategory.entries()).map(([category, catTasks]) => (
        <div key={category} className="mb-8">
           <div className="mb-4 flex items-center justify-between">
             <h2 className="t-eyebrow text-muted-text/70 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-navly-red"></div>
               {category}
             </h2>
             <span className="t-caption">{catTasks.length} remaining</span>
           </div>
           <div className="flex flex-col">
              {catTasks.map(task => (
                 <TaskRow key={task.id} task={task} onToggle={toggle} />
              ))}
           </div>
        </div>
      ))}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="t-eyebrow text-green-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Completed
            </h2>
            <span className="t-caption text-green-600">{completedTasks.length} done</span>
          </div>
          <div className="flex flex-col opacity-60 hover:opacity-100 transition-opacity">
            {completedTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="mb-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-subtle bg-surface-card py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
            <ListChecks className="h-5 w-5 text-muted-text/70" />
          </div>
          <p className="mt-4 font-semibold text-heading">No tasks yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-text">
            Complete your profile in onboarding to generate a personalised checklist, or add a custom task below.
          </p>
        </div>
      )}

      <Toast message={message} />

      {/* Add task Input */}
      <div data-tour="tasks-add" className="flex gap-3 bg-surface-alt p-2 rounded-2xl border border-subtle shadow-inner mt-4">
        <Input
          placeholder="Add a custom task (e.g. 'Book English test', 'Update NOC description')…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="rounded-xl border-transparent bg-surface-card shadow-sm px-4 py-3 text-heading focus-visible:ring-navly-red"
        />
        <Button
          onClick={addTask}
          disabled={!newTitle.trim()}
          className="gap-2 bg-navly-red text-white hover:bg-navly-red/80 disabled:opacity-40 rounded-xl px-6"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
}: {
  task: Task
  onToggle: (id: string) => void
}) {
  const hasGuide = Boolean(TASK_GUIDES[task.id])

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-2xl border p-4 transition-all mb-3',
        task.done ? 'border-subtle/50 bg-surface-alt shadow-none' : 'border-subtle bg-surface-card shadow-sm hover:border-navly-navy/20 hover:shadow-md'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all focus:outline-none cursor-pointer',
          task.done ? 'border-[#10b981] bg-[#10b981]' : 'border-subtle hover:border-[#10b981] hover:bg-green-50'
        )}
      >
        {task.done && (
          <svg className="h-3.5 w-3.5 text-white animate-fade-in" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block text-[15px] font-semibold truncate',
            task.done ? 'text-muted-text/70 line-through' : 'text-heading'
          )}
        >
          {task.title}
        </span>
        {task.details && !task.done && (
          <p className="text-xs text-muted-text/70 truncate mt-0.5 max-w-[90%]">{task.details}</p>
        )}
      </div>

      {hasGuide && !task.done && (
        <Link
          href={`/dashboard/tasks/${task.id}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-subtle px-2.5 py-1.5 text-xs font-semibold text-muted-text hover:border-navly-navy hover:text-heading transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          More info
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
