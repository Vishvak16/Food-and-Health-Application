import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db, handleFirestoreError } from "../lib/firebase";
import { UserProfile, MealLog } from "../types";

export const dbService = {
  /**
   * Saves both public and private profile data (split collection strategy)
   */
  async saveUserProfile(userId: string, data: Partial<UserProfile>) {
    try {
      // 1. Save Public Profile
      const publicRef = doc(db, 'users', userId);
      await setDoc(publicRef, {
        displayName: data.name,
        lastUpdated: Date.now() // Using MS for compatibility with types
      }, { merge: true });

      // 2. Save Private Profile (Health PII)
      const privateRef = doc(db, 'users', userId, 'private', 'profile');
      const privateData = {
        age: data.age,
        weight: data.weight,
        height: data.height,
        medicalConditions: data.medicalConditions,
        goals: data.goals,
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies,
        cuisinePreferences: data.cuisinePreferences,
        budgetPerWeek: data.budgetPerWeek
      };
      await setDoc(privateRef, privateData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'create', `/users/${userId}`);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const publicSnap = await getDoc(doc(db, 'users', userId));
      const privateSnap = await getDoc(doc(db, 'users', userId, 'private', 'profile'));

      if (!publicSnap.exists()) return null;

      const publicData = publicSnap.data();
      const privateData = privateSnap.exists() ? privateSnap.data() : {};

      return {
        uid: userId,
        name: publicData.displayName,
        age: privateData.age || 0,
        weight: privateData.weight || 0,
        height: privateData.height || 0,
        medicalConditions: privateData.medicalConditions || [],
        goals: privateData.goals || [],
        dietaryRestrictions: privateData.dietaryRestrictions || [],
        allergies: privateData.allergies || [],
        cuisinePreferences: privateData.cuisinePreferences || [],
        budgetPerWeek: privateData.budgetPerWeek || 0,
        lastUpdated: publicData.lastUpdated || Date.now()
      };
    } catch (error) {
      handleFirestoreError(error, 'get', `/users/${userId}`);
      return null;
    }
  },

  async logMeal(userId: string, meal: Omit<MealLog, 'id' | 'userId' | 'timestamp'>) {
    try {
      const mealsRef = collection(db, 'users', userId, 'meals');
      const payload = {
        ...meal,
        userId,
        timestamp: Date.now()
      };
      const docRef = await addDoc(mealsRef, payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      handleFirestoreError(error, 'create', `/users/${userId}/meals`);
    }
  },

  async getRecentMeals(userId: string, count: number = 10): Promise<MealLog[]> {
    try {
      const mealsRef = collection(db, 'users', userId, 'meals');
      const q = query(mealsRef, orderBy('timestamp', 'desc'), limit(count));
      const snap = await getDocs(q);
      
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as MealLog[];
    } catch (error) {
      handleFirestoreError(error, 'list', `/users/${userId}/meals`);
      return [];
    }
  }
};
