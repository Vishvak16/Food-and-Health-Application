import React from "react";
import { motion } from "motion/react";
import { UserProfile, MealLog } from "../types";
import MacroRing from "./nutrition/MacroRing";
import NutrientBar from "./nutrition/NutrientBar";
import MealCard from "./nutrition/MealCard";
import { Plus, TrendingUp, Activity, AlertTriangle } from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  meals: MealLog[];
  onLogMeal: () => void;
}

export default function Dashboard({ profile, meals, onLogMeal }: DashboardProps) {
  const dailyTotal = meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targetKcal = 2200; // placeholder

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back, {profile.name}</h1>
          <p className="text-white/40 text-sm">Wednesday, October 25 • Day 12 Streak 🔥</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onLogMeal}
            className="flex items-center gap-2 bg-accent-green hover:bg-accent-green/80 text-black px-6 py-2.5 rounded-full font-bold shadow-lg shadow-accent-green/10 transition-all"
          >
            <Plus className="w-5 h-5" />
            Log a Meal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium flex items-center justify-around">
              <MacroRing 
                current={dailyTotal.calories} 
                total={targetKcal} 
                label="Calories" 
                unit="kcal" 
              />
              <div className="space-y-4 flex-1 ml-6">
                <NutrientBar label="Protein" current={`${dailyTotal.protein}g`} target="180g" color="bg-accent-blue" percentage={(dailyTotal.protein / 180) * 100} />
                <NutrientBar label="Carbs" current={`${dailyTotal.carbs}g`} target="220g" color="bg-accent-orange" percentage={(dailyTotal.carbs / 220) * 100} />
                <NutrientBar label="Fat" current={`${dailyTotal.fat}g`} target="70g" color="bg-accent-green" percentage={(dailyTotal.fat / 70) * 100} />
              </div>
            </div>

            <div className="card-premium">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-accent-green" />
                <p className="text-sm font-semibold text-white">Weekly Energy Balance</p>
              </div>
              <div className="flex items-end justify-between h-24 gap-2 mb-4">
                {[16, 20, 24, 18, 22, 24, 12].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 h-24 rounded-t-sm relative overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(h/24)*100}%` }}
                      className={`absolute bottom-0 w-full ${i === 5 ? 'bg-accent-green' : 'bg-accent-green/20'}`} 
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-white/30 font-medium">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>

          <div className="card-premium flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Logs</h2>
              <button className="text-accent-green text-xs font-bold uppercase tracking-wider hover:underline">View History</button>
            </div>
            <div className="space-y-4">
              {meals.length > 0 ? (
                meals.map(meal => <MealCard key={meal.id} meal={meal} />)
              ) : (
                <div className="text-center py-12 text-white/20">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No meals logged yet today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-accent-green/30 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/5 blur-3xl"></div>
            <div className="flex items-center gap-2 text-accent-green mb-3">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Intelligence</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-white/80">
              "You've already consumed <span className="font-bold text-accent-green">85% of your sodium</span> limit for today. I recommend a low-salt dinner like steamed salmon."
            </p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-colors text-white">
              Generate Dinner Ideas
            </button>
          </motion.div>

          <div className="bg-accent-red/10 rounded-2xl border border-accent-red/40 p-6">
            <div className="flex items-center gap-2 text-accent-red mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Medical Guardrail</span>
            </div>
            <div className="bg-black/20 p-3 rounded-lg border border-accent-red/20">
              <p className="text-xs text-accent-red font-medium">Interaction Warning:</p>
              <p className="text-[11px] text-white/70 leading-relaxed mt-1">
                Your last logged meal contains <span className="font-bold text-white">grapefruit</span>, which may interact with your active profile's <span className="underline underline-offset-2 italic">Statin medication</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
