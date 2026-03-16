import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './Button';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nano-gen-preview-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/60 dark:bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
        {/* Toolbar */}
        <div className="absolute top-0 right-0 flex items-center gap-3 z-50 pointer-events-auto p-4">
             <Button 
                variant="secondary" 
                onClick={handleDownload}
                className="shadow-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
                <Download className="w-4 h-4 mr-2" />
                Download
             </Button>
             <button 
                onClick={onClose}
                className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-lg"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Image */}
        <img 
            src={imageUrl} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto select-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
};