'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ListChecks } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadTasks, saveTasks, generateTasks, type Task } from '@/lib/tasks'
import { loadProfile } from '@/lib/profile'
import { calculateScore } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/useToast'
import { Toast } from '@/components/ui/Toast'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const { message, showToast } = useToast()

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('navly_tasks')
    if (saved) {
      setTasks(loadTasks())
    } else {
      const profile = loadProfile()
      if (profile) {
        const score = calculateScore(profile)
        setTasks(generateTasks(profile, score))
      } else {
        setTasks(loadTasks())
      }
    }
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

  const pending = tasks.filter((t) => !t.done)
  const completed = tasks.filter((t) => t.done)

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Tasks</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">My tasks</h1>
        <p className="mt-2 text-slate-500">
          Stay on top of your next steps before your consultation.
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {done} of {total} complete
            </p>
            <span className="text-sm font-bold text-[#D62828]">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#D62828] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            To do
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Done
          </h2>
          <div className="flex flex-col gap-2">
            {completed.map((task) => (
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
            Add your first task below to stay on top of your next immigration steps.
          </p>
        </div>
      )}

      <Toast message={message} />

      {/* Add task */}
      <div className="flex gap-3">
        <Input
          placeholder="Add a task…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
        />
        <Button
          onClick={addTask}
          disabled={!newTitle.trim()}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
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
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-4 transition-all',
        task.done ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all focus:outline-none',
          task.done ? 'border-[#D62828] bg-[#D62828]' : 'border-slate-300 hover:border-[#D62828]'
        )}
      >
        {task.done && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-sm font-semibold',
          task.done ? 'text-slate-400 line-through' : 'text-[#0B1F3A]'
        )}
      >
        {task.title}
      </span>

      <button
        onClick={() => onRemove(task.id)}
        className="ml-1 shrink-0 text-slate-300 transition hover:text-red-400 focus:outline-none"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
