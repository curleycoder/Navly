import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300',
        message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <div className="flex items-center gap-2 rounded-2xl bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white shadow-xl">
        <CheckCircle2 className="h-4 w-4 text-green-400" />
        {message}
      </div>
    </div>
  )
}
