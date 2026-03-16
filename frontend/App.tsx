// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { PromptInput } from './components/PromptInput';
// import { TaskQueue } from './components/TaskQueue';
// import { SettingsPanel } from './components/SettingsPanel';
// import { LoginScreen } from './components/LoginScreen';
// import { ImageTask, TaskStatus, GenerationSettings } from './types';
// import { generateImage } from './services/geminiService';
// import { Zap, AlertTriangle, Moon, Sun, LogOut } from 'lucide-react';

// const App: React.FC = () => {
//   // --- Auth State ---
//   const [user, setUser] = useState<string | null>(() => localStorage.getItem('nanoGenUser'));
  
//   // --- Theme State ---
//   const [isDark, setIsDark] = useState<boolean>(() => {
//     if (typeof window !== 'undefined') {
//         return document.documentElement.classList.contains('dark');
//     }
//     return true;
//   });

//   // --- App State ---
//   const [tasks, setTasks] = useState<ImageTask[]>([]);
//   const [settings, setSettings] = useState<GenerationSettings>({
//     aspectRatio: '1:1',
//     concurrency: 1,
//   });
  
//   const processingRef = useRef<boolean>(false);
//   const tasksRef = useRef<ImageTask[]>([]);

//   // Sync ref with state
//   useEffect(() => {
//     tasksRef.current = tasks;
//   }, [tasks]);

//   // Handle Theme Change
//   useEffect(() => {
//     if (isDark) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDark]);

//   const toggleTheme = () => setIsDark(!isDark);

//   const handleLogin = (username: string) => {
//     localStorage.setItem('nanoGenUser', username);
//     setUser(username);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('nanoGenUser');
//     setUser(null);
//   };

//   const addTasks = (prompts: string[]) => {
//     const newTasks: ImageTask[] = prompts.map((prompt) => ({
//       id: crypto.randomUUID(),
//       prompt,
//       status: TaskStatus.PENDING,
//       createdAt: Date.now(),
//     }));
//     setTasks((prev) => [...prev, ...newTasks]);
//   };

//   const clearCompleted = () => {
//     setTasks((prev) => prev.filter((t) => t.status !== TaskStatus.COMPLETED));
//   };

//   const clearAll = () => {
//     setTasks((prev) => prev.filter((t) => t.status === TaskStatus.PROCESSING));
//   };

//   const deleteTask = (id: string) => {
//     setTasks((prev) => prev.filter((t) => t.id !== id));
//   };

//   const updateTaskStatus = (id: string, status: TaskStatus, result?: { imageData?: string; error?: string }) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? { ...t, status, imageData: result?.imageData, error: result?.error }
//           : t
//       )
//     );
//   };

//   const processQueue = useCallback(async () => {
//     if (processingRef.current) return;
    
//     const currentTasks = tasksRef.current;
//     const activeCount = currentTasks.filter(t => t.status === TaskStatus.PROCESSING).length;
    
//     if (activeCount >= settings.concurrency) return;

//     const nextTask = currentTasks.find(t => t.status === TaskStatus.PENDING);
//     if (!nextTask) return;

//     updateTaskStatus(nextTask.id, TaskStatus.PROCESSING);
    
//     generateImage(nextTask.prompt, settings.aspectRatio)
//       .then((result) => {
//         if (result.imageData) {
//           updateTaskStatus(nextTask.id, TaskStatus.COMPLETED, { imageData: result.imageData });
//         } else {
//           updateTaskStatus(nextTask.id, TaskStatus.FAILED, { error: result.error });
//         }
//       })
//       .catch((err) => {
//         updateTaskStatus(nextTask.id, TaskStatus.FAILED, { error: "Unexpected error" });
//       });
      
//   }, [settings.concurrency, settings.aspectRatio]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       processQueue();
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [processQueue]);

