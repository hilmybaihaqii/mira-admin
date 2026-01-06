import React, { useState, useEffect } from 'react';
import { Zap, BarChart3, TrendingUp, Activity, Loader2, AlertCircle, Trophy, Sparkles } from 'lucide-react';

// --- INTERFACES ---
interface RawFeatureLog {
  id: number;
  feature_name: string;
  created_at: string;
  user_id: string;
  profiles: {
    email: string;
    nickname: string;
  };
}

interface ProcessedFeature {
  feature_name: string;
  usage_count: number;
  last_used: string;
}

export default function Features() {
  const [features, setFeatures] = useState<ProcessedFeature[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper: Format Feature Name
  const formatName = (name: string) => {
    if (!name) return "Unknown";
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const token = localStorage.getItem('mira_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${baseUrl}/api/dashboard/features`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
           const rawData: RawFeatureLog[] = result.data;
           const summaryMap: Record<string, ProcessedFeature> = {};

           rawData.forEach((log) => {
             const name = log.feature_name;
             if (!summaryMap[name]) {
               summaryMap[name] = {
                 feature_name: name,
                 usage_count: 0,
                 last_used: log.created_at
               };
             }
             summaryMap[name].usage_count += 1;
             if (new Date(log.created_at) > new Date(summaryMap[name].last_used)) {
               summaryMap[name].last_used = log.created_at;
             }
           });

           const sortedData = Object.values(summaryMap).sort((a, b) => b.usage_count - a.usage_count);
           
           setFeatures(sortedData);
           setTotalHits(rawData.length);
        } else {
           setError('Failed to load data.');
        }
      } catch (err) {
        console.error(err);
        setError('Connection error.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const maxCount = features.length > 0 ? features[0].usage_count : 0;
  const getPercentage = (count: number) => maxCount === 0 ? 0 : (count / maxCount) * 100;
  const topFeature = features.length > 0 ? features[0] : null;

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96 w-full animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p className="text-slate-400 font-medium text-sm">Synchronizing data...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER (PERSIS OVERVIEW) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Zap className="h-6 w-6 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Feature Analytics</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Detailed insights on how users interact with your application features.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10">
                <Activity className="text-emerald-400" size={18} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Hits</p>
                    <p className="text-xl font-bold text-white font-mono">
                        {totalHits.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. MAIN LIST CARD (STYLE SAMA DENGAN OVERVIEW TABLE) */}
        <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Feature Usage Ranking</h3>
                    <p className="text-xs text-slate-500 mt-1">Sorted by most used features.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <BarChart3 size={20} />
                </div>
            </div>
            
            <div className="p-0">
                {error ? (
                    <div className="p-8 text-center text-rose-500 flex flex-col items-center">
                        <AlertCircle size={32} className="mb-2" />
                        <p>{error}</p>
                    </div>
                ) : features.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <p>No data recorded yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {features.map((feature, index) => (
                            <div key={feature.feature_name} className="px-8 py-5 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold border
                                            ${index === 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                              index === 1 ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                              index === 2 ? 'bg-slate-50 text-slate-500 border-slate-200' : 
                                              'bg-transparent text-slate-400 border-transparent'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {formatName(feature.feature_name)}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500">
                                                Last: {new Date(feature.last_used).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-slate-700 font-mono block">
                                            {feature.usage_count}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-linear-to-r from-indigo-500 to-purple-600' : 'bg-slate-400'}`}
                                        style={{ width: `${getPercentage(feature.usage_count)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* 3. SIDEBAR STATS (CONSISTENT STYLE) */}
        <div className="space-y-6">
            
            {/* Top Feature Highlight */}
            <div className="rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 p-1 text-white shadow-xl shadow-indigo-200/50">
                <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Blob internal */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-2xl rounded-full pointer-events-none"></div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <Trophy size={16} className="text-yellow-300" />
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Most Popular</span>
                        </div>
                        
                        {topFeature ? (
                            <>
                                <h3 className="text-2xl font-bold mb-1 leading-tight">{formatName(topFeature.feature_name)}</h3>
                                <p className="text-indigo-100 text-xs mb-6 opacity-80">Highest engagement this month.</p>
                                
                                <div className="mt-auto bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-indigo-100 font-medium">Interactions</span>
                                        <span className="text-xl font-bold font-mono text-white">{topFeature.usage_count}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm opacity-70">Analysis pending...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Quick Metrics</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Active Features</span>
                        </div>
                        <span className="font-bold text-slate-800">{features.length}</span>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                <Sparkles size={18} />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Avg. Hits</span>
                        </div>
                        <span className="font-bold text-slate-800">
                             {features.length > 0 ? Math.round(totalHits / features.length) : 0}
                        </span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}