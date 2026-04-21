import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserProfile, MedicalCondition } from "../../types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(120),
  weight: z.number().min(2),
  height: z.number().min(30),
  medicalConditions: z.array(z.string()),
  budgetPerWeek: z.number().min(0),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm({ 
  initialData, 
  onSubmit 
}: { 
  initialData?: Partial<UserProfile>, 
  onSubmit: (data: ProfileFormData) => void 
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData as any
  });

  const conditions: MedicalCondition[] = [
    'diabetic', 'hypertensive', 'lactose-intolerant', 'celiac', 'pregnancy', 'postpartum'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Full Name</label>
          <input 
            {...register("name")} 
            className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent-green transition-colors"
          />
          {errors.name && <p className="text-accent-red text-[10px]">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Age</label>
          <input 
            type="number"
            {...register("age", { valueAsNumber: true })} 
            className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent-green transition-colors"
          />
          {errors.age && <p className="text-accent-red text-[10px]">{errors.age.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Weight (kg)</label>
          <input 
            type="number"
            {...register("weight", { valueAsNumber: true })} 
            className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent-green transition-colors"
          />
          {errors.weight && <p className="text-accent-red text-[10px]">{errors.weight.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Height (cm)</label>
          <input 
            type="number"
            {...register("height", { valueAsNumber: true })} 
            className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent-green transition-colors"
          />
          {errors.height && <p className="text-accent-red text-[10px]">{errors.height.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Weekly Budget ($)</label>
        <input 
          type="number"
          {...register("budgetPerWeek", { valueAsNumber: true })} 
          className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent-green transition-colors"
        />
        {errors.budgetPerWeek && <p className="text-accent-red text-[10px]">{errors.budgetPerWeek.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Medical Conditions</label>
        <div className="flex flex-wrap gap-2">
          {conditions.map(condition => (
            <label key={condition} className="flex items-center gap-2 bg-bg-tertiary border border-white/5 px-3 py-2 rounded-lg cursor-pointer hover:border-accent-green/50 transition-colors">
              <input 
                type="checkbox" 
                value={condition} 
                {...register("medicalConditions")}
                className="accent-accent-green"
              />
              <span className="text-xs capitalize">{condition.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-accent-green text-black font-bold py-3 rounded-xl shadow-lg shadow-accent-green/10 hover:bg-accent-green/90 transition-all"
      >
        Save Profile
      </button>
    </form>
  );
}
