'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, ListChecks, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadTasks, saveTasks, generateTasks, type Task, type TaskCategory } from '@/lib/tasks'
import { loadProfile } from '@/lib/profile'
import { calculateScore } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/useToast'
import { Toast } from '@/components/ui/Toast'

export default function TasksPage() {
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

  function remove(id: string) {
    update(tasks.filter((t) => t.id !== id))
    showToast('Task removed')
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
    <div className="mx-auto w-full max-w-3xl px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Action plan</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Your Settlement & PR Checklist</h1>
        <p className="mt-2 text-slate-500">
          Step-by-step tasks generated from your profile. Tap any item for specific instructions on how and where to complete it.
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {done} of {total} tasks complete
            </p>
            <span className="text-sm font-bold text-[#D62828]">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#D62828] transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Categories */}
      {Array.from(pendingByCategory.entries()).map(([category, catTasks]) => (
        <div key={category} className="mb-8">
           <div className="mb-4 flex items-center justify-between">
             <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#D62828]"></div>
               {category}
             </h2>
             <span className="text-xs font-semibold text-slate-400">{catTasks.length} remaining</span>
           </div>
           <div className="flex flex-col">
              {catTasks.map(task => (
                 <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
              ))}
           </div>
        </div>
      ))}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-green-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Completed
            </h2>
            <span className="text-xs font-semibold text-green-600">{completedTasks.length} done</span>
          </div>
          <div className="flex flex-col opacity-60 hover:opacity-100 transition-opacity">
            {completedTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="mb-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ListChecks className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 font-semibold text-[#0B1F3A]">No tasks yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Complete your profile in onboarding to generate a personalised checklist, or add a custom task below.
          </p>
        </div>
      )}

      <Toast message={message} />

      {/* Add task Input */}
      <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner mt-4">
        <Input
          placeholder="Add a custom task (e.g. 'Book English test', 'Update NOC description')…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="rounded-xl border-transparent bg-white shadow-sm px-4 py-3 text-[#0B1F3A] focus-visible:ring-[#D62828]"
        />
        <Button
          onClick={addTask}
          disabled={!newTitle.trim()}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40 rounded-xl px-6"
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
  onRemove,
}: {
  task: Task
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'group flex flex-col gap-0 rounded-2xl border transition-all overflow-hidden mb-3',
        task.done ? 'border-slate-100 bg-slate-50 shadow-none' : 'border-slate-200 bg-white shadow-sm hover:border-[#0B1F3A]/20 hover:shadow-md'
      )}
    >
      <div 
         onClick={() => setExpanded(!expanded)}
         className={cn("flex items-center gap-4 p-4", task.details ? "cursor-pointer" : "")}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all focus:outline-none',
            task.done ? 'border-[#10b981] bg-[#10b981]' : 'border-slate-300 hover:border-[#10b981] hover:bg-green-50'
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
              task.done ? 'text-slate-400 line-through' : 'text-[#0B1F3A]'
            )}
          >
            {task.title}
          </span>
          {task.details && !expanded && !task.done && (
             <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[90%]">
               <span className="text-[#D62828] font-semibold mr-1">TIPS:</span> 
               {task.details}
             </p>
          )}
        </div>

        {task.details && !task.done && (
          <div className="shrink-0 text-slate-300 transition-colors group-hover:text-[#0B1F3A]">
             {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(task.id); }}
          className={cn(
            "ml-2 shrink-0 p-2 rounded-lg transition-colors focus:outline-none",
            task.done ? "text-slate-300 hover:text-red-400 hover:bg-red-50" : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
          )}
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && task.details && (
        <div className="px-13 pb-5 pt-1 animate-fade-in text-sm text-slate-600 leading-relaxed bg-slate-50/50">
          <div className="p-4 bg-[#0B1F3A]/5 rounded-xl border border-[#0B1F3A]/10 text-[#0B1F3A]">
            <div className="flex gap-2 items-start">
               <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#D62828]" />
               <p>{task.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
