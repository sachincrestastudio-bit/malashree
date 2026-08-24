"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { registerUser } from "@/actions/auth";
import { getCurrentUser } from "@/actions/user";
import { setAssignedKitchen } from "@/actions/kitchen";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const setProfile = useStore((s) => s.setProfile);
  const setBranch = useStore((s) => s.setBranch);
  const branchId = useStore((s) => s.branchId);
  const nav = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      branchId: branchId || "pimple-saudagar",
    };

    const res = await registerUser(payload);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // Fetch user and set profile in store
    const user = await getCurrentUser();
    if (user) {
      setProfile({
        name: user.name,
        phone: user.phone,
        address: user.address || formData.address,
        branchId: payload.branchId,
        email: user.email,
        role: user.role,
        joinedDate: user.joinedDate,
      });
    }

    await setAssignedKitchen(payload.branchId);
    setBranch(payload.branchId);

    if (res.role === "admin") {
      nav.push("/admin/dashboard");
    } else {
      nav.push("/profile");
    }
  };

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
              Create your account
            </h1>
            <p className="text-xs text-[#52635c] font-medium">
              Join Malashree for instant food ordering & member dining privileges
            </p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Riya Sharma"
                required
                className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:border-[#064e3b] focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="riya@example.com"
                required
                className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:border-[#064e3b] focus:bg-white outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:border-[#064e3b] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:border-[#064e3b] focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d261e] mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat 401, Pimple Saudagar, Pune"
                className="w-full h-11 px-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:border-[#064e3b] focus:bg-white outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.name || !formData.email || !formData.password}
              className="w-full h-12 mt-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0a5c46] disabled:opacity-50 transition shadow-xs cursor-pointer border border-[#d4af37]/30"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#52635c] font-medium">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="text-[#064e3b] font-black hover:text-[#d4af37] underline"
            >
              Log in →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
