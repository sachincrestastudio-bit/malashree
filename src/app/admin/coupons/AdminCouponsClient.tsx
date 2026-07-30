"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Trash2, Pencil, Ticket, AlertTriangle, X,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Calendar, Percent, IndianRupee, Store,
} from "lucide-react";
import {
  createCoupon, updateCoupon, toggleCouponStatus, deleteCoupon,
} from "@/actions/adminCoupon";

interface Kitchen {
  id: string;
  name: string;
  code: string;
}

interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  expiry: string;
  expiryFormatted: string;
  usageLimit?: number;
  usedCount: number;
  kitchenRestriction: string[];
  kitchenNames: string[];
  status: "active" | "expired" | "disabled";
  isExpired: boolean;
}

interface Props {
  coupons: CouponItem[];
  kitchens: Kitchen[];
}

const EMPTY_FORM = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  minimumOrder: "0",
  maximumDiscount: "",
  expiry: "",
  usageLimit: "",
  kitchenRestriction: [] as string[],
  status: "active" as "active" | "disabled",
};

export default function AdminCouponsClient({ coupons, kitchens }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CouponItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        c.kitchenNames.some((n) => n.toLowerCase().includes(q));

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "expired" ? c.isExpired : c.status === filterStatus);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, filterStatus]);

  const openAdd = () => {
    setEditTarget(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const defaultExpiry = tomorrow.toISOString().split("T")[0];

    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "20",
      minimumOrder: "0",
      maximumDiscount: "",
      expiry: defaultExpiry,
      usageLimit: "",
      kitchenRestriction: [],
      status: "active",
    });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (c: CouponItem) => {
    setEditTarget(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minimumOrder: String(c.minimumOrder),
      maximumDiscount: c.maximumDiscount ? String(c.maximumDiscount) : "",
      expiry: c.expiry ? new Date(c.expiry).toISOString().split("T")[0] : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      kitchenRestriction: c.kitchenRestriction || [],
      status: c.status === "expired" ? "disabled" : c.status,
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError(null);
    setEditTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : 0,
      maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    };

    const res = editTarget
      ? await updateCoupon(editTarget.id, payload)
      : await createCoupon(payload);

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    closeForm();
    router.refresh();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    await toggleCouponStatus(id, nextStatus);
    setTogglingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    setDeletingId(id);
    await deleteCoupon(id);
    setDeletingId(null);
    router.refresh();
  };

  const toggleKitchenSelection = (kId: string) => {
    setForm((prev) => {
      const exists = prev.kitchenRestriction.includes(kId);
      const next = exists
        ? prev.kitchenRestriction.filter((x) => x !== kId)
        : [...prev.kitchenRestriction, kId];
      return { ...prev, kitchenRestriction: next };
    });
  };

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Discount Promotions
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Coupon <span className="italic text-emerald">Codes</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {coupons.length} coupon rules registered · manage discount promo codes and limits.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto"
        >
          Create Coupon
          <span className="size-8 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform">
            <Plus className="size-3.5" />
          </span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
          <input
            type="text"
            placeholder="Search coupon code or kitchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="disabled">Disabled Only</option>
          <option value="expired">Expired Only</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Coupon Code", "Discount", "Limits & Min Order", "Scope", "Expiry", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <Ticket className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No coupons found.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      Click Create Coupon above to add your first promotion
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/60 transition-colors">
                    {/* Code */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-ink text-sm flex items-center gap-2">
                        <Ticket className="size-4 text-lime-deep" />
                        <span className="bg-ink/5 px-2 py-0.5 border border-ink/10">{c.code}</span>
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="px-5 py-4">
                      <div className="font-display text-lg text-ink font-bold flex items-center gap-1">
                        {c.discountType === "percentage" ? (
                          <>
                            {c.discountValue}% OFF
                            <Percent className="size-3.5 text-olive" />
                          </>
                        ) : (
                          <>
                            ₹{c.discountValue} OFF
                            <IndianRupee className="size-3.5 text-olive" />
                          </>
                        )}
                      </div>
                      {c.maximumDiscount && c.discountType === "percentage" && (
                        <div className="text-[9px] font-mono text-olive mt-0.5">
                          Cap: ₹{c.maximumDiscount}
                        </div>
                      )}
                    </td>

                    {/* Limits */}
                    <td className="px-5 py-4 text-xs text-olive-dark">
                      <div>Min Order: ₹{c.minimumOrder}</div>
                      {c.usageLimit ? (
                        <div className="text-[10px] font-mono text-olive mt-0.5">
                          Used: {c.usedCount} / {c.usageLimit}
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-olive mt-0.5">Unlimited Uses</div>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="px-5 py-4 text-xs text-olive-dark">
                      {c.kitchenNames.length === 0 ? (
                        <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-cream border border-ink/10 text-olive-dark">
                          All Kitchens
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {c.kitchenNames.map((k) => (
                            <span key={k} className="px-2 py-0.5 text-[9px] font-mono uppercase bg-lime/10 border border-lime/30 text-lime-deep">
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-4 text-xs text-olive-dark font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-olive/60" />
                        {c.expiryFormatted}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {c.isExpired ? (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-amber-200 text-amber-700 bg-amber-50 flex items-center gap-1 w-fit">
                          <AlertCircle className="size-3" /> Expired
                        </span>
                      ) : c.status === "active" ? (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/40 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="size-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-red-200 text-red-700 bg-red-50 flex items-center gap-1 w-fit">
                          <AlertCircle className="size-3" /> Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          disabled={togglingId === c.id || c.isExpired}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition disabled:opacity-30"
                          title="Toggle Active / Disabled"
                        >
                          {c.status === "active" ? (
                            <ToggleRight className="size-4 text-lime-deep" />
                          ) : (
                            <ToggleLeft className="size-4 text-olive/40" />
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(c)}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={deletingId === c.id}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive/50 hover:text-red-600 transition disabled:opacity-30"
                        >
                          <Trash2 className="size-3" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-cream border-2 border-ink w-full max-w-lg mx-4">
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  {editTarget ? "Edit Entry · Coupon Code" : "New Entry · Coupon Code"}
                </div>
                <h3 className="font-display text-2xl text-ink">
                  {editTarget ? `Edit — ${editTarget.code}` : "Create Coupon"}
                </h3>
              </div>
              <button onClick={closeForm} className="text-olive hover:text-ink transition">
                <X className="size-5" />
              </button>
            </div>

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
                    Coupon Code *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="MALASHREE20"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
                  >
                    <option value="percentage">Percentage (% off)</option>
                    <option value="fixed">Fixed Amount (₹ off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Discount Value *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder={form.discountType === "percentage" ? "20" : "100"}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="300"
                    value={form.minimumOrder}
                    onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={form.discountType === "percentage" ? "100 (optional)" : "N/A"}
                    disabled={form.discountType === "fixed"}
                    value={form.maximumDiscount}
                    onChange={(e) => setForm({ ...form, maximumDiscount: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Expiry Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500 (Optional)"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
                  />
                </div>

                {/* Kitchen Restrictions */}
                <div className="col-span-2">
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                    Kitchen Branch Scope (Leave unselected for ALL kitchens)
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {kitchens.map((k) => {
                      const selected = form.kitchenRestriction.includes(k.id);
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => toggleKitchenSelection(k.id)}
                          className={`px-3 py-1.5 text-xs font-mono border transition ${
                            selected
                              ? "bg-ink border-ink text-lime"
                              : "border-ink/10 text-olive-dark hover:border-ink"
                          }`}
                        >
                          <Store className="size-3 inline mr-1.5" />
                          {k.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50"
                >
                  {loading ? "Saving…" : editTarget ? "Save Changes" : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2"
                >
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
