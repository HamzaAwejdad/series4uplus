
import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem, SheetRow } from "../types";

const MOVIE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    year: { type: Type.STRING },
    category: { type: Type.STRING },
    rating: { type: Type.STRING },
    type: { type: Type.STRING, description: "Must be 'movie' or 'series'" },
    seasons: { type: Type.NUMBER },
    description: { type: Type.STRING },
    poster: { type: Type.STRING, description: "Direct high quality poster image URL" }
  },
  required: ["title", "year", "category", "rating", "type", "description", "poster"]
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastRequestStartTime = 0;
const MIN_REQUEST_GAP = 25000; 

const throttle = async () => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestStartTime;
  if (timeSinceLast < MIN_REQUEST_GAP) {
    const delay = MIN_REQUEST_GAP - timeSinceLast;
    await wait(delay);
  }
  lastRequestStartTime = Date.now();
};

export const fetchContentMetadata = async (sheetRow: SheetRow, retryCount = 0): Promise<ContentItem | null> => {
  try {
    await throttle();

    // Initialize Gemini API client using process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide cinematic metadata for the ${sheetRow.type}: "${sheetRow.title}". Include IMDb rating and a professional description. Return ONLY JSON.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Priority: 1. Manual Poster from Sheet, 2. AI Generated Poster, 3. Placeholder
    let finalPoster = sheetRow.poster;
    if (!finalPoster || !finalPoster.startsWith('http')) {
      finalPoster = data.poster && data.poster.startsWith('http') 
        ? data.poster 
        : `https://images.placeholders.dev/?width=400&height=600&text=${encodeURIComponent(sheetRow.title)}&bg=%23111&color=%23555`;
    }

    return {
      id: btoa(sheetRow.title).substring(0, 10) + Math.random().toString(36).substr(2, 5),
      title: data.title || sheetRow.title,
      year: data.year || "2024",
      category: data.category || "General",
      rating: data.rating || "N/A",
      type: (data.type?.toLowerCase() === 'series' ? 'series' : 'movie') as any,
      seasons: data.seasons,
      description: data.description || "No description available for this title.",
      poster: finalPoster,
      // Fix: SheetRow uses 'telegram' property, not 'telegram_channel_link'
      telegramLink: sheetRow.telegram,
      status: 'active'
      // Fix: customNote removed as it does not exist on SheetRow
    };
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    const isQuotaError = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError && retryCount < 2) {
      const delay = (retryCount + 1) * 45000; 
      await wait(delay);
      return fetchContentMetadata(sheetRow, retryCount + 1);
    }

    console.error(`[Gemini] Metadata error for ${sheetRow.title}:`, error);
    
    return {
      id: "error-" + btoa(sheetRow.title).substring(0, 5) + Date.now(),
      title: sheetRow.title,
      year: "TBA",
      category: "Status",
      rating: "N/A",
      type: sheetRow.type,
      description: "API Access Restricted. This item will automatically retry in the next background cycle.",
      poster: sheetRow.poster || `https://images.placeholders.dev/?width=400&height=600&text=QUOTA_EXHAUSTED&bg=%23200&color=%23f00`,
      // Fix: SheetRow uses 'telegram' property, not 'telegram_channel_link'
      telegramLink: sheetRow.telegram,
      status: 'active',
      customNote: "Archive synchronization is paused to prevent API lockout."
    };
  }
};
