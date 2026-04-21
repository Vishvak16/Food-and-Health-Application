export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  goals: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  medicalConditions: MedicalCondition[];
  budgetPerWeek: number;
  lastUpdated: number; // timestamp
}

export type MedicalCondition = 
  | 'diabetic' 
  | 'hypertensive' 
  | 'lactose-intolerant' 
  | 'celiac' 
  | 'pregnancy' 
  | 'postpartum'
  | 'none';

export interface MealLog {
  id: string;
  userId: string;
  profileId: string; // support household profiles
  date: string; // ISO
  mealName: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fiber?: number;
  image?: string; // storage URL or base64
  verificationMethod: 'ai' | 'manual' | 'voice' | 'barcode';
  confidence?: number;
  timestamp: number;
}

export interface HouseholdProfile {
  id: string;
  name: string;
  age: number;
  memberType: 'adult' | 'elderly' | 'child' | 'infant';
  isActive: boolean;
}