//   // If not authenticated, show login screen
//   if (!user) {
//     return <LoginScreen onLogin={handleLogin} />;
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 p-4 md:p-8 font-sans transition-colors duration-300">
//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500 flex items-center gap-3">
//               <Zap className="text-yellow-500 dark:text-yellow-400 fill-current w-8 h-8" />
//               NanoGen Bulk
//             </h1>
//             <p className="text-zinc-500 dark:text-zinc-500 mt-2 max-w-xl">
//               High-performance bulk image generation. Welcome, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user}</span>.
//             </p>
//           </div>
//           <div className="flex flex-wrap items-center gap-3">
//              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
//                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//                  System Operational
//              </div>
             
//              <button 
//                 onClick={toggleTheme}
//                 className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
//                 title="Toggle Theme"
//              >
//                 {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//              </button>

//              <button 
//                 onClick={handleLogout}
//                 className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
//                 title="Logout"
//              >
//                 <LogOut className="w-4 h-4" />
//              </button>
//           </div>
//         </header>

//         {/* Missing API Key Warning */}
//         {!process.env.API_KEY && (
//           <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-700 dark:text-red-200">
//             <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
//             <div>
//               <h3 className="font-bold text-red-800 dark:text-red-400">API Key Missing</h3>
//               <p className="text-sm mt-1 opacity-90">
//                 You must provide a valid <code className="bg-red-100 dark:bg-red-950/50 px-1 py-0.5 rounded text-red-800 dark:text-red-300">API_KEY</code> in your environment variables to use the Gemini API.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          
//           {/* Left Column: Controls */}
//           <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-2">
//             <PromptInput onAddTasks={addTasks} />
//             <SettingsPanel settings={settings} onSettingsChange={setSettings} />
            
//             <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 mt-auto shadow-sm">
//                 <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Stats</h4>
//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                         <span className="block text-2xl font-bold text-zinc-800 dark:text-zinc-100">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</span>
//                         <span className="text-xs text-zinc-500">Completed</span>
//                     </div>
//                     <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                         <span className="block text-2xl font-bold text-yellow-600 dark:text-yellow-500">{tasks.filter(t => t.status === TaskStatus.PENDING).length}</span>
//                         <span className="text-xs text-zinc-500">Pending</span>
//                     </div>
//                 </div>
//             </div>
//           </div>

//           {/* Right Column: Queue & Results */}
//           <div className="lg:col-span-8 h-full">
//             <TaskQueue 
//               tasks={tasks} 
//               onClearCompleted={clearCompleted} 
//               onClearAll={clearAll}
//               onDeleteTask={deleteTask}
//             />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { PromptInput } from './components/PromptInput';
// import { TaskQueue } from './components/TaskQueue';
// import { SettingsPanel } from './components/SettingsPanel';
// import { LoginScreen } from './components/LoginScreen';
// import { ImageTask, TaskStatus, GenerationSettings } from './types';
// import { generateImage } from './services/geminiService';
// import { generateImageHF } from './services/huggingfaceService';
// import { generateImagePollinations } from './services/pollinationsService';
// import { Zap, AlertTriangle, Moon, Sun, LogOut } from 'lucide-react';

// const App: React.FC = () => {
//   // --- Auth State ---
//   const [user, setUser] = useState<string | null>(() => localStorage.getItem('nanoGenUser'));

//   // --- Theme State ---
//   const [isDark, setIsDark] = useState<boolean>(() => {
//     if (typeof window !== 'undefined') {
//       return document.documentElement.classList.contains('dark');
//     }
//     return true;
//   });

//   // --- App State ---
//   const [tasks, setTasks] = useState<ImageTask[]>([]);
//   const [settings, setSettings] = useState<GenerationSettings>({
//     aspectRatio: '1:1',
//     concurrency: 1,
//     provider: 'pollinations',     // ✅ Default: free, no key needed
//     hfApiKey: '',
//     hfModel: 'stabilityai/stable-diffusion-xl-base-1.0',
//   });

//   const processingRef = useRef<boolean>(false);
//   const tasksRef = useRef<ImageTask[]>([]);

//   // Sync ref with state
//   useEffect(() => {
//     tasksRef.current = tasks;
//   }, [tasks]);

