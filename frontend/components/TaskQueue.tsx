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
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Generation Queue</span>
            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onClearCompleted} disabled={!tasks.some(t => t.status === TaskStatus.COMPLETED)}>
              Clear Done
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearAll} disabled={tasks.length === 0} className="text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10">
              Clear All
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/30">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-500 space-y-3 min-h-[200px]">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 opacity-50 text-zinc-400 dark:text-zinc-500" />
              </div>
              <p>Queue is empty. Add prompts to start.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border transition-all ${
                  task.status === TaskStatus.PROCESSING
                    ? 'bg-yellow-50 dark:bg-zinc-800/50 border-yellow-200 dark:border-yellow-500/30 ring-1 ring-yellow-500/10'
                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
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
                    <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-auto font-mono">
                     ID: {task.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate font-medium">{task.prompt}</p>
                  {task.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-100 dark:border-red-900/50">{task.error}</p>
                  )}
                </div>

                {/* Actions & Result */}
                <div className="flex items-center gap-3 sm:border-l sm:border-zinc-100 dark:sm:border-zinc-800 sm:pl-4 min-w-[100px] justify-end sm:justify-start">
                   {task.status === TaskStatus.COMPLETED && task.imageData && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors cursor-pointer" onClick={() => setPreviewImage(task.imageData!)}>
                          <img src={task.imageData} alt="Result" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                      </div>
                   )}
                   
                   <div className="flex flex-col gap-2">
                      {task.status === TaskStatus.COMPLETED && task.imageData && (
                           <div className="flex gap-2">
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setPreviewImage(task.imageData!)} 
                                className="h-7 w-7 p-0 flex items-center justify-center"
                                title="Preview"
                             >
                                <Eye className="w-3.5 h-3.5" />
                             </Button>
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => downloadImage(task.imageData!, `nano-gen-${task.id}.png`)} 
                                className="h-7 text-xs flex-grow"
                             >
                                Save
                             </Button>
                           </div>
                      )}
                      <button 
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors self-end sm:self-center w-full flex justify-center"
                          title="Remove task"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
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