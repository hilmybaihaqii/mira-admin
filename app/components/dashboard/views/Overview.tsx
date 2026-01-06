import React from 'react';
import { Users, Crown, ArrowRight, Activity, Calendar, Sparkles, User } from 'lucide-react';
import StatsCard from '../shared/StatsCard';

interface ApiUser {
  id: string;
  full_name?: string;
  username?: string;
  email: string;
  role?: string;
  status?: string;
  level?: {
    status: string;
  };
  created_at?: string;
}

interface OverviewProps {
  users: ApiUser[];
  onViewAll: () => void;
  topFeature?: string;
}

export default function Overview({ users, onViewAll, topFeature }: OverviewProps) {
  
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.replace(/@.*/, '').split(/[\s.]/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getJoinedDate = (dateString?: string) => {
    if (dateString) return new Date(dateString).toLocaleDateString();
    return new Date().toLocaleDateString();
  };

  const getUserStatus = (user: ApiUser) => {
    return user.status || user.level?.status || 'Reguler';
  };

  // Logic: Ambil 5 user terakhir dari props users
  const recentUsers = Array.isArray(users) ? [...users].reverse().slice(0, 5) : [];
  const totalUsers = Array.isArray(users) ? users.length : 0;
  
  // Logic: Hitung user premium dari props users
  const proUsers = Array.isArray(users) ? users.filter(u => {
    const status = getUserStatus(u).toLowerCase();
    return status.includes('premium') || status.includes('plus');
  }).length : 0;

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* HERO HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Activity className="h-6 w-6 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Welcome back! Here is what&apos;s happening with your platform today.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10">
                <Calendar className="text-indigo-300" size={18} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today&apos;s Date</p>
                    <p className="text-sm font-bold text-white">
                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Users" value={totalUsers} icon={Users} colorTheme="indigo" />
        <StatsCard title="Pro Subscribers" value={proUsers} icon={Crown} colorTheme="amber" />
        
        {/* Menggunakan data dinamis dari props topFeature */}
        <StatsCard 
            title="Top Used Feature" 
            value={topFeature || "No Data"} 
            icon={Sparkles} 
            colorTheme="violet" 
        />
      </div>

      {/* TABLE PREVIEW */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Recent Registrations</h3>
                <p className="text-xs text-slate-500 mt-1">New users who joined the platform recently.</p>
            </div>
            <button onClick={onViewAll} className="group flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95">
                View All Users <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th scope="col" className="px-8 py-5">User Profile</th>
                        <th scope="col" className="px-6 py-5">Status</th>
                        <th scope="col" className="px-6 py-5">Joined Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recentUsers.length > 0 ? (
                        recentUsers.map((user) => {
                            const displayName = user.full_name || user.username || user.email || "Unknown User";
                            const currentStatus = getUserStatus(user);
                            const statusLower = currentStatus.toLowerCase();
                            const isPro = statusLower.includes('premium') || statusLower.includes('plus');

                            return (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-11 w-11 flex items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-md text-white font-bold text-xs">
                                                {getInitials(displayName)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors capitalize">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {isPro ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                                                <Crown size={12} className="text-indigo-600" /> {currentStatus}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                <User size={12} className="text-slate-400" /> {currentStatus}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                                        {getJoinedDate(user.created_at)}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-8 py-8 text-center text-slate-400 text-sm">
                                No users found in the database.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}