//   // Handle Theme Change
//   useEffect(() => {
//     if (isDark) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDark]);

//   const toggleTheme = () => setIsDark(!isDark);

//   const handleLogin = (username: string) => {
//     localStorage.setItem('nanoGenUser', username);
//     setUser(username);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('nanoGenUser');
//     setUser(null);
//   };

//   const addTasks = (prompts: string[]) => {
//     const newTasks: ImageTask[] = prompts.map((prompt) => ({
//       id: crypto.randomUUID(),
//       prompt,
//       status: TaskStatus.PENDING,
//       createdAt: Date.now(),
//     }));
//     setTasks((prev) => [...prev, ...newTasks]);
//   };

//   const clearCompleted = () => {
//     setTasks((prev) => prev.filter((t) => t.status !== TaskStatus.COMPLETED));
//   };

//   const clearAll = () => {
//     setTasks((prev) => prev.filter((t) => t.status === TaskStatus.PROCESSING));
//   };

//   const deleteTask = (id: string) => {
//     setTasks((prev) => prev.filter((t) => t.id !== id));
//   };

//   const updateTaskStatus = (
//     id: string,
//     status: TaskStatus,
//     result?: { imageData?: string; error?: string }
//   ) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? { ...t, status, imageData: result?.imageData, error: result?.error }
//           : t
//       )
//     );
//   };

//   // --- Route to the correct provider ---
//   const getGenerationPromise = useCallback(
//     (prompt: string, aspectRatio: GenerationSettings['aspectRatio']) => {
//       switch (settings.provider) {
//         case 'huggingface':
//           return generateImageHF(
//             prompt,
//             aspectRatio,
//             settings.hfApiKey || '',
//             settings.hfModel
//           );
//         case 'pollinations':
//           return generateImagePollinations(prompt, aspectRatio);
//         case 'gemini':
//         default:
//           return generateImage(prompt, aspectRatio);
//       }
//     },
//     [settings.provider, settings.hfApiKey, settings.hfModel,settings.pollinationsApiKey]
//   );

//   const processQueue = useCallback(async () => {
//     if (processingRef.current) return;

//     const currentTasks = tasksRef.current;
//     const activeCount = currentTasks.filter(
//       (t) => t.status === TaskStatus.PROCESSING
//     ).length;

//     if (activeCount >= settings.concurrency) return;

//     const nextTask = currentTasks.find((t) => t.status === TaskStatus.PENDING);
//     if (!nextTask) return;

//     updateTaskStatus(nextTask.id, TaskStatus.PROCESSING);

//     getGenerationPromise(nextTask.prompt, settings.aspectRatio)
//       .then((result) => {
//         if (result.imageData) {
//           updateTaskStatus(nextTask.id, TaskStatus.COMPLETED, {
//             imageData: result.imageData,
//           });
//         } else {
//           updateTaskStatus(nextTask.id, TaskStatus.FAILED, {
//             error: result.error,
//           });
//         }
//       })
//       .catch(() => {
//         updateTaskStatus(nextTask.id, TaskStatus.FAILED, {
//           error: 'Unexpected error',
//         });
//       });
//   }, [settings.concurrency, settings.aspectRatio, getGenerationPromise]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       processQueue();
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [processQueue]);

//   // If not authenticated, show login screen
//   if (!user) {
//     return <LoginScreen onLogin={handleLogin} />;
//   }

//   // Show warning only for gemini (missing key) or huggingface (missing HF key)
//   const showApiWarning =
//     (settings.provider === 'gemini' && !process.env.API_KEY) ||
//     (settings.provider === 'huggingface' && !settings.hfApiKey);

