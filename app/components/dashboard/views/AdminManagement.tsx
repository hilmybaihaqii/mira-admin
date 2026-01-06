import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Trash2, 
  Plus, 
  Search, 
  AlertOctagon, 
  Loader2, 
  RefreshCw, 
  Lock,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { User } from '@/types';

// Import Modals
import DeleteModal from '../shared/DeleteModal';
import AdminModal, { AdminFormData } from '../shared/AdminModal';

interface ApiAdminResponse {
  id: number;
  username: string;
  role?: string;
  created_at: string;
}

export default function AdminManagement() {
  // --- STATE ---
  const [admins, setAdmins] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- HELPER UI ---
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(/[\s._]/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // --- ACTIONS ---
  const fetchAdmins = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${baseUrl}/api/admin/list`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const mappedAdmins: User[] = result.data.map((item: ApiAdminResponse) => ({
          id: item.id,
          name: item.username,
          email: '', // Email dikosongkan karena tidak ingin ditampilkan
          role: item.role || 'Moderator',
          joined: new Date(item.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          avatar: '' 
        }));
        setAdmins(mappedAdmins);
      }
    } catch (error) {
      console.error("Fetch admins error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdmin = async (formData: AdminFormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const payload = {
        username: formData.name.toLowerCase().replace(/\s+/g, ''),
        password: formData.password || "admin123"
      };

      const response = await fetch(`${baseUrl}/api/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        await fetchAdmins();
        setIsAddModalOpen(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("An error occurred while registering admin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (admin: User) => {
    if (admin.role === 'Super Admin') return;
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${baseUrl}/api/admin/${selectedAdmin.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setAdmins(admins.filter(a => a.id !== selectedAdmin.id));
        setIsDeleteOpen(false);
      }
    } catch (error) {
      alert("An error occurred during deletion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-rose-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                <Shield className="h-6 w-6 text-indigo-300" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Admin Privileges</h2>
            </div>
            <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
              Manage system administrators and monitor security permissions for the platform.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-300 border border-amber-500/20 uppercase tracking-wider">
              <AlertOctagon size={14}/> 
              <span>Authorized Personnel Only</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            disabled={isLoading}
            className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white group-hover:bg-indigo-700 transition-colors">
              <Plus size={14} strokeWidth={3} />
            </div>
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchAdmins} 
            className="flex items-center gap-2 px-4 py-3.5 text-slate-600 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl transition-all shadow-sm font-bold text-xs"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="h-10 w-px bg-slate-200 mx-1 hidden md:block"></div>
          <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Total Staff</p>
            <p className="text-sm font-black text-slate-800">{filteredAdmins.length} Admins</p>
          </div>
        </div>
      </div>

      {/* 3. TABLE DATA */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto min-h-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-8 py-5">Administrator</th>
                <th className="px-6 py-5">Security Role</th>
                <th className="px-6 py-5">Access Granted</th>
                <th className="px-8 py-5 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isFetching ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 size={40} className="animate-spin text-indigo-600" />
                      <p className="text-sm font-bold text-slate-500 tracking-wide">Synchronizing Database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-6 bg-slate-50 rounded-full mb-4">
                        <Shield size={40} className="opacity-20" />
                      </div>
                      <p className="text-lg font-bold text-slate-600">No admins found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="group hover:bg-slate-50/60 transition-colors duration-200">
                    {/* Administrator Profile */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-11 w-11 flex items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-slate-700 to-slate-900 shadow-md text-white font-bold text-xs shrink-0 ring-2 ring-white">
                          {getInitials(admin.name)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 capitalize group-hover:text-indigo-600 transition-colors">
                              {admin.name}
                            </p>
                            {admin.role === 'Super Admin' && (
                              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-600 border border-amber-500/20">MASTER</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Role Level */}
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold border transition-all ${
                        admin.role === 'Super Admin' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm shadow-indigo-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <Shield size={14} className={admin.role === 'Super Admin' ? "text-indigo-500" : "text-slate-400"} /> 
                        {admin.role.toUpperCase()}
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Calendar size={14} className="opacity-50" />
                        {admin.joined}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {admin.role === 'Super Admin' ? (
                          <div className="flex items-center gap-2 px-3 py-2 text-slate-400 bg-slate-50 rounded-xl border border-slate-100" title="Protected Account">
                            <Lock size={14} />
                            <span className="text-[10px] font-bold uppercase">Locked</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleDeleteClick(admin)}
                            disabled={isLoading}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200 group/del"
                            title="Revoke Admin Access"
                          >
                            {isLoading && selectedAdmin?.id === admin.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                            )}
                          </button>
                        )}
                        <div className="p-1 text-slate-200 group-hover:text-slate-300 transition-colors">
                            <ChevronRight size={18} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AdminModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAdmin}
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Revoke Admin Access?"
        message="This will immediately terminate all administrative privileges for"
        itemName={selectedAdmin?.name || 'this admin'}
        isDeleting={isLoading}
      />
    </div>
  );
}