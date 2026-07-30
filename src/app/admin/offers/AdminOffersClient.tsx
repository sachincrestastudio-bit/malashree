"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Trash2, Pencil, Gift, AlertTriangle, X,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Store, Tag,
} from "lucide-react";
import {
  createOffer, updateOffer, toggleOfferStatus, deleteOffer,
} from "@/actions/adminOffer";

interface Kitchen {
  id: string;
  name: string;
  code: string;
}

interface OfferItem {
  id: string;
  kitchenId: string;
  kitchenName: string;
  code: string;
  title: string;
  sub: string;
  active: boolean;
  createdAt: string;
}

interface Props {
  offers: OfferItem[];
  kitchens: Kitchen[];
}

const EMPTY_FORM = {
  kitchenId: "",
  code: "",
  title: "",
  sub: "",
  active: true,
};

export default function AdminOffersClient({ offers, kitchens }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<OfferItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterKitchen, setFilterKitchen] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        o.title.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.sub.toLowerCase().includes(q) ||
        o.kitchenName.toLowerCase().includes(q);

      const matchesKitchen = filterKitchen === "all" || o.kitchenId === filterKitchen;

      return matchesSearch && matchesKitchen;
    });
  }, [offers, search, filterKitchen]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      kitchenId: kitchens[0]?.id || "",
      code: "WELCOME20",
      title: "20% OFF ON FIRST ORDER",
      sub: "Valid on minimum order of ₹300 across all vegetarian dishes.",
      active: true,
    });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (o: OfferItem) => {
    setEditTarget(o);
    setForm({
      kitchenId: o.kitchenId,
      code: o.code,
      title: o.title,
      sub: o.sub,
      active: o.active,
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

    const res = editTarget
      ? await updateOffer(editTarget.id, form)
      : await createOffer(form);

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    closeForm();
    router.refresh();
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    await toggleOfferStatus(id, !currentActive);
    setTogglingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete offer "${title}"?`)) return;
    setDeletingId(id);
    await deleteOffer(id);
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
            Chapter · Special Promotions
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Kitchen <span className="italic text-emerald">Offers</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {offers.length} offers active across {kitchens.length} kitchen branches.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto"
        >
          Create Offer
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
            placeholder="Search offer title, promo code, or kitchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
          />
        </div>
        <select
          value={filterKitchen}
          onChange={(e) => setFilterKitchen(e.target.value)}
          className="h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono"
        >
          <option value="all">All Kitchen Branches</option>
          {kitchens.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Promo Code", "Offer Title", "Details / Subtitle", "Kitchen Branch", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <Gift className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No offers found.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      Click Create Offer above to launch a promotion
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/60 transition-colors">
                    {/* Code Badge */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-ink text-xs flex items-center gap-2">
                        <Tag className="size-3.5 text-lime-deep" />
                        <span className="bg-lime/20 border border-lime/40 px-2.5 py-1 text-lime-deep tracking-wider uppercase">
                          {o.code}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4 font-display text-base text-ink font-bold max-w-xs">
                      {o.title}
                    </td>

                    {/* Subtitle */}
                    <td className="px-5 py-4 text-xs text-olive-dark max-w-sm">
                      {o.sub || "—"}
                    </td>

                    {/* Kitchen Branch */}
                    <td className="px-5 py-4">
                      <div className="text-xs text-olive-dark font-mono flex items-center gap-1.5">
                        <Store className="size-3 text-olive/60" />
                        {o.kitchenName}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {o.active ? (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-lime/40 text-lime-deep bg-lime/10 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="size-3" /> Live
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase border border-red-200 text-red-700 bg-red-50 flex items-center gap-1 w-fit">
                          <AlertCircle className="size-3" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(o.id, o.active)}
                          disabled={togglingId === o.id}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition disabled:opacity-30"
                          title="Toggle Live / Inactive"
                        >
                          {o.active ? (
                            <ToggleRight className="size-4 text-lime-deep" />
                          ) : (
                            <ToggleLeft className="size-4 text-olive/40" />
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(o)}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(o.id, o.title)}
                          disabled={deletingId === o.id}
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
          <div className="bg-cream border-2 border-ink w-full max-w-md mx-4">
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  {editTarget ? "Edit Entry · Offer Banner" : "New Entry · Offer Banner"}
                </div>
                <h3 className="font-display text-2xl text-ink">
                  {editTarget ? `Edit — ${editTarget.code}` : "Create Kitchen Offer"}
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

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Kitchen Branch *
                </label>
                <select
                  required
                  value={form.kitchenId}
                  onChange={(e) => setForm({ ...form, kitchenId: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                >
                  <option value="">Select kitchen branch…</option>
                  {kitchens.map((k) => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Promo Badge Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder="WELCOME20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Headline Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="20% OFF ON FIRST ORDER"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">
                  Terms / Subtitle
                </label>
                <textarea
                  placeholder="Valid on orders above ₹300. Max discount ₹100."
                  value={form.sub}
                  onChange={(e) => setForm({ ...form, sub: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="size-4 text-emerald rounded border-ink/20 focus:ring-emerald"
                />
                <label htmlFor="activeCheck" className="text-xs font-mono text-ink cursor-pointer">
                  Activate Offer Immediately
                </label>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50"
                >
                  {loading ? "Saving…" : editTarget ? "Save Changes" : "Create Offer"}
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