//   const apiWarningMessage =
//     settings.provider === 'gemini'
//       ? 'Gemini API key missing. Add API_KEY to your .env.local file.'
//       : 'Hugging Face API key missing. Enter your free key in Configuration below.';

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 p-4 md:p-8 font-sans transition-colors duration-300">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500 flex items-center gap-3">
//               <Zap className="text-yellow-500 dark:text-yellow-400 fill-current w-8 h-8" />
//               NanoGen Bulk
//             </h1>
//             <p className="text-zinc-500 dark:text-zinc-500 mt-2 max-w-xl">
//               High-performance bulk image generation. Welcome,{' '}
//               <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user}</span>.
//             </p>
//           </div>
//           <div className="flex flex-wrap items-center gap-3">
//             {/* Provider Badge */}
//             <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
//               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//               {settings.provider === 'pollinations' && '🌸 Pollinations'}
//               {settings.provider === 'huggingface' && '🤗 Hugging Face'}
//               {settings.provider === 'gemini' && '⚡ Gemini'}
//             </div>

//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
//               title="Toggle Theme"
//             >
//               {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             </button>

//             <button
//               onClick={handleLogout}
//               className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
//               title="Logout"
//             >
//               <LogOut className="w-4 h-4" />
//             </button>
//           </div>
//         </header>

//         {/* API Warning Banner */}
//         {showApiWarning && (
//           <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-700 dark:text-red-200">
//             <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
//             <div>
//               <h3 className="font-bold text-red-800 dark:text-red-400">API Key Missing</h3>
//               <p className="text-sm mt-1 opacity-90">{apiWarningMessage}</p>
//             </div>
//           </div>
//         )}

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

//           {/* Left Column: Controls */}
//           <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-2">
//             <PromptInput onAddTasks={addTasks} />
//             <SettingsPanel settings={settings} onSettingsChange={setSettings} />

