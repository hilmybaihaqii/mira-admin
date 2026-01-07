import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X, Bell, Clock, Loader2, RefreshCw, CreditCard } from 'lucide-react';

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 1. FETCH DATA SAAT DROPDOWN DIBUKA ---
  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token');
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
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // --- HELPER: AVATAR GENERATOR ---
  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;
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
    // Dropdown Container dengan Style Glassmorphism & Shadow Halus
    <div className="bg-white rounded-b-2xl rounded-t-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 border-t-0 overflow-hidden w-full max-w-100">
      
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
               Notifications 
               {requests.length > 0 && (
                 <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center shadow-sm shadow-rose-500/30">
                   {requests.length}
                 </span>
               )}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Subscription requests</p>
        </div>
        <button 
            onClick={fetchRequests} 
            disabled={isLoading}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh"
        >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* List Content */}
      <div className="max-h-95 overflow-y-auto custom-scrollbar bg-white">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-500 opacity-50" />
                <p className="text-xs font-medium text-slate-400 animate-pulse">Syncing requests...</p>
            </div>
        ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300 ring-4 ring-slate-50/50">
                    <Bell size={28} />
                </div>
                <p className="text-sm font-bold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-100 leading-relaxed">
                    There are no pending subscription requests at the moment.
                </p>
            </div>
        ) : (
            <div className="divide-y divide-slate-50">
                {requests.map((req) => (
                    <div key={req.id} className="p-5 hover:bg-slate-50/60 transition-colors group">
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                                    <Image 
                                        src={getAvatarUrl(req.profiles?.full_name || 'User')} 
                                        alt={req.profiles?.full_name} 
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-slate-800 truncate pr-2">
                                        {req.profiles?.full_name || 'Unknown User'}
                                    </p>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 bg-slate-100/50 px-1.5 py-0.5 rounded">
                                        <Clock size={10} /> {formatTime(req.created_at)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span className="text-xs text-slate-500">Requesting:</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100/50">
                                        <CreditCard size={10} />
                                        {req.requested_plan}
                                    </span>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleApprove(req)}
                                        disabled={processingId === req.id}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {processingId === req.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={12} strokeWidth={3} /> Approve
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleReject(req.id)}
                                        disabled={processingId === req.id}
                                        className="px-3 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 disabled:bg-slate-50 disabled:text-slate-300 text-[11px] font-bold py-2 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed"
                                        title="Reject Request"
                                    >
                                        {processingId === req.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <X size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
         <button 
            onClick={onClose} 
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
         >
            Close
         </button>
      </div>
    </div>
  );
}