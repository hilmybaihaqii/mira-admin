import React, { useState } from 'react';
import { 
  Download, 
  Database, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle, 
  FileDown, 
  Layout,
  Clock
} from 'lucide-react';

export default function ExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      // Langsung tembak API profiles
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
      setLastExport(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat mengunduh data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        {/* Background Gradients (Emerald/Teal Theme for Export/Excel) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <FileDown className="h-6 w-6 text-emerald-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Export Data</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Download comprehensive reports and database records. Generate Excel files for external analysis and backup purposes.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10 w-fit">
                <Database className="text-emerald-300" size={20} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System Status</p>
                    <p className="text-sm font-bold text-white">Ready to Export</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. EXPORT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: USER PROFILES (ACTIVE) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col hover:border-emerald-200 transition-colors group">
            <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                        <Layout size={28} />
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-200">
                        Available
                    </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800">User Profiles</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Export the complete list of registered users including names, email addresses, roles, and profile statuses.
                </p>

                <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium mb-2">
                        <FileSpreadsheet size={18} className="text-emerald-600" />
                        <span>Format: <strong>.xlsx (Microsoft Excel)</strong></span>
                    </div>
                    {lastExport ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mt-3 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                            <CheckCircle size={14} />
                            <span>Last downloaded: {lastExport}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                            <Clock size={14} />
                            <span>No recent export history</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={18} className="animate-spin text-emerald-400" /> 
                            <span className="text-slate-200">Preparing File...</span>
                        </>
                    ) : (
                        <>
                            <Download size={18} className="text-emerald-400" /> 
                            <span>Download Excel Report</span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* CARD 2: COMING SOON (PLACEHOLDER) */}
        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed h-full min-h-75">
            <div className="p-5 bg-white rounded-full mb-6 shadow-sm">
                <Database size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-400">Additional Reports</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
                Analytics, System Logs, and Payment History exports are currently under development.
            </p>
            <span className="mt-6 px-4 py-1.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Coming Soon
            </span>
        </div>

      </div>
    </div>
  );
}