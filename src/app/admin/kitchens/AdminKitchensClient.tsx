"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Store, AlertTriangle, X, Pencil, Trash2,
  CheckCircle2, Clock, AlertCircle, MapPin, LayoutDashboard,
  KeyRound, Lock, Mail, Eye, EyeOff, UserCheck, ShieldCheck,
} from "lucide-react";
import {
  createKitchen, updateKitchen, updateKitchenStatus, deleteKitchen, setBranchCredentials,
} from "@/actions/adminKitchen";

interface Kitchen {
  id: string;
  name: string;
  code: string;
  address: string;
  status: "active" | "inactive" | "maintenance";
  deliveryRadius: number;
  preparationTime: number;
  latitude: number;
  longitude: number;
  menuItemCount: number;
  manager: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  createdAt: string;
}

const STATUS_META = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    cls: "text-lime-deep border-lime/40 bg-lime/10",
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircle,
    cls: "text-red-700 border-red-200 bg-red-50",
  },
  maintenance: {
    label: "Maintenance",
    icon: Clock,
    cls: "text-amber-700 border-amber-200 bg-amber-50",
  },
};

const EMPTY_FORM = {
  name: "", code: "", address: "",
  latitude: "", longitude: "",
  deliveryRadius: "5000", preparationTime: "30",
};

type FormData = typeof EMPTY_FORM;

