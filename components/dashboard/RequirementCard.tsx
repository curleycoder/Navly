import { LucideIcon } from 'lucide-react'

export interface RequirementCardProps {
  icon: LucideIcon;
  title: string;
  status: "Complete" | "In Progress" | "Required" | "Active" | "Under Review";
  details: { label: string; value: string | number }[];
  progress?: number;
}

export function RequirementCard({ icon: Icon, title, status, details, progress }: RequirementCardProps) {
  const isComplete = status === "Complete";
  const progressColor = isComplete ? "bg-green-600" : "bg-[#0b1f3a]";
  const statusColors = {
    "Complete": "bg-green-100 text-green-700",
    "In Progress": "bg-slate-100 text-slate-700",
    "Required": "bg-red-100 text-[#d62828]",
    "Active": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700"
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mb-3 text-[15px] font-bold text-[#0b1f3aLeading-tight] sm:text-base">
        {title}
      </h3>
      
      {details.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-x-2 gap-y-2 text-xs flex-1">
          {details.map((d, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-slate-500">{d.label}</span>
              <span className="truncate font-semibold text-[#0b1f3a]">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {progress !== undefined && (
        <div className="mb-4 mt-auto">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-[#0b1f3a]">Progress</span>
            <span className="text-[#0b1f3a]">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div 
              className={`h-1.5 rounded-full ${progressColor} transition-all duration-1000`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500">status</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
          {status}
        </span>
      </div>
    </div>
  )
}
