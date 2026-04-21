import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, X, Loader2, Wand2 } from "lucide-react";
import { analyzeFoodImage } from "../../services/aiService";
import { UserProfile } from "../../types";

const mealSchema = z.object({
  mealName: z.string().min(2, "What did you eat?"),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
});

type MealFormData = z.infer<typeof mealSchema>;

export default function MealLogForm({ onSubmit, profile }: { onSubmit: (data: MealFormData, image?: string) => void, profile?: UserProfile }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        
        if (profile) {
          setIsAnalyzing(true);
          try {
            const analysis = await analyzeFoodImage(base64, profile);
            if (analysis) {
              setValue("mealName", analysis.foodName);
              setValue("calories", analysis.calories);
              setValue("protein", analysis.protein);
              setValue("carbs", analysis.carbs);
              setValue("fat", analysis.fat);
            }
          } catch (error) {
            console.error("AI Analysis failed:", error);
          } finally {
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, imagePreview || undefined))} className="space-y-6">
      <div className="flex flex-col items-center justify-center p-8 bg-bg-tertiary border-2 border-dashed border-white/10 rounded-2xl hover:border-accent-green/50 transition-colors relative group overflow-hidden">
        {imagePreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <button 
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-green animate-spin mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-accent-green">AI Analyzing...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent-green/10 transition-colors">
                <Camera className="w-8 h-8 text-white/40 group-hover:text-accent-green transition-colors" />
              </div>
              <p className="text-sm font-semibold">Snap a food photo</p>
              <p className="text-[11px] text-white/30 uppercase tracking-widest mt-1">Automatic macro detection</p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Food Description</label>
            {isAnalyzing && <span className="text-[10px] text-accent-green animate-pulse">Extracting details...</span>}
          </div>
          <div className="relative">
            <input 
              {...register("mealName")}
              placeholder={isAnalyzing ? "Analyzing..." : "e.g., Avocado Toast with Poached Egg"}
              disabled={isAnalyzing}
              className="w-full bg-bg-tertiary border border-white/10 rounded-xl p-3.5 pl-4 outline-none focus:border-accent-green transition-colors disabled:opacity-50"
            />
            {!isAnalyzing && !imagePreview && (
              <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            )}
          </div>
          {errors.mealName && <p className="text-accent-red text-[10px] font-medium">{errors.mealName.message}</p>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "calories", label: "Kcal", icon: "🔥" },
            { name: "protein", label: "Protein (g)", icon: "💪" },
            { name: "carbs", label: "Carbs (g)", icon: "🍝" },
            { name: "fat", label: "Fat (g)", icon: "🥑" },
          ].map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                <span>{field.icon}</span> {field.label}
              </label>
              <input 
                type="number"
                disabled={isAnalyzing}
                {...register(field.name as any, { valueAsNumber: true })}
                className="w-full bg-bg-tertiary border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-accent-green transition-colors disabled:opacity-50 font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        type="submit"
        disabled={isAnalyzing}
        className="w-full bg-accent-green text-black font-bold py-4 rounded-xl shadow-lg shadow-accent-green/10 hover:shadow-accent-green/20 hover:bg-accent-green/90 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? "Processing..." : "Confirm & Log Meal"}
      </button>
    </form>
  );
}
