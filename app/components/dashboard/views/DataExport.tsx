import React, { useState } from 'react';
import { Download, Database, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';

export default function ExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      // Langsung tembak API profiles karena hanya ini yang tersedia
      const response = await fetch(`${baseUrl}/api/admin/export/profiles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh file export.');
      }

      // Handle response sebagai Blob (Binary)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nama file otomatis: users_export_YYYY-MM-DD.xlsx
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `users_export_${dateStr}.xlsx`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Update status UI
      setLastExport(new Date().toLocaleTimeString());

    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat mengunduh data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.5s_ease-out]">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Export Data</h2>
        <p className="text-slate-500 text-sm mt-1">Download database reports.</p>
      </div>

      {/* MAIN CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD: USER DATA (ACTIVE) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Database size={24} />
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Available
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800">User Profiles</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Export full list of registered users including names, emails, and profile details.
                </p>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span>Format: <strong>.xlsx (Microsoft Excel)</strong></span>
                    </div>
                    {lastExport && (
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span>Last downloaded: {lastExport}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Preparing File...
                        </>
                    ) : (
                        <>
                            <Download size={18} /> Download Excel
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* CARD: COMING SOON (PLACEHOLDER AGAR TIDAK KOSONG) */}
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center opacity-60">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Database size={32} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-400">More Reports Coming Soon</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Analytics and System Logs export features are currently under development.
            </p>
        </div>

      </div>
    </div>
  );
}