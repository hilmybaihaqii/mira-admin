'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, BookOpen, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  
  const [errors, setErrors] = useState({
    username: '', 
    password: '',
    general: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '', general: '' };

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
      isValid = false;
    } 

    if (!password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } 
   
    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: '' }));
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username, 
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // --- LOGIN BERHASIL & LOGIKA LEVELING ---
        
        // 1. Simpan Token
        localStorage.setItem('mira_token', data.token);
        
        // 2. Simpan Data User
        localStorage.setItem('mira_user', JSON.stringify(data.user));
        
        // 3. Tentukan Role (Leveling)
        // Prioritas 1: Ambil dari response backend jika ada field 'role'
        // Prioritas 2: Deteksi manual dari username (fallback sementara)
        let userRole = 'ADMIN'; // Default
        
        if (data.user.role) {
            userRole = data.user.role;
        } else if (data.user.username.toLowerCase().includes('super')) {
            userRole = 'SUPER_ADMIN';
        }

        localStorage.setItem('mira_role', userRole);
        localStorage.setItem('mira_session', 'true');

        setLoading(false);
        
        // Redirect ke Dashboard utama
        // Nanti di dashboard bisa cek localStorage.getItem('mira_role') untuk membatasi fitur
        router.push('/'); 

      } else {
        // --- LOGIN GAGAL ---
        setLoading(false);
        setErrors(prev => ({ 
          ...prev, 
          general: data.message || 'Login failed. Please check your credentials.'
        }));
      }

    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Network error. Please try again later.' 
      }));
    }
  };

  // Styles Helper
  const getInputClasses = (hasError: boolean) => `
    block w-full pl-12 pr-4 py-4 
    bg-white rounded-xl 
    text-[#0F172A] placeholder:text-slate-400 font-medium 
    transition-all duration-300 
    border 
    ${hasError 
      ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
      : 'border-slate-200 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] hover:border-slate-300'
    }
    focus:outline-none
  `;

  const getIconClasses = (hasError: boolean) => `
    h-5 w-5 transition-colors duration-300 
    ${hasError ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-[#4F46E5]'}
  `;

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans animate-[fade-in_0.7s_ease-out]">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex w-[45%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0">
            <Image 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop"
                alt="MIRA Architecture"
                fill
                className="object-cover grayscale opacity-20 mix-blend-overlay"
                priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#0F172A] via-transparent to-[#0F172A]/80"></div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-wider">MIRA</h1>
            <p className="text-slate-400 text-xs font-medium tracking-[0.2em] uppercase">Education Intelligence</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Cultivating <br/>
            Knowledge & <br/>
            Excellence.
          </h2>
          <div className="h-1 w-12 bg-[#4F46E5] mt-8 mb-6"></div>
          <p className="text-slate-300 text-base leading-relaxed font-light pr-10">
            Access the command center to manage curriculum, analyze performance, and shape the future of learning.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm flex items-center gap-2">
           <div className="h-px w-8 bg-slate-700"></div>
           <span>Authorized Access Only</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-110">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Sign In</h2>
            <p className="text-slate-500 text-lg">Welcome back, please enter your details.</p>
            {/* Hint dihapus sesuai request */}
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 animate-[fade-in-down_0.3s_ease-out]">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-[#0F172A] tracking-wide ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={getIconClasses(!!errors.username)} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if(errors.username) setErrors(prev => ({...prev, username: ''}));
                  }}
                  className={getInputClasses(!!errors.username)}
                />
              </div>

              {errors.username && (
                <div className="flex items-center gap-2 text-rose-500 text-sm font-medium animate-[fade-in-down_0.3s_ease-out] ml-1">
                    <AlertCircle size={16} />
                    <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-[#0F172A] tracking-wide ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={getIconClasses(!!errors.password)} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(errors.password) setErrors(prev => ({...prev, password: ''}));
                  }}
                  className={getInputClasses(!!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0F172A] cursor-pointer transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {errors.password && (
                <div className="flex items-center gap-2 text-rose-500 text-sm font-medium animate-[fade-in-down_0.3s_ease-out] ml-1">
                    <AlertCircle size={16} />
                    <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border border-slate-300 rounded transition-all duration-300 peer-checked:bg-[#4F46E5] peer-checked:border-[#4F46E5] group-hover:border-[#4F46E5]"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-slate-600 font-medium transition-colors group-hover:text-[#0F172A]">Remember for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#4F46E5] text-white font-bold py-4 px-6 rounded-xl 
              transition-all duration-300 ease-out 
              hover:bg-[#4338CA] 
              hover:shadow-lg hover:shadow-[#4F46E5]/20 
              hover:-translate-y-px
              active:translate-y-0 active:shadow-md
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...</>
              ) : (
                <><span className="text-[15px] tracking-wider">Sign In</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

        </div>
        <div className="absolute bottom-8 right-8 text-xs text-slate-400">
            © 2025 MIRA Platform.
        </div>
      </div>
    </div>
  );
}