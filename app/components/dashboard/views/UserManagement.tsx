import React, { useState } from 'react';
import { 
  Trash2, 
  Crown, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Users,
  ShieldCheck,
  Loader2,
  ChevronDown,
  User
} from 'lucide-react';

import DeleteModal from '../shared/DeleteModal';

// --- KONFIGURASI OPSI PLAN ---
const PLAN_OPTIONS = [
  { label: 'Reguler', value: 'Reguler' },
  { label: 'Monthly Plus', value: 'Monthly Plus' },
  { label: 'Monthly Premium', value: 'Monthly Premium' },
  { label: 'Yearly Premium', value: 'Yearly Premium' },
];

interface ApiUser {
  id: string;
  full_name?: string;
  username?: string;
  email: string;
  role?: string; // Tetap ada di interface jaga-jaga API kirim, tapi tidak ditampilkan
  status?: string; 
  created_at?: string;
}

interface UserManagementProps {
  users: ApiUser[];
  setUsers: React.Dispatch<React.SetStateAction<ApiUser[]>>;
}

export default function UserManagement({ users, setUsers }: UserManagementProps) {
  // --- STATE LOKAL ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // State Modal Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Loading Update
  const [updatingStatusIds, setUpdatingStatusIds] = useState<string[]>([]);

  // --- HELPER UI ---
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .replace(/@.*/, '') 
      .split(/[\s.]/)     
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getJoinedDate = (dateString?: string) => {
    if (dateString) return new Date(dateString).toLocaleDateString();
    return new Date().toLocaleDateString(); 
  };

  // --- LOGIC SEARCH & FILTER ---
  const filteredUsers = users.filter((user) => {
    const displayName = user.full_name || user.username || '';
    const matchesSearch = 
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    const currentStatus = (user.status || 'Reguler').toLowerCase(); 

    if (statusFilter !== 'ALL') {
        if (statusFilter === 'PREMIUM') {
            matchesStatus = currentStatus.includes('premium') || currentStatus.includes('plus');
        } else if (statusFilter === 'REGULER') {
            matchesStatus = currentStatus === 'reguler' || currentStatus === 'free';
        }
    }

    return matchesSearch && matchesStatus;
  });

  // --- HANDLERS ---
  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.status === newStatus) return;

    setUpdatingStatusIds(prev => [...prev, userId]);

    try {
        const token = localStorage.getItem('mira_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${baseUrl}/api/admin/subs/update-level`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: userId,
                newStatus: newStatus
            })
        });

        const result = await response.json();

        if (result.success) {
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userId ? { ...u, status: newStatus } : u
            ));
        } else {
            console.error("Backend Error:", result);
            alert(`Failed: ${result.message}`);
        }

    } catch (error) {
        console.error("Network error:", error);
        alert("Connection error.");
    } finally {
        setUpdatingStatusIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleDeleteTrigger = (user: ApiUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);

    try {
        const token = localStorage.getItem('mira_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${baseUrl}/api/admin/users/${selectedUser.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (result.success) {
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setIsDeleteOpen(false);
            setSelectedUser(null);
        } else {
            alert(`Failed: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete user error:", error);
        alert("Failed to delete user.");
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Users className="h-6 w-6 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">User Directory</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Manage registered users, update subscription plans, and monitor account status.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10">
                <ShieldCheck className="text-emerald-400" size={18} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Active</p>
                    <p className="text-lg font-bold text-white">{users.length} Users</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={20} />
             </div>
             <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm" 
             />
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full md:w-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Filter size={18} />
            </div>
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-56 appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm font-bold text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
            >
                <option value="ALL">All Status</option>
                <option value="PREMIUM">Premium / Plus</option>
                <option value="REGULER">Reguler</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={16} strokeWidth={2.5} />
            </div>
        </div>
      </div>

      {/* 3. TABLE DATA */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto min-h-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th className="px-8 py-5">User Profile</th>
                        {/* Column Role Removed */}
                        <th className="px-6 py-5">Current Status</th>
                        <th className="px-6 py-5">Joined Date</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                                        <Search size={32} className="opacity-40" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-600">No users found</p>
                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((user) => {
                            const displayName = user.full_name || user.username || 'User';
                            const currentStatus = user.status || 'Reguler';
                            const statusLower = currentStatus.toLowerCase();
                            const isReguler = statusLower === 'reguler' || statusLower === 'free';
                            const isUpdating = updatingStatusIds.includes(user.id);

                            return (
                                <tr key={user.id} className="group hover:bg-slate-50/60 transition-colors duration-200">
                                    {/* Profile */}
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-11 w-11 flex items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-md text-white font-bold text-xs shrink-0 ring-2 ring-white">
                                                {getInitials(displayName)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 capitalize group-hover:text-indigo-600 transition-colors">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role Column Removed */}

                                    {/* Status Badge */}
                                    <td className="px-6 py-5">
                                        {!isReguler ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                                                <Crown size={12} className="text-indigo-600" /> {currentStatus}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                                                <User size={12} className="text-slate-400" /> Reguler
                                            </div>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                                        {getJoinedDate(user.created_at)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            
                                            {/* DROPDOWN SELECT */}
                                            <div className="relative group/select">
                                                {isUpdating && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 rounded-xl cursor-wait">
                                                        <Loader2 size={16} className="animate-spin text-indigo-600" />
                                                    </div>
                                                )}
                                                
                                                <div className="relative">
                                                    <select
                                                        value={user.status || 'Reguler'} 
                                                        onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                                                        disabled={isUpdating}
                                                        className="appearance-none w-40 pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer"
                                                    >
                                                        {PLAN_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronDown size={14} strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DELETE BUTTON */}
                                            <button 
                                                onClick={() => handleDeleteTrigger(user)}
                                                disabled={isUpdating}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all shrink-0 group/del" 
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
        
        {/* PAGINATION */}
        <div className="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4 bg-slate-50/50">
            <span className="font-medium">
                Showing <span className="font-bold text-slate-700">{filteredUsers.length}</span> entries
            </span>
            <div className="flex gap-2">
                <button disabled className="px-4 py-2 flex items-center gap-1 border border-slate-200 bg-white rounded-xl text-slate-400 font-bold text-xs opacity-50 cursor-not-allowed shadow-sm">
                    <ChevronLeft size={14} /> Previous
                </button>
                <button disabled className="px-4 py-2 flex items-center gap-1 border border-slate-200 bg-white rounded-xl text-slate-400 font-bold text-xs opacity-50 cursor-not-allowed shadow-sm">
                    Next <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message="Are you sure you want to completely remove access for"
        itemName={selectedUser?.full_name || selectedUser?.username || 'this user'}
        isDeleting={isDeleting} 
      />
    </div>
  );
}