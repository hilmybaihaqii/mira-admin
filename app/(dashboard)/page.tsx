'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Bell } from 'lucide-react';


// --- TYPES ---
import { Role } from '@/types';

// --- COMPONENTS ---
import Sidebar from '@/app/components/dashboard/layout/Sidebar';
import NotificationDropdown from '@/app/components/dashboard/shared/NotificationDropdown';

// --- VIEWS ---
import Overview from '@/app/components/dashboard/views/Overview'; 
import Features from '@/app/components/dashboard/views/Features'; 
import UserManagement from '@/app/components/dashboard/views/UserManagement';
import AdminManagement from '@/app/components/dashboard/views/AdminManagement';
import Community from '@/app/components/dashboard/views/Community';
import Reports from '@/app/components/dashboard/views/Reports';    
import ImportData from '@/app/components/dashboard/views/DataImport';
import ExportData from '@/app/components/dashboard/views/DataExport';

// --- INTERFACES ---
interface ApiUser {
  id: string;
  full_name?: string;
  username?: string;
  email: string;
  role?: string;
  status?: string;
  level?: { status: string }; // Field penting untuk notifikasi subscription
  created_at?: string;
}

interface FeatureLog {
  feature_name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // --- DATA STATE ---
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [username, setUsername] = useState<string>('Administrator'); 
  const [users, setUsers] = useState<ApiUser[]>([]); 
  const [topFeatureName, setTopFeatureName] = useState<string>(''); 
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  // --- HANDLER: LOGOUT (Memoized) ---
  const handleLogout = useCallback(async () => {
    try {
        const token = localStorage.getItem('mira_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        if (token && baseUrl) {
            // Fire and forget logout request
            await fetch(`${baseUrl}/api/admin/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        localStorage.clear();
        router.push('/login');
    }
  }, [router]);

  // --- EFFECT: INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const initDashboard = async () => {
      const token = localStorage.getItem('mira_token');
      const role = localStorage.getItem('mira_role') as Role;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Parallel fetching untuk optimasi waktu load
        const [profileRes, usersRes, featuresRes] = await Promise.all([
            fetch(`${baseUrl}/api/admin/whoami`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${baseUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${baseUrl}/api/dashboard/features`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        // 1. Process Profile
        if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.success && profileData.data) {
                setUsername(profileData.data.username);
            }
        } else if (profileRes.status === 401) {
            handleLogout();
            return;
        }

        // 2. Process Users & Notification Logic
        if (usersRes.ok) {
            const usersData = await usersRes.json();
            const userList: ApiUser[] = Array.isArray(usersData) ? usersData : (usersData.data || []);
            setUsers(userList);

            // LOGIC: Cek pending subscription requests
            const hasRequest = userList.some(u => 
                u.level?.status === 'requested' || u.level?.status === 'pending_approval'
            );
            setHasPendingRequests(hasRequest);
        }

        // 3. Process Top Feature
        if (featuresRes.ok) {
            const featuresData = await featuresRes.json();
            if (featuresData.success && Array.isArray(featuresData.data) && featuresData.data.length > 0) {
                const logs: FeatureLog[] = featuresData.data;
                const counts: Record<string, number> = {};
                
                // Hitung frekuensi (O(n))
                logs.forEach(log => {
                    if (log.feature_name) counts[log.feature_name] = (counts[log.feature_name] || 0) + 1;
                });

                // Cari max (O(k))
                const topEntry = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
                
                if (topEntry) {
                     // Format string: "second_brain" -> "Second Brain"
                    const formatted = topEntry[0]
                        .split('_')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    setTopFeatureName(formatted);
                }
            } else {
                setTopFeatureName('No Usage Data');
            }
        }

        setUserRole(role || 'ADMIN');
        setIsLoading(false);

      } catch (error) {
        console.error("Dashboard init failed:", error);
        setUserRole(role || 'ADMIN');
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router, handleLogout]);

  // --- EFFECT: CLICK OUTSIDE NOTIFICATION ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  // --- HELPER: INITIALS ---
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'AD';

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Overview users={users} topFeature={topFeatureName} onViewAll={() => setActiveTab('Users')} />;
      case 'Features': return <Features />;
      case 'Users': return <UserManagement users={users} setUsers={setUsers} />;
      case 'Community': return <Community />;
      case 'Reports': return <Reports />;
      case 'Admins':
        if (userRole !== 'SUPER_ADMIN') {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] p-8 animate-[fade-in_0.3s_ease-out]">
                    <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl p-8 text-center max-w-md">
                        <h3 className="text-lg font-bold text-red-900 mb-2">Restricted Area</h3>
                        <p className="text-sm text-red-600/80">Only HQ (Super Admin) allows modification of administrative privileges.</p>
                    </div>
                </div>
            );
        }
        return <AdminManagement />;
      case 'Import': return <ImportData />;
      case 'Export': return <ExportData />;
      default: return null;
    }
  };

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mt-4 animate-pulse">
            Establishing Secure Connection...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SIDEBAR */}
      <div className="relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout} 
            userRole={userRole} 
        />
      </div>

      {/* MAIN LAYOUT */}
      <main className="flex-1 md:ml-72 flex flex-col h-full relative z-0">
        
        {/* === LUXURY HEADER === */}
        {/* === LUXURY HEADER (FIXED NOTIFICATION) === */}
        <header className="sticky top-0 z-40 px-8 py-5 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex justify-between items-center transition-all duration-300 supports-backdrop-filter:bg-white/60">
          
          {/* Title & Context */}
          <div className="flex flex-col animate-[fade-in_0.5s_ease-out]">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {activeTab === 'Dashboard' ? 'Overview' : 
               activeTab === 'Features' ? 'Feature Analytics' : activeTab}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${userRole === 'SUPER_ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {userRole === 'SUPER_ADMIN' ? 'HQ Access' : 'Branch Access'}
                </span>
                <span className="text-slate-300 text-[10px]">•</span>
                <p className="text-slate-500 text-xs font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            
            {/* NOTIFICATIONS (ATTACHED STYLE) */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2.5 transition-all duration-200 rounded-full outline-none z-50 ${
                        isNotifOpen 
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 rounded-b-none' // Saat aktif: bawah kotak agar nyambung
                        : 'text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-md'
                    }`}
                >
                    <Bell size={20} className="stroke-[2px]" />
                    
                    {/* RED DOT */}
                    {hasPendingRequests && (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 border border-white"></span>
                        </span>
                    )}
                </button>

                {/* DROPDOWN MENU */}
                {/* mt-0: Menempel, rounded-t-none: Atas Rata, rounded-b-2xl: Bawah Bulat */}
                <div 
                    className={`absolute right-0 top-full mt-0 w-80 sm:w-96 z-40 origin-top-right transition-all duration-200 ease-out transform ${
                        isNotifOpen 
                        ? 'opacity-100 scale-100 translate-y-0 visible' 
                        : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                    }`}
                >
                    {/* Container Style */}
                    <div className="bg-white rounded-b-2xl rounded-t-none shadow-[0_15px_50px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 border-t-0 overflow-hidden">
                        
                        {/* Garis pemanis di paling atas agar seolah menyatu dengan header/tombol */}
                        <div className="h-px w-full bg-slate-50"></div> 
                        
                        <NotificationDropdown 
                            isOpen={isNotifOpen}
                            onClose={() => setIsNotifOpen(false)}
                        />
                    </div>
                </div>
            </div>
            
            {/* PROFILE WIDGET */}
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200/60 h-10">
                <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-slate-700 capitalize leading-tight">{username}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                        {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </p>
                </div>
                
                <div className="relative group cursor-pointer">
                    <div className="h-11 w-11 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                        {getInitials(username)}
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-slate-50"></div>
                </div>
            </div>
          </div>
        </header>

        {/* === SCROLLABLE CONTENT === */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 relative z-0 scroll-smooth custom-scrollbar">
          {/* Aesthetic Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-white to-transparent pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto w-full animate-[fade-in_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            {renderContent()}
          </div>

          <div className="mt-12 py-6 text-center border-t border-slate-100">
             <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                SYSTEM SECURE • ENCRYPTED CONNECTION
             </p>
          </div>
        </div>

      </main>
    </div>
  );
}