// import { GenerationResult } from "../types";

// // Map aspect ratios to pixel dimensions for HF
// const ASPECT_RATIO_SIZES: Record<string, { width: number; height: number }> = {
//   "1:1":  { width: 1024, height: 1024 },
//   "3:4":  { width: 768,  height: 1024 },
//   "4:3":  { width: 1024, height: 768  },
//   "9:16": { width: 576,  height: 1024 },
//   "16:9": { width: 1024, height: 576  },
// };

// // Free models on Hugging Face — no payment needed
// export const HF_FREE_MODELS = [
//   { id: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base (Best Quality)" },
//   { id: "runwayml/stable-diffusion-v1-5",           label: "SD v1.5 (Fastest)" },
//   { id: "stabilityai/stable-diffusion-2-1",         label: "SD 2.1 (Balanced)" },
//   { id: "Lykon/dreamshaper-8",                      label: "DreamShaper 8 (Artistic)" },
// ];

// export const DEFAULT_HF_MODEL = HF_FREE_MODELS[0].id;

// export const generateImageHF = async (
//   prompt: string,
//   aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
//   apiKey: string,
//   model: string = DEFAULT_HF_MODEL
// ): Promise<GenerationResult> => {
//   if (!apiKey) {
//     return { imageData: null, error: "Hugging Face API key is missing. Get a free one at huggingface.co → Settings → Access Tokens." };
//   }

//   const { width, height } = ASPECT_RATIO_SIZES[aspectRatio] || ASPECT_RATIO_SIZES["1:1"];

//   try {
//     const response = await fetch(
//       `https://api-inference.huggingface.co/models/${model}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           inputs: prompt,
//           parameters: {
//             width,
//             height,
//             num_inference_steps: 30,
//             guidance_scale: 7.5,
//           },
//           options: {
//             wait_for_model: true,  // Auto-wait if model is loading
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       // Model is loading — retry after delay
//       if (response.status === 503) {
//         const waitTime = errorData?.estimated_time || 20;
//         return { imageData: null, error: `Model loading, retry in ${Math.ceil(waitTime)}s` };
//       }
//       throw new Error(errorData?.error || `HTTP ${response.status}`);
//     }

//     const blob = await response.blob();
//     const base64 = await blobToBase64(blob);
//     return { imageData: base64 };

//   } catch (error: any) {
//     console.error("Hugging Face API Error:", error);
//     return { imageData: null, error: error.message || "Unknown error" };
//   }
// };

// // Helper: Convert Blob → base64 data URL
// const blobToBase64 = (blob: Blob): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result as string);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };
import { GenerationResult } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const HF_FREE_MODELS = [
  { id: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base (Best Quality)" },
  { id: "runwayml/stable-diffusion-v1-5",           label: "SD v1.5 (Fastest)" },
  { id: "stabilityai/stable-diffusion-2-1",         label: "SD 2.1 (Balanced)" },
  { id: "Lykon/dreamshaper-8",                      label: "DreamShaper 8 (Artistic)" },
];

export const DEFAULT_HF_MODEL = HF_FREE_MODELS[0].id;

export const generateImageHF = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
  _apiKey: string = '',         // ignored — key is on backend server
  model: string = DEFAULT_HF_MODEL
): Promise<GenerationResult> => {
  try {
    const response = await fetch(`${API_BASE}/api/generate/huggingface`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, model }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { imageData: null, error: data.error || `HTTP ${response.status}` };
    }

    return { imageData: data.imageData };

  } catch (error: any) {
    return { imageData: null, error: error.message || 'Network error — is backend running on port 3001?' };
  }
};