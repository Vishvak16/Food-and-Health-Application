/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Camera, 
  ClipboardList, 
  ScanQrCode, 
  Users, 
  Activity,
  UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserProfile, MedicalCondition, MealLog } from "./types";
import Dashboard from "./components/Dashboard";
import ProfileForm from "./components/forms/ProfileForm";
import MealLogForm from "./components/forms/MealLogForm";
import MealPlan from "./components/MealPlan";
import LabelScanner from "./components/LabelScanner";

import { useAuth } from "./lib/AuthContext";
import { dbService } from "./services/dbService";

const DEFAULT_PROFILE_BASE: Partial<UserProfile> = {
  goals: [],
  dietaryRestrictions: [],
  allergies: [],
  cuisinePreferences: [],
  medicalConditions: [],
  budgetPerWeek: 0,
};

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  // Fetch profile when user is authenticated
  useEffect(() => {
    async function loadData() {
      if (user) {
        setProfileLoading(true);
        const p = await dbService.getUserProfile(user.uid);
        setProfile(p);
        
        if (p) {
          const m = await dbService.getRecentMeals(user.uid);
          setMeals(m);
        }
        setProfileLoading(false);
      } else {
        setProfile(null);
        setMeals([]);
        setProfileLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleProfileSubmit = async (data: any) => {
    if (!user) return;
    const fullProfile = { ...DEFAULT_PROFILE_BASE, ...data, uid: user.uid, lastUpdated: Date.now() };
    await dbService.saveUserProfile(user.uid, fullProfile);
    setProfile(fullProfile as UserProfile);
  };

  const handleMealLogged = async (data: any, image?: string) => {
    if (!user || !profile) return;
    const newMeal = await dbService.logMeal(user.uid, {
      profileId: '1', // default for now
      date: new Date().toISOString(),
      type: 'lunch', // placeholder, should come from AI or manual selection
      mealName: data.mealName,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      image,
      verificationMethod: 'ai'
    });
    
    if (newMeal) {
      setMeals([newMeal as MealLog, ...meals]);
      setActiveTab("dashboard");
      setShowLogModal(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Activity className="w-12 h-12 text-accent-green animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-accent-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent-green/20">
            <Activity className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">NutriWise AI</h1>
          <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
            Smart nutrition tracking with medical guardrails and personalized AI-driven meal planning.
          </p>
        </div>
        <button 
          onClick={login}
          className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-white/90 transition-all active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" referrerPolicy="no-referrer" />
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-bg-secondary p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <Activity className="w-12 h-12 text-accent-green mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Setup Your Profile</h1>
            <p className="text-white/40 mt-2">Personalize your dietary limits and health goals.</p>
          </div>
          <ProfileForm onSubmit={handleProfileSubmit} />
        </div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
        activeTab === id 
          ? "bg-white/5 text-accent-green" 
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-bg-primary text-white font-sans overflow-hidden">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-bg-secondary border-r border-white/10 flex flex-col p-6 shrink-0 z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">NutriWise AI</span>
        </div>

        <div className="space-y-1 flex-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="log" icon={Camera} label="Log Meal" />
          <NavItem id="plan" icon={ClipboardList} label="Meal Plan" />
          <NavItem id="scan" icon={ScanQrCode} label="Label Scanner" />
        </div>

        <div className="mt-8">
          <div className="p-4 bg-bg-tertiary rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent-blue overflow-hidden flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">Adult Profile</p>
              </div>
            </div>
            <button className="w-full text-[10px] font-bold py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/60 uppercase tracking-tighter transition-colors">
              Switch Household
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard 
                profile={profile} 
                meals={meals} 
                onLogMeal={() => setShowLogModal(true)} 
              />
            </motion.div>
          )}
          {activeTab === "log" && (
            <motion.div 
              key="log"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto py-8"
            >
              <h2 className="text-2xl font-bold mb-6">Log a New Meal</h2>
              <MealLogForm 
                profile={profile}
                onSubmit={handleMealLogged} />
            </motion.div>
          )}
          {activeTab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MealPlan profile={profile} />
            </motion.div>
          )}
          {activeTab === "scan" && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LabelScanner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating action button modal overlay placeholder */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl bg-bg-secondary p-8 rounded-3xl border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowLogModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                Close
              </button>
              <h2 className="text-2xl font-bold mb-6">Log a Meal</h2>
              <MealLogForm 
                profile={profile}
                onSubmit={handleMealLogged} />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
