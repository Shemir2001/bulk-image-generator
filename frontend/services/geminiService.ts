import { GoogleGenAI } from "@google/genai";
import { GenerationResult } from "../types";

const API_KEY = process.env.API_KEY || '';

if (!API_KEY) {
  console.warn("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an image using the gemini-2.5-flash-image model (Nano Banana).
 * 
 * @param prompt The text prompt for generation.
 * @param aspectRatio The desired aspect ratio.
 * @returns A promise resolving to the generation result.
 */
export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
): Promise<GenerationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        // responseMimeType and responseSchema are NOT supported for this model
      },
    });

    // Iterate through parts to find the image data
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from API.");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("No content parts returned.");
    }

    let base64Image: string | null = null;

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct the data URL
        const mimeType = part.inlineData.mimeType || 'image/png';
        base64Image = `data:${mimeType};base64,${part.inlineData.data}`;
        break; // Found the image, exit loop
      }
    }

    if (!base64Image) {
      throw new Error("No image data found in response.");
    }

    return { imageData: base64Image };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { 
      imageData: null, 
      error: error.message || "Unknown error occurred during generation." 
    };
  }
};

/**
 * Optimizes a list of prompts using Gemini 3 Flash.
 */
export const optimizePrompts = async (prompts: string[]): Promise<string[]> => {
  if (prompts.length === 0) return [];

  try {
    const promptText = prompts.join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert AI image prompt engineer. I have a list of image ideas. Rewrite each one to be highly detailed, vivid, and optimized for a high-quality generative AI model. 
      
      Rules:
      1. Improve clarity, lighting, and style descriptors.
      2. Keep the meaning of the original idea.
      3. Return EXACTLY the same number of lines as the input.
      4. Do not add numbering or bullet points.
      5. Output ONLY the raw list of optimized prompts.

      Input Prompts:
      ${promptText}`,
    });

    const optimizedText = response.text?.trim() || "";
    if (!optimizedText) return prompts;

    return optimizedText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Optimization failed:", error);
    return prompts; // Fallback to original
  }
};