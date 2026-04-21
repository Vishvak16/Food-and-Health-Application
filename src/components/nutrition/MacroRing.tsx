import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface MacroRingProps {
  current: number;
  total: number;
  label: string;
  unit: string;
  className?: string;
}

export default function MacroRing({ current, total, label, unit, className }: MacroRingProps) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center w-36 h-36", className)}>
      <svg className="w-full h-full transform -rotate-90">
        <circle 
          cx="72" 
          cy="72" 
          r={radius} 
          stroke="currentColor" 
          strokeWidth="12" 
          fill="transparent" 
          className="text-white/5" 
        />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="72" 
          cy="72" 
          r={radius} 
          stroke="currentColor" 
          strokeWidth="12" 
          fill="transparent" 
          strokeDasharray={circumference}
          className="text-accent-green" 
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold">{current.toLocaleString()}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">of {total.toLocaleString()} {unit}</p>
      </div>
    </div>
  );
}
