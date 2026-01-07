/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Trash2, Search, CheckCircle, Loader2, RefreshCw, FileText, ShieldAlert, User, AlertTriangle } from 'lucide-react';
import DeleteModal from '../shared/DeleteModal';

// --- INTERFACES ---
interface Author {
  full_name: string;
  email: string;
  avatar_url: string;
}

interface ReportedContent {
  id: string;
  content: string;
  image_url?: string | null;
  author: Author;
}

interface ApiReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  user_id: string;
  reporter: Author;
  post_id?: string;
  post?: ReportedContent;
}

export default function Reports() {
  // --- STATE ---
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ApiReport | null>(null);
  const [actionType, setActionType] = useState<'DELETE_CONTENT' | 'DISMISS_REPORT'>('DISMISS_REPORT');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH REPORTS ---
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${baseUrl}/api/admin/community/reports`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // --- FILTERING ---
  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const reporterName = report.reporter?.full_name?.toLowerCase() || '';
    const contentText = report.post?.content?.toLowerCase() || '';
    const reportedAuthor = report.post?.author?.full_name?.toLowerCase() || '';

    return reporterName.includes(searchLower) || 
           contentText.includes(searchLower) ||
           reportedAuthor.includes(searchLower);
  });

  // --- ACTIONS HANDLERS ---
  const confirmAction = (report: ApiReport, type: 'DELETE_CONTENT' | 'DISMISS_REPORT') => {
    setSelectedReport(report);
    setActionType(type);
    setIsDeleteOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!selectedReport) return;
    setIsProcessing(true);

    const token = localStorage.getItem('mira_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (actionType === 'DELETE_CONTENT') {
        const contentId = selectedReport.post_id || selectedReport.post?.id;
        
        if (!contentId) {
            console.error("Report data missing content ID:", selectedReport);
            throw new Error("Content ID not found");
        }

        // 1. Delete Postingan
        const resContent = await fetch(`${baseUrl}/api/admin/community/posts/${contentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const dataContent = await resContent.json();
        if (!dataContent.success) throw new Error(dataContent.message || "Failed to delete post");

        // 2. Hapus Laporan (Clean up)
        const resCleanup = await fetch(`${baseUrl}/api/admin/community/reports/${selectedReport.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resCleanup.ok) console.warn("Report cleanup might have failed");

      } else {
        // DISMISS REPORT
        const resReport = await fetch(`${baseUrl}/api/admin/community/reports/${selectedReport.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dataReport = await resReport.json();
        if (!dataReport.success) throw new Error(dataReport.message || "Failed to dismiss report");
      }

      // Update UI Optimistic
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setIsDeleteOpen(false);
      setSelectedReport(null);

    } catch (error: unknown) { 
      console.error("Action error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Action failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper: Format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER (Matches Community Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Flag className="h-6 w-6 text-rose-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Reported Content</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Review flagged content. Take action to maintain community standards by removing violations or dismissing false reports.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10">
                <ShieldAlert className="text-rose-400" size={20} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Issues</p>
                    <p className="text-lg font-bold text-white">{reports.length} Reports</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. TOOLBAR (SEARCH & REFRESH) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none">
                <Search size={20} />
            </div>
            <input 
                type="text" 
                placeholder="Search reporter, author, or content..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
            />
        </div>

        {/* Refresh Button */}
        <button 
            onClick={fetchReports} 
            disabled={isLoading}
            className="p-3.5 text-slate-500 bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-2xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            title="Refresh Reports"
        >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 3. TABLE DATA */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto min-h-75">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th className="px-8 py-5">Reporter</th>
                        <th className="px-6 py-5">Flagged Content</th>
                        <th className="px-6 py-5">Violation Reason</th>
                        <th className="px-6 py-5">Date</th>
                        <th className="px-8 py-5 text-right">Moderation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <Loader2 size={32} className="animate-spin text-rose-500" />
                                    <p className="text-sm font-medium">Loading reports...</p>
                                </div>
                            </td>
                        </tr>
                    ) : filteredReports.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <div className="p-4 bg-emerald-50 rounded-full mb-3 text-emerald-500">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-lg font-bold text-slate-600">All Clear!</p>
                                    <p className="text-sm">There are no pending reports matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredReports.map((report) => (
                            <tr key={report.id} className="group hover:bg-slate-50/60 transition-colors duration-200">
                                {/* COLUMN 1: REPORTER */}
                                <td className="px-8 py-5 align-top w-64">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-10 w-10 min-w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                            <img 
                                                src={report.reporter?.avatar_url || `https://ui-avatars.com/api/?name=${report.reporter?.full_name || 'User'}`} 
                                                alt="Reporter" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{report.reporter?.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">{report.reporter?.email}</p>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-500 border-slate-200">
                                                <User size={9} /> Reporter
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                
                                {/* COLUMN 2: CONTENT PREVIEW */}
                                <td className="px-6 py-5 align-top max-w-sm">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 group-hover:border-slate-300 transition-colors">
                                        {/* Original Author */}
                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/50">
                                            <div className="h-5 w-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                <img 
                                                    src={report.post?.author?.avatar_url || `https://ui-avatars.com/api/?name=${report.post?.author?.full_name || 'U'}`} 
                                                    alt="Author" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 truncate max-w-30">
                                                {report.post?.author?.full_name || 'Unknown Author'}
                                            </span>
                                        </div>
                                        
                                        {/* Content Text */}
                                        <p className="text-sm text-slate-700 italic leading-relaxed line-clamp-3 mb-2">
                                            &quot;{report.post?.content || 'Content not available or deleted.'}&quot;
                                        </p>
                                        
                                        {/* Attachment Indicator */}
                                        {report.post?.image_url && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 w-fit">
                                                <FileText size={12} className="text-rose-400" /> Image Attachment
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMN 3: REASON */}
                                <td className="px-6 py-5 align-top">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                        <AlertTriangle size={12} />
                                        {report.reason}
                                    </div>
                                </td>

                                {/* COLUMN 4: DATE */}
                                <td className="px-6 py-5 align-top whitespace-nowrap">
                                     <div className="text-sm font-medium text-slate-500">
                                        {formatDate(report.created_at)}
                                     </div>
                                </td>

                                {/* COLUMN 5: ACTIONS */}
                                <td className="px-8 py-5 text-right align-top">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* DISMISS BUTTON */}
                                        <button 
                                            onClick={() => confirmAction(report, 'DISMISS_REPORT')}
                                            className="p-2.5 text-emerald-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl transition-all shadow-sm group/ok"
                                            title="Dismiss (Keep Content)"
                                        >
                                            <CheckCircle size={18} className="group-hover/ok:scale-110 transition-transform" />
                                        </button>
                                        
                                        {/* DELETE CONTENT BUTTON */}
                                        <button 
                                            onClick={() => confirmAction(report, 'DELETE_CONTENT')}
                                            className="p-2.5 text-rose-500 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl transition-all shadow-sm group/del"
                                            title="Delete Content (Valid Report)"
                                        >
                                            <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleExecuteAction}
        title={actionType === 'DELETE_CONTENT' ? "Delete Content?" : "Dismiss Report?"}
        message={actionType === 'DELETE_CONTENT' 
            ? "This will permanently remove the content from the platform and mark the report as resolved." 
            : "This will remove the report from the queue. The content will remain visible on the platform."}
        itemName={actionType === 'DELETE_CONTENT' ? "this content" : "this report"}
        isDeleting={isProcessing}
      />
    </div>
  );
}