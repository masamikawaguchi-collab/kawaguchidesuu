import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

/**
 * Suggests a professional summary or improvement for the negotiation description.
 */
export const polishDescription = async (input: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key not found.");
    return input;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a professional sales assistant. 
        Rewrite the following sales negotiation notes to be more concise, professional, and action-oriented in Japanese.
        Keep important details like budget, key person reaction, and bottlenecks.
        
        IMPORTANT: Output ONLY the rewritten text. Do not include any conversational filler, introductions (e.g. "Here is the revised text"), or explanations.
        
        Original Notes:
        ${input}
      `,
    });
    
    return response.text?.trim() || input;
  } catch (error) {
    console.error("Gemini Polish Error:", error);
    return input;
  }
};

/**
 * Suggests the next best action based on the current situation.
 */
export const suggestNextAction = async (description: string, status: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key not found.");
    return "";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Based on the following sales negotiation description and current status, suggest a specific, short "Next Action" in Japanese (under 30 characters).
        IMPORTANT: Return ONLY the suggested action text.
        
        Status: ${status}
        Description: ${description}
      `,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "";
  }
};
