import { motion } from "motion/react";
import { UserProfile } from "../types";
import { generateMealPlan } from "../services/aiService";
import { useState, useEffect } from "react";
import { Loader2, Calendar, ShoppingBag, MapPin, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface MealPlanProps {
  profile: UserProfile;
}

export default function MealPlan({ profile }: MealPlanProps) {
  const [plan, setPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const data = await generateMealPlan(profile);
      setPlan(data);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportToPDF() {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`7-Day Meal Plan for ${profile.name}`, 10, 20);
    doc.setFontSize(12);
    
    plan.forEach((day, index) => {
      const y = 40 + (index * 30);
      doc.text(`Day ${index + 1}: ${day.meals.map((m: any) => m.name).join(', ')}`, 10, y);
    });
    
    doc.save("meal-plan.pdf");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Personalized Meal Plan</h1>
          <p className="text-white/40 text-sm">AI-generated based on your budget and medical profile</p>
        </div>
        <div className="flex gap-3">
          {plan && (
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-accent-green hover:bg-accent-green/80 text-black px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            {plan ? "Regenerate Plan" : "Generate Plan"}
          </button>
        </div>
      </header>

      {!plan && !loading ? (
        <div className="card-premium py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No active meal plan</h2>
          <p className="text-white/40 max-w-sm mb-8">
            Click generate to create a science-backed 7-day meal plan tailored to your hypertensive condition and $150/week budget.
          </p>
          <button 
            onClick={handleGenerate}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Start Planning
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="card-premium animate-pulse h-64 bg-white/5 border-none" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plan.map((day: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-premium flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-accent-green font-bold">Day {i + 1}</span>
                <span className="text-[10px] text-white/40">{day.meals.reduce((sum: number, m: any) => sum + m.calories, 0)} Kcal</span>
              </div>
              <div className="space-y-4 flex-1">
                {day.meals.map((meal: any, mi: number) => (
                  <div key={mi} className="border-l-2 border-white/5 pl-3 py-1">
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">{meal.type}</p>
                    <p className="text-sm font-medium text-white/90 leading-tight mb-1">{meal.name}</p>
                    <div className="flex gap-2">
                       <span className="text-[9px] text-accent-blue">{meal.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Shopping List helper */}
          <div className="card-premium lg:col-span-2 xl:col-span-1 bg-accent-blue/5 border-accent-blue/20">
            <div className="flex items-center gap-2 text-accent-blue mb-4">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="font-bold">Shopping Insights</h3>
            </div>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              Based on your $150 budget, we've optimized this plan for seasonal produce and bulk grains.
            </p>
            <button className="w-full py-2.5 bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded-xl text-xs font-bold transition-colors mb-3">
              View Shopping List
            </button>
            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <MapPin className="w-3 h-3" />
              Find Stores Nearby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
