"use client";

import { useState, useTransition } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { toggleDishStock } from "@/actions/kitchen/orders";

interface DishItem {
  id: string;
  name: string;
  price: number;
  categoryName: string;
  isAvailable: boolean;
  isVeg: boolean;
}

export function KitchenMenuClient({
  initialItems,
  kitchenId,
}: {
  initialItems: DishItem[];
  kitchenId: string;
}) {
  const [items, setItems] = useState<DishItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [isPending, startTransition] = useTransition();

  const categories = Array.from(new Set(items.map((i) => i.categoryName))).filter(Boolean);

  const handleToggle = (dishId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === dishId ? { ...item, isAvailable: nextStatus } : item))
    );

    startTransition(async () => {
      const res = await toggleDishStock(dishId, nextStatus);
      if (res.error) {
        // Revert on error
        setItems((prev) =>
          prev.map((item) => (item.id === dishId ? { ...item, isAvailable: currentStatus } : item))
        );
        alert(res.error);
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

    return matchesSearch && matchesCat && matchesStock;
  });

  const inStockCount = items.filter((i) => i.isAvailable).length;
  const outOfStockCount = items.filter((i) => !i.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6e2d8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            <span className="size-2 rounded-full bg-[#064e3b]" />
            Kitchen Live Inventory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
            Menu Stock & Availability
          </h1>
          <p className="text-xs text-[#52635c] mt-0.5">
            Instantly mark dishes In-Stock or Sold-Out. Changes reflect on customer menu in real time.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-black uppercase text-emerald-800 block">In Stock</span>
            <span className="text-lg font-black text-[#064e3b]">{inStockCount}</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-black uppercase text-rose-800 block">Sold Out</span>
            <span className="text-lg font-black text-rose-700">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Controls: Search, Category Filter, Stock Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52635c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dish name (e.g. Paneer Lababdar, Dal Tadka)..."
              className="w-full h-11 pl-10 pr-4 bg-[#fbf9f4] border border-[#e6e2d8] rounded-xl text-xs font-bold text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b]"
            />
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
              All ({items.length})
            </button>
            <button
              onClick={() => setStockFilter("in")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                stockFilter === "in"
                  ? "bg-[#064e3b] text-[#d4af37]"
                  : "text-[#52635c] hover:text-[#0d261e]"
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                stockFilter === "out"
                  ? "bg-rose-700 text-white"
                  : "text-[#52635c] hover:text-rose-700"
              }`}
            >
              Sold Out ({outOfStockCount})
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
            All Categories
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
              {cat}
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
                  Price
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c]">
                  Status
                </th>
                <th className="px-6 py-3.5 font-black uppercase tracking-wider text-[#52635c] text-right">
                  Toggle Availability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#52635c] font-medium">
                    No dishes found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbf9f4]/60 transition">
                    <td className="px-6 py-4 font-bold text-sm text-[#0d261e]">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-sm border border-[#064e3b] grid place-items-center shrink-0">
                          <div className="size-1.5 rounded-full bg-[#064e3b]" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#52635c] font-semibold">
                      {item.categoryName}
                    </td>
                    <td className="px-6 py-4 font-black text-[#0d261e]">
                      ₹{item.price}
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggle(item.id, item.isAvailable)}
                        disabled={isPending}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs border ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
