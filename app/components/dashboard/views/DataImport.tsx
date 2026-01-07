import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  Loader2, 
  XCircle, 
  Database, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function ImportData() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  // --- HANDLER UPLOAD KE API ---
  const uploadFile = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    setResultMessage('');

    const token = localStorage.getItem('mira_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/api/admin/import/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setResultMessage(result.message); 
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error: unknown) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      setResultMessage(error instanceof Error ? error.message : "Failed to connect to server");
    }
  };

  // --- EVENT HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setResultMessage('');
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        {/* Background Gradients (Sky/Cyan Theme for Data) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Database className="h-6 w-6 text-sky-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Import Data</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Bulk upload content to populate the community feed. Support for Excel and CSV formats to streamline data entry.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10 w-fit">
                <FileSpreadsheet className="text-sky-300" size={20} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Supported Files</p>
                    <p className="text-sm font-bold text-white">.XLSX, .CSV</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. MAIN CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        
        {/* Header inside Card */}
        <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Upload Data Source</h3>
            <p className="text-sm text-slate-500 mt-1">Drag and drop your file below to start the import process.</p>
        </div>

        <div className="p-8">
            <div 
                className={`
                relative flex flex-col items-center justify-center text-center rounded-2xl p-12 transition-all duration-300 border-2 border-dashed
                min-h-100
                ${isDragging 
                    ? 'border-sky-500 bg-sky-50/50 scale-[1.01]' 
                    : 'border-slate-200 bg-slate-50/30 hover:border-sky-300 hover:bg-slate-50'
                }
                ${uploadStatus === 'success' ? 'border-emerald-500 bg-emerald-50/30' : ''}
                ${uploadStatus === 'error' ? 'border-rose-500 bg-rose-50/30' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                
                {/* STATE: IDLE */}
                {uploadStatus === 'idle' && (
                <div className="animate-[fade-in_0.3s]">
                    <div className="mb-6 flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-white text-sky-600 shadow-lg shadow-sky-100 ring-1 ring-slate-100">
                        <UploadCloud size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Drag & Drop file here</h3>
                    <p className="mt-2 text-sm text-slate-500">or click the button below to browse</p>
                    
                    <label className="mt-8 group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-sky-700 hover:-translate-y-0.5 active:scale-95">
                        Browse Files
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xlsx" />
                    </label>
                    <p className="mt-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                        Maximum file size: 10MB
                    </p>
                </div>
                )}

                {/* STATE: UPLOADING */}
                {uploadStatus === 'uploading' && (
                <div className="flex flex-col items-center animate-[fade-in_0.3s]">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-sky-100 animate-ping opacity-75"></div>
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-sky-600 shadow-md">
                            <Loader2 size={40} className="animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Uploading {fileName}...</h3>
                    <p className="text-slate-500 text-sm mt-2">Processing data on server, please wait.</p>
                </div>
                )}

                {/* STATE: SUCCESS */}
                {uploadStatus === 'success' && (
                <div className="flex flex-col items-center animate-[scale-in_0.3s]">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-50">
                        <CheckCircle size={48} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-700">Import Successful!</h3>
                    <p className="text-slate-600 font-medium text-sm mt-2 mb-8 max-w-md bg-white/60 px-4 py-2 rounded-lg border border-emerald-100">
                        {resultMessage}
                    </p>
                    
                    <button 
                        onClick={resetUpload} 
                        className="rounded-xl bg-emerald-600 text-white px-8 py-3 text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5"
                    >
                        Upload Another File
                    </button>
                </div>
                )}

                {/* STATE: ERROR */}
                {uploadStatus === 'error' && (
                    <div className="flex flex-col items-center animate-[scale-in_0.3s]">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-lg shadow-rose-200/50 ring-4 ring-rose-50">
                        <XCircle size={48} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-rose-700">Import Failed</h3>
                    <p className="text-rose-600/80 text-sm mt-2 mb-8 max-w-md bg-white/60 px-4 py-2 rounded-lg border border-rose-100">
                        {resultMessage || "An unexpected error occurred during upload."}
                    </p>
                    
                    <button 
                        onClick={resetUpload} 
                        className="rounded-xl bg-white border border-rose-200 px-8 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-sm"
                    >
                        Try Again
                    </button>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-start gap-4">
            <AlertCircle size={20} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Important Note</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                    Ensure your file contains a header row with at least a <strong>content</strong> column. 
                    Image URLs are optional. Large files may take a few moments to process. 
                    Duplicate entries may be rejected depending on database constraints.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}