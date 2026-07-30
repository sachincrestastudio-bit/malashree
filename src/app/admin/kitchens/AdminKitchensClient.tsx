"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Store, AlertTriangle, X, Pencil, Trash2,
  CheckCircle2, Clock, AlertCircle, UtensilsCrossed, MapPin, Timer,
} from "lucide-react";
import {
  createKitchen, updateKitchen, updateKitchenStatus, deleteKitchen,
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
            {kitchens.length} branch{kitchens.length !== 1 ? "es" : ""} in the network · manage locations and status.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto"
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
              <div key={k.id} className="bg-white border border-ink/10 flex flex-col">
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
                          className={`flex-1 py-1.5 text-[9px] font-mono tracking-widest uppercase border transition disabled:cursor-default
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
                <div className="px-5 py-3 border-t border-ink/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-olive">Since {k.createdAt}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(k)}
                      className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(k.id, k.name)}
                      disabled={deletingId === k.id}
                      className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-olive/50 hover:text-red-600 transition disabled:opacity-30"
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
              <button onClick={closeForm} className="text-olive hover:text-ink transition">
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
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50">
                  {loading ? "Saving…" : editTarget ? "Save Changes" : "Create Kitchen"}
                </button>
                <button type="button" onClick={closeForm}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2">
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
