'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react'
import { loadTasks, type Task } from '@/lib/tasks'
import { TASK_GUIDES, type TaskGuide } from '@/lib/task-guides'
import { loadProfile } from '@/lib/profile'
import { cn } from '@/lib/utils'

const typeStyles = {
  official: 'border-[#0B1F3A]/20 bg-[#0B1F3A]/5',
  recommended: 'border-slate-200 bg-white',
  budget: 'border-amber-200 bg-amber-50',
}

const typeBadge = {
  official: { label: 'Official', className: 'bg-[#0B1F3A] text-white' },
  recommended: { label: 'Recommended', className: 'bg-slate-100 text-slate-600' },
  budget: { label: 'Budget pick', className: 'bg-amber-100 text-amber-700' },
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [guide, setGuide] = useState<TaskGuide | null>(null)
  const [userProvince, setUserProvince] = useState<string | null>(null)

  useEffect(() => {
    const tasks = loadTasks()
    const found = tasks.find((t) => t.id === id)
    setTask(found ?? null)

    const g = TASK_GUIDES[id]
    setGuide(g ?? null)

    const profile = loadProfile()
    const province = profile?.province || profile?.intendedProvince || null
    setUserProvince(province)
  }, [id])

  if (!task && !guide) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link href="/dashboard/tasks" className="mb-6 hidden md:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to tasks
        </Link>
        <p className="text-slate-500">Task not found.</p>
      </div>
    )
  }

  // Relevant province info: exact match first, then fallback to all provinces entry
  const provinceMatch = guide?.provinceInfo?.find(
    (p) => userProvince && p.provinces.includes(userProvince)
  ) ?? guide?.provinceInfo?.find((p) => p.provinces.length > 3)

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 animate-fade-in">
      <Link href="/dashboard/tasks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to tasks
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="hidden md:block text-sm font-semibold uppercase tracking-wide text-[#D62828]">
          {task?.category ?? 'Settlement & Living'}
        </p>
        <h1 className="hidden md:block mt-1 text-3xl font-bold text-[#0B1F3A]">{task?.title ?? guide?.taskId}</h1>
        {guide?.timeEstimate && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#D62828]" />
            {guide.timeEstimate}
          </p>
        )}
      </div>

      {/* Overview */}
      {guide?.overview && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-600">{guide.overview}</p>
        </div>
      )}

      {/* Steps */}
      {guide?.steps && guide.steps.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Step-by-step</h2>
          <div className="flex flex-col gap-3">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D62828] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F3A]">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Province-specific info */}
      {guide?.provinceInfo && guide.provinceInfo.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Province info{userProvince ? ` — ${userProvince}` : ''}
          </h2>
          <div className="flex flex-col gap-3">
            {(userProvince
              ? guide.provinceInfo.filter((p) =>
                  p.provinces.includes(userProvince) || p.provinces.length > 3
                )
              : guide.provinceInfo
            ).map((p, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl border p-4',
                  userProvince && p.provinces.includes(userProvince)
                    ? 'border-[#D62828]/30 bg-[#D62828]/5 ring-1 ring-[#D62828]/10'
                    : 'border-slate-200 bg-white'
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-[#0B1F3A] text-sm">{p.label}</p>
                  {userProvince && p.provinces.includes(userProvince) && (
                    <span className="rounded-full bg-[#D62828] px-2 py-0.5 text-[10px] font-bold text-white">Your province</span>
                  )}
                </div>
                <p className="text-sm leading-6 text-slate-600">{p.info}</p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0B1F3A] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Official site
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services / Options */}
      {guide?.services && guide.services.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Where to go</h2>
          <div className="flex flex-col gap-3">
            {guide.services.map((svc, i) => (
              <div key={i} className={cn('rounded-2xl border p-4', typeStyles[svc.type])}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', typeBadge[svc.type].className)}>
                    {typeBadge[svc.type].label}
                  </span>
                  {svc.tag && (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {svc.tag}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-[#0B1F3A]">{svc.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{svc.description}</p>
                <a
                  href={svc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#0B1F3A] hover:text-[#0B1F3A] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit website
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Find nearby */}
      {guide?.findNearbyUrl && (
        <div className="mb-8">
          <a
            href={guide.findNearbyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#0B1F3A] bg-[#0B1F3A] py-4 text-sm font-bold text-white transition hover:bg-[#162d52]"
          >
            <MapPin className="h-4 w-4" />
            {guide.findNearbyLabel ?? 'Find nearby locations'}
          </a>
        </div>
      )}

      {/* Tips */}
      {guide?.tips && guide.tips.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Tips</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ul className="flex flex-col gap-3">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#10b981]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mark complete CTA */}
      {task && !task.done && (
        <p className="text-center text-xs text-slate-400">
          Once you&apos;ve completed this step, check it off from the{' '}
          <Link href="/dashboard/tasks" className="font-semibold text-[#0B1F3A] hover:underline">
            tasks list
          </Link>
          .
        </p>
      )}
    </div>
  )
}
