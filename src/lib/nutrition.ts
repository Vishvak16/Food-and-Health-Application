import { UserProfile, MealLog } from "../types";

/**
 * NIH Tolerable Upper Intake Levels (UL) approximations for adults
 */
export const NUTRIENT_UPPER_LIMITS = {
  sodium: 2300, // mg
  fiber: 50, // g (not a UL but a high intake warning threshold for context)
  calcium: 2500, // mg
};

/**
 * Calculate recommended daily calorie intake using Mifflin-St Jeor Equation
 */
export function calculateTargetCalories(profile: UserProfile): number {
  // Simplified BMR calculation
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5; // assumes male for simplicity or mid-range
  // Low activity multiplier
  return Math.round(bmr * 1.2);
}

/**
 * Aggregates nutrients for a list of meal logs
 */
export function aggregateDailyMacros(meals: MealLog[]) {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
    sodium: acc.sodium + (meal.sodium || 0),
    fiber: acc.fiber + (meal.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0 });
}

/**
 * Checks for medical conflicts based on meal data and user profile
 */
export function checkMedicalConflicts(foodName: string, macros: Partial<MealLog>, profile: UserProfile): string[] {
  const conflicts: string[] = [];

  if (profile.medicalConditions.includes('diabetic') && (macros.carbs || 0) > 60) {
    conflicts.push("High carbohydrate content may spike blood glucose levels.");
  }

  if (profile.medicalConditions.includes('hypertensive') && (macros.sodium || 0) > 800) {
    conflicts.push("High sodium content detected. Monitor blood pressure.");
  }

  if (profile.medicalConditions.includes('pregnancy')) {
    const rawPatterns = ['sushi', 'blue cheese', 'raw', 'rare steak'];
    if (rawPatterns.some(p => foodName.toLowerCase().includes(p))) {
      conflicts.push("BLOCK: Potential listeria risk. Raw or unpasteurized foods are restricted during pregnancy.");
    }
  }

  return conflicts;
}
