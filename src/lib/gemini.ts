import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: In Vite, we use process.env.GEMINI_API_KEY which is defined in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

/**
 * Centralized Gemini API utility
 */
export const gemini = ai;

export default ai;
