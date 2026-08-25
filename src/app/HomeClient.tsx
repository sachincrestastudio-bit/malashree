"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
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
} from "lucide-react";
import { Header } from "@/components/Header";
import { useStore } from "@/lib/store";
import { FOOD_CATEGORIES, Dish } from "@/lib/data";
import { getKitchenMenu, searchKitchenMenu } from "@/actions/menu";
import { MenuItemData } from "@/app/menu/MenuClient";

interface HomeClientProps {
  initialDishes: MenuItemData[];
  initialHomepageContent: any;
}

export default function HomeClient({
  initialDishes,
  initialHomepageContent,
}: HomeClientProps) {
  const branchId = useStore((s) => s.branchId);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const setQty = useStore((s) => s.setQty);
  const userLocation = useStore((s) => s.userLocation);

  const [dbDishes, setDbDishes] = useState<MenuItemData[]>(initialDishes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [homepageContent] = useState<any>(initialHomepageContent);

  // Re-fetch dishes when search or branch changes
  useEffect(() => {
    let mounted = true;
    const loadRealMenu = async () => {
      try {
        const data = searchQuery.trim()
          ? await searchKitchenMenu(searchQuery, branchId)
          : await getKitchenMenu(branchId);
        if (mounted && data && data.length > 0) {
          setDbDishes(data);
        }
      } catch (e) {
        console.error("Failed to load kitchen menu:", e);
      }
    };

    const timer = setTimeout(loadRealMenu, searchQuery.trim() ? 250 : 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, branchId]);

  // Dynamic food categories derived from actual DB items
  const dynamicCategories = useMemo(() => {
    const catsSet = new Set<string>();
    dbDishes.forEach((d) => {
      if (d.category) catsSet.add(d.category);
    });

    const categoryArray = Array.from(catsSet);
    return categoryArray.map((catName) => {
      // Find matching icon/image from FOOD_CATEGORIES or use fallback
      const match = FOOD_CATEGORIES.find(
        (c) => c.name.toLowerCase() === catName.toLowerCase()
      );
      const sampleDish = dbDishes.find(
        (d) => d.category?.toLowerCase() === catName.toLowerCase() && d.image
      );

      return {
        id: catName.toLowerCase().replace(/\s+/g, "_"),
        name: catName,
        image:
          match?.image ||
          sampleDish?.image ||
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
      };
    });
  }, [dbDishes]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    let list = dbDishes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.desc && d.desc.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      list = list.filter(
        (d) =>
          d.category &&
          d.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    if (activeFilter === "rating") {
      list = list.filter((d) => (d.rating || 4.8) >= 4.5);
    } else if (activeFilter === "veg") {
      list = list.filter((d) => d.veg !== false);
    } else if (activeFilter === "fast") {
      list = list.filter((d) => (parseInt(d.time || "25") || 25) <= 25);
    } else if (activeFilter === "offers") {
      list = list.filter((d) => Boolean(d.tag));
    }

    return list;
  }, [dbDishes, searchQuery, selectedCategory, activeFilter]);

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
              placeholder="Search dishes, paneer, thali, biryani..."
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

        {/* Promotional Deals Grid */}
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
                  title: "Special Thalis",
                  subtitle: "PURE GHEE FROM",
                  badgeText: "DEAL OF THE DAY",
                  priceText: "₹180 only",
                  imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
                  targetType: "category",
                  targetValue: "Royal Thalis",
                },
                {
                  id: "card_3",
                  title: "Royal Biryani",
                  subtitle: "DUM BIRYANI FROM",
                  badgeText: "BESTSELLER",
                  priceText: "₹169 only",
                  imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80",
                  targetType: "category",
                  targetValue: "Biryani & Pulao",
                },
                {
                  id: "card_4",
                  title: "100% Pure Veg",
                  subtitle: "Hygienic Cloud Kitchens",
                  badgeText: "MAX SAFETY",
                  imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
                  targetType: "link",
                  targetValue: "/menu",
                },
              ]
          ).map((card: any, idx: number) => (
            <div
              key={card.id || idx}
              onClick={() => {
                if (card.targetType === "category") handleCategoryClick(card.targetValue);
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

        {/* Circular Category Browser (Eat what makes you happy) */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e6e2d8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#0d261e] tracking-tight">
              Eat what makes you happy
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-[#064e3b] hover:text-[#d4af37] cursor-pointer"
              >
                Clear filter (Showing all)
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center text-center group focus:outline-none cursor-pointer shrink-0"
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
                    className={`text-xs font-bold mt-1.5 truncate max-w-[80px] ${
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
              src="https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=300&q=80"
              alt="Malashree Pure Veg"
              className="size-20 sm:size-24 rounded-2xl object-cover shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0d261e] tracking-tight">
                  Malashree Pure Veg
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-300 font-extrabold text-[10px]">
                  100% Pure Veg
                </span>
              </div>
              <p className="text-xs text-[#52635c] mt-0.5">
                North Indian · Royal Thalis · Dum Biryani · Fast Food
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#52635c] mt-2 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-[#064e3b] text-[#d4af37] font-extrabold flex items-center gap-1 text-[11px]">
                  4.8 <Star className="size-3 fill-[#d4af37]" />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-[#52635c]" />
                  {userLocation?.etaMin || 22} mins ETA
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#d4af37]" />
                  {userLocation?.kitchenName || "Pune Central Kitchen"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/menu"
            className="px-6 py-3 rounded-2xl bg-[#064e3b] text-[#d4af37] font-black text-xs uppercase tracking-wider hover:bg-[#0a5c46] transition shadow-xs flex items-center gap-2 self-stretch md:self-auto justify-center border border-[#d4af37]/30"
          >
            <span>Explore All 260+ Dishes</span>
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
                        <div className="w-full h-8 bg-[#064e3b] text-[#d4af37] rounded-xl flex items-center justify-between px-2 shadow-md">
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
    </div>
  );
}
