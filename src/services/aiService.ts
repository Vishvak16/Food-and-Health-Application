import { GoogleGenAI, Type } from "@google/genai";
import { MealLog, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * Analyzes food image using Gemini Pro Vision
 */
export async function analyzeFoodImage(base64Image: string, profile: UserProfile) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this food image for a user with the following profile:
    Age: ${profile.age}
    Conditions: ${profile.medicalConditions.join(', ')}
    Goals: ${profile.goals.join(', ')}

    Return a JSON object with:
    - foodName: string
    - calories: number
    - protein: number (g)
    - carbs: number (g)
    - fat: number (g)
    - sodium: number (mg)
    - fiber: number (g)
    - confidence: number (0-1)
    - healthNote: string (brief advice)
    - containsAllergens: string[]
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          sodium: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          healthNote: { type: Type.STRING },
          containsAllergens: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["foodName", "calories", "protein", "carbs", "fat", "confidence"],
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

/**
 * Generates a 7-day meal plan
 */
export async function generateMealPlan(profile: UserProfile) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a 7-day healthy meal plan for:
    Profile: ${JSON.stringify(profile)}
    
    For each day, provide breakfast, lunch, dinner, and 2 snacks.
    Return as a JSON array of 7 objects, each with 'day' and 'meals' (array of objects with 'type', 'name', 'calories', 'macros').
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "[]");
}
