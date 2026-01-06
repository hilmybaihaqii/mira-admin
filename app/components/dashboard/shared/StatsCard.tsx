import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string; // Ubah jadi Optional (?)
  trendLabel?: string; // Ubah jadi Optional (?)
  icon: LucideIcon;
  colorTheme: 'indigo' | 'amber' | 'sky' | 'emerald' | 'rose' | 'violet';
}

export default function StatsCard({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  icon: Icon, 
  colorTheme = 'indigo' 
}: StatsCardProps) {

  const themeStyles = {
    indigo: {
      bgIcon: 'bg-indigo-100',
      textIcon: 'text-indigo-600',
      blob: 'bg-indigo-50',
      shadow: 'hover:shadow-indigo-900/10',
      trendBadge: 'text-indigo-600 bg-indigo-50'
    },
    amber: {
      bgIcon: 'bg-amber-100',
      textIcon: 'text-amber-600',
      blob: 'bg-amber-50',
      shadow: 'hover:shadow-amber-900/10',
      trendBadge: 'text-amber-600 bg-amber-50'
    },
    sky: {
      bgIcon: 'bg-sky-100',
      textIcon: 'text-sky-600',
      blob: 'bg-sky-50',
      shadow: 'hover:shadow-sky-900/10',
      trendBadge: 'text-sky-600 bg-sky-50'
    },
    emerald: {
      bgIcon: 'bg-emerald-100',
      textIcon: 'text-emerald-600',
      blob: 'bg-emerald-50',
      shadow: 'hover:shadow-emerald-900/10',
      trendBadge: 'text-emerald-600 bg-emerald-50'
    },
    rose: {
        bgIcon: 'bg-rose-100',
        textIcon: 'text-rose-600',
        blob: 'bg-rose-50',
        shadow: 'hover:shadow-rose-900/10',
        trendBadge: 'text-rose-600 bg-rose-50'
    },
    violet: {
        bgIcon: 'bg-violet-100',
        textIcon: 'text-violet-600',
        blob: 'bg-violet-50',
        shadow: 'hover:shadow-violet-900/10',
        trendBadge: 'text-violet-600 bg-violet-50'
    }
  };

  const theme = themeStyles[colorTheme];

  return (
    <div className={`group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-2xl ${theme.shadow}`}>
      {/* Decorative Blob */}
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-20%] rounded-full transition-all group-hover:scale-150 ${theme.blob}`}></div>
      
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-2xl p-3 ${theme.bgIcon} ${theme.textIcon}`}>
          <Icon size={24} />
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-3xl font-bold text-slate-800 mt-1">{value}</h4>
        
        {trend && (
            <div className={`mt-3 flex items-center gap-1 text-xs font-bold w-fit px-2 py-1 rounded-full ${theme.trendBadge}`}>
                {trend} <span className="font-medium text-slate-400 ml-1">{trendLabel}</span>
            </div>
        )}
      </div>
    </div>
  );
}