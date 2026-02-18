
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAIUsage = async (prompt: string, responseText: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this AI interaction. 
      USER PROMPT: "${prompt}"
      AI RESPONSE: "${responseText}"`,
      config: {
        systemInstruction: `You are an AI Usage Auditor. Your goal is to categorize and score the quality of a user's interaction with AI.
        
        CATEGORIES:
        1. 'learning': Use for educational prompts, practice questions, requests for explanation, or depth-seeking behavior.
        2. 'collaborative': Use for modifying existing work, essay planning, code refactoring, or co-authoring summaries.
        3. 'parasocial': Use for social-only chatting, personifying the AI, or non-productive emotional roleplay.
        4. 'shortcut' / 'lazy': Use for cheating, asking for direct answers without explanation.

        Provide a JSON response with:
        1. score: Calculated health impact (-25 to +25).
        2. feedback: A short, witty Duolingo-style comment.
        3. category: One of ['learning', 'collaborative', 'parasocial', 'shortcut', 'lazy'].
        4. isQuiz: Boolean, true ONLY if the user is generating/answering practice questions, flashcards, or self-testing material.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              enum: ['learning', 'collaborative', 'parasocial', 'shortcut', 'lazy']
            },
            isQuiz: { type: Type.BOOLEAN }
          },
          required: ['score', 'feedback', 'category', 'isQuiz']
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 0,
      feedback: "That was a weird one. Let's stay on track!",
      category: 'collaborative',
      isQuiz: false
    };
  }
};
