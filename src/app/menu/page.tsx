"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { getBranch, Dish, ALL_CATEGORY_DISHES } from "@/lib/data";
import { getKitchenMenu, searchKitchenMenu } from "@/actions/menu";
import { syncCartWithServer } from "@/actions/cart";

export default function MenuPage() {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const setQty = useStore((s) => s.setQty);
  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const setKitchenMenu = useStore((s) => s.setKitchenMenu);
  const setCartTotals = useStore((s) => s.setCartTotals);
  const branch = getBranch(branchId);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [vegOnly, setVegOnly] = useState(true);

  // Load real menu from database
  useEffect(() => {
    let mounted = true;
    const fetchMenu = async () => {
      try {
        const data = search.trim()
          ? await searchKitchenMenu(search, branchId)
          : await getKitchenMenu(branchId);
        if (mounted && data && data.length > 0) {
          setKitchenMenu(data);
        }
      } catch (err) {
        console.error("Menu fetch notice:", err);
      }
    };
    fetchMenu();
    return () => {
      mounted = false;
    };
  }, [branchId, search, setKitchenMenu]);

  // Sync cart totals with server
  useEffect(() => {
    let mounted = true;
    const fetchTotals = async () => {
      if (cart.length > 0) {
        try {
          const res = await syncCartWithServer(cart);
          if (mounted && res && res.totals) {
            setCartTotals(res.totals);
          }
        } catch (e) {
          console.error("Cart sync notice:", e);
        }
      }
    };
    const timer = setTimeout(fetchTotals, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [cart, setCartTotals]);

  // Combine real database dishes with static branch catalog
  const dishes: Dish[] = useMemo(() => {
    if (kitchenMenu && kitchenMenu.length > 0) {
      return kitchenMenu.map((k) => ({
        id: k.id,
        name: k.name,
        desc: k.desc || "",
        price: k.price,
        category: k.category || "Main Course",
        tag: k.tag,
        rating: k.rating || 4.8,
        reviews: k.reviews || 120,
        veg: k.veg !== undefined ? k.veg : true,
        spice: k.spice || 1,
        time: k.time || "25 mins",
        image:
          k.image ||
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
        featured: k.featured,
      }));
    }

    const map = new Map<string, Dish>();
    for (const d of branch.menu) {
      map.set(d.id, d);
    }
    for (const d of ALL_CATEGORY_DISHES) {
      if (!map.has(d.id)) map.set(d.id, d);
    }
    return Array.from(map.values());
  }, [branch.menu, kitchenMenu]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    dishes.forEach((d) => set.add(d.category));
    return ["All", ...Array.from(set)];
  }, [dishes]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => {
      const matchCat = selectedCategory === "All" || d.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !search.trim() ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.desc.toLowerCase().includes(search.toLowerCase());
      const matchVeg = !vegOnly || d.veg;
      return matchCat && matchSearch && matchVeg;
    });
  }, [dishes, selectedCategory, search, vegOnly]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const dish = dishes.find((d) => d.id === i.dishId);
    return sum + (dish?.price || 0) * i.qty;
  }, 0);

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-32">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-5">
        {/* Restaurant Cover & Info Masthead */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0d261e] tracking-tight">
                  Malashree Pure Veg
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-xs">
                  Pure Veg
                </span>
              </div>
              <p className="text-xs text-[#52635c] mt-1 font-medium">
                North Indian, Biryani, Thali, Snacks, Desserts
              </p>
              <p className="text-xs text-[#52635c] mt-0.5">
                {branch.name} · {branch.area}, Pune
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-[#52635c] font-medium">
                <span className="px-2 py-0.5 rounded-md bg-[#064e3b] text-[#d4af37] font-black flex items-center gap-1">
                  4.8 <Star className="size-3 fill-[#d4af37]" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-[#52635c]" />
                  {branch.etaMin} mins
                </span>
                <span>•</span>
                <span className="text-[#064e3b] font-bold">
                  60% OFF up to ₹120 (Code: ROYAL60)
                </span>
              </div>
            </div>

            {/* Veg Switch */}
            <div className="flex items-center gap-2 self-start sm:self-center bg-[#fbf9f4] px-3 py-1.5 rounded-2xl border border-[#e6e2d8]">
              <span className="text-xs font-bold text-[#0d261e]">Veg Only</span>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                  vegOnly ? "bg-[#064e3b]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`size-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs ${
                    vegOnly ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* In-Menu Search Input */}
          <div className="mt-4 pt-4 border-t border-[#e6e2d8]">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 size-4 text-[#d4af37]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search within Malashree menu..."
                className="w-full h-10 pl-10 pr-4 bg-[#fbf9f4] rounded-xl border border-[#e6e2d8] text-xs text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b] focus:bg-white transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-3 text-gray-400">
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Sticky Horizontal Categories Bar */}
        <section className="sticky top-16 z-30 bg-[#fbf9f4]/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? dishes.length
                  : dishes.filter((d) => d.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isSelected
                      ? "bg-[#064e3b] text-[#d4af37] shadow-xs border border-[#d4af37]/30"
                      : "bg-white text-[#52635c] border border-[#e6e2d8] hover:border-[#d4af37]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? "bg-[#d4af37] text-[#064e3b]" : "bg-gray-100 text-[#52635c]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dishes Feed Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-[#0d261e] tracking-tight">
              {selectedCategory} ({filteredDishes.length} Items)
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => {
              const inCart = cart.find((c) => c.dishId === dish.id);
              const qty = inCart?.qty || 0;

              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-3xl p-4 border border-[#e6e2d8] shadow-2xs flex justify-between gap-4 hover:border-[#d4af37] transition"
                >
                  {/* Left Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="size-3.5 rounded-sm border border-[#064e3b] grid place-items-center shrink-0">
                          <div className="size-1.5 rounded-full bg-[#064e3b]" />
                        </div>
                        {dish.tag && (
                          <span className="text-[10px] font-black uppercase text-[#064e3b] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {dish.tag}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-[#0d261e] leading-snug">
                        {dish.name}
                      </h4>
                      <p className="font-black text-sm text-[#064e3b] mt-1">₹{dish.price}</p>
                      {dish.desc && (
                        <p className="text-xs text-[#52635c] mt-1 line-clamp-2 leading-relaxed font-normal">
                          {dish.desc}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#52635c] mt-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#064e3b] font-extrabold text-[10px] flex items-center gap-1 border border-emerald-200">
                        {dish.rating || 4.8} <Star className="size-2.5 fill-[#d4af37] text-[#d4af37]" />
                      </span>
                      <span>•</span>
                      <span>{dish.time || "25 mins"}</span>
                    </div>
                  </div>

                  {/* Right: Photo & Overlapping ADD button */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl overflow-hidden bg-gray-100 shadow-2xs">
                      <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="absolute -bottom-2 w-20">
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(dish.id)}
                          className="w-full h-8 bg-white border border-[#064e3b] text-[#064e3b] rounded-xl text-xs font-black uppercase tracking-wider shadow-xs hover:bg-[#064e3b] hover:text-[#d4af37] transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>ADD</span>
                          <Plus className="size-3 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="w-full h-8 bg-[#064e3b] text-[#d4af37] rounded-xl flex items-center justify-between px-1.5 shadow-md">
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            className="p-1 hover:bg-black/20 rounded cursor-pointer"
                          >
                            <Minus className="size-3 stroke-[3]" />
                          </button>
                          <span className="text-xs font-black text-white">{qty}</span>
                          <button
                            onClick={() => setQty(dish.id, qty + 1)}
                            className="p-1 hover:bg-black/20 rounded cursor-pointer"
                          >
                            <Plus className="size-3 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Floating View Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg">
          <Link
            href="/cart"
            className="w-full h-14 bg-[#064e3b] text-white rounded-2xl px-5 flex items-center justify-between shadow-2xl hover:bg-[#0a5c46] transition border border-[#d4af37]/40"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                {cartCount} item{cartCount > 1 ? "s" : ""} added
              </span>
              <span className="text-base font-black">₹{cartTotal} plus taxes</span>
            </div>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#d4af37]">
              <span>View Cart</span>
              <ArrowRight className="size-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
