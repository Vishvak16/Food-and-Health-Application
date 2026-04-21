import React, { useState } from "react";
import { Camera, Loader2, ScanLine, AlertCircle, Activity } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export default function LabelScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        setIsScanning(true);
        
        try {
          const model = "gemini-3-flash-preview";
          const prompt = "Extract all nutrition facts from this label image. Return JSON with calories, protein, carbs, fat, sodium, fiber, and ingredients list. Also highlight any potentially harmful ingredients like high fructose corn syrup or trans fats.";
          
          const imagePart = {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64.split(',')[1],
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
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  sodium: { type: Type.NUMBER },
                  fiber: { type: Type.NUMBER },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              }
            }
          });

          setResult(JSON.parse(response.text || "{}"));
        } catch (err) {
          console.error(err);
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Nutrition Label AI Scanner</h1>
        <p className="text-white/40 text-sm">Snap a photo of the nutrition facts panel to reveal hidden additives and precise macros.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-bg-tertiary border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center relative group transition-all hover:border-accent-green/50">
            {image ? (
              <img src={image} alt="Label" className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
            ) : (
              <>
                <ScanLine className="w-16 h-16 text-white/10 group-hover:text-accent-green/30 transition-colors mb-4" />
                <p className="text-sm font-medium text-white/40">Drop label image or click to scan</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleScan}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          
          {image && (
            <button 
              onClick={() => { setImage(null); setResult(null); }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Reset Scanner
            </button>
          )}
        </div>

        <div className="space-y-6">
          {isScanning ? (
            <div className="card-premium h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-accent-green animate-spin mb-4" />
              <p className="font-bold text-accent-green animate-pulse">Running OCR & AI Analysis...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="card-premium">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Extracted Macros</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Calories", val: result.calories, unit: "kcal" },
                    { label: "Protein", val: result.protein, unit: "g" },
                    { label: "Carbs", val: result.carbs, unit: "g" },
                    { label: "Fat", val: result.fat, unit: "g" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase font-bold">{stat.label}</p>
                      <p className="text-lg font-bold">{stat.val} <span className="text-[10px] font-normal opacity-50">{stat.unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {result.alerts?.length > 0 && (
                <div className="card-premium border-accent-orange/30 bg-accent-orange/5">
                  <div className="flex items-center gap-2 text-accent-orange mb-3">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Additive Alerts</span>
                  </div>
                  <ul className="space-y-2">
                    {result.alerts.map((alert: string, i: number) => (
                      <li key={i} className="text-sm text-white/80 flex gap-2">
                        <span className="text-accent-orange">•</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="card-premium">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Full Ingredients</h3>
                <p className="text-xs leading-relaxed text-white/60">
                  {result.ingredients?.join(", ")}
                </p>
              </div>
            </div>
          ) : (
            <div className="card-premium h-full border-white/5 flex flex-col items-center justify-center py-20 text-center">
              <Activity className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-white/40">Results will appear here after scanning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
