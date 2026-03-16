import { GenerationResult } from "../types";

// Points to your Express backend — change to your Vercel URL when deploying
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

export const generateImagePollinations = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
): Promise<GenerationResult> => {
  try {
    const response = await fetch(`${API_BASE}/api/generate/pollinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { imageData: null, error: data.error || `HTTP ${response.status}` };
    }

    return { imageData: data.imageData };

  } catch (error: any) {
    return { imageData: null, error: error.message || 'Network error' };
  }
};