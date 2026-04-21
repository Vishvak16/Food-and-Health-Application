import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface NutrientBarProps {
  label: string;
  current: string;
  target: string;
  color: string;
  percentage: number; // 0-100
}

export default function NutrientBar({ label, current, target, color, percentage }: NutrientBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/40 uppercase font-medium">{label}</span>
        <span className="font-medium">{current} / {target}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full", color)} 
        />
      </div>
    </div>
  );
}
