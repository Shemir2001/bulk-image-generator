// export enum TaskStatus {
//   PENDING = 'PENDING',
//   PROCESSING = 'PROCESSING',
//   COMPLETED = 'COMPLETED',
//   FAILED = 'FAILED',
// }

// export interface ImageTask {
//   id: string;
//   prompt: string;
//   status: TaskStatus;
//   imageData?: string; // Base64 string
//   error?: string;
//   createdAt: number;
// }

// export interface GenerationSettings {
//   aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
//   concurrency: number; // 1 to 3
// }

// export interface GenerationResult {
//   imageData: string | null;
//   error?: string;
// }
export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type ImageProvider = 'gemini' | 'huggingface' | 'pollinations';

export interface ImageTask {
  id: string;
  prompt: string;
  status: TaskStatus;
  imageData?: string;
  error?: string;
  createdAt: number;
}

export interface GenerationSettings {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  concurrency: number;
  provider: ImageProvider;
  hfApiKey?: string;
  hfModel?: string;
  pollinationsApiKey?: string;   // ← NEW
}

export interface GenerationResult {
  imageData: string | null;
  error?: string;
}