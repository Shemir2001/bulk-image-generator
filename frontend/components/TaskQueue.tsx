import React, { useState } from 'react';
import { ImageTask, TaskStatus } from '../types';
import { CheckCircle2, CircleDashed, Clock, XCircle, Download, Trash2, Image as ImageIcon, Eye, Maximize2 } from 'lucide-react';
import { Button } from './Button';
import { ImagePreviewModal } from './ImagePreviewModal';

interface TaskQueueProps {
  tasks: ImageTask[];
  onClearCompleted: () => void;
  onClearAll: () => void;
  onDeleteTask: (id: string) => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ tasks, onClearCompleted, onClearAll, onDeleteTask }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case TaskStatus.FAILED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case TaskStatus.PROCESSING:
        return <CircleDashed className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-zinc-400" />;
    }
  };

  const downloadImage = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden shadow-sm transition-colors duration-300">
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">Generation Queue</span>
            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <Button variant="ghost" size="sm" onClick={onClearCompleted} disabled={!tasks.some(t => t.status === TaskStatus.COMPLETED)}>
              Clear Done
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearAll} disabled={tasks.length === 0} className="text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10">
              Clear All
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/30">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-500 space-y-3 min-h-[200px]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 opacity-50 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm sm:text-base">Queue is empty. Add prompts to start.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group rounded-lg border transition-all overflow-hidden ${
                  task.status === TaskStatus.PROCESSING
                    ? 'bg-yellow-50 dark:bg-zinc-800/50 border-yellow-200 dark:border-yellow-500/30 ring-1 ring-yellow-500/10'
                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Generated Image — shown prominently for completed tasks */}
                {task.status === TaskStatus.COMPLETED && task.imageData && (
                  <div 
                    className="relative w-full cursor-pointer bg-zinc-100 dark:bg-zinc-800"
                    onClick={() => setPreviewImage(task.imageData!)}
                  >
                    <img 
                      src={task.imageData} 
                      alt="Generated result" 
                      className="w-full h-40 sm:h-48 md:h-56 object-contain bg-zinc-950/5 dark:bg-zinc-950" 
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-all">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {/* Info & Actions row */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Status & Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <span className={`text-xs font-bold tracking-wider ${
                          task.status === TaskStatus.COMPLETED ? 'text-green-600 dark:text-green-500' :
                          task.status === TaskStatus.PROCESSING ? 'text-yellow-600 dark:text-yellow-500' :
                          task.status === TaskStatus.FAILED ? 'text-red-600 dark:text-red-500' : 'text-zinc-500'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-auto font-mono hidden sm:inline">
                          ID: {task.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium line-clamp-2">{task.prompt}</p>
                      {task.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-100 dark:border-red-900/50 line-clamp-3">{task.error}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                       {task.status === TaskStatus.COMPLETED && task.imageData && (
                         <>
                           <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => setPreviewImage(task.imageData!)} 
                              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 p-0 flex items-center justify-center"
                              title="Preview"
                           >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline ml-1.5 text-xs">Preview</span>
                           </Button>
                           <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => downloadImage(task.imageData!, `nano-gen-${task.id}.png`)} 
                              className="h-7 sm:h-8 text-xs"
                           >
                              <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                              <span className="hidden sm:inline">Save</span>
                           </Button>
                         </>
                       )}
                       <button 
                           onClick={() => onDeleteTask(task.id)}
                           className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                           title="Remove task"
                       >
                           <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};