export default function AdminKitchensClient({ kitchens }: { kitchens: Kitchen[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Kitchen | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Credentials Modal State
  const [credTarget, setCredTarget] = useState<Kitchen | null>(null);
  const [credForm, setCredForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (k: Kitchen) => {
    setEditTarget(k);
    setForm({
      name: k.name,
      code: k.code,
      address: k.address,
      latitude: String(k.latitude),
      longitude: String(k.longitude),
      deliveryRadius: String(k.deliveryRadius),
      preparationTime: String(k.preparationTime),
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setError(null); setEditTarget(null); };

  const openCredentialsModal = (k: Kitchen) => {
    setCredTarget(k);
    setCredForm({
      email: k.manager?.email || "",
      password: "",
      name: k.manager?.name || `${k.name} Manager`,
      phone: k.manager?.phone || "",
    });
    setCredError(null);
    setShowCredPassword(false);
  };

  const closeCredentialsModal = () => {
    setCredTarget(null);
    setCredError(null);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credTarget) return;

    if (!credForm.email.trim()) {
      setCredError("Please enter a valid email address.");
      return;
    }

    if (!credTarget.manager && (!credForm.password || credForm.password.length < 6)) {
      setCredError("Password is required and must be at least 6 characters long.");
      return;
    }

    if (credForm.password && credForm.password.length < 6) {
      setCredError("Password must be at least 6 characters long.");
      return;
    }

    setCredLoading(true);
    setCredError(null);

    const res = await setBranchCredentials(credTarget.id, {
      email: credForm.email.trim(),
      password: credForm.password || undefined,
      name: credForm.name.trim() || undefined,
      phone: credForm.phone.trim() || undefined,
    });

    setCredLoading(false);

    if (res.error) {
      setCredError(res.error);
      return;
    }

    showNotification(`Dashboard credentials updated for "${credTarget.name}" (${credForm.email.trim()})`);
    closeCredentialsModal();
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = editTarget
      ? await updateKitchen(editTarget.id, form)
      : await createKitchen(form);

    setLoading(false);
    if (res.error) { setError(res.error); return; }
    closeForm();
    router.refresh();
  };

  const handleStatusChange = async (id: string, status: Kitchen["status"]) => {
    setUpdatingId(id);
    await updateKitchenStatus(id, status);
    setUpdatingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from customers.`)) return;
    setDeletingId(id);
    await deleteKitchen(id);
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#064e3b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#d4af37]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-[#d4af37] shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Kitchen Branches
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Kitchen <span className="italic text-emerald">Branches</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {kitchens.length} branch{kitchens.length !== 1 ? "es" : ""} in the network · manage locations, status, and dashboard credentials.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto cursor-pointer"
        >
          Add Kitchen
          <span className="size-8 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform">
            <Plus className="size-3.5" />
          </span>
        </button>
      </div>

      {/* Kitchen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {kitchens.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-ink/10 bg-white">
            <Store className="h-10 w-10 text-olive/20 mx-auto mb-3" />
            <p className="font-display italic text-xl text-ink">No kitchens on record.</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
              Add your first branch above
            </p>
          </div>
        ) : (
          kitchens.map((k) => {
            const S = STATUS_META[k.status];
            const Icon = S.icon;
            return (
              <div key={k.id} className="bg-white border border-ink/10 flex flex-col shadow-xs">
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 border-b border-ink/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 border border-lime/30 flex items-center justify-center text-lime-deep font-display font-bold text-lg shrink-0">
                        {k.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-ink font-semibold text-sm leading-tight">{k.name}</div>
                        <div className="text-[9px] font-mono tracking-[0.24em] uppercase text-olive mt-0.5">
                          Code: {k.code}
                        </div>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span className={`shrink-0 px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border flex items-center gap-1.5 ${S.cls}`}>
                      <Icon className="size-3" />
                      {S.label}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-3 flex-1">
                  {k.address && (
                    <div className="flex items-start gap-2 text-xs text-olive-dark">
                      <MapPin className="size-3.5 mt-0.5 shrink-0 text-olive/50" />
                      <span className="leading-snug">{k.address}</span>
                    </div>
                  )}

                  {/* Dedicated Dashboard Login Info Box */}
                  <div className="bg-[#fbf9f4] border border-[#e6e2d8] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase font-bold text-[#064e3b]">
                        <KeyRound className="size-3 text-[#d4af37]" />
                        <span>Branch Dashboard Login</span>
                      </div>
                      <button
                        onClick={() => openCredentialsModal(k)}
                        className="text-[9px] font-mono tracking-wider uppercase font-bold text-[#064e3b] hover:text-[#d4af37] bg-white px-2 py-0.5 rounded border border-[#e6e2d8] hover:border-[#064e3b] transition cursor-pointer"
                      >
                        {k.manager?.email ? "Change" : "Set Email & Pass"}
                      </button>
                    </div>

                    {k.manager?.email ? (
                      <div className="flex items-center justify-between text-xs font-semibold text-[#0d261e]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="size-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{k.manager.email}</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                        <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                        <span>No login email assigned yet</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center border border-ink/5 py-2">
                      <div className="font-display text-xl text-ink">{k.menuItemCount}</div>
                      <div className="text-[8px] font-mono tracking-widest uppercase text-olive mt-0.5">Dishes</div>
                    </div>
                    <div className="text-center border border-ink/5 py-2">
                      <div className="font-display text-xl text-ink">{(k.deliveryRadius / 1000).toFixed(1)}</div>
                      <div className="text-[8px] font-mono tracking-widest uppercase text-olive mt-0.5">km Radius</div>
                    </div>
                    <div className="text-center border border-ink/5 py-2">
                      <div className="font-display text-xl text-ink">{k.preparationTime}</div>
                      <div className="text-[8px] font-mono tracking-widest uppercase text-olive mt-0.5">Min Prep</div>
                    </div>
                  </div>

                  {/* Status changer */}
                  <div>
                    <div className="text-[8px] font-mono tracking-[0.24em] uppercase text-olive mb-1.5">Change Status</div>
                    <div className="flex gap-1.5">
                      {(["active", "inactive", "maintenance"] as const).map((s) => (
                        <button
                          key={s}
                          disabled={k.status === s || updatingId === k.id}
                          onClick={() => handleStatusChange(k.id, s)}
                          className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest uppercase border transition disabled:cursor-default cursor-pointer
                            ${k.status === s
                              ? "bg-ink border-ink text-lime"
                              : "border-ink/10 text-olive hover:border-ink hover:text-ink"
                            }`}
                        >
                          {s === "active" ? "Active" : s === "inactive" ? "Off" : "Maint."}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 border-t border-ink/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-cream/30">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/kitchen/dashboard?kitchenId=${k.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#064e3b] text-[#d4af37] text-[10px] font-mono tracking-widest uppercase font-bold hover:bg-[#0a5c46] transition shadow-xs self-start"
                    >
                      <LayoutDashboard className="size-3" />
                      <span>Open Dashboard</span>
                    </Link>

                    <button
                      onClick={() => openCredentialsModal(k)}
                      title="Set Login Credentials for this branch"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#064e3b]/30 bg-white text-[#064e3b] text-[10px] font-mono tracking-wider uppercase font-bold hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <KeyRound className="size-3" />
                      <span>Credentials</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() => openEdit(k)}
                      className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition cursor-pointer"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(k.id, k.name)}
                      disabled={deletingId === k.id}
                      className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-olive/50 hover:text-red-600 transition disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="size-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* Set Branch Dashboard Credentials Modal */}
      {/* ========================================================================= */}
      {credTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#e6e2d8] space-y-6 relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#e6e2d8]">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 text-[#064e3b] grid place-items-center">
                  <KeyRound className="size-5 text-[#064e3b]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0d261e] tracking-tight">
                    Branch Dashboard Access
                  </h3>
                  <p className="text-xs text-[#52635c] font-medium">
                    Set dedicated login credentials for <span className="font-bold text-[#064e3b]">{credTarget.name}</span> ({credTarget.code})
                  </p>
                </div>
              </div>
              <button
                onClick={closeCredentialsModal}
                className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0d261e] grid place-items-center cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Error Banner */}
            {credError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{credError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1.5">
                  Dashboard Login Email *
                </label>
                <div className="relative">
                  <Mail className="size-4 text-[#52635c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    placeholder="branch.manager@malashree.in"
                    value={credForm.email}
                    onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] focus:border-[#064e3b] focus:bg-white outline-none text-xs font-medium text-[#0d261e]"
                  />
                </div>
                <p className="text-[10px] text-[#52635c] mt-1">
                  The branch manager will use this email address to log in to their dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1.5">
                  Password {credTarget.manager ? <span className="font-normal text-[#52635c]">(Leave blank to keep existing password)</span> : "*"}
                </label>
                <div className="relative">
                  <Lock className="size-4 text-[#52635c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCredPassword ? "text" : "password"}
                    required={!credTarget.manager}
                    placeholder={credTarget.manager ? "Enter new password to reset" : "Minimum 6 characters"}
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                    className="w-full h-11 pl-10 pr-10 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] focus:border-[#064e3b] focus:bg-white outline-none text-xs font-medium text-[#0d261e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredPassword(!showCredPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52635c] hover:text-[#0d261e] cursor-pointer"
                  >
                    {showCredPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1.5">
                    Manager Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={credForm.name}
                    onChange={(e) => setCredForm({ ...credForm, name: e.target.value })}
                    className="w-full h-11 px-3.5 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] focus:border-[#064e3b] focus:bg-white outline-none text-xs font-medium text-[#0d261e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1.5">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={credForm.phone}
                    onChange={(e) => setCredForm({ ...credForm, phone: e.target.value })}
                    className="w-full h-11 px-3.5 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] focus:border-[#064e3b] focus:bg-white outline-none text-xs font-medium text-[#0d261e]"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[11px] text-emerald-900 font-medium">
                <ShieldCheck className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Logging in with these credentials grants access <strong>strictly locked</strong> to the <strong>{credTarget.name}</strong> kitchen dashboard.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#e6e2d8]">
                <button
                  type="button"
                  onClick={closeCredentialsModal}
                  className="px-5 py-2.5 rounded-xl border border-[#e6e2d8] hover:bg-gray-50 text-xs font-bold text-[#52635c] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#0a5c46] text-[#d4af37] text-xs font-black uppercase tracking-wider transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <KeyRound className="size-3.5" />
                  <span>{credLoading ? "Saving..." : "Save Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-cream border-2 border-ink w-full max-w-xl mx-4">
            {/* Modal header */}
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  {editTarget ? "Edit Entry · Kitchen Branch" : "New Entry · Kitchen Branch"}
                </div>
                <h3 className="font-display text-2xl text-ink">
                  {editTarget ? `Edit — ${editTarget.name}` : "Add New Kitchen"}
                </h3>
              </div>
              <button onClick={closeForm} className="text-olive hover:text-ink transition cursor-pointer">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Kitchen Name *
                  </label>
                  <input required type="text" placeholder="Malashree — Connaught Place"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Branch Code * {editTarget && <span className="text-olive/50">(read-only)</span>}
                  </label>
                  <input required type="text" placeholder="CPL" maxLength={10}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    disabled={!!editTarget}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Address
                  </label>
                  <input type="text" placeholder="12A, Inner Circle, CP"
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Latitude *
                  </label>
                  <input required type="number" step="any" placeholder="28.6315"
                    value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Longitude *
                  </label>
                  <input required type="number" step="any" placeholder="77.2167"
                    value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Delivery Radius (metres)
                  </label>
                  <input type="number" min="500" step="100" placeholder="5000"
                    value={form.deliveryRadius} onChange={(e) => setForm({ ...form, deliveryRadius: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Prep Time (minutes)
                  </label>
                  <input type="number" min="5" step="5" placeholder="30"
                    value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button type="submit" disabled={loading}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50 cursor-pointer">
                  {loading ? "Saving…" : editTarget ? "Save Changes" : "Create Kitchen"}
                </button>
                <button type="button" onClick={closeForm}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2 cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

