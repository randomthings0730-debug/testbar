
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ErrorEntry } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a weekly study plan based on weak subjects and exam date.
 */
export async function generateWeeklyPlan(examDate: string, weakSubjects: Subject[]) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a 7-day high-level study plan for the Bar Exam (Exam Date: ${examDate}). Focus on these weak subjects: ${weakSubjects.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus: { type: Type.STRING },
              tasks: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["day", "focus", "tasks"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Planner generation error:", error);
    return [];
  }
}

/**
 * Fixed: Added getStudyInsights to analyze missed rules.
 * Uses gemini-3-pro-preview as it is best suited for complex reasoning tasks.
 */
export async function getStudyInsights(errors: ErrorEntry[]) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert Bar Exam tutor. Analyze the following list of missed rules and provide 3-5 high-level strategic study insights. Identify patterns in the mistakes and suggest specific areas for reinforcement.
      
      Missed Rules:
      ${JSON.stringify(errors)}`,
    });
    
    return response.text || "No insights available yet.";
  } catch (error) {
    console.error("Study insights generation error:", error);
    return "Error generating insights. Keep practicing and check back later.";
  }
}
