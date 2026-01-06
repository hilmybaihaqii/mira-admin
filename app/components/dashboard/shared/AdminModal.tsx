import React, { useState } from 'react';
import { X, Save, Shield, Lock, Eye, EyeOff, User } from 'lucide-react';

export interface AdminFormData {
  name: string; // Username
  role: string;
  password?: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminFormData) => void;
}

export default function AdminModal({ isOpen, onClose, onSubmit }: AdminModalProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    role: 'Admin', // Default role fix ke Admin/Moderator
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form setelah submit
    setFormData({ name: '', role: 'Admin', password: '' });
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-[scale-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                <Shield size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">New Admin</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* USERNAME INPUT */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. admin_mira"
                  autoComplete="off"
                />
            </div>
          </div>
          
          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">Must be at least 6 characters long.</p>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98]">
            <Save size={18} />
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}