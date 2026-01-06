'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  BookOpen, 
  Crown, 
  ShieldCheck, 
  FileInput, 
  FileOutput,
  Flag,           
  MessagesSquare,
  Zap // <--- Sudah diimport sesuai request
} from 'lucide-react';
import { MenuItem, Role } from '@/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userRole: Role | null;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, userRole }: SidebarProps) {
  
  // --- KONFIGURASI MENU ---
  const menuItems: MenuItem[] = [
    { 
      id: 'Dashboard', 
      icon: LayoutDashboard, 
      label: 'Overview' 
    },
    { 
      id: 'Features', 
      icon: Zap, 
      label: 'Feature Analytics' 
    },
    { 
      id: 'Users', 
      icon: Users, 
      label: 'User Management' 
    },
    { 
      id: 'Community', 
      icon: MessagesSquare, 
      label: 'Community Feed' 
    },
    { 
      id: 'Reports', 
      icon: Flag, 
      label: 'Reports & Safety' 
    },
    { 
      id: 'Admins', 
      icon: ShieldCheck, 
      label: 'Admin Management',
      allowedRoles: ['SUPER_ADMIN']
    },
    { 
      id: 'Import', 
      icon: FileInput, 
      label: 'Import Data' 
    },
    { 
      id: 'Export', 
      icon: FileOutput, 
      label: 'Export Data' 
    },
  ];

  // Filter Menu Berdasarkan Role
  const filteredMenu = menuItems.filter(item => {
    if (!item.allowedRoles) return true;
    return userRole && item.allowedRoles.includes(userRole);
  });

  return (
    <aside className="w-72 bg-[#0B1120] text-slate-300 flex flex-col fixed h-full z-50 transition-all duration-300 border-r border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
      
      {/* --- BRANDING AREA --- */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-4 group cursor-default">
          {/* Logo dengan efek Glow */}
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
             <div className="relative w-11 h-11 bg-linear-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 border border-white/10">
                <BookOpen className="text-white w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">MIRA</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${userRole === 'SUPER_ADMIN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-blue-500'}`}></div>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                    {userRole === 'SUPER_ADMIN' ? 'HQ Access' : 'Admin Panel'}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION MENU --- */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Main Menu</p>
        </div>
        
        {filteredMenu.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden isolate
                ${isActive 
                  ? 'text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/3'
                }`}
            >
              {/* Active Background (linear + Border) */}
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-indigo-700 -z-10 border border-indigo-500/30 rounded-xl"></div>
              )}

              {/* Icon */}
              <Icon 
                size={20} 
                strokeWidth={1.5} 
                className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} 
              />
              
              {/* Label */}
              <span className="relative z-10 tracking-wide">{item.label}</span>
              
              {/* Active Indicator (Right Side Glow) */}
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* --- BOTTOM ACTIONS (USER STATUS) --- */}
      <div className="p-5 border-t border-slate-800/60 bg-[#0B1120]">
        
        {/* Status Card Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 mb-3 group">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2 bg-linear-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-orange-900/20">
                <Crown size={16} className="text-white fill-white/20" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-200">System Status</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {userRole === 'SUPER_ADMIN' ? 'Root privileges active' : 'Standard privileges'}
                </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent rounded-xl transition-all duration-300 group"
        >
          <LogOut size={18} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
        
        <div className="mt-4 text-center">
            <p className="text-[9px] text-slate-600 font-medium tracking-widest">MIRA v2.0.4 [STABLE]</p>
        </div>
      </div>
    </aside>
  );
}