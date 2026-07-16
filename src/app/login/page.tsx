
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { loginUser } from "@/actions/auth";

export default function Login() {
  const nav = useRouter();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState({ 
    email: "",
    password: "",
  });

  const steps = [
    { key: "email", label: "Your email?", placeholder: "riya@example.com", type: "email" },
    { key: "password", label: "Your password?", placeholder: "••••••••", type: "password" },
  ] as const;

  const finish = async () => {
    setLoading(true);
    setError(null);
    
    const res = await loginUser(data);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      setStep(0); // Reset to email step on error
      return;
    }

    nav.push("/profile");
  };

  const isLast = step === steps.length;
  const current = steps[step];

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-olive mb-3">Step {Math.min(step + 1, steps.length)} of {steps.length}</div>
        <div className="h-1 bg-ink/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-lime" animate={{ width: `${((step + 1) / (steps.length)) * 100}%` }} />
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
                    if (step === steps.length - 1) {
                       setStep(step + 1);
                       finish();
                    } else {
                       setStep(step + 1);
                    }
                  }
                }}
                placeholder={current.placeholder}
                className="mt-8 w-full h-16 px-6 rounded-full bg-white border-2 border-ink/10 focus:border-ink outline-none text-lg"
              />
              <button
                onClick={() => {
                  if (step === steps.length - 1) {
                    setStep(step + 1);
                    finish();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={!(data as Record<string, string>)[current.key]}
                className="mt-6 h-14 px-8 rounded-full bg-ink text-cream font-medium flex items-center gap-2 disabled:opacity-40 hover:bg-ink/90 transition"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="loading" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="mt-12 text-center">
               <RefreshCw className="size-10 animate-spin mx-auto text-lime" />
               <h1 className="font-display text-4xl mt-6">authenticating...</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
