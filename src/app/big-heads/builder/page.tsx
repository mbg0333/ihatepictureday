"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Info, CheckCircle2, AlertTriangle, Truck, ShieldCheck, Camera, Smartphone, Plus, Trash2, CreditCard, ShoppingBag, MapPin, User, Mail, Phone, Zap, Send, Trophy } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Placeholder for Stripe (User would replace with their own publishable key)
const stripePromise = loadStripe("pk_test_placeholder");

import { useUploadThing } from "@/lib/uploadthing";

type BigHeadStyle = "STANDARD BIG HEAD" | "HEAD ONLY" | "HALF BODY" | "HALF BODY WITH NAME" | "CARTOON STYLE";

interface BigHeadItem {
  id: string;
  file: File;
  quantity: number;
  style: BigHeadStyle;
  customName?: string;
}

const styles: BigHeadStyle[] = [
  "STANDARD BIG HEAD",
  "HALF BODY",
  "HALF BODY WITH NAME",
  "CARTOON STYLE"
];

const samples = [
  { id: 1, title: "Standard Big Head", image: "/images/bigheads/sample1.png" },
  { id: 2, title: "Head Only Cutout", image: "/images/bigheads/sample2.png" },
  { id: 3, title: "Half Body Style", image: "/images/bigheads/sample1.png" },
  { id: 4, title: "Half Body w/ Name", image: "/images/bigheads/sample2.png" },
  { id: 5, title: "Cartoon Style", image: "/images/bigheads/sample1.png" },
  { id: 6, title: "League Special", image: "/images/bigheads/sample2.png" },
];

const PRICE_STANDARD = 25;
const PRICE_MID = 22;
const PRICE_BULK = 18;
const MID_THRESHOLD = 10;
const BULK_THRESHOLD = 24;
const MIN_THRESHOLD = 6;

