"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Sparkles,
  UtensilsCrossed,
  Pencil,
  Check,
  X,
  RotateCcw,
  IndianRupee,
  TrendingUp,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  updateBranchDishPrice,
  resetBranchDishPrice,
  toggleBranchDishStock,
} from "@/actions/kitchen/menu";

interface DishItem {
  id: string;
  name: string;
  masterPrice: number;
  price: number;
  hasOverride: boolean;
  categoryName: string;
  isAvailable: boolean;
  isVeg: boolean;
  image?: string;
}

export function KitchenMenuClient({
  initialItems,
  kitchenId,
}: {
  initialItems: DishItem[];
  kitchenId: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<DishItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "custom" | "standard">("all");
  const [isPending, startTransition] = useTransition();

  // Price Editing State
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>("");
  const [savingDishId, setSavingDishId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories = Array.from(new Set(items.map((i) => i.categoryName))).filter(Boolean);

  const handleStartEditPrice = (item: DishItem) => {
    setEditingDishId(item.id);
    setEditPriceValue(String(item.price));
  };

  const handleCancelEditPrice = () => {
    setEditingDishId(null);
    setEditPriceValue("");
  };

  const handleSavePrice = async (dishId: string) => {
    const numPrice = parseFloat(editPriceValue);
    if (isNaN(numPrice) || numPrice < 0) {
      alert("Please enter a valid price (₹0 or higher).");
      return;
    }

    setSavingDishId(dishId);
    const targetItem = items.find((i) => i.id === dishId);
    const prevPrice = targetItem?.price;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === dishId
          ? {
              ...item,
              price: numPrice,
              hasOverride: numPrice !== item.masterPrice,
            }
          : item
      )
    );
    setEditingDishId(null);

    const res = await updateBranchDishPrice(dishId, numPrice, kitchenId);
    setSavingDishId(null);

    if (res.error) {
      // Revert
      if (prevPrice !== undefined) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === dishId
              ? {
                  ...item,
                  price: prevPrice,
                  hasOverride: prevPrice !== item.masterPrice,
                }
              : item
          )
        );
      }
      alert(res.error);
    } else {
      showToast(`Branch price updated to ₹${numPrice} for "${targetItem?.name}"`);
      router.refresh();
    }
  };

  const handleResetPrice = async (dish: DishItem) => {
    if (!window.confirm(`Reset "${dish.name}" price to Universal Master Price (₹${dish.masterPrice})?`)) {
      return;
    }

    setSavingDishId(dish.id);
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === dish.id
          ? {
              ...item,
              price: dish.masterPrice,
              hasOverride: false,
            }
          : item
      )
    );

    const res = await resetBranchDishPrice(dish.id, kitchenId);
    setSavingDishId(null);

    if (res.error) {
      alert(res.error);
    } else {
      showToast(`Price reset to master (₹${dish.masterPrice}) for "${dish.name}"`);
      router.refresh();
    }
  };

  const handleToggle = (dishId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === dishId ? { ...item, isAvailable: nextStatus } : item))
    );

    startTransition(async () => {
      const res = await toggleBranchDishStock(dishId, nextStatus, kitchenId);
      if (res.error) {
        // Revert on error
        setItems((prev) =>
          prev.map((item) => (item.id === dishId ? { ...item, isAvailable: currentStatus } : item))
        );
        alert(res.error);
      } else {
        showToast(`Stock updated: "${items.find((i) => i.id === dishId)?.name}" is now ${nextStatus ? "In Stock" : "Sold Out"}`);
        router.refresh();
      }
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.categoryName === selectedCategory;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in" && item.isAvailable) ||
      (stockFilter === "out" && !item.isAvailable);
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "custom" && item.hasOverride) ||
      (priceFilter === "standard" && !item.hasOverride);

    return matchesSearch && matchesCat && matchesStock && matchesPrice;
  });

  const inStockCount = items.filter((i) => i.isAvailable).length;
  const outOfStockCount = items.filter((i) => !i.isAvailable).length;
  const customPricesCount = items.filter((i) => i.hasOverride).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#064e3b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#d4af37]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-[#d4af37] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6e2d8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            <span className="size-2 rounded-full bg-[#064e3b]" />
            Branch Live Menu & Custom Pricing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
            Menu Pricing & Stock
          </h1>
          <p className="text-xs text-[#52635c] mt-0.5">
            Set branch-specific prices and live availability. Custom prices apply exclusively to this branch.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-amber-50/80 border border-amber-200">
            <span className="text-[10px] font-black uppercase text-amber-900 block">Custom Prices</span>
            <span className="text-lg font-black text-amber-800">{customPricesCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-black uppercase text-emerald-800 block">In Stock</span>
            <span className="text-lg font-black text-[#064e3b]">{inStockCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-black uppercase text-rose-800 block">Sold Out</span>
            <span className="text-lg font-black text-rose-700">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Controls: Search, Category Filter, Stock & Price Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52635c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dish name (e.g. Paneer Butter Masala, Biryani)..."
              className="w-full h-11 pl-10 pr-4 bg-[#fbf9f4] border border-[#e6e2d8] rounded-xl text-xs font-bold text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b]"
            />
          </div>

          {/* Pricing Filter */}
          <div className="flex gap-1.5 p-1 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] shrink-0">
            <button
              onClick={() => setPriceFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                priceFilter === "all"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                priceFilter === "custom"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              Custom ({customPricesCount})
            </button>
            <button
              onClick={() => setPriceFilter("standard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                priceFilter === "standard"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              Master Price ({items.length - customPricesCount})
            </button>
          </div>

          {/* Stock Filter */}
          <div className="flex gap-1.5 p-1 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] shrink-0">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                stockFilter === "all"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter("in")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                stockFilter === "in"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                stockFilter === "out"
                  ? "bg-rose-700 text-white"
                  : "text-[#52635c] hover:text-rose-700"
              }`}
            >
              Sold Out
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                : "bg-[#fbf9f4] text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
            }`}
          >
            All Categories ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                  : "bg-[#fbf9f4] text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
              }`}
            >
              {cat} ({items.filter((i) => i.categoryName === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white border border-[#e6e2d8] rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e6e2d8] bg-[#fbf9f4]">
              <tr>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  Dish Name
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  Category
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  Universal Master Price
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  This Branch Price
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  Stock Status
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c] text-right">
                  Availability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#52635c] font-medium">
                    No dishes found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingDishId === item.id;
                  const isSaving = savingDishId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#fbf9f4]/60 transition">
                      {/* Dish Name */}
                      <td className="px-6 py-4 font-bold text-sm text-[#0d261e]">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-sm border border-[#064e3b] grid place-items-center shrink-0">
                            <div className="size-1.5 rounded-full bg-[#064e3b]" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-[#52635c] font-semibold">
                        {item.categoryName}
                      </td>

                      {/* Master Price */}
                      <td className="px-6 py-4 font-bold text-[#52635c]">
                        <span>₹{item.masterPrice}</span>
                      </td>

                      {/* Branch Price Editor */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#52635c]">₹</span>
                              <input
                                autoFocus
                                type="number"
                                min="0"
                                step="1"
                                value={editPriceValue}
                                onChange={(e) => setEditPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSavePrice(item.id);
                                  if (e.key === "Escape") handleCancelEditPrice();
                                }}
                                className="w-full h-9 pl-6 pr-2 bg-white border-2 border-[#064e3b] rounded-lg text-xs font-black text-[#0d261e] focus:outline-none"
                              />
                            </div>
                            <button
                              onClick={() => handleSavePrice(item.id)}
                              disabled={isSaving}
                              title="Save Price"
                              className="size-8 rounded-lg bg-[#064e3b] hover:bg-[#0a5c46] text-[#d4af37] grid place-items-center transition cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              onClick={handleCancelEditPrice}
                              title="Cancel"
                              className="size-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#52635c] grid place-items-center transition cursor-pointer"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <span className={`font-black text-sm ${item.hasOverride ? "text-emerald-800 font-extrabold" : "text-[#0d261e]"}`}>
                              ₹{item.price}
                            </span>

                            {item.hasOverride ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Custom ({item.price > item.masterPrice ? `+₹${item.price - item.masterPrice}` : `-₹${item.masterPrice - item.price}`})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-500 bg-gray-100">
                                Master
                              </span>
                            )}

                            <button
                              onClick={() => handleStartEditPrice(item)}
                              title="Edit Price for this Branch"
                              className="p-1 rounded-md text-[#52635c] hover:text-[#064e3b] hover:bg-emerald-50 transition cursor-pointer"
                            >
                              <Pencil className="size-3.5" />
                            </button>

                            {item.hasOverride && (
                              <button
                                onClick={() => handleResetPrice(item)}
                                disabled={isSaving}
                                title="Reset to Universal Master Price"
                                className="p-1 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition cursor-pointer"
                              >
                                <RotateCcw className="size-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4">
                        {item.isAvailable ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> In Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300 inline-flex items-center gap-1">
                            <XCircle className="size-3" /> Sold Out
                          </span>
                        )}
                      </td>

                      {/* Action Toggle Availability */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggle(item.id, item.isAvailable)}
                          disabled={isPending}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs border ${
                            item.isAvailable
                              ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                              : "bg-[#064e3b] text-[#d4af37] border-[#064e3b] hover:bg-[#0a5c46]"
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <ToggleRight className="size-4" />
                              <span>Mark Sold Out</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="size-4" />
                              <span>Set In Stock</span>
                            </>
                          )}
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
  );
}

