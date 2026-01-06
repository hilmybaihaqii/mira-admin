import React from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName: string;
  isDeleting?: boolean; // Prop baru untuk loading state
}

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item?", 
  message = "Are you sure you want to delete",
  itemName,
  isDeleting = false // Default false
}: DeleteModalProps) {
    
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* 1. Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fade-in_0.3s_ease-out]"
        onClick={!isDeleting ? onClose : undefined} // Cegah tutup saat loading
      />

      {/* 2. Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-100 shadow-2xl shadow-slate-900/20 transform transition-all animate-[scale-in_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
        
        {/* Dekorasi Header */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-rose-50/50 to-transparent pointer-events-none"></div>

        {/* Close Button */}
        {!isDeleting && (
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 p-2 bg-white/80 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all z-10 backdrop-blur-sm"
            >
                <X size={18} strokeWidth={2.5} />
            </button>
        )}

        <div className="p-8 relative z-0 flex flex-col items-center text-center">
          
          {/* 3. Icon Wrapper */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="relative w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg shadow-rose-100">
               <AlertTriangle className="text-rose-500 drop-shadow-sm" size={36} strokeWidth={2} />
            </div>
          </div>
          
          {/* 4. Typography */}
          <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
            {message} <span className="font-bold text-slate-800">&quot;{itemName}&quot;</span>?
            <br />
            <span className="text-slate-400 text-xs mt-2 block">
                This action is permanent and cannot be undone.
            </span>
          </p>
          
          {/* 5. Action Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all duration-200 focus:ring-4 focus:ring-slate-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-3.5 px-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/40 transition-all duration-200 flex items-center justify-center gap-2 focus:ring-4 focus:ring-rose-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} strokeWidth={2.5} />
                  Delete
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}