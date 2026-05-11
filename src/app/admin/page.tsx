'use client';

import React, { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ImageIcon, 
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  FolderOpen,
  Plus,
  Trophy,
  Calendar,
  Grid,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  Monitor,
  ShieldCheck,
  Smartphone,
  Camera,
  ExternalLink,
  Tag,
  Clock,
  CloudUpload,
  X,
  PlusCircle,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { activeGalleries } from '@/data/events';
import { GalleryEvent, EventSpecial } from '@/data/types';
import Link from 'next/link';

type UploadMode = 'event' | 'sample' | 'hero' | 'bighead' | 'dashboard';

interface FileInfo {
  name: string;
  url: string;
  path: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<UploadMode>('dashboard');
  const [selectedGallery, setSelectedGallery] = useState(activeGalleries[0].id);
  const [selectedCategory, setSelectedCategory] = useState('football');
  const [customId, setCustomId] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [existingFiles, setExistingFiles] = useState<FileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [eventThumbnails, setEventThumbnails] = useState<Record<string, string>>({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [events, setEvents] = useState<GalleryEvent[]>(activeGalleries);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOffers, setModalOffers] = useState<EventSpecial[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [armedDelete, setArmedDelete] = useState<string | null>(null);
  const [hidingPath, setHidingPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHide = async (fileUrl: string, fileName: string) => {
    const isHidden = fileName.startsWith('HIDDEN_');
    const newName = isHidden ? fileName.replace('HIDDEN_', '') : `HIDDEN_${fileName}`;
    
    setHidingPath(fileUrl);
    
    try {
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', path: fileUrl, newName })
      });
      
      const data = await res.json();
      if (!data.success) {
        alert(`Failed to ${isHidden ? 'unhide' : 'hide'}: ${data.error || 'Server error'}`);
      }
      fetchFiles();
    } catch (err) {
      alert('Network Error');
    } finally {
      setHidingPath(null);
    }
  };

  // Check if already authenticated via session cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Not authenticated
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    
    // Load persisted events if they exist
    const saved = localStorage.getItem('ihatepictureday_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load saved events:", err);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: loginStep === 1 ? password : undefined,
          code: loginStep === 2 ? twoFactorCode : undefined
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.step === 2) {
          setLoginStep(2);
        } else {
          setIsAuthenticated(true);
          setPassword('');
          setTwoFactorCode('');
        }
      } else {
        setError(data.error || 'Access denied');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setLoginStep(1);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/admin/categories?type=${mode}`);
      const data = await res.json();
      if (data.categories) {
        setDynamicCategories(data.categories);
        // Automatically select the first category if the current one isn't in the new list
        const exists = data.categories.find((c: any) => c.id === selectedCategory);
        if (data.categories.length > 0 && (!selectedCategory || !exists)) {
          setSelectedCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchFiles = async () => {
    const id = mode === 'event' ? selectedGallery : (mode === 'sample' || mode === 'bighead') ? selectedCategory : 'hero';
    if (!id && mode !== 'hero') return;
    
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/admin/files?type=${mode}&id=${id}&_t=${Date.now()}`);
      const data = await res.json();
      setExistingFiles(data.files || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchEventThumbnails = async () => {
    const thumbs: Record<string, string> = {};
    for (const event of activeGalleries) {
      try {
        const res = await fetch(`/api/admin/files?type=event&id=${event.id}&_t=${Date.now()}`);
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          thumbs[event.id] = data.files[0].url;
        }
      } catch (err) {}
    }
    setEventThumbnails(thumbs);
  };

  const handleSaveEvent = (eventData: GalleryEvent) => {
    let newEvents: GalleryEvent[] = [];
    if (editingEvent) {
      newEvents = events.map(e => e.id === editingEvent.id ? eventData : e);
    } else {
      newEvents = [eventData, ...events];
    }
    
    setEvents(newEvents);
    localStorage.setItem('ihatepictureday_events', JSON.stringify(newEvents));
    
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handlePublishToCode = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/save-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      if (res.ok) {
        alert('✅ Success! Changes saved to source code. Run "git push" to update the live site.');
      } else {
        throw new Error('Failed to save to file');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error: Could not save to code. Make sure you are running locally.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditEvent = (event: GalleryEvent) => {
    setEditingEvent(event);
    setModalOffers(event.specials || []);
    setIsEventModalOpen(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setModalOffers([{ label: '', code: '', description: '', startDate: '', endDate: '', detail: '' }]);
    setIsEventModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated && mode === 'dashboard') {
      fetchEventThumbnails();
    }
  }, [isAuthenticated, mode]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchFiles();
    }
  }, [isAuthenticated, mode, selectedGallery, selectedCategory]);

  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const handleDelete = async (fileUrl: string, fileName: string) => {
    setDeletingPath(fileUrl);
    
    // Optimistic UI update
    setExistingFiles(prev => prev.filter(f => f.url !== fileUrl));
    
    try {
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', path: fileUrl })
      });
      
      const data = await res.json();
      if (!data.success) {
        alert(`Delete failed: ${data.error || 'Server error'}`);
        fetchFiles();
      } else {
        setTimeout(() => fetchFiles(), 800);
      }
    } catch (err) {
      alert('Network Error: Could not reach the API');
      fetchFiles();
    } finally {
      setDeletingPath(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const mockEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleUpload(mockEvent);
  };

  const [selectedStyle, setSelectedStyle] = useState('STANDARD BIG HEAD');

  const BIG_HEAD_STYLES = [
    "STANDARD BIG HEAD",
    "HALF BODY",
    "HALF BODY WITH NAME",
    "CARTOON STYLE"
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      let pathPrefix = '';
      if (mode === 'event') {
        const galleryId = isAddingNew ? customId : selectedGallery;
        pathPrefix = `events/${galleryId}`;
      } else if (mode === 'sample') {
        const category = isAddingNew ? customId : selectedCategory;
        pathPrefix = `samples/${category}`;
      } else if (mode === 'bighead') {
        const category = isAddingNew ? customId : selectedCategory;
        pathPrefix = `bighead/${category}`;
      } else if (mode === 'hero') {
        pathPrefix = `hero`;
      }

      for (const file of Array.from(files)) {
        let fileName = file.name;
        
        // Smart renaming for builder examples
        if (mode === 'bighead' && selectedCategory === 'builder-examples') {
          const ext = file.name.split('.').pop();
          const styleSlug = selectedStyle.toLowerCase().replace(/\s+/g, '-');
          fileName = `${styleSlug}.${ext}`;
        }

        await upload(`images/${pathPrefix}/${fileName}`, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/upload',
        });
      }

      setUploadStatus({ success: true, message: `Successfully uploaded ${files.length} images` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      if (isAddingNew) {
        const newId = customId;
        setIsAddingNew(false);
        if (mode === 'sample' || mode === 'bighead') {
          setSelectedCategory(newId.toLowerCase());
          fetchCategories();
        } else {
          setSelectedGallery(newId);
        }
        setCustomId('');
      }
      fetchFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStatus({ success: false, message: err.message || 'Something went wrong during cloud upload' });
    } finally {
      setUploading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="text-brand-red animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-brand-black flex items-center justify-center p-4 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-zinc-900 border border-white/10 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-red shadow-[0_0_15px_rgba(224,40,38,0.5)]" />
            
            <AnimatePresence mode="wait">
              {loginStep === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-brand-red flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(224,40,38,0.4)]"><Lock className="text-white" size={32} /></div>
                  </div>
                  <h1 className="text-2xl font-black uppercase italic text-center mb-1 tracking-widest text-white">Management Portal</h1>
                  <p className="text-gray-500 text-center text-[10px] uppercase font-black tracking-widest mb-8">Authorized Personnel Only</p>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Access Key</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red text-white placeholder:text-zinc-800" placeholder="••••••••" autoFocus disabled={isSubmitting} />
                    </div>
                    {error && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase"><AlertCircle size={14} /> {error}</motion.div>}
                    <Button type="submit" className="w-full py-5 uppercase font-black tracking-widest italic text-lg shadow-lg" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Validate Credentials"}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-brand-red flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(224,40,38,0.4)]"><Smartphone className="text-white" size={32} /></div>
                  </div>
                  <h1 className="text-2xl font-black uppercase italic text-center mb-1 tracking-widest text-white">2-Factor Auth</h1>
                  <p className="text-gray-500 text-center text-[10px] uppercase font-black tracking-widest mb-8 text-brand-red animate-pulse">Code sent to registered email</p>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Verification Code</label>
                      <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full bg-black border border-white/10 p-4 font-black text-center text-3xl tracking-[10px] outline-none focus:border-brand-red text-white placeholder:text-zinc-800" placeholder="000000" autoFocus disabled={isSubmitting} />
                    </div>
                    {error && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase"><AlertCircle size={14} /> {error}</motion.div>}
                    <div className="flex flex-col gap-4">
                      <Button type="submit" className="w-full py-5 uppercase font-black tracking-widest italic text-lg shadow-lg" disabled={isSubmitting || twoFactorCode.length < 6}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Finalize Access"}
                      </Button>
                      <button type="button" onClick={() => setLoginStep(1)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors underline decoration-brand-red decoration-2 underline-offset-4">
                        Back to Login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <Link href="/" className="text-xs font-bold text-gray-600 hover:text-brand-red transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"><ArrowLeft size={14} /> Back to Site</Link>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-red/30 pb-20">
      {/* Header */}
      <nav className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-brand-red p-2 shadow-lg shadow-brand-red/20 rotate-3"><LayoutDashboard size={20} className="text-white -rotate-3" /></div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-widest leading-none">Management</h1>
              <p className="text-[8px] font-black text-brand-red uppercase tracking-[0.3em] mt-1 italic">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">2FA Active</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black uppercase text-gray-500 hover:text-brand-red transition-all group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-zinc-900 border border-white/10 p-1.5 rounded-lg flex flex-col gap-1 shadow-2xl">
              <button onClick={() => { setMode('dashboard'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'dashboard' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Grid size={14} /> Dashboard
              </button>
              <button onClick={() => { setMode('event'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'event' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <FolderOpen size={14} /> Upload Images
              </button>
              <button onClick={() => { setMode('sample'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'sample' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Trophy size={14} /> Samples
              </button>
              <button onClick={() => { setMode('bighead'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'bighead' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Camera size={14} /> Big Heads
              </button>
              <button onClick={() => { setMode('hero'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'hero' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Monitor size={14} /> Hero Banners
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode !== 'hero' && mode !== 'dashboard' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-zinc-900 border border-white/10 p-6 space-y-6 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FolderOpen size={14} /> {mode === 'event' ? 'Events' : mode === 'sample' ? 'Sports' : 'Big Head Categories'}
                    </h3>
                    <button onClick={() => setIsAddingNew(!isAddingNew)} className={`p-1.5 rounded transition-all ${isAddingNew ? "bg-brand-red text-white rotate-45" : "bg-white/5 text-gray-400 hover:bg-brand-red hover:text-white"}`}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {isAddingNew && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-2">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder={mode === 'event' ? "NEW-EVENT-ID" : mode === 'sample' ? "NEW-SPORT-ID" : "e.g. SAMPLES or BUILDER-EXAMPLES"} 
                              value={customId} 
                              onChange={(e) => setCustomId(e.target.value.toUpperCase().replace(/\s+/g, '-'))} 
                              onKeyDown={(e) => e.key === 'Enter' && customId && (e.preventDefault(), fileInputRef.current?.click())}
                              className="w-full bg-black border border-brand-red p-3 pr-12 text-xs font-black uppercase outline-none focus:ring-1 focus:ring-brand-red/50" 
                              autoFocus 
                            />
                            {customId && (
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-red hover:bg-brand-red/10 rounded transition-all"
                                title="Set and choose files"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                          </div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">
                            {customId ? "Hit Enter or click check to choose files" : "Type a name to begin"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {mode === 'event' ? (
                      activeGalleries.map((gallery) => (
                        <button key={gallery.id} onClick={() => { setSelectedGallery(gallery.id); setIsAddingNew(false); }} className={`w-full text-left p-4 border transition-all ${!isAddingNew && selectedGallery === gallery.id ? "border-brand-red bg-brand-red/10 text-white translate-x-2" : "border-white/5 bg-black/20 text-gray-500 hover:border-white/20"}`}>
                          <p className="text-[10px] font-black uppercase truncate leading-none">{gallery.name}</p>
                        </button>
                      ))
                    ) : (
                      dynamicCategories.map((cat) => (
                        <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setIsAddingNew(false); }} className={`w-full text-left p-4 border transition-all ${!isAddingNew && selectedCategory === cat.id ? "border-brand-red bg-brand-red/10 text-white translate-x-2" : "border-white/5 bg-black/20 text-gray-500 hover:border-white/20"}`}>
                          <p className="text-[10px] font-black uppercase truncate leading-none">{cat.name}</p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-9 space-y-8">
            {mode === 'dashboard' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-wider">Event Management</h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePublishToCode} 
                      disabled={isSyncing}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} className="text-brand-red" />}
                      Push Changes to Live
                    </button>
                    <button onClick={handleAddEvent} className="bg-brand-red hover:bg-white hover:text-brand-black text-white px-4 py-2 text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2">
                      <PlusCircle size={14} /> Add New Event
                    </button>
                    <Link href="/galleries" className="text-[10px] font-black uppercase text-gray-500 hover:text-brand-red flex items-center gap-2 transition-colors">
                      <Eye size={14} /> View Public Site
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {events.map((event) => {
                    const today = new Date().toISOString().split('T')[0];
                    const activeOffers = event.specials.filter(s => {
                      if (s.startDate && s.startDate > today) return false;
                      if (s.endDate && s.endDate < today) return false;
                      return true;
                    });

                    return (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-xl group hover:border-brand-red/30 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-full md:w-48 aspect-square md:aspect-auto bg-black relative shrink-0">
                          {eventThumbnails[event.id] ? (
                            <img src={eventThumbnails[event.id]} alt={event.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-800">
                              <ImageIcon size={32} />
                              <span className="text-[8px] font-black uppercase italic">No Images</span>
                            </div>
                          )}
                          <div className={`absolute top-2 left-2 px-2 py-1 text-[8px] font-black uppercase tracking-widest ${event.status === 'Live' ? 'bg-green-500 text-white' : 'bg-brand-red text-white'}`}>
                            {event.status}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xl font-black uppercase italic leading-none mb-1 group-hover:text-brand-red transition-colors">{event.name}</h3>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Calendar size={12} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{event.displayDate}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] block">Gallery Access</label>
                                <div className="flex items-center gap-3">
                                  <div className="bg-black border border-white/5 px-3 py-2 flex-1 flex justify-between items-center group/code">
                                    <span className="text-xs font-black tracking-[0.2em] text-brand-red">{event.accessCode}</span>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(event.accessCode)}
                                      className="text-[8px] font-black uppercase text-gray-600 hover:text-white transition-colors"
                                    >
                                      Copy Code
                                    </button>
                                  </div>
                                  <a 
                                    href={`https://my.photoday.com/g/${event.accessCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-brand-red text-white hover:bg-white hover:text-brand-black transition-all"
                                    title="Open PhotoDay Gallery"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 border-l border-white/5 pl-6">
                              <div className="flex items-center justify-between">
                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
                                  <Tag size={10} className="text-brand-red" /> Active Offers
                                </label>
                                {event.specials.length > activeOffers.length && (
                                  <span className="text-[8px] font-black text-brand-red uppercase animate-pulse">
                                    {event.specials.length - activeOffers.length} Expired Removed
                                  </span>
                                )}
                              </div>

                              <div className="space-y-3">
                                {activeOffers.length > 0 ? (
                                  activeOffers.map((offer, idx) => (
                                    <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded space-y-2 relative overflow-hidden group/offer">
                                      <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase text-white italic">{offer.label}</span>
                                        <span className="text-[10px] font-black text-brand-red bg-brand-red/10 px-2 py-0.5 rounded tracking-widest">{offer.code || 'N/A'}</span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 leading-tight">{offer.description || 'No description provided.'}</p>
                                      {offer.endDate && (
                                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-gray-600">
                                          <Clock size={8} />
                                          <span>Expires {new Date(offer.endDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-4 border border-dashed border-white/5 rounded">
                                    <Tag size={16} className="text-zinc-800 mb-1" />
                                    <span className="text-[8px] font-black uppercase text-zinc-700 italic">No Active Offers</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => handleEditEvent(event)} className="px-4 py-2 bg-white/5 hover:bg-white hover:text-brand-black text-white text-[9px] font-black uppercase italic tracking-widest transition-all">
                              Edit Event Details
                            </button>
                            <button onClick={() => { setMode('event'); setSelectedGallery(event.id); }} className="px-4 py-2 border border-brand-red/30 hover:bg-brand-red text-white text-[9px] font-black uppercase italic tracking-widest transition-all">
                              Manage Gallery Images
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-zinc-900 border border-white/10 p-8 shadow-2xl">
                  <div onClick={() => !uploading && fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={handleDrop} className={`border-2 border-dashed p-12 text-center transition-all cursor-pointer relative overflow-hidden ${uploading ? "opacity-50 cursor-wait border-zinc-700" : "border-white/5 hover:border-brand-red bg-black/20 group"}`}>
                    <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleUpload} className="hidden" />
                    <div className="flex flex-col items-center">
                      <Upload size={32} className={`mb-4 transition-all duration-300 ${uploading ? "text-zinc-600 animate-bounce" : "text-brand-red group-hover:scale-125"}`} />
                      <h3 className="text-2xl font-black uppercase italic mb-2">{uploading ? "Uploading..." : "Drop Images Here"}</h3>
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 rounded-full border border-white/5">
                          <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Target:</span>
                          <span className="text-[10px] font-black uppercase text-brand-red tracking-wider">
                            {mode === 'event' ? (isAddingNew ? customId || '???' : selectedGallery) : mode === 'sample' ? (isAddingNew ? customId || '???' : selectedCategory) : mode === 'bighead' ? (isAddingNew ? customId || '???' : selectedCategory) : 'HERO BANNER'}
                          </span>
                        </div>

                        {mode === 'bighead' && selectedCategory === 'builder-examples' && (
                          <div className="mt-4 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Which style is this for?</p>
                            <select 
                              value={selectedStyle} 
                              onChange={(e) => setSelectedStyle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-zinc-800 border border-brand-red text-white text-[10px] font-black uppercase px-4 py-2 outline-none cursor-pointer hover:bg-zinc-700 transition-colors"
                            >
                              {BIG_HEAD_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {uploadStatus && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mt-6 p-4 border flex items-center justify-between ${uploadStatus.success ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-brand-red/10 border-brand-red/20 text-brand-red"}`}>
                        <div className="flex items-center gap-3">{uploadStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}<span className="text-[10px] font-black uppercase tracking-widest">{uploadStatus.message}</span></div>
                        <button onClick={() => setUploadStatus(null)} className="text-[8px] font-black uppercase underline">Close</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-zinc-900 border border-white/10 p-8 shadow-2xl min-h-[400px]">
                  <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-brand-red/10 border border-brand-red/30"><Grid size={18} className="text-brand-red" /></div>
                      <div>
                        <h2 className="text-xl font-black uppercase italic leading-none">Folder Explorer</h2>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Managing <span className="text-white">{mode.toUpperCase()}</span> Files</p>
                      </div>
                    </div>
                    <button onClick={fetchFiles} className="p-2 hover:bg-white/5 rounded-full transition-all group" title="Refresh List"><RefreshCw size={18} className={`text-gray-500 group-hover:text-white ${loadingFiles ? "animate-spin text-brand-red" : ""}`} /></button>
                  </div>

                  {loadingFiles ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="text-brand-red animate-spin" size={40} /><p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Syncing Files...</p></div>
                  ) : existingFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5"><ImageIcon size={48} className="text-zinc-800 mb-4" /><p className="text-xs font-black uppercase text-zinc-700 italic">No files in this folder yet.</p></div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {existingFiles.map((file) => (
                        <motion.div 
                          key={file.path} 
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          className={`group relative aspect-square bg-black border border-white/5 overflow-hidden ${deletingPath === file.url ? "opacity-30 cursor-wait" : ""}`}
                        >
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                          
                          {deletingPath === file.url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-brand-red/20">
                              <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                          )}

                          {/* Action Bar - Always visible on mobile, hover on desktop */}
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center justify-between gap-2 z-20">
                            <div className="flex flex-col flex-1 truncate">
                              <p className="text-[7px] font-black uppercase truncate text-gray-400 group-hover:text-white">{file.name.replace('HIDDEN_', '')}</p>
                              {file.name.startsWith('HIDDEN_') && (
                                <span className="text-[6px] font-black text-brand-red uppercase tracking-widest">Hidden</span>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              {armedDelete === file.url ? (
                                <div className="flex gap-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setArmedDelete(null);
                                    }}
                                    className="px-2 py-1 bg-white/20 hover:bg-white text-white hover:text-black text-[8px] font-black uppercase rounded transition-all"
                                  >
                                    No
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(file.url, file.name);
                                      setArmedDelete(null);
                                    }}
                                    className="px-2 py-1 bg-brand-red text-white text-[8px] font-black uppercase rounded animate-pulse"
                                  >
                                    Delete!
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      let folderPrefix = 'images/';
                                      if (mode === 'event') folderPrefix += `events/${selectedGallery}/`;
                                      else if (mode === 'sample') folderPrefix += `samples/${selectedCategory}/`;
                                      else if (mode === 'hero') folderPrefix += `hero/`;
                                      else if (mode === 'bighead') folderPrefix += `bighead/${selectedCategory}/`;
                                      
                                      // Send folderPrefix as part of a custom body or similar
                                      // Actually, I'll update handleHide to accept folderPrefix
                                      const getPrefix = () => {
                                        if (mode === 'event') return `images/events/${selectedGallery}/`;
                                        if (mode === 'sample') return `images/samples/${selectedCategory}/`;
                                        if (mode === 'hero') return `images/hero/`;
                                        if (mode === 'bighead') return `images/bighead/${selectedCategory}/`;
                                        return 'images/';
                                      };

                                      const prefix = getPrefix();
                                      
                                      const hideAction = async () => {
                                        const isHidden = file.name.startsWith('HIDDEN_');
                                        const newName = isHidden ? file.name.replace('HIDDEN_', '') : `HIDDEN_${file.name}`;
                                        
                                        setHidingPath(file.url);
                                        try {
                                          const res = await fetch('/api/admin/files', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'rename', path: file.url, newName, folderPrefix: prefix })
                                          });
                                          if (res.ok) fetchFiles();
                                        } catch (err) {}
                                        finally { setHidingPath(null); }
                                      };
                                      hideAction();
                                    }} 
                                    disabled={hidingPath !== null}
                                    className={`w-7 h-7 flex items-center justify-center rounded transition-all ${hidingPath === file.url ? "animate-pulse" : file.name.startsWith('HIDDEN_') ? "bg-brand-red text-white" : "bg-white/10 hover:bg-white text-white hover:text-brand-black"}`}
                                    title={file.name.startsWith('HIDDEN_') ? "Unhide Image" : "Hide Image"}
                                  >
                                    <Eye size={14} className={file.name.startsWith('HIDDEN_') ? "opacity-50" : ""} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setArmedDelete(file.url);
                                    }} 
                                    disabled={deletingPath !== null}
                                    className={`w-7 h-7 flex items-center justify-center rounded transition-all ${deletingPath === file.url ? "bg-zinc-800 text-zinc-600" : "bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-white cursor-pointer"}`}
                                    title="Delete Image"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Event Edit/Add Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEventModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="bg-brand-red px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-black uppercase italic tracking-widest text-white">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button onClick={() => setIsEventModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  const eventData: GalleryEvent = {
                    id: formData.get('id') as string || (editingEvent?.id || ''),
                    name: formData.get('name') as string,
                    status: formData.get('status') as any,
                    accessCode: formData.get('accessCode') as string,
                    link: `https://my.photoday.com/g/${formData.get('accessCode')}`,
                    date: formData.get('date') as string,
                    displayDate: new Date(formData.get('date') as string + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                    samples: editingEvent?.samples || [],
                    specials: modalOffers.filter(o => o.label)
                  };
                  handleSaveEvent(eventData);
                }}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Event Title</label>
                      <input name="name" required defaultValue={editingEvent?.name} className="w-full bg-black border border-white/10 p-3 text-sm font-bold outline-none focus:border-brand-red text-white" placeholder="e.g. LPAR Baseball 2026" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Event ID (Internal)</label>
                      <input name="id" required defaultValue={editingEvent?.id} disabled={!!editingEvent} className="w-full bg-black border border-white/10 p-3 text-sm font-bold outline-none focus:border-brand-red text-white disabled:opacity-50" placeholder="e.g. lpar-baseball-2026" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</label>
                      <select name="status" defaultValue={editingEvent?.status || 'Coming Soon'} className="w-full bg-black border border-white/10 p-3 text-sm font-bold outline-none focus:border-brand-red text-white cursor-pointer">
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Advance Pay Available">Advance Pay Available</option>
                        <option value="Live">Live</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Access Code</label>
                      <input name="accessCode" required defaultValue={editingEvent?.accessCode} className="w-full bg-black border border-white/10 p-3 text-sm font-bold outline-none focus:border-brand-red text-white" placeholder="e.g. LUFKIN2026" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Date of Event</label>
                      <input name="date" type="date" required defaultValue={editingEvent?.date} className="w-full bg-black border border-white/10 p-3 text-sm font-bold outline-none focus:border-brand-red text-white" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                        <Tag size={12} className="text-brand-red" /> Active Offers
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setModalOffers([...modalOffers, { label: '', code: '', description: '', startDate: '', endDate: '', detail: '' }])}
                        className="text-[10px] font-black uppercase text-brand-red hover:text-white flex items-center gap-2 transition-colors"
                      >
                        <Plus size={12} /> Add Another Offer
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {modalOffers.map((special, i) => (
                        <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-lg space-y-4 relative group/offer-row">
                          <button 
                            type="button"
                            onClick={() => setModalOffers(modalOffers.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 text-gray-600 hover:text-brand-red opacity-0 group-hover/offer-row:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[7px] font-black uppercase text-gray-600 block">Offer Name</span>
                              <input 
                                value={special.label}
                                onChange={(e) => {
                                  const newOffers = [...modalOffers];
                                  newOffers[i].label = e.target.value;
                                  setModalOffers(newOffers);
                                }}
                                placeholder="e.g. Free Shipping" 
                                className="w-full bg-black border border-white/10 p-2 text-xs font-bold outline-none focus:border-brand-red text-white" 
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[7px] font-black uppercase text-gray-600 block">Promo Code</span>
                              <input 
                                value={special.code}
                                onChange={(e) => {
                                  const newOffers = [...modalOffers];
                                  newOffers[i].code = e.target.value.toUpperCase();
                                  setModalOffers(newOffers);
                                }}
                                placeholder="CODE123" 
                                className="w-full bg-black border border-white/10 p-2 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-red text-brand-red" 
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[7px] font-black uppercase text-gray-600 block">Description</span>
                              <input 
                                value={special.description}
                                onChange={(e) => {
                                  const newOffers = [...modalOffers];
                                  newOffers[i].description = e.target.value;
                                  setModalOffers(newOffers);
                                }}
                                placeholder="Details..." 
                                className="w-full bg-black border border-white/10 p-2 text-xs font-bold outline-none focus:border-brand-red text-white" 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[7px] font-black uppercase text-gray-600 block">Start Date</span>
                                <input 
                                  type="date"
                                  value={special.startDate}
                                  onChange={(e) => {
                                    const newOffers = [...modalOffers];
                                    newOffers[i].startDate = e.target.value;
                                    setModalOffers(newOffers);
                                  }}
                                  className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold outline-none focus:border-brand-red text-white" 
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[7px] font-black uppercase text-gray-600 block">End Date</span>
                                <input 
                                  type="date"
                                  value={special.endDate}
                                  onChange={(e) => {
                                    const newOffers = [...modalOffers];
                                    newOffers[i].endDate = e.target.value;
                                    setModalOffers(newOffers);
                                  }}
                                  className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold outline-none focus:border-brand-red text-white" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-brand-red uppercase font-black tracking-widest italic flex items-center justify-center gap-2">
                      <Save size={18} /> {editingEvent ? 'Save Changes' : 'Create Event'}
                    </button>
                    <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-8 py-4 bg-zinc-800 text-white font-black uppercase italic tracking-widest hover:bg-zinc-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E02826; }
        
        /* Make calendar icon visible in dark inputs */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </main>
  );
}
