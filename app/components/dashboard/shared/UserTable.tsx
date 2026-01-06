'use client';

import React from 'react';
import Image from 'next/image';
import { Edit3, Trash2, Crown } from 'lucide-react';

// Definisi Tipe Data
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatar: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;   // Tambahan Props Fungsi
  onDelete: (user: User) => void; // Tambahan Props Fungsi
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-50">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">Recent Activity</h3>
          <p className="text-slate-400 text-sm mt-1">Real-time monitoring of user interactions.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-xs font-semibold uppercase text-slate-400 tracking-wider bg-slate-50/50">
              <th className="px-8 py-5">User Profile</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Joined</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.length === 0 ? (
               <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 text-sm">No recent data available.</td>
               </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="group hover:bg-[#F8FAFC] transition-colors duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-[#4F46E5]/20 transition-colors">
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A] text-[15px]">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-500 font-medium">{user.joined}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-2 text-slate-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(user)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPro = status === 'PRO';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border
      ${isPro 
        ? 'bg-amber-50 text-amber-700 border-amber-100' 
        : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
    >
      {isPro && <Crown size={10} strokeWidth={3} className="mb-0.5" />}
      {status}
    </span>
  );
}