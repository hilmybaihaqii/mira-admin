import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  Loader2, 
  FileText, 
  XCircle
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
      // 1. Siapkan FormData (Wajib untuk upload file)
      const formData = new FormData();
      formData.append('file', file); // Key 'file' standar untuk multer/backend umum

      // 2. Kirim Request POST
      const response = await fetch(`${baseUrl}/api/admin/import/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // JANGAN set 'Content-Type': 'multipart/form-data' secara manual,
          // biarkan browser yang mengaturnya agar boundary ter-set otomatis.
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setResultMessage(result.message); // Menampilkan pesan dari backend (e.g., "Successfully imported 2 posts...")
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error: unknown) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      setResultMessage(error instanceof Error ? error.message : "Failed to connect to server");
    }
  };

  // --- EVENT HANDLERS (Drag & Drop + Click) ---
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
    <div className="space-y-6 animate-[fade-in_0.5s_ease-out]">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Import Community Posts</h2>
        <p className="text-slate-500 text-sm mt-1">
            Bulk upload posts from Excel/CSV directly to the community feed.
        </p>
      </div>

      {/* MAIN UPLOAD AREA */}
      <div 
        className={`
          relative flex flex-col items-center justify-center text-center rounded-3xl p-12 transition-all duration-300 border-2 border-dashed
          min-h-100
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
          }
          ${uploadStatus === 'success' ? 'border-emerald-500 bg-emerald-50/30' : ''}
          ${uploadStatus === 'error' ? 'border-rose-500 bg-rose-50/30' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {/* STATE: IDLE (Belum ada file) */}
        {uploadStatus === 'idle' && (
          <div className="animate-[fade-in_0.3s]">
            <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-sm ring-4 ring-indigo-50/50">
              <UploadCloud size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Drag & Drop file here</h3>
            <p className="mt-2 text-sm text-slate-500">Supported formats: <strong>.xlsx, .csv</strong></p>
            
            <label className="mt-8 group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95">
              Browse Files
              <input type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xlsx" />
            </label>
          </div>
        )}

        {/* STATE: UPLOADING */}
        {uploadStatus === 'uploading' && (
          <div className="flex flex-col items-center animate-[fade-in_0.3s]">
            <Loader2 size={56} className="text-indigo-600 animate-spin mb-6" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-slate-800">Uploading {fileName}...</h3>
            <p className="text-slate-500 text-sm mt-2">Processing data on server...</p>
          </div>
        )}

        {/* STATE: SUCCESS */}
        {uploadStatus === 'success' && (
          <div className="flex flex-col items-center animate-[scale-in_0.3s]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm ring-4 ring-emerald-50">
              <CheckCircle size={40} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-emerald-700">Import Successful!</h3>
            <p className="text-slate-600 font-medium text-sm mt-2 mb-8 max-w-md">
                {resultMessage}
            </p>
            
            <button 
                onClick={resetUpload} 
                className="rounded-xl bg-white border border-emerald-200 px-6 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
            >
                Upload Another File
            </button>
          </div>
        )}

        {/* STATE: ERROR */}
        {uploadStatus === 'error' && (
           <div className="flex flex-col items-center animate-[scale-in_0.3s]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm ring-4 ring-rose-50">
              <XCircle size={40} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-rose-700">Import Failed</h3>
            <p className="text-rose-600/80 text-sm mt-2 mb-8 max-w-md">
                {resultMessage || "An unexpected error occurred during upload."}
            </p>
            
            <button 
                onClick={resetUpload} 
                className="rounded-xl bg-white border border-rose-200 px-6 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-sm"
            >
                Try Again
            </button>
          </div>
        )}
      </div>

      {/* INFO CARD (Minimalis) */}
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 mt-0.5">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">File Requirements</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ensure your file has a header row with at least a <strong>content</strong> column. 
                Images are optional. Use standard Excel (.xlsx) or CSV formats.
            </p>
          </div>
      </div>
    </div>
  );
}