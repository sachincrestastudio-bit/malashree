"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Star,
  Clock,
  X,
  Check,
  Navigation,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { useLocationStore } from "@/store/locationStore";
import { FOOD_CATEGORIES, ALL_CATEGORY_DISHES, BRANCHES, getBranch, Dish } from "@/lib/data";
import { getKitchenMenu, searchKitchenMenu } from "@/actions/menu";
import { getHomepageContent } from "@/actions/adminHomepage";
import { requestGPSLocation } from "@/services/client/LocationService";
import { assignNearestKitchen } from "@/services/client/KitchenAssignmentService";
import { setAssignedKitchen } from "@/actions/kitchen";

export default function HomePage() {
  const branchId = useStore((s) => s.branchId);
  const setBranch = useStore((s) => s.setBranch);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const setQty = useStore((s) => s.setQty);
  const profile = useStore((s) => s.profile);
  const kitchenMenu = useStore((s) => s.kitchenMenu);
  const setKitchenMenu = useStore((s) => s.setKitchenMenu);
  const resolveLocation = useStore((s) => s.resolveLocation);

  const { setLocation, setPermissionError, setLoading } = useLocationStore();
  const branch = getBranch(branchId);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [homepageContent, setHomepageContent] = useState<any>(null);

  // Load real homepage content from MongoDB (promo cards, categories, announcements)
  useEffect(() => {
    let mounted = true;
    getHomepageContent().then((content) => {
      if (mounted && content) {
        setHomepageContent(content);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load real menu from database / backend action
  useEffect(() => {
    let mounted = true;
    const loadRealMenu = async () => {
      setMenuLoading(true);
      try {
        const data = searchQuery.trim()
          ? await searchKitchenMenu(searchQuery, branchId)
          : await getKitchenMenu(branchId);
        if (mounted && data && data.length > 0) {
          setKitchenMenu(data);
        }
      } catch (e) {
        console.error("Failed to load kitchen menu:", e);
      } finally {
        if (mounted) setMenuLoading(false);
      }
    };

    const timer = setTimeout(loadRealMenu, searchQuery.trim() ? 300 : 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, branchId, setKitchenMenu]);

  // Combined real dish pool
  const allDishes = useMemo(() => {
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

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    let list = allDishes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.desc.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter(
        (d) => d.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (activeFilter === "rating") {
      list = list.filter((d) => d.rating >= 4.5);
    } else if (activeFilter === "veg") {
      list = list.filter((d) => d.veg);
    } else if (activeFilter === "fast") {
      list = list.filter((d) => (parseInt(d.time || "30") || 30) <= 25);
    } else if (activeFilter === "offers") {
      list = list.filter((d) => Boolean(d.tag));
    }

    return list;
  }, [allDishes, searchQuery, selectedCategory, activeFilter]);

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
    }
  };

  const toggleFilter = (filterKey: string) => {
    setActiveFilter((prev) => (prev === filterKey ? null : filterKey));
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#0d261e] font-sans antialiased pb-28">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Top Search Bar (Mobile Only) */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 size-4.5 text-[#d4af37]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for biryani, paneer, thali..."
              className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-[#e6e2d8] text-xs text-[#0d261e] placeholder:text-[#52635c] focus:outline-none focus:border-[#064e3b] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-gray-400"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Announcement Ticker */}
        {homepageContent?.announcementBanner?.isActive && (
          <div className="bg-gradient-to-r from-[#064e3b] to-[#0a5c46] text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs border border-[#d4af37]/30">
            <span className="truncate">{homepageContent.announcementBanner.text}</span>
            <Link
              href={homepageContent.announcementBanner.link || "/menu"}
              className="text-[10px] uppercase font-black bg-[#d4af37] text-[#064e3b] px-2.5 py-1 rounded-lg shrink-0 ml-3 shadow-2xs hover:bg-[#eab308] transition"
            >
              Order Now
            </Link>
          </div>
        )}

        {/* 2x2 Promotional Deals Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(homepageContent?.promoCards?.length > 0
            ? homepageContent.promoCards.filter((c: any) => c.isActive !== false)
            : [
                {
                  id: "card_1",
                  title: "60% OFF",
                  subtitle: "UP TO ₹120",
                  badgeText: "CODE: ROYAL60",
                  imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
                  targetType: "link",
                  targetValue: "/menu",
                },
                {
                  id: "card_2",
                  title: "Burger Specials",
                  subtitle: "EVERYTHING AT",
                  badgeText: "DEAL OF THE DAY",
                  priceText: "₹129 only",
                  imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
                  targetType: "category",
                  targetValue: "Burger",
                },
                {
                  id: "card_3",
                  title: "Royal Biryani",
                  subtitle: "BIRYANIS FROM",
                  badgeText: "DEAL OF THE DAY",
                  priceText: "₹169 only",
                  imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80",
                  targetType: "category",
                  targetValue: "Biryani",
                },
                {
                  id: "card_4",
                  title: "1,40,000 +",
                  subtitle: "valets vaccinated!",
                  badgeText: "MAX SAFETY",
                  targetType: "modal",
                  targetValue: "safety",
                },
              ]
          ).map((card: any, idx: number) => (
            <div
              key={card.id || idx}
              onClick={() => {
                if (card.targetType === "category") handleCategoryClick(card.targetValue);
                else if (card.targetType === "modal") setShowSafetyModal(true);
                else if (card.targetType === "link") window.location.href = card.targetValue || "/menu";
              }}
              className="relative overflow-hidden rounded-2xl bg-white p-3.5 shadow-2xs border border-[#e6e2d8] flex flex-col justify-between cursor-pointer hover:border-[#d4af37] transition group min-h-[135px]"
            >
              <div>
                <span className="text-[9px] font-black uppercase text-[#d4af37] tracking-wider block">
                  {card.badgeText || "SPECIAL OFFER"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#0d261e] leading-tight mt-0.5 truncate">
                  {card.title}
                </h3>
                <p className="text-[11px] text-[#52635c] font-medium truncate">
                  {card.subtitle} {card.priceText && <span className="font-bold text-[#064e3b]">{card.priceText}</span>}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-bold text-[#064e3b] group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition">
                  Explore →
                </span>
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="size-11 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                  />
                )}
              </div>
            </div>
          ))}
        </section>

        {/* "Eat what makes you happy" Circular Categories */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#0d261e] tracking-tight">
              Eat what makes you happy
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-[#064e3b] hover:text-[#d4af37]"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {(homepageContent?.foodCategories?.length > 0
              ? homepageContent.foodCategories.filter((c: any) => c.isActive !== false)
              : FOOD_CATEGORIES
            ).map((cat: any) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center text-center group focus:outline-none cursor-pointer"
                >
                  <div
                    className={`relative size-16 sm:size-20 rounded-full p-0.5 transition duration-200 ${
                      isSelected
                        ? "ring-3 ring-[#064e3b] scale-105 shadow-md"
                        : "group-hover:scale-105 group-hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full rounded-full object-cover shadow-2xs"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#064e3b]/40 rounded-full flex items-center justify-center">
                        <Check className="size-5 text-[#d4af37] stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold mt-1.5 truncate max-w-full ${
                      isSelected ? "text-[#064e3b] font-black" : "text-[#52635c] group-hover:text-[#0d261e]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Restaurant Header Banner Card */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={branch.hero}
              alt={branch.name}
              className="size-20 sm:size-24 rounded-2xl object-cover shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0d261e] tracking-tight">
                  Malashree Pure Veg
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-[10px]">
                  Pure Veg
                </span>
              </div>
              <p className="text-xs text-[#52635c] mt-0.5">
                North Indian · Biryani · Thalis · Fast Food
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#52635c] mt-2 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-[#064e3b] text-[#d4af37] font-extrabold flex items-center gap-1 text-[11px]">
                  4.8 <Star className="size-3 fill-[#d4af37]" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-[#52635c]" />
                  {branch.etaMin} mins
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#d4af37]" />
                  {branch.area}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/menu"
            className="px-6 py-3 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-xs flex items-center gap-2 self-stretch md:self-auto justify-center border border-[#d4af37]/30"
          >
            <span>View Full Menu</span>
            <ArrowRight className="size-4" />
          </Link>
        </section>

        {/* Quick Filter Chips */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => toggleFilter("rating")}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeFilter === "rating"
                ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
            }`}
          >
            Rating 4.5+ ★
          </button>
          <button
            onClick={() => toggleFilter("veg")}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeFilter === "veg"
                ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
            }`}
          >
            Pure Veg
          </button>
          <button
            onClick={() => toggleFilter("fast")}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeFilter === "fast"
                ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
            }`}
          >
            Fast Delivery (≤25 mins)
          </button>
          <button
            onClick={() => toggleFilter("offers")}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeFilter === "offers"
                ? "bg-[#064e3b] text-[#d4af37] border-[#064e3b]"
                : "bg-white text-[#52635c] border-[#e6e2d8] hover:border-[#d4af37]"
            }`}
          >
            Special Offers
          </button>
        </section>

        {/* Dishes Listing Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0d261e] tracking-tight">
              {selectedCategory ? `${selectedCategory} Dishes` : "Popular Dishes For You"} (
              {filteredDishes.length})
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
                      {/* Veg indicator & tag */}
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

                  {/* Right: Dish Photo & Overlapping ADD button */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl overflow-hidden bg-gray-100 shadow-2xs">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Overlapping ADD counter button */}
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

      {/* Safety Modal */}
      <AnimatePresence>
        {showSafetyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="font-extrabold text-lg text-gray-900">
                    {homepageContent?.safetyHighlight?.modalTitle || "MAX Safety & Vaccination"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSafetyModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-bold text-[#064e3b]">
                  {homepageContent?.safetyHighlight?.modalDescription ||
                    "1,40,000+ Delivery Partners Vaccinated Across India!"}
                </p>
                <ul className="space-y-2 text-xs text-gray-600">
                  {(homepageContent?.safetyHighlight?.points || [
                    "Daily temperature checks and sanitized kitchen gear.",
                    "Tamper-evident food packaging seals on every order.",
                    "100% contactless doorstep delivery option available.",
                  ]).map((pt: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="size-4 text-[#064e3b] shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowSafetyModal(false)}
                className="w-full bg-[#064e3b] text-[#d4af37] py-3 rounded-2xl font-bold text-xs hover:bg-[#0a5c46] transition cursor-pointer"
              >
                Got it, thank you!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
