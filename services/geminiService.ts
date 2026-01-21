
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeComplaint(description: string) {
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
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { priority: 'Medium', summary: description.substring(0, 50) + '...' };
  }
}

export async function generateNoticeContent(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional and polite notice for a housing society about: "${topic}". Include a clear heading and specific instructions.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "Failed to generate content. Please write manually.";
  }
}
