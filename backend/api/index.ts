import express, { Request, Response } from 'express';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// ✅ Handle OPTIONS preflight BEFORE everything else
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// ✅ Apply CORS headers to ALL responses
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const POLLINATIONS_KEY = process.env.POLLINATIONS_KEY || '';
const HF_KEY = process.env.HF_KEY || '';

const ASPECT_SIZES: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "3:4":  { width: 768,  height: 1024 },
  "4:3":  { width: 1024, height: 768  },
  "9:16": { width: 576,  height: 1024 },
  "16:9": { width: 1024, height: 576  },
};

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate/pollinations', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1', model = 'flux' } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!POLLINATIONS_KEY) return res.status(500).json({ error: 'POLLINATIONS_KEY not configured' });

  const { width, height } = ASPECT_SIZES[aspectRatio] || ASPECT_SIZES['1:1'];
  const seed = Math.floor(Math.random() * 999999);
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&nofeed=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${POLLINATIONS_KEY}`,
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `Pollinations error: HTTP ${response.status} — ${errText.substring(0, 150)}`
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      const text = await response.text();
      return res.status(500).json({ error: `Expected image, got: ${contentType} — ${text.substring(0, 100)}` });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) return res.status(500).json({ error: 'Empty image response' });

    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = contentType.split(';')[0].trim();
    return res.json({ imageData: `data:${mimeType};base64,${base64}` });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Network error' });
  }
});

app.post('/api/generate/huggingface', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1', model = 'stabilityai/stable-diffusion-xl-base-1.0' } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!HF_KEY) return res.status(500).json({ error: 'HF_KEY not configured' });

  const { width, height } = ASPECT_SIZES[aspectRatio] || ASPECT_SIZES['1:1'];

  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width, height, num_inference_steps: 30, guidance_scale: 7.5 },
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 503) {
        const wait = (err as any)?.estimated_time || 20;
        return res.status(503).json({ error: `Model loading, retry in ${Math.ceil(wait)}s` });
      }
      return res.status(response.status).json({ error: (err as any)?.error || `HTTP ${response.status}` });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return res.json({ imageData: `data:image/png;base64,${base64}` });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.post('/api/optimize', async (req: Request, res: Response) => {
  const { prompts } = req.body;
  if (!prompts || !Array.isArray(prompts)) {
    return res.status(400).json({ error: 'Prompts array required' });
  }
  if (!HF_KEY) return res.status(500).json({ error: 'HF_KEY not configured' });

  try {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `You are an expert AI image prompt engineer. Rewrite each prompt to be highly detailed and vivid. Return EXACTLY the same number of lines. No numbering, no bullets, just the prompts.\n\nInput:\n${prompts.join('\n')}`,
          parameters: { max_new_tokens: 500, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Optimization failed' });
    }

    const data = await response.json() as any;
    const text = data[0]?.generated_text || '';
    const lines = text.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    return res.json({ optimized: lines.slice(0, prompts.length) });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT as number, () => {
    console.log(`\n✅ Backend running at http://localhost:${PORT}`);
    console.log(`🌸 Pollinations: ${POLLINATIONS_KEY ? '✅' : '❌ MISSING'}`);
    console.log(`🤗 HuggingFace:  ${HF_KEY ? '✅' : '❌ MISSING'}\n`);
  });
}

export default app;