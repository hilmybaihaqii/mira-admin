/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import { MessagesSquare, Trash2, Search, Filter, MessageCircle, Loader2, RefreshCw, FileImage, CornerDownRight, Calendar } from 'lucide-react';
import DeleteModal from '../shared/DeleteModal';

// --- INTERFACES ---
interface Author {
  email: string;
  full_name: string;
  avatar_url: string;
}

interface ApiComment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author: Author;
}

interface ApiPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  author: Author;
  comments: ApiComment[];
}

interface FeedItem {
  id: string;
  uniqueKey: string; 
  type: 'Post' | 'Comment';
  author: Author;
  content: string;
  image_url?: string | null;
  created_at: string;
  commentsCount?: number; 
  parentPostContent?: string; 
}

export default function Community() {
  // State
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'POST' | 'COMMENT'>('ALL');

  // Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- PROCESS DATA ---
  const processFeed = (posts: ApiPost[]) => {
    const flattened: FeedItem[] = [];

    posts.forEach(post => {
      flattened.push({
        id: post.id,
        uniqueKey: `post-${post.id}`,
        type: 'Post',
        author: post.author,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        commentsCount: post.comments.length
      });

      if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
          flattened.push({
            id: comment.id,
            uniqueKey: `comment-${comment.id}`,
            type: 'Comment',
            author: comment.author,
            content: comment.content,
            created_at: comment.created_at,
            parentPostContent: post.content 
          });
        });
      }
    });

    flattened.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFeedItems(flattened);
  };

  // --- FETCH DATA ---
  const fetchCommunityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mira_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${baseUrl}/api/admin/community/posts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        processFeed(result.data);
      }
    } catch (error) {
      console.error("Fetch community error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // --- FILTER LOGIC ---
  const filteredItems = feedItems.filter(item => {
    const matchesSearch = 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.author.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || item.type.toUpperCase() === filterType;
    
    return matchesSearch && matchesType;
  });

  // --- HANDLERS ---
  const handleDeleteTrigger = (item: FeedItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);

    try {
        const token = localStorage.getItem('mira_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        
        const endpoint = selectedItem.type === 'Post' 
            ? `/api/admin/community/posts/${selectedItem.id}`
            : `/api/admin/community/comments/${selectedItem.id}`; 

        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (result.success) {
            setFeedItems(prev => prev.filter(i => i.uniqueKey !== selectedItem.uniqueKey));
            
            if (selectedItem.type === 'Post') {
               fetchCommunityData(); 
            } else {
               setIsDeleteOpen(false);
               setSelectedItem(null);
            }
        } else {
            alert(`Failed to delete: ${result.message}`);
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred.");
    } finally {
        setIsDeleting(false);
        setIsDeleteOpen(false); 
    }
  };

  // Helper: Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    // PENTING: Padding ditambahkan di sini agar selaras dengan ContentWrapper di halaman lain
    <div className="p-6 md:p-8 space-y-8 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
        {/* Decorative Blobs (Indigo & Violet theme) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                        <MessagesSquare className="h-6 w-6 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Community Feed</h2>
                </div>
                <p className="max-w-xl text-slate-300 text-sm leading-relaxed">
                    Overview of all user-generated content. Monitor, filter, and manage posts and comments to ensure a healthy community.
                </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-sm border border-white/10 w-fit">
                <Filter className="text-indigo-300" size={20} />
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Content</p>
                    <p className="text-lg font-bold text-white">{feedItems.length} Items</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. TOOLBAR (SEARCH & TABS) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                <Search size={20} />
            </div>
            <input 
                type="text" 
                placeholder="Search content or author..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Refresh Button */}
            <button 
                onClick={fetchCommunityData} 
                disabled={isLoading}
                className="p-3.5 text-slate-500 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                title="Refresh Feed"
            >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>

            {/* Filter Tabs (Segmented Control Style) */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full md:w-auto">
                {(['ALL', 'POST', 'COMMENT'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                            filterType === type 
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {type === 'ALL' ? 'All' : type === 'POST' ? 'Posts' : 'Comments'}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 3. TABLE DATA */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto min-h-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th className="px-8 py-5">Author & Type</th>
                        <th className="px-6 py-5">Content Preview</th>
                        <th className="px-6 py-5">Context / Attachments</th>
                        <th className="px-6 py-5">Posted</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                                    <p className="text-sm font-medium">Loading community feed...</p>
                                </div>
                            </td>
                        </tr>
                    ) : filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                                        <MessagesSquare size={32} className="opacity-40" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-600">No content found</p>
                                    <p className="text-sm">Try adjusting your filters.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                            <tr key={item.uniqueKey} className="group hover:bg-slate-50/60 transition-colors duration-200">
                                {/* AUTHOR */}
                                <td className="px-8 py-5 align-top w-64">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-10 w-10 min-w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                            <img 
                                                src={item.author.avatar_url || `https://ui-avatars.com/api/?name=${item.author.full_name}`} 
                                                alt={item.author.full_name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.author.full_name}</p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">{item.author.email}</p>
                                            
                                            {/* Type Badge */}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                item.type === 'Post' 
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {item.type === 'Post' ? <FileImage size={9} className="mr-1" /> : <MessageCircle size={9} className="mr-1" />}
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                
                                {/* CONTENT */}
                                <td className="px-6 py-5 align-top max-w-sm">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-3">
                                        {item.content}
                                    </p>
                                    
                                    {/* Stats for Post */}
                                    {item.type === 'Post' && (
                                        <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                            <MessageCircle size={14} />
                                            <span className="text-xs font-medium">{item.commentsCount} comments</span>
                                        </div>
                                    )}
                                </td>

                                {/* CONTEXT / ATTACHMENT */}
                                <td className="px-6 py-5 align-top">
                                    {/* Image Preview for Post */}
                                    {item.type === 'Post' && item.image_url ? (
                                        <div className="relative group/img w-fit">
                                            <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                                                <img 
                                                    src={item.image_url} 
                                                    alt="Post attachment" 
                                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors rounded-xl pointer-events-none" />
                                            <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 font-medium shadow-sm">
                                                <FileImage size={10} /> Image
                                            </span>
                                        </div>
                                    ) : item.type === 'Post' ? (
                                        <span className="text-xs text-slate-400 italic">No attachment</span>
                                    ) : (
                                        // Context for Comment
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 max-w-xs">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-wide">
                                                <CornerDownRight size={10} /> In reply to
                                            </div>
                                            <p className="text-xs text-slate-500 italic line-clamp-2 border-l-2 border-indigo-200 pl-2">
                                                &quot;{item.parentPostContent}&quot;
                                            </p>
                                        </div>
                                    )}
                                </td>

                                {/* DATE */}
                                <td className="px-6 py-5 align-top whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <Calendar size={14} className="text-slate-400" />
                                        {formatDate(item.created_at)}
                                    </div>
                                </td>

                                {/* ACTIONS */}
                                <td className="px-8 py-5 text-right align-top">
                                    <button 
                                        onClick={() => handleDeleteTrigger(item)}
                                        className="p-2.5 text-slate-400 bg-white border border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm group/del"
                                        title={`Delete ${item.type}`}
                                    >
                                        <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedItem?.type}?`}
        message={selectedItem?.type === 'Post' 
            ? "Deleting this post will also remove all associated comments permanently." 
            : "Are you sure you want to delete this comment permanently?"}
        itemName={selectedItem?.type || 'item'}
        isDeleting={isDeleting}
      />
    </div>
  );
}