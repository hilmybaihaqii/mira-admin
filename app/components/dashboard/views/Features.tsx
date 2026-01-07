import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Loader2, 
  AlertCircle, 
  Trophy, 
  Sparkles,
  Clock,
  ArrowUpRight,
  LayoutGrid
} from 'lucide-react';

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
    if (!name) return "Unknown Feature";
    return name.split(/[_ ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Helper: Get Rank Color (Solid Colors)
  const getRankStyle = (index: number) => {
    switch(index) {
        case 0: return 'bg-amber-100 text-amber-700 border-amber-200'; // Gold
        case 1: return 'bg-slate-200 text-slate-600 border-slate-300'; // Silver
        case 2: return 'bg-orange-100 text-orange-700 border-orange-200'; // Bronze
        default: return 'bg-slate-50 text-slate-500 border-slate-100'; // Standard
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Smooth loading

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
           setError('Failed to load analytical data.');
        }
      } catch (err) {
        console.error(err);
        setError('Connection error. Please check your network.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const maxCount = features.length > 0 ? features[0].usage_count : 0;
  const getPercentage = (count: number) => maxCount === 0 ? 0 : (count / maxCount) * 100;
  const topFeature = features.length > 0 ? features[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-[fade-in_0.5s_ease-out] pb-10">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-10 text-white shadow-2xl shadow-indigo-900/20">
        {/* Subtle Blobs (No hard gradients) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Feature Analytics</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Detailed insights on how users interact with your application features. Monitor popularity and usage trends in real-time.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 sm:px-5 sm:py-3 backdrop-blur-sm border border-white/10 w-fit">
                <Activity className="text-emerald-400 shrink-0" size={20} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Interactions</p>
                    {isLoading ? (
                        <div className="h-6 w-24 bg-white/10 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-lg sm:text-xl font-bold text-white font-mono">
                            {totalHits.toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* 2. MAIN LIST CARD (SCROLLABLE) */}
        <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 flex flex-col min-h-125">
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <BarChart3 size={20} className="text-indigo-600" />
                        Usage Ranking
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Features sorted by popularity.</p>
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                    Top {features.length} Features
                </div>
            </div>
            
            <div className="p-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <p className="text-slate-400 font-medium text-sm">Synchronizing data...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-rose-500 flex flex-col items-center">
                        <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                             <AlertCircle size={24} />
                        </div>
                        <p className="font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 text-xs underline">Try Again</button>
                    </div>
                ) : features.length === 0 ? (
                    <div className="p-20 text-center text-slate-400">
                        <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No feature usage data recorded yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {features.map((feature, index) => (
                            <div key={feature.feature_name} className="px-6 py-5 sm:px-8 hover:bg-slate-50/80 transition-all duration-200 group relative">
                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold border shrink-0 shadow-sm
                                            ${getRankStyle(index)}
                                        `}>
                                            {index === 0 && <Trophy size={14} className="mr-0.5" />}
                                            {index + 1}
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {formatName(feature.feature_name)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock size={12} className="text-slate-400" />
                                                <p className="text-xs font-medium text-slate-500">
                                                    Last used: {new Date(feature.last_used).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-indigo-600">
                                            <span className="text-base sm:text-lg font-bold font-mono">
                                                {feature.usage_count.toLocaleString()}
                                            </span>
                                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1" />
                                        </div>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Hits</span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar - SOLID COLOR */}
                                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                                    <div 
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-indigo-600' : 'bg-indigo-400 opacity-60'}`}
                                        style={{ width: `${getPercentage(feature.usage_count)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* 3. SIDEBAR STATS (STICKY) */}
        {/* 'sticky top-8' membuat elemen ini menempel saat discroll */}
        <div className="space-y-6 lg:sticky lg:top-8">
            
            {/* Top Feature Highlight Card - SOLID BG */}
            <div className="rounded-3xl bg-indigo-600 p-1 text-white shadow-xl shadow-indigo-500/30 transform transition hover:scale-[1.02] duration-300">
                <div className="bg-white/10 backdrop-blur-md rounded-[20px] p-6 h-full flex flex-col justify-between relative overflow-hidden min-h-55">
                    {/* Decorative Blob (Subtle) */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-4 opacity-90">
                            <div className="p-1.5 bg-white/20 rounded-lg border border-white/20 text-white">
                                <Trophy size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Champion</span>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-6 w-3/4 bg-white/20 rounded"></div>
                                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                            </div>
                        ) : topFeature ? (
                            <>
                                <h3 className="text-2xl font-bold mb-1 leading-tight text-white drop-shadow-sm">
                                    {formatName(topFeature.feature_name)}
                                </h3>
                                <p className="text-indigo-100 text-xs mb-6 opacity-80 leading-relaxed">
                                    The most engaged feature by your users this period.
                                </p>
                                
                                <div className="mt-auto bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-indigo-100 font-medium uppercase tracking-wider">Total Usage</span>
                                        <span className="text-2xl font-bold font-mono text-white tracking-tight">
                                            {topFeature.usage_count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-60">
                                <p className="text-sm">No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-500" />
                    Quick Metrics
                </h3>
                
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 w-full bg-slate-100 rounded-xl"></div>
                        <div className="h-8 w-full bg-slate-100 rounded-xl"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                    <LayoutGrid size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-600">Total Features</span>
                            </div>
                            <span className="font-bold text-slate-800 text-lg">{features.length}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                    <TrendingUp size={18} />
                                </div>
                                <span className="text-sm font-bold text-slate-600">Avg. Hits</span>
                            </div>
                            <span className="font-bold text-slate-800 text-lg">
                                {features.length > 0 ? Math.round(totalHits / features.length) : 0}
                            </span>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}