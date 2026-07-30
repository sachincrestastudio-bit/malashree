"use client";

import { useState } from "react";
import { createAdminUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus, AlertTriangle, CheckCircle, X } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
}

export default function AdminAccountsClient({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await createAdminUser(form);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", password: "", phone: "" });
    setLoading(false);
    setTimeout(() => {
      setShowForm(false);
      setSuccess(false);
      router.refresh();
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Admin Accounts
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Admin <span className="italic text-emerald">Accounts</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            Manage administrator access to the Malashree Control Centre.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); setSuccess(false); }}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition"
        >
          New Admin
          <span className="size-8 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform">
            <Plus className="size-3.5" />
          </span>
        </button>
      </div>

      {/* Create Admin Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <div className="bg-cream border-2 border-ink w-full max-w-lg mx-4 relative">
            {/* Modal header */}
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  New Entry · Admin Portal
                </div>
                <h3 className="font-display text-2xl text-ink">Create Admin Account</h3>
              </div>
              <button
                onClick={() => { setShowForm(false); setError(null); setSuccess(false); }}
                className="text-olive hover:text-ink transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-4 border border-red-300 bg-red-50 text-xs text-red-700">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 p-4 border border-lime/40 bg-lime/10 text-xs text-lime-deep">
                  <CheckCircle className="size-4 shrink-0" />
                  <span className="font-medium font-mono tracking-wide">Admin account created successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Riya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="admin@malashree.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white border border-ink/10">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-lime-deep" />
          <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-olive-dark">
            {admins.length} Admin{admins.length !== 1 ? "s" : ""} on record
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Name", "Email", "Phone", "Created", "Last Login"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-olive-dark italic font-light text-sm">
                    No admin accounts found. Create one above.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 border border-lime flex items-center justify-center text-lime-deep font-bold text-xs font-display">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-ink text-sm font-medium">{admin.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-olive-dark">{admin.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-olive-dark">{admin.phone}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-olive">{admin.createdAt}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-ink/10 text-olive-dark">
                        {admin.lastLogin}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
