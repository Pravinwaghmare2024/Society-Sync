
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeComplaint(description: string) {
  // Fix: Create instance right before making an API call to ensure latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following housing society complaint and provide a priority (Urgent, Medium, Low) and a short summary: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, description: 'Urgent, Medium, or Low' },
            summary: { type: Type.STRING, description: 'A one-sentence summary of the issue.' },
          },
          required: ["priority", "summary"],
          propertyOrdering: ["priority", "summary"],
        },
      },
    });

    // Fix: Use response.text directly and trim
    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { priority: 'Medium', summary: description.substring(0, 50) + '...' };
  }
}

export async function generateNoticeContent(topic: string) {
  // Fix: Create instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional and polite notice for a housing society about: "${topic}". Include a clear heading and specific instructions.`,
    });
    // Fix: Use response.text directly
    return response.text || "Failed to generate content. Please write manually.";
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "Failed to generate content. Please write manually.";
  }
}
