// import React from 'react';
// import { GenerationSettings } from '../types';
// import { Settings, Zap, Monitor } from 'lucide-react';

// interface SettingsPanelProps {
//   settings: GenerationSettings;
//   onSettingsChange: (settings: GenerationSettings) => void;
// }

// export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
//   const handleChange = (key: keyof GenerationSettings, value: any) => {
//     onSettingsChange({ ...settings, [key]: value });
//   };

//   return (
//     <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-6 shadow-sm transition-colors duration-300">
//       <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-4">
//         <Settings className="w-5 h-5 text-yellow-500" />
//         <h2 className="font-semibold text-lg">Configuration</h2>
//       </div>

//       {/* Aspect Ratio */}
//       <div className="space-y-3">
//         <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
//           <Monitor className="w-4 h-4" />
//           Aspect Ratio
//         </label>
//         <div className="grid grid-cols-3 gap-2">
//           {['1:1', '3:4', '4:3', '9:16', '16:9'].map((ratio) => (
//             <button
//               key={ratio}
//               onClick={() => handleChange('aspectRatio', ratio)}
//               className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
//                 settings.aspectRatio === ratio
//                   ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-500'
//                   : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
//               }`}
//             >
//               {ratio}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Concurrency - Simulated Speed */}
//       <div className="space-y-3">
//         <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
//           <Zap className="w-4 h-4" />
//           Concurrency Limit
//         </label>
//         <div className="flex items-center space-x-4">
//           <input
//             type="range"
//             min="1"
//             max="3"
//             step="1"
//             value={settings.concurrency}
//             onChange={(e) => handleChange('concurrency', parseInt(e.target.value))}
//             className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
//           />
//           <span className="text-sm font-mono text-yellow-700 dark:text-yellow-500 min-w-[3rem] text-center bg-yellow-500/10 rounded px-2 py-1">
//             {settings.concurrency}x
//           </span>
//         </div>
//         <p className="text-xs text-zinc-500">
//           Higher concurrency may hit API rate limits faster. Recommended: 1 or 2.
//         </p>
//       </div>
//     </div>
//   );
// };
import React from 'react';
import { GenerationSettings, ImageProvider } from '../types';
import { Settings, Zap, Monitor, Cpu } from 'lucide-react';
import { HF_FREE_MODELS } from '../services/huggingfaceService';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

const PROVIDERS: { id: ImageProvider; label: string; emoji: string; free: boolean }[] = [
  { id: 'pollinations', label: 'Pollinations', emoji: '🌸', free: true },
  { id: 'huggingface', label: 'Hugging Face', emoji: '🤗', free: true },
  { id: 'gemini',      label: 'Gemini',        emoji: '⚡', free: false },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-6 shadow-sm transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <Settings className="w-5 h-5 text-yellow-500" />
        <h2 className="font-semibold text-lg">Configuration</h2>
      </div>

      {/* Provider Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Image Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleChange('provider', p.id)}
              className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all flex flex-col items-center gap-1 ${
                settings.provider === p.id
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
              {p.free && (
                <span className="text-[10px] text-green-500 font-semibold">FREE</span>
              )}
            </button>
          ))}
        </div>

        {/* Gemini warning only */}
        {settings.provider === 'gemini' && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-1">
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">
              Paid API required
            </p>
            <p className="text-xs text-red-600 dark:text-red-500">
              Gemini image model requires billing. Use Pollinations or Hugging Face for free generation.
            </p>
          </div>
        )}
      </div>

      {/* HF Model selector — no key input, just model choice */}
      {settings.provider === 'huggingface' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Model
          </label>
          <select
            value={settings.hfModel || HF_FREE_MODELS[0].id}
            onChange={(e) => handleChange('hfModel', e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer"
          >
            {HF_FREE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">
            SDXL Base gives the best quality. SD v1.5 is fastest.
          </p>
        </div>
      )}

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => handleChange('aspectRatio', ratio)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                settings.aspectRatio === ratio
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Concurrency */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Concurrency Limit
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={settings.concurrency}
            onChange={(e) => handleChange('concurrency', parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <span className="text-sm font-mono text-yellow-700 dark:text-yellow-500 min-w-[3rem] text-center bg-yellow-500/10 rounded px-2 py-1">
            {settings.concurrency}x
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          {settings.provider === 'pollinations'
            ? 'Pollinations handles concurrency well. 2-3x recommended.'
            : 'Higher concurrency may hit rate limits faster. Recommended: 1 or 2.'}
        </p>
      </div>

    </div>
  );
};