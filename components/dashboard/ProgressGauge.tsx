'use client'

interface ProgressGaugeProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressGauge({ value, max = 100, label, sublabel }: ProgressGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 10;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative flex h-48 w-48 items-center justify-center sm:h-64 sm:w-64">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 120 120"
        >
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-slate-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-[#D62828] transition-all duration-1000 ease-in-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-[#0B1F3A] sm:text-5xl">
            {percentage.toFixed(0)}%
          </span>
          {label && (
            <span className="mt-1 text-sm font-medium text-slate-500">
              {label}
            </span>
          )}
        </div>
      </div>
      {sublabel && (
        <p className="mt-4 text-center text-sm font-medium text-slate-600">
          {sublabel}
        </p>
      )}
    </div>
  );
}
