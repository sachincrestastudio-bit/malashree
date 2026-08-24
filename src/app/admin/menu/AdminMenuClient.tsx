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
  RotateCcw,
  RefreshCw,
  Tag,
  ShieldCheck,
} from "lucide-react";
import {
  addMasterDish,
  deleteMenuItem,
  updateMenuItemAvailability,
  updateBranchDishOverride,
  bulkEnableAllMasterDishesForBranch,
  bulkDisableAllMasterDishesForBranch,
  bulkResetBranchPricesToMaster,
  syncUniversalCatalog,
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
  const [activeTab, setActiveTab] = useState<"master" | "branches">("branches");
  const [selectedKitchenId, setSelectedKitchenId] = useState<string>(kitchens[0]?.id || "");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

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
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const selectedKitchen = kitchens.find((k) => k.id === selectedKitchenId) || kitchens[0];

  // Unique categories list
  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.categoryName) set.add(i.categoryName);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  // Filter items for search and category
  const filteredDishes = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategoryFilter === "All" ||
        item.categoryName.toLowerCase() === selectedCategoryFilter.toLowerCase();
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, search, selectedCategoryFilter]);

  // Branch statistics
  const branchStats = useMemo(() => {
    if (!selectedKitchenId) return { totalMaster: items.length, activeCount: 0, customCount: 0 };

    let activeCount = 0;
    let customCount = 0;

    for (const dish of items) {
      const override = (dish.branchPricing || []).find((bp) => bp.kitchenId === selectedKitchenId);
      const isEnabled = override?.isEnabled !== undefined ? override.isEnabled : true;
      if (isEnabled) activeCount++;
      if (override?.price !== undefined && override.price !== dish.price) customCount++;
    }

    return { totalMaster: items.length, activeCount, customCount };
  }, [items, selectedKitchenId]);

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
      showToast(
        "success",
        !currentEnabled
          ? `Added "${dish.name}" to ${selectedKitchen?.name} menu card!`
          : `Removed "${dish.name}" from ${selectedKitchen?.name} menu card!`
      );
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
        `All ${res.count} master catalog dishes enabled for ${selectedKitchen?.name}!`
      );
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to bulk enable dishes.");
    }
  };

  // Bulk Disable All Master Dishes for Branch
  const handleBulkDisableBranch = async () => {
    if (!confirm(`Are you sure you want to disable all dishes for ${selectedKitchen?.name}?`)) return;
    setBulkLoading(true);
    const res = await bulkDisableAllMasterDishesForBranch(selectedKitchenId);
    setBulkLoading(false);

    if (res.success) {
      showToast("success", `Disabled all dishes for ${selectedKitchen?.name}.`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to disable dishes.");
    }
  };

  // Bulk Reset Branch Prices to Master Prices
  const handleBulkResetPrices = async () => {
    if (!confirm(`Reset all prices to master base catalog for ${selectedKitchen?.name}?`)) return;
    setBulkLoading(true);
    const res = await bulkResetBranchPricesToMaster(selectedKitchenId);
    setBulkLoading(false);

    if (res.success) {
      showToast("success", `All prices reset to master catalog for ${selectedKitchen?.name}!`);
      setBranchPriceEdits({});
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to reset prices.");
    }
  };

  // Sync Universal Catalog (Seed / Reload Chinchwad & Master catalog)
  const handleSyncUniversalCatalog = async () => {
    setSyncingCatalog(true);
    const res = await syncUniversalCatalog();
    setSyncingCatalog(false);

    if (res.success) {
      showToast("success", `Universal Catalog synced with all ${res.count} dishes including Chinchwad!`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to sync catalog.");
    }
  };

  // Delete Dish from Master
  const handleDeleteMasterDish = async (dish: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${dish.name}" from the master catalog?`)) return;
    const res = await deleteMenuItem(dish.id);
    if (res.success) {
      showToast("success", `Dish "${dish.name}" removed from master catalog.`);
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to delete dish.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Masthead */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#064e3b] uppercase font-bold">
            <Sparkles className="size-4 text-[#d4af37]" />
            <span>UNIVERSAL MENU ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight mt-1">
            Universal Menu & Branch Customizer
          </h1>
          <p className="text-xs sm:text-sm text-[#52635c] mt-1 max-w-2xl">
            All products reside in the Universal Master Catalog. Select any branch below to include/exclude products and set customized pricing per branch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <button
            onClick={handleSyncUniversalCatalog}
            disabled={syncingCatalog}
            className="px-4 py-2.5 rounded-2xl bg-[#fbf9f4] hover:bg-[#064e3b] hover:text-[#d4af37] text-[#0d261e] font-bold text-xs transition shadow-2xs border border-[#e6e2d8] flex items-center gap-2 cursor-pointer"
            title="Sync all Chinchwad and Signature dishes into Universal Master Menu"
          >
            <RefreshCw className={`size-3.5 ${syncingCatalog ? "animate-spin" : ""}`} />
            <span>Sync All Chinchwad Dishes</span>
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-xs flex items-center gap-2 border border-[#d4af37]/30 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Master Dish</span>
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-xs ${
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

      {/* Main Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center gap-2 border ${
            activeTab === "branches"
              ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b] shadow-xs"
              : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
          }`}
        >
          <Store className="size-4" />
          <span>Branch Menu Cards & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab("master")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center gap-2 border ${
            activeTab === "master"
              ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b] shadow-xs"
              : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
          }`}
        >
          <UtensilsCrossed className="size-4" />
          <span>Universal Master Catalog ({items.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRANCH MENU CARDS & PRICING MANAGER (MAIN FEATURE) */}
      {/* ========================================================================= */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          {/* Branch Picker Row */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#064e3b]">
                Select Target Branch Kitchen:
              </span>
              <div className="text-xs font-bold text-[#52635c] flex items-center gap-3">
                <span>Active Menu: <b className="text-[#064e3b]">{branchStats.activeCount} / {branchStats.totalMaster} dishes</b></span>
                {branchStats.customCount > 0 && (
                  <span>· Custom Priced: <b className="text-[#d4af37]">{branchStats.customCount}</b></span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {kitchens.map((k) => {
                const isSelected = selectedKitchenId === k.id;
                return (
                  <button
                    key={k.id}
                    onClick={() => {
                      setSelectedKitchenId(k.id);
                      setBranchPriceEdits({});
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b] shadow-xs"
                        : "bg-[#fbf9f4] text-[#0d261e] border-[#e6e2d8] hover:border-[#d4af37]"
                    }`}
                  >
                    <Store className="size-3.5" />
                    <span>{k.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      isSelected ? "bg-[#d4af37] text-[#064e3b]" : "bg-gray-200 text-[#52635c]"
                    }`}>
                      {k.area || "Pune"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Bar: Search + Category Filter + Bulk Branch Actions */}
          <div className="bg-white rounded-3xl p-5 border border-[#e6e2d8] shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 size-4 text-[#d4af37]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${selectedKitchen?.name} menu...`}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleBulkEnableBranch}
                  disabled={bulkLoading}
                  className="px-3.5 py-2 rounded-xl bg-[#064e3b] text-[#d4af37] font-black text-xs hover:bg-[#0a5c46] transition flex items-center gap-1.5 shadow-2xs cursor-pointer border border-[#d4af37]/30"
                  title="Enable every master dish for this branch"
                >
                  <Zap className="size-3.5 fill-[#d4af37]" />
                  <span>Include All Master Dishes</span>
                </button>

                <button
                  onClick={handleBulkResetPrices}
                  disabled={bulkLoading}
                  className="px-3.5 py-2 rounded-xl bg-[#fbf9f4] hover:bg-gray-100 text-[#0d261e] font-bold text-xs transition flex items-center gap-1.5 border border-[#e6e2d8] cursor-pointer"
                  title="Reset all prices to master base prices"
                >
                  <RotateCcw className="size-3.5 text-[#52635c]" />
                  <span>Reset Prices</span>
                </button>

                <button
                  onClick={handleBulkDisableBranch}
                  disabled={bulkLoading}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                  title="Remove all dishes from this branch's menu"
                >
                  <X className="size-3.5" />
                  <span>Remove All</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-[#52635c] shrink-0">Filter:</span>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? "bg-[#064e3b] text-[#d4af37]"
                      : "bg-[#fbf9f4] text-[#52635c] hover:text-[#0d261e] border border-[#e6e2d8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Branch Menu Table */}
          <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
                  <tr>
                    <th className="px-5 py-3.5 text-center">Include in Branch?</th>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Master Price</th>
                    <th className="px-5 py-3.5">Branch Custom Price (₹)</th>
                    <th className="px-5 py-3.5 text-center">In-Stock Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e2d8]/60">
                  {filteredDishes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#52635c] font-bold">
                        No dishes found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredDishes.map((dish) => {
                      const override = (dish.branchPricing || []).find(
                        (bp) => bp.kitchenId === selectedKitchenId
                      );

                      const isEnabled = override?.isEnabled !== undefined ? override.isEnabled : true;
                      const isAvailable = override?.isAvailable !== undefined ? override.isAvailable : true;
                      const currentBranchPrice = override?.price !== undefined ? override.price : dish.price;
                      const isPriceOverridden = override?.price !== undefined && override.price !== dish.price;
                      const isDirty =
                        branchPriceEdits[dish.id] !== undefined &&
                        branchPriceEdits[dish.id] !== String(currentBranchPrice);

                      return (
                        <tr
                          key={dish.id}
                          className={`transition ${
                            !isEnabled ? "bg-gray-50/70 opacity-60" : "hover:bg-[#fbf9f4]/60"
                          }`}
                        >
                          {/* 1. Include in Branch Toggle */}
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => handleToggleBranchEnabled(dish, isEnabled)}
                              disabled={savingDishId === dish.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                                isEnabled
                                  ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b] shadow-2xs"
                                  : "bg-white text-gray-400 border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              {isEnabled ? "Included ✓" : "Excluded ✕"}
                            </button>
                          </td>

                          {/* 2. Product Details */}
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
                                  {dish.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Category */}
                          <td className="px-5 py-3.5 font-bold text-[#52635c]">
                            {dish.categoryName}
                          </td>

                          {/* 4. Universal Master Price */}
                          <td className="px-5 py-3.5 font-bold text-[#52635c]">
                            ₹{dish.price}
                          </td>

                          {/* 5. Branch Custom Price Field */}
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

                              {isDirty ? (
                                <button
                                  onClick={() => handleSaveBranchPrice(dish)}
                                  disabled={savingDishId === dish.id}
                                  className="px-3 h-9 rounded-xl bg-[#064e3b] text-[#d4af37] font-bold text-xs flex items-center gap-1 hover:bg-[#0a5c46] transition cursor-pointer shadow-xs"
                                >
                                  {savingDishId === dish.id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Save className="size-3.5" />
                                  )}
                                  <span>Save</span>
                                </button>
                              ) : isPriceOverridden ? (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                                  Custom
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* 6. In-Stock Status */}
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
                              {isAvailable ? "In Stock" : "Sold Out"}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIVERSAL MASTER CATALOG VIEW */}
      {/* ========================================================================= */}
      {activeTab === "master" && (
        <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-[#e6e2d8] bg-[#fbf9f4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-sm text-[#0d261e] uppercase tracking-wider">
                Universal Master Dishes ({filteredDishes.length})
              </h3>
              <p className="text-xs text-[#52635c] mt-0.5">
                Every dish added here is globally available for all 6 branches to activate and price.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f4] border-b border-[#e6e2d8] text-[10px] font-black font-mono tracking-wider uppercase text-[#52635c]">
                <tr>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Universal Base Price</th>
                  <th className="px-5 py-3.5">Dietary</th>
                  <th className="px-5 py-3.5">Branch Overrides</th>
                  <th className="px-5 py-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60">
                {filteredDishes.map((dish) => {
                  const overridesCount = (dish.branchPricing || []).filter(
                    (bp) => bp.price !== undefined && bp.price !== dish.price
                  ).length;

                  return (
                    <tr key={dish.id} className="hover:bg-[#fbf9f4]/50 transition">
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
                              {dish.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-[#0d261e]">
                        {dish.categoryName}
                      </td>

                      <td className="px-5 py-3.5 font-black text-sm text-[#064e3b]">
                        ₹{dish.price}
                      </td>

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

                      <td className="px-5 py-3.5 font-semibold text-[#52635c]">
                        {overridesCount > 0 ? (
                          <span className="text-[#064e3b] font-bold">
                            {overridesCount} custom prices
                          </span>
                        ) : (
                          <span className="text-gray-400">Default base price</span>
                        )}
                      </td>

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
                    placeholder="e.g. Bestseller, Office Favorite"
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

              {/* Image Input */}
              <div>
                <label className="block text-xs font-bold text-[#0d261e] mb-1">
                  Dish Image (Upload File or Enter Image URL)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="text-xs text-[#52635c] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#064e3b] file:text-[#d4af37] file:cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="Or paste Unsplash image URL..."
                    className="w-full h-9 px-3.5 rounded-xl bg-[#fbf9f4] border border-[#e6e2d8] text-xs text-[#0d261e] focus:outline-none focus:border-[#064e3b]"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-16 rounded-xl object-cover border border-[#e6e2d8] shadow-2xs"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-[#52635c] hover:text-[#0d261e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-6 py-2.5 rounded-xl bg-[#064e3b] text-[#d4af37] text-xs font-bold hover:bg-[#0a5c46] transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>{uploading ? "Uploading..." : "Saving Dish..."}</span>
                    </>
                  ) : (
                    <span>Add to Master Catalog</span>
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
