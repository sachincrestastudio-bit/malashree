
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { getBranch } from "@/lib/data";
import { registerUser } from "@/actions/auth";

export default function Register() {
  const setProfile = useStore(s => s.setProfile);
  const setBranch = useStore(s => s.setBranch);
  const branchId = useStore(s => s.branchId);
  const branch = getBranch(branchId);
  const nav = useRouter();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState({ 
    name: "", 
    email: "",
    phone: "", 
    password: "",
    address: "", 
    branchId: branchId 
  });

  const steps = [
    { key: "name", label: "What's your name?", placeholder: "Riya Sharma", type: "text" },
    { key: "email", label: "Your email?", placeholder: "riya@example.com", type: "email" },
    { key: "phone", label: "Phone number?", placeholder: "+91 98765 43210", type: "tel" },
    { key: "password", label: "Create a password", placeholder: "Min. 6 characters", type: "password" },
    { key: "address", label: "Delivery address?", placeholder: "Flat 401, Pimple Saudagar…", type: "text" },
  ] as const;

  const finish = async () => {
    setLoading(true);
    setError(null);
    
    const res = await registerUser(data);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    setProfile({ name: data.name, phone: data.phone, address: data.address, branchId: data.branchId });
    setBranch(data.branchId);
    nav.push("/profile");
  };

  const isLast = step === steps.length;
  const current = steps[step];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-olive mb-3">Step {Math.min(step + 1, steps.length + 1)} of {steps.length + 1}</div>
        <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-lime" animate={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }} />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-xs text-red-700 flex gap-3 items-start"
          >
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium leading-normal">{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isLast ? (
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="mt-12">
              <h1 className="font-display text-5xl leading-[0.95]">{current.label}</h1>
              <input
                autoFocus
                type={current.type}
                value={(data as Record<string, string>)[current.key]}
                onChange={e => setData({ ...data, [current.key]: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (data as Record<string, string>)[current.key]) {
                    setStep(step + 1);
                  }
                }}
                placeholder={current.placeholder}
                className="mt-8 w-full h-16 px-6 rounded-full bg-white border-2 border-ink/10 focus:border-ink outline-none text-lg"
              />
              <button
                onClick={() => setStep(step + 1)}
                disabled={!(data as Record<string, string>)[current.key]}
                className="mt-6 h-14 px-8 rounded-full bg-ink text-cream font-medium flex items-center gap-2 disabled:opacity-40 hover:bg-ink/90 transition"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="branch" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="mt-12">
              <h1 className="font-display text-5xl leading-[0.95]">kitchen <span className="italic">assigned.</span></h1>
              <p className="mt-3 text-olive-dark">Based on your delivery address, your local kitchen zone has been resolved and locked:</p>
              <div className="mt-6 p-6 rounded-2xl bg-white border border-ink/5 shadow-sm">
                <div className="font-semibold text-lg text-ink">{branch.name}</div>
                <p className="text-xs text-olive-dark mt-1">{branch.tagline} · {branch.vibe}</p>
                <div className="mt-4 pt-4 border-t border-ink/5 flex justify-between text-xs text-olive font-semibold">
                  <span>ETA: {branch.etaMin} mins</span>
                  <span>Distance: {branch.distanceKm} km</span>
                </div>
              </div>
              <button 
                onClick={finish} 
                disabled={loading}
                className="mt-8 w-full h-14 rounded-full bg-lime text-ink font-semibold hover:brightness-95 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="size-5 animate-spin" /> : "Confirm & Finish setup"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
