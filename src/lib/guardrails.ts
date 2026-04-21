import { MealLog } from "../types";

/**
 * GUARDRAIL 1 — Eating Disorder Safety
 * Checks if calorie intake has been sustained below safe thresholds
 */
export function checkCalorieSafety(recentDailyTotals: number[]): boolean {
  if (recentDailyTotals.length < 3) return true;
  
  // Flag if < 700 kcal for 3 consecutive days
  const unsafeRun = recentDailyTotals.slice(-3).every(kcal => kcal < 700);
  return !unsafeRun;
}

/**
 * Checks journal/chat text for destructive patterns
 */
export function containsEDSensitivity(text: string): boolean {
  const patterns = ["purge", "starve", "hate my body", "don't want to eat", "nothing today", "fat and ugly"];
  return patterns.some(p => text.toLowerCase().includes(p));
}

/**
 * GUARDRAIL 2 — Pediatric Mode
 * Returns true if the profile is for a minor
 */
export function isPediatric(age: number): boolean {
  return age < 18;
}

/**
 * Appends pediatric warning if necessary
 */
export function wrapWithPediatricWarning(message: string, age: number): string {
  if (isPediatric(age)) {
    return `${message}\n\n[Medical Notice]: Please consult a registered dietitian or pediatrician before acting on these recommendations.`;
  }
  return message;
}
