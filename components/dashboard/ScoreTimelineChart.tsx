'use client'

import { useEffect, useState, useMemo } from 'react'
import { getScoreHistory, type ScoreSnapshot } from '@/lib/history'
import { LineChart, TrendingUp } from 'lucide-react'

export function ScoreTimelineChart() {
  const [history, setHistory] = useState<ScoreSnapshot[]>([])

  useEffect(() => {
    setHistory(getScoreHistory())
  }, [])

  const points = useMemo(() => {
    if (history.length < 2) return null;
    
    const w = 300;
    const h = 60;
    
    // Create some vertical padding
    const minS = Math.max(0, Math.min(...history.map(s => s.score)) - 20);
    const maxS = Math.min(1200, Math.max(...history.map(s => s.score)) + 20);
    const sRange = (maxS - minS) || 1;
    
    return history.map((entry, i) => {
      const x = history.length === 1 ? w / 2 : (i / (history.length - 1)) * w;
      // In SVG, y=0 is top, so we invert
      const y = h - ((entry.score - minS) / sRange) * h;
      return { x, y, score: entry.score };
    })
  }, [history])

  if (history.length < 2) {
    return (
      <div className="mt-6 w-full text-center px-4">
        <p className="text-xs text-muted-text/70 font-medium">
          Update your score simulating "What-Ifs" to build your progress timeline.
        </p>
      </div>
    );
  }

  const pathD = points ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
  const latestGain = history[history.length - 1].score - history[0].score;

  return (
    <div className="mt-8 w-full animate-fade-in flex flex-col px-2">
       <div className="flex items-center justify-between mb-3 w-full">
         <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-alt border border-subtle/50 rounded-full text-[10px] font-bold text-muted-text uppercase tracking-wide">
           <LineChart className="h-3.5 w-3.5 text-navly-red" /> History
         </div>
         {latestGain !== 0 && (
           <span className={`text-[11px] font-bold ${latestGain > 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} px-2 py-0.5 rounded flex items-center gap-1`}>
             <TrendingUp className={`h-3 w-3 ${latestGain < 0 && 'rotate-180'}`} /> {latestGain > 0 ? '+' : ''}{latestGain}
           </span>
         )}
       </div>

       <div className="relative w-full h-[80px]" style={{ maxWidth: '100%' }}>
          {/* Preserve aspect ratio visually without clipping */}
          <svg width="100%" height="100%" viewBox="0 -15 300 90" className="overflow-visible" preserveAspectRatio="none">
             {/* Subtle gradient under line */}
             <defs>
               <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="var(--navly-red)" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="var(--navly-red)" stopOpacity="0" />
               </linearGradient>
             </defs>
             {points && <path d={`${pathD} L ${points[points.length-1].x},85 L ${points[0].x},85 Z`} fill="url(#lineFill)" stroke="none" />}
             
             {/* The line itself */}
             <path d={pathD} fill="none" stroke="var(--navly-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             
             {points?.map((p, i) => (
               <g key={i}>
                 <circle cx={p.x} cy={p.y} r="4" fill="var(--page-card)" stroke="var(--navly-navy)" strokeWidth="2" className="transition-all cursor-pointer" />
                 {/* Only label first and last, or all if short */}
                 {(i === points.length - 1 || i === 0 || history.length < 4) && (
                   <text x={p.x} y={p.y - 12} fontSize="12" fontWeight="bold" fill="var(--navly-navy)" textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>
                     {p.score}
                   </text>
                 )}
               </g>
             ))}
          </svg>
       </div>
    </div>
  )
}