export default function BigHeadsPage() {
  const [items, setItems] = useState<BigHeadItem[]>([]);
  const [configuringFile, setConfiguringFile] = useState<File | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentStyle, setCurrentStyle] = useState<BigHeadStyle>("STANDARD BIG HEAD");
  const [currentName, setCurrentName] = useState("");
  const [liabilityApproved, setLiabilityApproved] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"build" | "info" | "success">("build");
  const [showUpsell, setShowUpsell] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [bonusDiscount, setBonusDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { startUpload } = useUploadThing("bigHeadUploader", {
    onUploadProgress: (p) => setUploadProgress(p),
  });

  const [personalInfo, setPersonalInfo] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", zip: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalQuantity = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  
  const nextMultipleOf8 = Math.ceil(totalQuantity / 8) * 8;
  const isMultipleOf8 = totalQuantity > 0 && totalQuantity % 8 === 0;
  const upsellCount = nextMultipleOf8 - totalQuantity;

  const totalStylePremium = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + (item.style === "HALF BODY WITH NAME" ? item.quantity * 1 : 0);
    }, 0);
  }, [items]);

  const unitPrice = useMemo(() => {
    if (totalQuantity >= BULK_THRESHOLD) return PRICE_BULK;
    if (totalQuantity >= MID_THRESHOLD) return PRICE_MID;
    return PRICE_STANDARD;
  }, [totalQuantity]);

  const baseTotal = (totalQuantity * unitPrice) + totalStylePremium - bonusDiscount;
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConfiguringFile(e.target.files[0]);
      setCurrentQuantity(1);
      setCurrentStyle("STANDARD BIG HEAD");
      setCurrentName("");
      setLiabilityApproved(false);
    }
  };

  const addItemToCart = (q: number = currentQuantity) => {
    if (configuringFile) {
      // Check for quality issues
      if (configuringFile.size < 1024 * 1024 && !liabilityApproved) {
        setShowQualityModal(true);
        return;
      }

      const newItem: BigHeadItem = {
        id: Math.random().toString(36).substr(2, 9),
        file: configuringFile,
        quantity: q,
        style: currentStyle,
        customName: currentStyle === "HALF BODY WITH NAME" ? currentName : undefined
      };
      setItems([...items, newItem]);
      setConfiguringFile(null);
      setCurrentName("");
      setLiabilityApproved(false);
    }
  };

  const [bonusAllocations, setBonusAllocations] = useState<Record<string, number>>({});
  
  const totalAllocated = useMemo(() => Object.values(bonusAllocations).reduce((a, b) => a + b, 0), [bonusAllocations]);

  const handleUpsellQuantityChange = (itemId: string, delta: number) => {
    const current = bonusAllocations[itemId] || 0;
    const next = current + delta;
    if (next >= 0 && (totalAllocated + delta <= upsellCount)) {
      setBonusAllocations({...bonusAllocations, [itemId]: next});
    }
  };

  const addUpsellToCart = () => {
    if (totalAllocated > 0) {
      const discountPerHead = unitPrice - 15;
      const totalDiscount = totalAllocated * discountPerHead;
      
      const updatedItems = items.map(item => ({
        ...item,
        quantity: item.quantity + (bonusAllocations[item.id] || 0)
      }));
      setItems(updatedItems);
      setBonusDiscount(prev => prev + totalDiscount);
      setBonusAllocations({});
      setShowUpsell(false);
      setCheckoutStep("info");
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    // Clear allocations for the removed item
    const newAllocations = { ...bonusAllocations };
    delete newAllocations[id];
    setBonusAllocations(newAllocations);
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your pack and start over?")) {
      setItems([]);
      setConfiguringFile(null);
      setBonusAllocations({});
      setShowUpsell(false);
      setCheckoutStep("build");
    }
  };

  const handleCheckoutInitiate = () => {
    if (!isMultipleOf8 && totalQuantity > 0) {
      setShowUpsell(true);
    } else {
      setCheckoutStep("info");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      // 1. Prepare FormData for Local Upload
      const formData = new FormData();
      items.forEach(item => {
        const cleanStyle = item.style.replace(/\s+/g, '_');
        const cleanName = item.customName ? item.customName.replace(/\s+/g, '_').toUpperCase() : '';
        const namePrefix = cleanName ? `${cleanName}_` : '';
        const newName = `${cleanStyle}_${namePrefix}${item.file.name}`;
        formData.append('files', new File([item.file], newName, { type: item.file.type }));
      });

      let uploadedFiles;
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.error) throw new Error(uploadData.error);
        uploadedFiles = uploadData.files;
      } catch (uploadErr: any) {
        console.error("Local upload error:", uploadErr);
        throw new Error(`Upload failed: ${uploadErr.message || "Could not save files locally."}`);
      }
      
      if (!uploadedFiles || uploadedFiles.length === 0) throw new Error("Upload failed: No files were saved.");

      // 2. Send Order Request with Local URLs
      let response;
      try {
        response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bighead',
            data: {
              items: items.map((item, idx) => ({
                style: item.style,
                quantity: item.quantity,
                customName: item.customName,
                fileName: uploadedFiles[idx].name,
                fileUrl: window.location.origin + uploadedFiles[idx].url, // Full URL for the email
                unitPrice: unitPrice,
              })),
              customerInfo: personalInfo,
              totalAmount: baseTotal,
            },
          }),
        });
      } catch (sendErr: any) {
        console.error("Order API error:", sendErr);
        throw new Error("Order submission failed, but your photos were saved to public/uploads. Please try submitting again.");
      }

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setCheckoutStep("success");
    } catch (err: any) {
      console.error("Submission error:", err);
      alert(err.message || "There was an error submitting your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <Navbar />
      
      {/* Low Quality Modal */}
      <AnimatePresence>
        {showQualityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowQualityModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-brand-red p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 text-brand-red mb-6">
                <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic">Low Quality Warning</h3>
              </div>
              
              <div className="space-y-4 text-gray-400 mb-8">
                <p className="font-bold text-white">This photo's resolution is lower than we recommend for a Big Head.</p>
                <p className="text-sm">Small files (under 1MB) may appear blurry or pixelated when printed at full size.</p>
                
                <div className="bg-brand-red/5 p-4 border border-brand-red/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1" 
                      checked={liabilityApproved} 
                      onChange={(e) => setLiabilityApproved(e.target.checked)}
                    />
                    <span className="text-xs font-bold text-gray-300 uppercase leading-relaxed">
                      I understand that iHatePictureDay will not reprint or refund due to low quality issues.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  disabled={!liabilityApproved}
                  className="flex-1"
                  onClick={() => {
                    setShowQualityModal(false);
                    addItemToCart();
                  }}
                >
                  Add Anyway
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => setShowQualityModal(false)}
                >
                  Choose Another
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Builder Section */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left: Configuration Area */}
            <div className="lg:col-span-2 space-y-8">
              {showUpsell ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-red p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 text-[15rem] font-black italic opacity-10 leading-none select-none translate-x-20">
                    SAVE
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                      <h2 className="text-5xl font-black uppercase italic mb-4">Bonus Deal Unlocked!</h2>
                      <p className="text-lg font-bold mb-8 opacity-90">
                        You've unlocked a special sideline pack! Add <span className="bg-white text-brand-red px-2">{upsellCount} more Heads</span> to your order for only <span className="text-brand-black bg-white px-2">$15 each</span>. 
                        <br/><span className="text-xs uppercase mt-2 block opacity-70">Assign them to your existing photos below:</span>
                      </p>
                    </div>

                    <div className="bg-brand-black/20 p-6 space-y-4 border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase">Your Current Photos</span>
                        <span className="bg-white text-brand-red px-3 py-1 text-xs font-black uppercase italic">
                          Bonus Remaining: {upsellCount - totalAllocated}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {items.map(item => (
                          <div key={item.id} className="bg-black/20 p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase opacity-60 truncate">{item.style}</p>
                              <p className="font-bold truncate">{item.file.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-black opacity-60">Qty: {item.quantity}</span>
                              <div className="flex items-center gap-3">
                                <button onClick={() => handleUpsellQuantityChange(item.id, -1)} className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white/10">-</button>
                                <span className="text-xl font-black min-w-[1.5rem] text-center">+{bonusAllocations[item.id] || 0}</span>
                                <button onClick={() => handleUpsellQuantityChange(item.id, 1)} className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white/10">+</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        onClick={addUpsellToCart} 
                        disabled={totalAllocated === 0}
                        variant="secondary" 
                        className="px-12 py-6 text-xl disabled:opacity-50"
                      >
                        {totalAllocated > 0 ? `Claim ${totalAllocated} Extra Head${totalAllocated > 1 ? 's' : ''}` : "Assign Bonus Heads"}
                      </Button>
                      <button onClick={() => { setShowUpsell(false); setCheckoutStep("info"); }} className="text-sm font-black uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
                        No thanks, keep my current order
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : checkoutStep === "build" ? (
                <>
                  <div className="bg-zinc-900 border border-white/10 p-8 md:p-12 relative overflow-hidden">
                    <h2 className="text-3xl font-black uppercase italic mb-8">
                      {configuringFile ? "Configure Your Item" : "Step 1: Upload Photo"}
                    </h2>

                    <AnimatePresence mode="wait">
                      {!configuringFile ? (
                        <motion.div 
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-4 border-dashed border-white/10 p-16 text-center hover:border-brand-red cursor-pointer transition-all bg-brand-black/50 group"
                        >
                          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                          <Upload size={64} className="mx-auto mb-6 text-gray-500 group-hover:text-brand-red group-hover:scale-110 transition-all" />
                          <p className="text-2xl font-black uppercase italic">Drop or Click to Upload</p>
                          <p className="text-sm text-gray-500 mt-4 uppercase tracking-[0.2em]">One photo at a time</p>
                        </motion.div>
                      ) : (
                        <motion.div 
                           key="configure"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="space-y-4"
                         >
                           <div className="flex flex-col gap-4">
                             <div className="flex-1 space-y-4">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                 <div>
                                   <label className="text-sm font-black uppercase tracking-widest text-gray-400 block mb-0.5">Choose Style</label>
                                   <p className="text-[10px] font-black text-brand-red uppercase tracking-normal italic">Bulk pricing applies to your entire pack!</p>
                                 </div>
                                 <div className="flex gap-2">
                                   <div className="bg-brand-red/10 border border-brand-red/50 px-3 py-2 text-center relative flex-1 min-w-[80px]">
                                     <div className="absolute -top-2 -right-1 bg-brand-red text-white text-[6px] font-black px-1.5 py-0.5 uppercase italic tracking-tighter">Popular</div>
                                     <p className="text-[8px] font-black uppercase text-gray-500 leading-none mb-0.5 tracking-widest">10+ Heads</p>
                                     <p className="text-xl font-black text-white leading-tight">$22<span className="text-[10px] opacity-60 ml-0.5">EA</span></p>
                                     <p className="text-[7px] font-black text-brand-red uppercase mt-0.5 leading-none">Save $3/Head</p>
                                   </div>
                                   <div className="bg-white/5 border border-white/20 px-3 py-2 text-center relative flex-1 min-w-[80px]">
                                     <div className="absolute -top-2 -right-1 bg-white text-brand-black text-[6px] font-black px-1.5 py-0.5 uppercase italic tracking-tighter">Best Deal</div>
                                     <p className="text-[8px] font-black uppercase text-gray-500 leading-none mb-0.5 tracking-widest">24+ Heads</p>
                                     <p className="text-xl font-black text-white leading-tight">$18<span className="text-[10px] opacity-60 ml-0.5">EA</span></p>
                                     <p className="text-[7px] font-black text-white/60 uppercase mt-0.5 leading-none">Save $7/Head</p>
                                   </div>
                                 </div>
                               </div>

                               {/* Shipping Incentive Box - COMPACT */}
                               <div className="bg-brand-red/10 border border-brand-red/30 px-3 py-2 flex items-center gap-3">
                                 <Truck className="text-brand-red shrink-0" size={16} />
                                 <div>
                                   <p className="text-[7px] font-black uppercase text-brand-red tracking-[0.2em] leading-none mb-0.5 italic">Upgrade Confirmed</p>
                                   <h4 className="text-sm font-black text-white leading-none">Free Overnight Shipping Included!</h4>
                                 </div>
                               </div>

                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {styles.map(s => (
                                    <div key={s} className="relative flex items-center">
                                      <button
                                        type="button"
                                        onClick={() => setCurrentStyle(s)}
                                        className={`flex-1 px-4 py-3 text-left transition-all border ${
                                          currentStyle === s ? "border-brand-red bg-brand-red text-white" : "border-white/10 hover:border-white/30"
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-black uppercase">{s}</span>
                                          <span className={`text-xs font-black ${currentStyle === s ? "text-white/80" : "text-brand-red"}`}>
                                            ${(unitPrice + (s === "HALF BODY WITH NAME" ? 1 : 0)).toFixed(2)}
                                          </span>
                                        </div>
                                      </button>
                                      
                                      <div className="relative group ml-2">
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center cursor-help hover:border-brand-red hover:bg-brand-red/10 transition-all">
                                          <span className="text-xs font-black italic">?</span>
                                        </div>
                                        
                                        <div className="absolute right-0 bottom-full mb-4 w-64 aspect-[3/4] bg-zinc-900 border-2 border-brand-red z-[60] opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 shadow-2xl overflow-hidden">
                                          <img 
                                            src={s.includes("HEAD ONLY") ? "/images/bigheads/sample2.png" : "/images/bigheads/sample1.png"} 
                                            alt={s} 
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-brand-red p-2">
                                            <p className="text-[10px] font-black uppercase italic text-center text-white">{s} EXAMPLE</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {currentStyle === "HALF BODY WITH NAME" && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }} 
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-6 bg-brand-red/10 border border-brand-red/30 rounded-lg space-y-3"
                                >
                                  <label className="text-xs font-black uppercase tracking-widest text-brand-red flex items-center gap-2">
                                    <User size={14} /> Enter Name for Big Head
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. JACKSON #24" 
                                    className="w-full bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red text-white uppercase placeholder:text-gray-600"
                                    value={currentName}
                                    onChange={(e) => setCurrentName(e.target.value)}
                                  />
                                  <p className="text-[9px] font-bold text-gray-500 uppercase italic">This name will be printed on the bottom of the Big Head.</p>
                                </motion.div>
                              )}
                              
                              <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Quantity</label>
                                  <div className="flex items-center space-x-4">
                                    <button type="button" onClick={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))} className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 text-xl">-</button>
                                    <span className="text-3xl font-black">{currentQuantity}</span>
                                    <button type="button" onClick={() => setCurrentQuantity(currentQuantity + 1)} className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 text-xl">+</button>
                                  </div>
                                  {currentStyle === "HALF BODY WITH NAME" && (
                                    <p className="text-[10px] text-brand-red font-black uppercase mt-2 italic">+$1.00 Premium per head</p>
                                  )}
                                </div>
                                <div className="flex items-end">
                                  <div className="text-[10px] font-black uppercase text-gray-500">
                                    File: {configuringFile.name} ({(configuringFile.size / (1024 * 1024)).toFixed(2)} MB)
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4 pt-4">
                                <Button 
                                  onClick={() => addItemToCart()}
                                  className="flex-1 py-4 text-lg"
                                >
                                  Add to Cart - ${((unitPrice + (currentStyle === "HALF BODY WITH NAME" ? 1 : 0)) * currentQuantity).toFixed(2)}
                                </Button>
                                <Button variant="ghost" onClick={() => setConfiguringFile(null)}>Cancel</Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </>
              ) : checkoutStep === "info" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900 border border-white/10 p-8 md:p-12">
                  <h2 className="text-3xl font-black uppercase italic mb-8">Shipping & Personal Info</h2>
                  <form onSubmit={handleCheckout} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><User size={14} /> Full Name</label>
                        <input required className="w-full bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><Mail size={14} /> Email</label>
                        <input required type="email" className="w-full bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><Phone size={14} /> Phone Number</label>
                      <input required className="w-full bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><MapPin size={14} /> Shipping Address</label>
                      <input required className="w-full bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input placeholder="City" required className="bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.city} onChange={e => setPersonalInfo({...personalInfo, city: e.target.value})} />
                      <input placeholder="State" required className="bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.state} onChange={e => setPersonalInfo({...personalInfo, state: e.target.value})} />
                      <input placeholder="Zip" required className="bg-brand-black border border-white/10 p-4 font-bold outline-none focus:border-brand-red" value={personalInfo.zip} onChange={e => setPersonalInfo({...personalInfo, zip: e.target.value})} />
                    </div>
                    <div className="pt-6">
                      <Button disabled={submitting} type="submit" className="w-full py-6 text-xl flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-3">
                          <Send size={24} /> {submitting ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${uploadProgress}%)` : "Submitting...") : "Submit Order Request"}
                        </div>
                        {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full max-w-[200px] h-1 bg-white/10 mt-2 overflow-hidden">
                            <motion.div 
                              className="h-full bg-brand-red"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-gray-500 uppercase font-bold mt-4 tracking-widest italic">
                        Total Amount: ${baseTotal.toFixed(2)} - An invoice will be sent after submission
                      </p>
                      <button type="button" onClick={() => setCheckoutStep("build")} className="w-full text-xs font-bold uppercase tracking-widest text-gray-500 mt-4 hover:text-white transition-colors">Back to Builder</button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900 border border-white/10 p-12 text-center">
                  <Trophy size={80} className="mx-auto text-brand-red mb-6" />
                  <h2 className="text-4xl font-black uppercase italic mb-4">Order Request Sent!</h2>
                  <p className="text-gray-400 mb-8 font-bold italic uppercase tracking-widest text-xs">Proof and Payment information incoming</p>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    Thank you, {personalInfo.name}. We've received your request for {totalQuantity} Big Heads. <br/><br/>
                    <span className="text-white font-black">WHAT HAPPENS NEXT?</span><br/>
                    We will review your photos, create a digital proof for your approval, and then reach out to collect payment via invoice.
                  </p>
                  <div className="bg-brand-red/10 p-6 border border-brand-red/20 mb-8 max-w-sm mx-auto">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-red flex items-center justify-center gap-2">
                      <Mail size={16} /> Check Your Email
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase leading-relaxed">
                      Final Invoice Total: <span className="text-white">${baseTotal.toFixed(2)}</span>
                    </p>
                  </div>
                  <Button onClick={() => window.location.reload()}>Build Another Pack</Button>
                </motion.div>
              )}
            </div>

            {/* Right: Cart Summary */}
            <div className="space-y-6">
              <div className="bg-brand-red p-8 shadow-[0_0_40px_rgba(224,40,38,0.2)] text-white">
                <h3 className="text-3xl font-black uppercase italic mb-6 flex items-center justify-between">
                  Your Pack 
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <button 
                        onClick={clearCart}
                        className="text-[10px] font-black uppercase tracking-widest bg-black/20 hover:bg-black/40 px-2 py-1 transition-colors flex items-center gap-1"
                        title="Clear all and start over"
                      >
                        <Trash2 size={12} /> Start Over
                      </button>
                    )}
                    <ShoppingBag size={24} />
                  </div>
                </h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.length === 0 && <p className="opacity-70 italic">Your pack is empty...</p>}
                  {items.map(item => (
                    <div key={item.id} className="bg-black/20 p-4 relative group">
                      <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} className="text-white/50 hover:text-white" />
                      </button>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase opacity-60">{item.style}</p>
                        <p className="text-[10px] font-black uppercase opacity-60">${(unitPrice + (item.style === "HALF BODY WITH NAME" ? 1 : 0)).toFixed(2)} ea</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate max-w-[150px]">{item.file.name}</span>
                        <div className="text-right">
                          <span className="font-black text-lg block">x{item.quantity}</span>
                          <span className="text-[10px] font-black opacity-60 italic">
                            ${((unitPrice + (item.style === "HALF BODY WITH NAME" ? 1 : 0)) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase opacity-60">Total Quantity</span>
                      <span className="text-3xl font-black italic">{totalQuantity}</span>
                    </div>

                    {/* Discount Tier Notifications */}
                    <div className="space-y-1">
                      {totalQuantity < MID_THRESHOLD && (
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/40">
                          <span>Next Tier (10+):</span>
                          <span>$22.00 EA</span>
                        </div>
                      )}
                      {totalQuantity >= MID_THRESHOLD && totalQuantity < BULK_THRESHOLD && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-white">Tier 1 Applied:</span>
                          <span className="bg-white text-brand-red px-1">-$3.00 EA</span>
                        </div>
                      )}
                      {totalQuantity >= BULK_THRESHOLD && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-white">Bulk Tier Applied:</span>
                          <span className="bg-white text-brand-red px-1">-$7.00 EA</span>
                        </div>
                      )}
                      {totalQuantity >= MID_THRESHOLD && totalQuantity < BULK_THRESHOLD && (
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/40">
                          <span>Bulk Tier (24+):</span>
                          <span>$18.00 EA</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-xl font-black uppercase italic">Total Price</span>
                      <span className="text-5xl font-black italic">${baseTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {checkoutStep === "build" && (
                    <div className="space-y-3">
                      {totalQuantity < MIN_THRESHOLD && (
                        <div className="bg-black/40 p-4 border border-white/20 flex items-center gap-4 mb-4">
                          <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                            <Info size={20} className="text-white" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase tracking-wider text-white">Minimum Order: {MIN_THRESHOLD} Big Heads</p>
                            <p className="text-[11px] font-bold uppercase text-white/60">
                              Add <span className="text-white bg-black/40 px-1.5 py-0.5 rounded">{MIN_THRESHOLD - totalQuantity} more</span> to unlock checkout
                            </p>
                          </div>
                        </div>
                      )}
                      <Button 
                        onClick={() => setCheckoutStep("info")}
                        disabled={totalQuantity < MIN_THRESHOLD}
                        className="w-full py-6 text-xl bg-black hover:bg-zinc-900 text-white border-none shadow-xl"
                      >
                        Checkout Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
