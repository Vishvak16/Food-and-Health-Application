import React from "react";
import { MealLog } from "../../types";
import { cn } from "../../lib/utils";

export default function MealCard({ meal }: { meal: MealLog, key?: string | number }) {
  const emojiMap: Record<string, string> = {
    breakfast: "🍳",
    lunch: "🥗",
    dinner: "🍽️",
    snack: "🥝",
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
        {meal.image ? (
          <img src={meal.image} alt={meal.mealName} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
        ) : (
          emojiMap[meal.type] || "🍕"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{meal.mealName}</p>
        <p className="text-xs text-white/40">
          Logged at {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {meal.verificationMethod === 'ai' ? 'AI Vision Verified' : 'Manual Entry'}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">{meal.calories} <span className="text-[10px] font-normal opacity-50 uppercase tracking-tighter">kcal</span></p>
        <div className="flex gap-1 mt-1 justify-end">
          {meal.protein > 20 && (
            <span className="px-1.5 py-0.5 bg-accent-blue/20 text-accent-blue text-[10px] rounded">High P</span>
          )}
          {meal.carbs < 15 && (
            <span className="px-1.5 py-0.5 bg-accent-green/20 text-accent-green text-[10px] rounded">Low Carb</span>
          )}
        </div>
      </div>
    </div>
  );
}
