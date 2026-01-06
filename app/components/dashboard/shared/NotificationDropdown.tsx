import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X, Bell, Clock, Loader2, RefreshCw } from 'lucide-react';

// --- TIPE DATA SESUAI API ---
interface UserProfile {
  email: string;
  full_name: string;
}

interface SubscriptionRequest {
  id: string;
  requested_plan: string;
  created_at: string;
  user_id: string;
  profiles: UserProfile;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ 
  isOpen, 
  onClose 
}: NotificationDropdownProps) {
  
  // --- STATE ---
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null); // Untuk loading tombol aksi

  // --- 1. FETCH DATA SAAT DROPDOWN DIBUKA ---
  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token'); // Pastikan token sesuai key di localStorage Anda
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subs/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPER: FORMAT WAKTU ---
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  // --- HELPER: AVATAR GENERATOR (Karena API tidak ada avatar) ---
  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  // --- 2. HANDLE APPROVE ---
  const handleApprove = async (req: SubscriptionRequest) => {
    setProcessingId(req.id);
    try {
      const token = localStorage.getItem('mira_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subs/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: req.id })
      });

      const result = await res.json();
      if (result.success) {
        // Hapus item dari list jika sukses
        setRequests((prev) => prev.filter((item) => item.id !== req.id));
      } else {
        alert("Failed to approve: " + result.message);
      }
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // --- 3. HANDLE REJECT ---
  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('mira_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subs/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId: id })
      });

      const result = await res.json();
      if (result.success) {
        // Hapus item dari list jika sukses
        setRequests((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to reject: " + result.message);
      }
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-0 w-80 md:w-96 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 overflow-hidden z-50 animate-[fade-in-down_0.3s_cubic-bezier(0.16,1,0.3,1)] origin-top-right">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-indigo-50/50 flex justify-between items-center bg-white/50">
        <div>
            <h3 className="font-bold text-slate-800 text-base tracking-tight">Subscription Requests</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Pending Approval</p>
        </div>
        <div className="flex gap-2">
            {isLoading && <Loader2 size={16} className="animate-spin text-indigo-500" />}
            {requests.length > 0 && !isLoading && (
                <span className="flex items-center justify-center min-w-6 h-6 text-[10px] font-bold text-white bg-indigo-600 rounded-full px-2 shadow-lg shadow-indigo-500/30">
                    {requests.length}
                </span>
            )}
        </div>
      </div>

      {/* List Area */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-50/30">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-indigo-400" />
                <p className="text-xs">Checking requests...</p>
            </div>
        ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Bell size={28} />
                </div>
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending subscription requests.</p>
                <button 
                    onClick={fetchRequests} 
                    className="mt-4 flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full"
                >
                    <RefreshCw size={10} /> Refresh
                </button>
            </div>
        ) : (
            requests.map((req) => (
                <div key={req.id} className="p-5 border-b border-indigo-50/50 hover:bg-white transition-all duration-300 group">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="relative w-12 h-12 shrink-0">
                            <Image 
                                src={getAvatarUrl(req.profiles?.full_name || 'User')} 
                                alt={req.profiles?.full_name} 
                                width={48}
                                height={48}
                                className="rounded-full object-cover border-[3px] border-white shadow-md relative z-10"
                            />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full z-20" title="Pending"></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{req.profiles?.full_name || 'Unknown User'}</p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                    <Clock size={10} />
                                    {formatTime(req.created_at)}
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                Requested plan: <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">{req.requested_plan}</span>
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleApprove(req)}
                                    disabled={processingId === req.id}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95 disabled:cursor-not-allowed"
                                >
                                    {processingId === req.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={14} strokeWidth={3} /> Approve
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleReject(req.id)}
                                    disabled={processingId === req.id}
                                    className="flex-1 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 disabled:bg-slate-50 disabled:text-slate-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed"
                                >
                                    {processingId === req.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <X size={14} strokeWidth={3} /> Reject
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-white/80 backdrop-blur-md border-t border-slate-100 text-center">
         <button 
            onClick={onClose} 
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors py-1 px-4 rounded-lg hover:bg-indigo-50"
         >
            Close Panel
         </button>
      </div>
    </div>
  );
}