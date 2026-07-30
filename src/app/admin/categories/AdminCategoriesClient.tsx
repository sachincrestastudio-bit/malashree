"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Trash2, Pencil, Tags, AlertTriangle, X, Store, UtensilsCrossed,
} from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/adminCategory";

interface Kitchen {
  id: string;
  name: string;
  code: string;
}

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  kitchenId: string;
  kitchenName: string;
  kitchenCode: string;
  dishCount: number;
  createdAt: string;
}

interface Props {
  categories: CategoryItem[];
  kitchens: Kitchen[];
}

const EMPTY_FORM = {
  name: "",
  description: "",
  kitchenId: "",
};

export default function AdminCategoriesClient({ categories, kitchens }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterKitchen, setFilterKitchen] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.kitchenName.toLowerCase().includes(q);

      const matchesKitchen = filterKitchen === "all" || c.kitchenId === filterKitchen;
      return matchesSearch && matchesKitchen;
    });
  }, [categories, search, filterKitchen]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      name: "",
      description: "",
      kitchenId: kitchens[0]?.id || "",
    });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      kitchenId: cat.kitchenId,
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
      ? await updateCategory(editTarget.id, form)
      : await createCategory(form);

    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    closeForm();
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setDeletingId(id);
    const res = await deleteCategory(id);
    setDeletingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Masthead */}
      <div className="border-b-2 border-ink pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-2">
            <span className="h-px w-8 bg-lime" />
            Chapter · Category Registry
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Menu <span className="italic text-emerald">Categories</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {categories.length} category entries registered across {kitchens.length} kitchen branches.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto"
        >
          Add Category
          <span className="size-8 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform">
            <Plus className="size-3.5" />
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
          <input
            type="text"
            placeholder="Search category or kitchen…"
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
          <option value="all">All Kitchens</option>
          {kitchens.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Category Name", "Kitchen Branch", "Description", "Dishes Attached", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Tags className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">No categories found.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      Try resetting search or add a category above
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink text-sm flex items-center gap-2">
                        <Tags className="size-3.5 text-lime-deep" />
                        {c.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-olive-dark font-mono flex items-center gap-1.5">
                        <Store className="size-3 text-olive/60" />
                        {c.kitchenName}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-olive-dark max-w-xs truncate">
                      {c.description || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink font-bold">
                      <div className="inline-flex items-center gap-1 bg-lime/10 border border-lime/30 px-2.5 py-1 text-lime-deep">
                        <UtensilsCrossed className="size-3" />
                        {c.dishCount} dish{c.dishCount !== 1 ? "es" : ""}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(c)}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-olive/50 hover:text-red-600 transition disabled:opacity-30"
                          title="Delete category"
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

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-cream border-2 border-ink w-full max-w-md mx-4">
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  {editTarget ? "Edit Entry · Category" : "New Entry · Category"}
                </div>
                <h3 className="font-display text-2xl text-ink">
                  {editTarget ? `Edit — ${editTarget.name}` : "Add Category"}
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
                  Category Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Mains, Starters, Breads…"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                />
              </div>

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
                  Description
                </label>
                <textarea
                  placeholder="Freshly prepared cottage cheese dishes, rich curries…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50"
                >
                  {loading ? "Saving…" : editTarget ? "Save Changes" : "Create Category"}
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
