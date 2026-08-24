"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  AlertTriangle,
  X,
  ImagePlus,
  Loader2,
  Sparkles,
  Store,
  CheckCircle2,
  Save,
  Check,
  Zap,
  Edit,
  ExternalLink,
} from "lucide-react";
import {
  addMasterDish,
  deleteMenuItem,
  updateMenuItemAvailability,
  updateBranchDishOverride,
  bulkEnableAllMasterDishesForBranch,
} from "@/actions/adminMenu";
import { uploadToCloudinary } from "@/utils/client/cloudinary";

interface BranchPriceOverride {
  kitchenId: string;
  price?: number;
  isAvailable?: boolean;
  isEnabled?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  isGlobalMaster?: boolean;
  rating: number;
  tag: string;
  kitchenName: string;
  categoryName: string;
  kitchenId: string;
  categoryId: string;
  branchPricing?: BranchPriceOverride[];
}

interface Kitchen {
  id: string;
  name: string;
  code?: string;
  area?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  items: MenuItem[];
  kitchens: Kitchen[];
  categories: Category[];
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  isVeg: true,
  tags: "",
  images: "",
};

export default function AdminMenuClient({ items, kitchens, categories }: Props) {
  const router = useRouter();

  // Views
  const [activeTab, setActiveTab] = useState<"master" | "branches">("master");
  const [selectedKitchenId, setSelectedKitchenId] = useState<string>(
    kitchens[0]?.id || ""
  );

  // Modals & States
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline branch price edits state: { [dishId]: priceNumber }
  const [branchPriceEdits, setBranchPriceEdits] = useState<{ [dishId: string]: string }>({});
  const [savingDishId, setSavingDishId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const selectedKitchen = kitchens.find((k) => k.id === selectedKitchenId) || kitchens[0];

  // Filter items for search
  const filteredDishes = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit Master Dish Creation
  const handleCreateMasterDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl = form.images;

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

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      categoryId: form.categoryId || categories[0]?.id || "",
      isVeg: form.isVeg,
      tags: form.tags.trim(),
      images: imageUrl || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    };

    const res = await addMasterDish(payload);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setShowForm(false);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      showToast("success", `Master dish "${payload.name}" added to universal catalog!`);
      router.refresh();
    }
  };

  // Toggle Branch Dish Enablement (Served at this branch?)
  const handleToggleBranchEnabled = async (dish: MenuItem, currentEnabled: boolean) => {
    setSavingDishId(dish.id);
    const res = await updateBranchDishOverride({
      dishId: dish.id,
      kitchenId: selectedKitchenId,
      isEnabled: !currentEnabled,
    });
    setSavingDishId(null);

    if (res.success) {
      showToast("success", `Updated ${dish.name} status for ${selectedKitchen?.name}!`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to update branch menu.");
    }
  };

  // Toggle Branch Dish In-Stock Availability
  const handleToggleBranchStock = async (dish: MenuItem, currentStock: boolean) => {
    setSavingDishId(dish.id);
    const res = await updateBranchDishOverride({
      dishId: dish.id,
      kitchenId: selectedKitchenId,
      isAvailable: !currentStock,
    });
    setSavingDishId(null);

    if (res.success) {
      showToast("success", `${dish.name} stock updated for ${selectedKitchen?.name}!`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to update stock.");
    }
  };

  // Save Branch Specific Custom Price
  const handleSaveBranchPrice = async (dish: MenuItem) => {
    const enteredPrice = branchPriceEdits[dish.id];
    if (!enteredPrice || isNaN(Number(enteredPrice))) return;

    setSavingDishId(dish.id);
    const res = await updateBranchDishOverride({
      dishId: dish.id,
      kitchenId: selectedKitchenId,
      price: Number(enteredPrice),
    });
    setSavingDishId(null);

    if (res.success) {
      showToast(
        "success",
        `Custom price ₹${enteredPrice} saved for ${dish.name} at ${selectedKitchen?.name}!`
      );
      setBranchPriceEdits((prev) => {
        const next = { ...prev };
        delete next[dish.id];
        return next;
      });
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to save branch price.");
    }
  };

  // Bulk Enable All Master Dishes for Branch
  const handleBulkEnableBranch = async () => {
    setBulkLoading(true);
    const res = await bulkEnableAllMasterDishesForBranch(selectedKitchenId);
    setBulkLoading(false);

    if (res.success) {
      showToast(
        "success",
        `Enabled all ${res.count} master catalog dishes for ${selectedKitchen?.name}!`
      );
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to bulk enable dishes.");
    }
  };

  // Delete Dish from Master
  const handleDeleteMasterDish = async (dish: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${dish.name}" from the master catalog?`)) return;
    const res = await deleteMenuItem(dish.id);
    if (res.success) {
      showToast("success", `Dish "${dish.name}" removed from catalog.`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to delete dish.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#064e3b]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#064e3b] uppercase font-bold">
            <Sparkles className="size-4 text-[#d4af37]" />
            <span>Universal Master Menu System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0d261e] tracking-tight mt-1">
            Menu <span className="italic text-[#064e3b]">Control Center</span>
          </h1>
          <p className="text-xs text-[#52635c] mt-1">
            Create dishes once in the Universal Master Catalog, then activate & adjust prices per branch.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-xs flex items-center gap-2 self-start sm:self-center border border-[#d4af37]/30 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add New Master Dish</span>
        </button>
      </div>

      {/* Toast Notice */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 text-rose-700 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Navigation Tabs (Master Catalog vs Branch Menu Cards) */}
      <div className="flex items-center gap-2 border-b border-[#e6e2d8] overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab("master")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "master"
              ? "border-[#064e3b] text-[#064e3b] bg-white/60"
              : "border-transparent text-[#52635c] hover:text-[#0d261e]"
          }`}
        >
          <UtensilsCrossed className="size-4" />
          <span>1. Universal Master Catalog ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "branches"
              ? "border-[#064e3b] text-[#064e3b] bg-white/60"
              : "border-transparent text-[#52635c] hover:text-[#0d261e]"
          }`}
        >
          <Store className="size-4" />
          <span>2. Branch Menu Cards & Pricing</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 size-4 text-[#d4af37]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name or category..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#e6e2d8] text-xs text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b] shadow-2xs"
          />
        </div>

        {activeTab === "branches" && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#52635c]">Select Branch:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {kitchens.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelectedKitchenId(k.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedKitchenId === k.id
                      ? "bg-[#064e3b] text-[#d4af37] shadow-xs"
                      : "bg-white text-[#52635c] border border-[#e6e2d8] hover:border-[#d4af37]"
                  }`}
                >
                  {k.name} ({k.area || "Pune"})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UNIVERSAL MASTER CATALOG VIEW */}
      {/* ========================================================================= */}
      {activeTab === "master" && (
        <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e6e2d8] bg-[#fbf9f4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-sm text-[#0d261e] uppercase tracking-wider">
                Universal Master Dishes ({filteredDishes.length})
              </h3>
              <p className="text-xs text-[#52635c] mt-0.5">
                Every dish here is automatically ready for all branches to activate and price.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
                <tr>
                  <th className="px-5 py-3">Dish</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Base Price</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Branch Overrides</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60">
                {filteredDishes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#52635c] font-bold">
                      No master dishes found. Click "Add New Master Dish" to create one!
                    </td>
                  </tr>
                ) : (
                  filteredDishes.map((dish) => {
                    const overridesCount = (dish.branchPricing || []).filter(
                      (bp) => bp.price !== undefined && bp.price !== dish.price
                    ).length;

                    return (
                      <tr key={dish.id} className="hover:bg-[#fbf9f4]/50 transition">
                        {/* Dish Details */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="size-12 rounded-xl object-cover shadow-2xs shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-sm text-[#0d261e]">
                                  {dish.name}
                                </h4>
                                {dish.tag && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-[#064e3b] text-[9px] font-bold">
                                    {dish.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#52635c] line-clamp-1 max-w-xs">
                                {dish.description || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5 font-bold text-[#0d261e]">
                          {dish.categoryName}
                        </td>

                        {/* Base Price */}
                        <td className="px-5 py-3.5 font-black text-sm text-[#064e3b]">
                          ₹{dish.price}
                        </td>

                        {/* Veg/Non-Veg */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              dish.isVeg
                                ? "bg-emerald-50 text-[#064e3b] border border-emerald-300"
                                : "bg-red-50 text-red-700 border border-red-300"
                            }`}
                          >
                            {dish.isVeg ? "Pure Veg" : "Non-Veg"}
                          </span>
                        </td>

                        {/* Branch Overrides Count */}
                        <td className="px-5 py-3.5 font-semibold text-[#52635c]">
                          {overridesCount > 0 ? (
                            <span className="text-[#064e3b] font-bold">
                              {overridesCount} custom prices
                            </span>
                          ) : (
                            <span className="text-gray-400">Default base price</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteMasterDish(dish)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete from Master Catalog"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANCH MENU CARDS & PRICING MANAGER */}
      {/* ========================================================================= */}
      {activeTab === "branches" && (
        <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-[#e6e2d8] bg-[#fbf9f4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="size-4 text-[#d4af37]" />
                <h3 className="font-black text-base text-[#0d261e]">
                  {selectedKitchen?.name} Menu Card
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] text-[10px] font-black">
                  {selectedKitchen?.area || "Pune"}
                </span>
              </div>
              <p className="text-xs text-[#52635c] mt-0.5">
                Toggle dish availability and change prices specifically for this branch.
              </p>
            </div>

            <button
              onClick={handleBulkEnableBranch}
              disabled={bulkLoading}
              className="px-4 py-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs hover:bg-[#0a5c46] transition flex items-center gap-2 shadow-2xs self-start sm:self-center cursor-pointer border border-[#d4af37]/30"
            >
              {bulkLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5 fill-[#d4af37]" />
              )}
              <span>Enable All Master Dishes</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
                <tr>
                  <th className="px-5 py-3">Dish</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Master Price</th>
                  <th className="px-5 py-3">Branch Price (Override)</th>
                  <th className="px-5 py-3 text-center">In Stock Today?</th>
                  <th className="px-5 py-3 text-center">On Branch Menu?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60">
                {filteredDishes.map((dish) => {
                  const override = (dish.branchPricing || []).find(
                    (bp) => bp.kitchenId === selectedKitchenId
                  );

                  const isEnabled = override?.isEnabled !== undefined ? override.isEnabled : true;
                  const isAvailable = override?.isAvailable !== undefined ? override.isAvailable : true;
                  const currentBranchPrice = override?.price !== undefined ? override.price : dish.price;
                  const isDirty =
                    branchPriceEdits[dish.id] !== undefined &&
                    branchPriceEdits[dish.id] !== String(currentBranchPrice);

                  return (
                    <tr
                      key={dish.id}
                      className={`transition ${
                        !isEnabled ? "bg-gray-50/70 opacity-60" : "hover:bg-[#fbf9f4]/50"
                      }`}
                    >
                      {/* Dish */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="size-11 rounded-xl object-cover shadow-2xs shrink-0"
                          />
                          <div>
                            <h4 className="font-extrabold text-sm text-[#0d261e]">{dish.name}</h4>
                            <span className="text-[10px] text-[#52635c]">{dish.categoryName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 font-bold text-[#52635c]">
                        {dish.categoryName}
                      </td>

                      {/* Master Price */}
                      <td className="px-5 py-3.5 font-semibold text-[#52635c]">
                        ₹{dish.price}
                      </td>

                      {/* Branch Price Override Input */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="relative w-28">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-[#52635c]">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={
                                branchPriceEdits[dish.id] !== undefined
                                  ? branchPriceEdits[dish.id]
                                  : currentBranchPrice
                              }
                              onChange={(e) =>
                                setBranchPriceEdits({
                                  ...branchPriceEdits,
                                  [dish.id]: e.target.value,
                                })
                              }
                              className="w-full h-9 pl-6 pr-2 rounded-xl bg-white border border-[#e6e2d8] text-xs font-black text-[#064e3b] focus:outline-none focus:border-[#064e3b] shadow-2xs"
                            />
                          </div>

                          {isDirty && (
                            <button
                              onClick={() => handleSaveBranchPrice(dish)}
                              disabled={savingDishId === dish.id}
                              className="px-3 h-9 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs flex items-center gap-1 hover:bg-[#0a5c46] transition cursor-pointer shadow-xs"
                              title="Save custom branch price"
                            >
                              {savingDishId === dish.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                              <span>Save</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* In Stock Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleBranchStock(dish, isAvailable)}
                          disabled={savingDishId === dish.id}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isAvailable
                              ? "bg-emerald-50 text-[#064e3b] border border-emerald-300"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isAvailable ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>

                      {/* On Branch Menu Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleBranchEnabled(dish, isEnabled)}
                          disabled={savingDishId === dish.id}
                          className={`px-3.5 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                            isEnabled
                              ? "bg-[#064e3b] text-[#d4af37] shadow-2xs"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isEnabled ? "Active on Menu" : "Hidden / Disabled"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD MASTER DISH */}
      {/* ========================================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e6e2d8] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2d8]">
              <div>
                <h3 className="font-black text-lg text-[#0d261e]">Add New Master Dish</h3>
                <p className="text-xs text-[#52635c]">
                  This dish will be available across all branches in Malashree.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateMasterDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Cottage cheese simmered in rich creamy tomato butter gravy..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="280"
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1">
                    Category *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-bold text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d261e] mb-1">
                    Tag / Highlight
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. Bestseller, Chef Special"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isVegCheck"
                    checked={form.isVeg}
                    onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                    className="size-4 accent-[#064e3b]"
                  />
                  <label htmlFor="isVegCheck" className="text-xs font-bold text-[#0d261e]">
                    Pure Veg Dish
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Dish Photo (Upload or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-10 px-3.5 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 h-10 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs font-bold text-[#52635c] hover:bg-gray-100 transition flex items-center gap-1.5"
                  >
                    <ImagePlus className="size-4" />
                    <span>Upload</span>
                  </button>
                </div>

                {imagePreview && (
                  <div className="mt-2 relative size-16 rounded-xl overflow-hidden border border-[#e6e2d8]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition flex items-center justify-center gap-2 shadow-xs border border-[#d4af37]/30 cursor-pointer"
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Creating Dish...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Master Dish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
