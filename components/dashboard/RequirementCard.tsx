import { LucideIcon, ChevronRight } from 'lucide-react'

export interface RequirementCardProps {
  icon: LucideIcon;
  title: string;
  status: "Complete" | "In Progress" | "Required" | "Active" | "Under Review";
  details: { label: string; value: string | number }[];
  progress?: number;
  onClick?: () => void;
}

export function RequirementCard({ icon: Icon, title, status, details, progress, onClick }: RequirementCardProps) {
  const isComplete = status === "Complete";
  const progressColor = isComplete ? "bg-green-600" : "bg-[#0b1f3a]";
  const statusColors = {
    "Complete": "bg-green-100 text-green-700",
    "In Progress": "bg-slate-100 text-slate-700",
    "Required": "bg-red-100 text-[#d62828]",
    "Active": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700"
  };

  const interactiveStyles = onClick ? "cursor-pointer hover:border-[#D62828] hover:shadow-md active:scale-[0.99] transition-all" : "";

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={`flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${interactiveStyles}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {onClick && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
      <h3 className="mb-3 text-base font-bold leading-tight text-[#0b1f3a]">
        {title}
      </h3>

      {details.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-2 flex-1">
          {details.map((d, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-xs text-slate-500">{d.label}</span>
              <span className="truncate text-sm font-semibold text-[#0b1f3a]">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2.5">
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColors[status] ?? "bg-slate-100 text-slate-700"}`}>
          {status}
        </span>
        {progress !== undefined && (
          <>
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${status} — ${progress}%`}
            >
              <div
                className={`h-full rounded-full ${progressColor} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400">{progress}%</span>
          </>
        )}
      </div>
    </div>
  )
}
