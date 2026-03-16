import React, { useState } from 'react';
import { Button } from './Button';
import { Layers, Plus, Trash2, Wand2 } from 'lucide-react';
import { optimizePrompts } from '../services/geminiService';

interface PromptInputProps {
  onAddTasks: (prompts: string[]) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onAddTasks }) => {
  const [text, setText] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) return;
    const prompts = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    if (prompts.length > 0) {
      onAddTasks(prompts);
      setText('');
    }
  };

  const handleOptimize = async () => {
    if (!text.trim()) return;
    setIsOptimizing(true);
    const prompts = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    const optimized = await optimizePrompts(prompts);
    setText(optimized.join('\n'));
    setIsOptimizing(false);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col h-full shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
          <Layers className="w-5 h-5 text-yellow-500" />
          <h2 className="font-semibold text-lg">Bulk Input</h2>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
                <Trash2 className="w-3 h-3" /> Clear
            </button>
        </div>
      </div>
      
      <div className="relative flex-grow group">
        <textarea
          className="w-full h-full min-h-[150px] bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 resize-none font-mono leading-relaxed transition-all"
          placeholder={`Enter prompts here...\nOne prompt per line\nExample:\nA cyberpunk city in rain\nA cute robot eating a banana\nSpace station at sunset`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="absolute bottom-3 right-3 text-xs text-zinc-500 dark:text-zinc-600 font-mono bg-white/80 dark:bg-zinc-900/80 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800">
            {text.split('\n').filter(l => l.trim().length > 0).length} prompts
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="secondary" 
          onClick={handleOptimize} 
          disabled={!text.trim() || isOptimizing} 
          isLoading={isOptimizing}
          className="w-full sm:w-auto"
        >
          <Wand2 className="w-4 h-4 mr-2 text-indigo-500" />
          Auto-Optimize
        </Button>
        <Button onClick={handleAdd} disabled={!text.trim() || isOptimizing} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add to Queue
        </Button>
      </div>
    </div>
  );
};