//             {/* Stats */}
//             <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 mt-auto shadow-sm">
//               <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Stats</h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                   <span className="block text-2xl font-bold text-zinc-800 dark:text-zinc-100">
//                     {tasks.filter((t) => t.status === TaskStatus.COMPLETED).length}
//                   </span>
//                   <span className="text-xs text-zinc-500">Completed</span>
//                 </div>
//                 <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                   <span className="block text-2xl font-bold text-yellow-600 dark:text-yellow-500">
//                     {tasks.filter((t) => t.status === TaskStatus.PENDING).length}
//                   </span>
//                   <span className="text-xs text-zinc-500">Pending</span>
//                 </div>
//                 <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                   <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400">
//                     {tasks.filter((t) => t.status === TaskStatus.PROCESSING).length}
//                   </span>
//                   <span className="text-xs text-zinc-500">Processing</span>
//                 </div>
//                 <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
//                   <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
//                     {tasks.filter((t) => t.status === TaskStatus.FAILED).length}
//                   </span>
//                   <span className="text-xs text-zinc-500">Failed</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Queue & Results */}
//           <div className="lg:col-span-8 h-full">
//             <TaskQueue
//               tasks={tasks}
//               onClearCompleted={clearCompleted}
//               onClearAll={clearAll}
//               onDeleteTask={deleteTask}
//             />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PromptInput } from './components/PromptInput';
import { TaskQueue } from './components/TaskQueue';
import { SettingsPanel } from './components/SettingsPanel';
import { LoginScreen } from './components/LoginScreen';
import { ImageTask, TaskStatus, GenerationSettings } from './types';
import { generateImage } from './services/geminiService';
import { generateImageHF } from './services/huggingfaceService';
import { generateImagePollinations } from './services/pollinationsService';
import { Zap, AlertTriangle, Moon, Sun, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('nanoGenUser'));

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const [tasks, setTasks] = useState<ImageTask[]>([]);

  // ✅ No API keys in frontend state — all keys live on backend
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1',
    concurrency: 1,
    provider: 'huggingface',
    hfModel: 'stabilityai/stable-diffusion-xl-base-1.0',
  });

  const processingRef = useRef<boolean>(false);
  const tasksRef = useRef<ImageTask[]>([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = (username: string) => {
    localStorage.setItem('nanoGenUser', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('nanoGenUser');
    setUser(null);
  };

  const addTasks = (prompts: string[]) => {
    const newTasks: ImageTask[] = prompts.map((prompt) => ({
      id: crypto.randomUUID(),
      prompt,
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
    }));
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => t.status !== TaskStatus.COMPLETED));
  };

  const clearAll = () => {
    setTasks((prev) => prev.filter((t) => t.status === TaskStatus.PROCESSING));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (
    id: string,
    status: TaskStatus,
    result?: { imageData?: string; error?: string }
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, imageData: result?.imageData, error: result?.error }
          : t
      )
    );
  };

  // ✅ Routes to correct backend endpoint — no keys passed from frontend
  const getGenerationPromise = useCallback(
    (prompt: string, aspectRatio: GenerationSettings['aspectRatio']) => {
      switch (settings.provider) {
        case 'huggingface':
          return generateImageHF(prompt, aspectRatio, '', settings.hfModel);
        case 'pollinations':
          return generateImagePollinations(prompt, aspectRatio);
        case 'gemini':
        default:
          return generateImage(prompt, aspectRatio);
      }
    },
    [settings.provider, settings.hfModel]
  );

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;

    const currentTasks = tasksRef.current;
    const activeCount = currentTasks.filter(
      (t) => t.status === TaskStatus.PROCESSING
    ).length;

    if (activeCount >= settings.concurrency) return;

    const nextTask = currentTasks.find((t) => t.status === TaskStatus.PENDING);
    if (!nextTask) return;

    updateTaskStatus(nextTask.id, TaskStatus.PROCESSING);

    getGenerationPromise(nextTask.prompt, settings.aspectRatio)
      .then((result) => {
        if (result.imageData) {
          updateTaskStatus(nextTask.id, TaskStatus.COMPLETED, { imageData: result.imageData });
        } else {
          updateTaskStatus(nextTask.id, TaskStatus.FAILED, { error: result.error });
        }
      })
      .catch(() => {
        updateTaskStatus(nextTask.id, TaskStatus.FAILED, { error: 'Unexpected error' });
      });
  }, [settings.concurrency, settings.aspectRatio, getGenerationPromise]);

  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, 1000);
    return () => clearInterval(interval);
  }, [processQueue]);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ✅ Only warn when Gemini is selected (paid) — never warn for HF or Pollinations
  const showApiWarning = settings.provider === 'gemini';
  const apiWarningMessage = 'Gemini image model requires a paid API. Switch to Hugging Face or Pollinations for free generation.';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-200 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500 flex items-center gap-3">
              <Zap className="text-yellow-500 dark:text-yellow-400 fill-current w-8 h-8" />
              NanoGen Bulk
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 mt-2 max-w-xl">
              High-performance bulk image generation. Welcome,{' '}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user}</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {settings.provider === 'pollinations' && '🌸 Pollinations'}
              {settings.provider === 'huggingface' && '🤗 Hugging Face'}
              {settings.provider === 'gemini' && '⚡ Gemini'}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-yellow-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Only show warning for Gemini */}
        {showApiWarning && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-700 dark:text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-400">Paid API Required</h3>
              <p className="text-sm mt-1 opacity-90">{apiWarningMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-2">
            <PromptInput onAddTasks={addTasks} />
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 mt-auto shadow-sm">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                    {tasks.filter((t) => t.status === TaskStatus.COMPLETED).length}
                  </span>
                  <span className="text-xs text-zinc-500">Completed</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                    {tasks.filter((t) => t.status === TaskStatus.PENDING).length}
                  </span>
                  <span className="text-xs text-zinc-500">Pending</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {tasks.filter((t) => t.status === TaskStatus.PROCESSING).length}
                  </span>
                  <span className="text-xs text-zinc-500">Processing</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
                    {tasks.filter((t) => t.status === TaskStatus.FAILED).length}
                  </span>
                  <span className="text-xs text-zinc-500">Failed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 h-full">
            <TaskQueue
              tasks={tasks}
              onClearCompleted={clearCompleted}
              onClearAll={clearAll}
              onDeleteTask={deleteTask}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;