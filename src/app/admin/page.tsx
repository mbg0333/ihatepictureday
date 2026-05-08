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
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { activeGalleries } from '@/data/events';
import Link from 'next/link';

type UploadMode = 'event' | 'sample' | 'hero';

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
  const [mode, setMode] = useState<UploadMode>('event');
  const [selectedGallery, setSelectedGallery] = useState(activeGalleries[0].id);
  const [selectedCategory, setSelectedCategory] = useState('football');
  const [customId, setCustomId] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [existingFiles, setExistingFiles] = useState<FileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setDynamicCategories(data.categories);
        if (data.categories.length > 0 && !data.categories.find((c: any) => c.id === selectedCategory)) {
          setSelectedCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    const id = mode === 'event' ? selectedGallery : mode === 'sample' ? selectedCategory : 'hero';
    try {
      const res = await fetch(`/api/admin/files?type=${mode}&id=${id}`);
      const data = await res.json();
      setExistingFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchFiles();
    }
  }, [isAuthenticated, mode, selectedGallery, selectedCategory]);

  const handleDelete = async (filePath: string) => {
    if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/files?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchFiles();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert('Failed to delete file');
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
      } else if (mode === 'hero') {
        pathPrefix = `hero`;
      }

      for (const file of Array.from(files)) {
        await upload(`images/${pathPrefix}/${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/upload',
        });
      }

      setUploadStatus({ success: true, message: `Successfully uploaded ${files.length} images` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      if (isAddingNew) {
        const newId = customId;
        setIsAddingNew(false);
        if (mode === 'sample') {
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
              <button onClick={() => { setMode('event'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'event' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Calendar size={14} /> Events
              </button>
              <button onClick={() => { setMode('sample'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'sample' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Trophy size={14} /> Samples
              </button>
              <button onClick={() => { setMode('hero'); setIsAddingNew(false); }} className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase italic transition-all ${mode === 'hero' ? "bg-brand-red text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
                <Monitor size={14} /> Hero Banners
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode !== 'hero' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-zinc-900 border border-white/10 p-6 space-y-6 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FolderOpen size={14} /> {mode === 'event' ? 'Events' : 'Sports'}
                    </h3>
                    <button onClick={() => setIsAddingNew(!isAddingNew)} className={`p-1.5 rounded transition-all ${isAddingNew ? "bg-brand-red text-white rotate-45" : "bg-white/5 text-gray-400 hover:bg-brand-red hover:text-white"}`}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {isAddingNew && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-2">
                          <input type="text" placeholder={mode === 'event' ? "NEW-EVENT-ID" : "NEW-SPORT-ID"} value={customId} onChange={(e) => setCustomId(e.target.value.toUpperCase().replace(/\s+/g, '-'))} className="w-full bg-black border border-brand-red p-3 text-xs font-black uppercase outline-none" autoFocus />
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
            <div className="bg-zinc-900 border border-white/10 p-8 shadow-2xl">
              <div onClick={() => !uploading && fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={handleDrop} className={`border-2 border-dashed p-12 text-center transition-all cursor-pointer relative overflow-hidden ${uploading ? "opacity-50 cursor-wait border-zinc-700" : "border-white/5 hover:border-brand-red bg-black/20 group"}`}>
                <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleUpload} className="hidden" />
                <div className="flex flex-col items-center">
                  <Upload size={32} className={`mb-4 transition-all duration-300 ${uploading ? "text-zinc-600 animate-bounce" : "text-brand-red group-hover:scale-125"}`} />
                  <h3 className="text-2xl font-black uppercase italic mb-2">{uploading ? "Uploading..." : "Drop Images Here"}</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/60 rounded-full border border-white/5">
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Target:</span>
                    <span className="text-[10px] font-black uppercase text-brand-red tracking-wider">
                      {mode === 'event' ? (isAddingNew ? customId || '???' : selectedGallery) : mode === 'sample' ? (isAddingNew ? customId || '???' : selectedCategory) : 'HERO BANNER'}
                    </span>
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
                    <motion.div key={file.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative aspect-square bg-black border border-white/5 overflow-hidden">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <a href={file.url} target="_blank" className="w-10 h-10 bg-white flex items-center justify-center rounded-full hover:bg-brand-red hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"><Eye size={18} /></a>
                        <button onClick={() => handleDelete(file.path)} className="w-10 h-10 bg-brand-red text-white flex items-center justify-center rounded-full hover:bg-white hover:text-brand-red transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg"><Trash2 size={18} /></button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent pointer-events-none"><p className="text-[7px] font-black uppercase truncate text-gray-400 group-hover:text-white transition-colors">{file.name}</p></div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E02826; }
      `}</style>
    </main>
  );
}
