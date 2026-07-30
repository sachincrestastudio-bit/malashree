"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Trash2, ToggleLeft, ToggleRight, UtensilsCrossed, AlertTriangle, X, ImagePlus, Loader2,
} from "lucide-react";
import { addMenuItem, deleteMenuItem, updateMenuItemAvailability } from "@/actions/adminMenu";
import { uploadToCloudinary } from "@/utils/client/cloudinary";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
  tag: string;
  kitchenName: string;
  categoryName: string;
  kitchenId: string;
  categoryId: string;
}

interface Kitchen { id: string; name: string; }
interface Category { id: string; name: string; kitchenId: string; }

interface Props {
  items: MenuItem[];
  kitchens: Kitchen[];
  categories: Category[];
}

const EMPTY_FORM = {
  name: "", description: "", price: "", kitchenId: "", categoryId: "",
  isVeg: true, tags: "", images: "",
};


export default function AdminMenuClient({ items, kitchens, categories }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterKitchen, setFilterKitchen] = useState("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter categories to the selected kitchen
  const filteredCategories = useMemo(
    () => (form.kitchenId ? categories.filter((c) => c.kitchenId === form.kitchenId) : categories),
    [form.kitchenId, categories]
  );

  // Filter items for table display
  const displayItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchesKitchen = filterKitchen === "all" || item.kitchenId === filterKitchen;
      return matchesSearch && matchesKitchen;
    });
  }, [items, search, filterKitchen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl = form.images;

    // Upload to Cloudinary if a file was selected
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (err: any) {
        setError(err.message || "Image upload failed.");
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const res = await addMenuItem({ ...form, price: Number(form.price), isVeg: form.isVeg, images: imageUrl });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    router.refresh();
  };

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    await updateMenuItemAvailability(id, !current);
    setTogglingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this dish from the register?")) return;
    setDeletingId(id);
    await deleteMenuItem(id);
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
            Chapter · Menu Catalog
          </div>
          <h2 className="font-display text-4xl text-ink leading-[0.95]">
            Menu <span className="italic text-emerald">Catalog</span>
          </h2>
          <p className="text-sm text-olive-dark mt-2 italic font-light">
            {items.length} dish{items.length !== 1 ? "es" : ""} across all kitchens · live from the database.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="group h-11 pl-5 pr-2 inline-flex items-center gap-3 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition self-start sm:self-auto"
        >
          Add Dish
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
            placeholder="Search dishes or categories…"
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

      {/* Add Dish Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-cream border-2 border-ink w-full max-w-xl mx-4 relative">
            <div className="px-8 py-5 border-b-2 border-ink flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep mb-1">
                  New Entry · Menu Register
                </div>
                <h3 className="font-display text-2xl text-ink">Add New Dish</h3>
              </div>
              <button onClick={() => { setShowForm(false); setError(null); }} className="text-olive hover:text-ink">
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
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Dish Name *</label>
                  <input required type="text" placeholder="Paneer Lababdar"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Price (₹) *</label>
                  <input required type="number" min="1" placeholder="320"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>


                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Kitchen *</label>
                  <select required value={form.kitchenId}
                    onChange={(e) => setForm({ ...form, kitchenId: e.target.value, categoryId: "" })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink">
                    <option value="">Select kitchen…</option>
                    {kitchens.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Category *</label>
                  <select required value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink"
                    disabled={!form.kitchenId}>
                    <option value="">Select category…</option>
                    {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Description</label>
                  <textarea placeholder="Creamy tomato gravy, hand-churned paneer…"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink resize-none" />
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Tag (e.g. Bestseller)</label>
                  <input type="text" placeholder="Optional"
                    value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-ink/10 focus:border-ink outline-none text-sm text-ink" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[9px] font-mono tracking-[0.28em] uppercase text-olive mb-2">Dish Photo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative w-full aspect-[3/1] overflow-hidden border-2 border-ink/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-ink/70 text-cream rounded-full p-1 hover:bg-ink transition"
                      >
                        <X className="size-3" />
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 bg-ink/50 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="size-6 text-lime animate-spin" />
                          <span className="text-[10px] font-mono tracking-widest uppercase text-cream">Uploading…</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-ink/20 hover:border-lime flex flex-col items-center justify-center gap-2 text-olive hover:text-lime transition group"
                    >
                      <ImagePlus className="size-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-mono tracking-[0.24em] uppercase">Click to upload photo</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button type="submit" disabled={loading}
                  className="h-11 px-8 bg-ink text-lime text-[11px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition disabled:opacity-50">
                  {loading ? "Saving…" : "Add to Register"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(null); }}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white border border-ink/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-ink/10">
              <tr>
                {["Item", "Kitchen", "Category", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[9px] font-mono tracking-[0.24em] uppercase text-olive whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <UtensilsCrossed className="h-10 w-10 text-olive/20 mx-auto mb-3" />
                    <p className="font-display italic text-xl text-ink">Nothing on the register.</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-olive mt-2">
                      {search || filterKitchen !== "all" ? "Try clearing your filters" : "Add the first dish above"}
                    </p>
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name}
                            className="w-10 h-10 object-cover border border-ink/10 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 border border-ink/10 flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="w-4 h-4 text-olive/30" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-ink text-sm">{item.name}</div>
                          {item.tag && (
                            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-lime-deep">
                              {item.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-olive-dark font-mono">{item.kitchenName}</td>
                    <td className="px-5 py-4 text-xs text-olive-dark">{item.categoryName}</td>
                    <td className="px-5 py-4 font-display text-ink">₹{item.price}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(item.id, item.isAvailable)}
                        disabled={togglingId === item.id}
                        className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-olive-dark hover:text-ink transition disabled:opacity-50"
                      >
                        {item.isAvailable ? (
                          <><ToggleRight className="size-5 text-lime-deep" /> Available</>
                        ) : (
                          <><ToggleLeft className="size-5 text-olive/40" /> Sold out</>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-olive/50 hover:text-red-600 transition disabled:opacity-30"
                        title="Remove dish"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
