"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { loginUser } from "@/actions/auth";
import { getCurrentUser } from "@/actions/user";
import { mergeGuestCart } from "@/actions/cart";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const nav = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const steps = [
    {
      key: "email" as const,
      label: "Enter your email address",
      stepNumber: "01",
      placeholder: "admin@malashree.in or your email",
      type: "email",
    },
    {
      key: "password" as const,
      label: "Enter your password",
      stepNumber: "02",
      placeholder: "••••••••",
      type: "password",
    },
  ];

  const handleNext = () => {
    setError(null);
    if (step === 0) {
      if (!data.email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!data.password) {
        setError("Please enter your password.");
        return;
      }
      finish();
    }
  };

  const finish = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: data.email.trim(),
        password: data.password,
      };

      const res = await loginUser(payload);

      if (!res || res.error) {
        setError(res?.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Merge guest cart to DB
      const store = useStore.getState();
      const cart = store.cart;

      try {
        const merged = await mergeGuestCart(cart);
        if (merged) {
          store.setCartTotals(merged.totals);
          store.setCart(merged.items);
        }
      } catch (cartErr) {
        console.error("Cart merge notice:", cartErr);
      }

      // Fetch user profile
      try {
        const user = await getCurrentUser();
        if (user) {
          store.setProfile({
            name: user.name,
            phone: user.phone,
            address: user.address || "",
            branchId: store.branchId,
            email: user.email,
            role: user.role,
            joinedDate: user.joinedDate,
          });
        }
      } catch (userErr) {
        console.error("User profile fetch notice:", userErr);
      }

      if (res.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/profile";
      }
    } catch (err: any) {
      console.error("Login Submission Error:", err);
      setError(err?.message || "An unexpected error occurred during authentication.");
      setLoading(false);
    }
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-[#fbf9f4] pb-32 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e6e2d8] shadow-2xs space-y-6">
          <div className="text-center space-y-1">
            <span className="text-2xl font-black italic tracking-tighter text-[#064e3b]">
              malashree
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0d261e] tracking-tight mt-1">
              Sign In to your account
            </h1>
            <p className="text-xs text-[#52635c] font-medium">
              Step {current.stepNumber} of 02 · {step === 0 ? "Email Address" : "Password"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-[#fbf9f4] rounded-full overflow-hidden border border-[#e6e2d8]">
            <motion.div
              className="h-full bg-[#064e3b]"
              initial={false}
              animate={{ width: loading ? "100%" : `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex gap-2.5 items-center font-bold"
            >
              <AlertTriangle className="size-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-3"
              >
                <RefreshCw className="size-8 animate-spin mx-auto text-[#064e3b]" />
                <h2 className="text-lg font-black text-[#0d261e]">Signing in...</h2>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1.5">
                    {current.label}
                  </label>
                  <input
                    autoFocus
                    type={current.type}
                    value={data[current.key]}
                    onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && data[current.key]) {
                        handleNext();
                      }
                    }}
                    placeholder={current.placeholder}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] focus:border-[#064e3b] focus:bg-white outline-none text-sm text-[#0d261e] transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {step === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep(0);
                      }}
                      className="h-11 px-4 rounded-xl border border-[#e6e2d8] text-[#0d261e] font-bold text-xs hover:bg-[#fbf9f4] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!data[current.key]}
                    className="h-11 px-6 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#0a5c46] disabled:opacity-50 transition shadow-xs cursor-pointer ml-auto border border-[#d4af37]/30"
                  >
                    <span>{step === 0 ? "Continue" : "Sign In"}</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#52635c] font-medium">
            <span>Don't have an account?</span>
            <Link
              href="/register"
              className="text-[#064e3b] font-black hover:text-[#d4af37] underline"
            >
              Create Account →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
