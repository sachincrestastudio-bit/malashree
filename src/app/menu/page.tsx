"use client";

import Link from "next/link";

import { useMemo, useState, useEffect } from "react";
import { Search, ChevronRight, Leaf, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DishCard } from "@/components/DishCard";
import { useStore } from "@/lib/store";
import { getBranch, findDish } from "@/lib/data";
import { getKitchenMenu, searchKitchenMenu } from "@/actions/menu";
import { syncCart } from "@/actions/cart";



function MenuPage() {
  const { branchId, kitchenMenu, setKitchenMenu, cart, cartTotals, setCartTotals, setQty, removeFromCart: remove, addToCart } = useStore();
  const branch = getBranch(branchId); // Keep for static metadata (hero, vibe)
  
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch menu from backend based on search query
  useEffect(() => {
    let mounted = true;
    const fetchMenu = async () => {
      setLoading(true);
      const data = q.trim().length > 0 ? await searchKitchenMenu(q) : await getKitchenMenu();
      if (mounted) {
        setKitchenMenu(data);
        setLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(fetchMenu, q.trim().length > 0 ? 300 : 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [q, branchId, setKitchenMenu]);

  // Sync cart with server to calculate reliable totals
  useEffect(() => {
    let mounted = true;
    const fetchTotals = async () => {
      if (cart.length === 0) {
        setCartTotals(null);
        return;
      }
      const res = await syncCart(cart);
      if (mounted && res) {
        setCartTotals(res);
      }
    };
    
    const timer = setTimeout(fetchTotals, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [cart, setCartTotals]);

  // Dynamically calculate categories present in this kitchen's menu
  const categories = useMemo(() => {
    return Array.from(new Set(kitchenMenu.map(d => d.category)));
  }, [kitchenMenu]);

  // Group dishes by category, filtering by veg status
  const groupedDishes = useMemo(() => {
    const groups: { [key: string]: typeof kitchenMenu } = {};
    kitchenMenu.forEach(d => {
      // Search is handled by backend, only handle veg filter here
      const matchesVeg = !vegOnly || d.veg;
      
      if (matchesVeg) {
        if (!groups[d.category]) {
          groups[d.category] = [];
        }
        groups[d.category].push(d);
      }
    });
    return groups;
  }, [kitchenMenu, vegOnly]);

  // Filter categories to only those containing items after search/veg filters
  const activeCategories = useMemo(() => {
    return categories.filter(c => groupedDishes[c] && groupedDishes[c].length > 0);
  }, [categories, groupedDishes]);

  // Resolve full dish objects in cart
  const cartItems = useMemo(() => {
    return cart.map(c => {
      const dish = kitchenMenu.find(d => d.id === c.dishId) || findDish(c.dishId);
      return { ...c, dish };
    }).filter(i => i.dish);
  }, [cart, kitchenMenu]);

  // Use reliable checkout totals from the server
  const subtotal = cartTotals?.subtotal || 0;
  const gst = cartTotals?.tax || 0;
  const delivery = cartTotals?.deliveryFee || 0;
  const total = cartTotals?.grandTotal || 0;
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Find featured dish safely
  const featured = kitchenMenu.find(d => d.tag) ?? kitchenMenu[0];
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const featuredInCart = featured ? cart.find(c => c.dishId === featured.id) : null;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Masthead */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-6 border-b-2 border-ink">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] uppercase text-olive-dark">
          <span>Volume {new Date().getFullYear()} · {branch.area}</span>
          <span className="hidden sm:inline">The Malashree Gazette</span>
          <span>{today}</span>
        </div>
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-10 bg-lime" />
            <span className="text-[10px] tracking-[0.32em] uppercase font-mono text-lime">Menu Édition</span>
            <span className="h-px w-10 bg-lime" />
          </div>
          <h1 className="font-display text-6xl sm:text-8xl md:text-[7.5rem] leading-[0.92] text-ink">
            The <span className="italic text-emerald">Kitchen</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-olive-dark italic font-light">
            {branch.vibe} — a curated register of everything on the stove at {branch.name}, printed fresh.
          </p>
        </div>

        {/* Search + filter row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-olive" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search the register — paneer, biryani, chilli…"
              className="w-full h-12 pl-11 pr-4 bg-transparent border border-ink/20 focus:border-ink outline-none text-sm placeholder:italic placeholder:text-olive/60 transition"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`h-12 px-5 border text-[10px] font-bold tracking-[0.24em] uppercase flex items-center justify-center gap-2 transition-all ${
              vegOnly
                ? "bg-ink border-ink text-lime"
                : "bg-transparent border-ink/20 text-olive-dark hover:border-ink"
            }`}
          >
            <Leaf className="size-4" />
            Vegetarian
          </button>
        </div>

        {/* Horizontal Category Scroll (Mobile Only) */}
        <div className="md:hidden sticky top-14 z-30 bg-cream/95 backdrop-blur-md py-3 -mx-4 px-4 mt-6 border-t border-ink/10 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 w-max">
            {activeCategories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  const el = document.getElementById(`category-${c}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-4 h-9 bg-transparent border border-ink/20 text-ink text-[10px] font-bold tracking-[0.2em] uppercase hover:border-ink whitespace-nowrap"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured "cover story" */}
      {!q && !vegOnly && featured && !loading && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 border-b border-ink/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
            <div className="md:col-span-7 relative aspect-[4/3] overflow-hidden">
              <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.28em] uppercase text-cream flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-lime animate-pulse" /> Cover Story · Chef's Register
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep">Feature № 01 — {featured.category}</div>
              <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-ink mt-3">
                {featured.name.split(" ").slice(0, -1).join(" ")} <span className="italic text-emerald">{featured.name.split(" ").slice(-1)}</span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-olive-dark italic font-light leading-relaxed">
                "{featured.desc}"
              </p>
              <div className="mt-5 flex items-center gap-6 pt-5 border-t border-ink/10">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.24em] text-olive font-mono">Course</div>
                  <div className="font-display text-xl text-ink">₹{featured.price}</div>
                </div>
                <div className="h-8 w-px bg-ink/20" />
                <div>
                  <div className="text-[9px] uppercase tracking-[0.24em] text-olive font-mono">Rating</div>
                  <div className="font-display text-xl text-ink">★ {featured.rating}</div>
                </div>
                <button
                  onClick={() => featuredInCart ? setQty(featured.id, featuredInCart.qty + 1) : addToCart(featured.id)}
                  className="ml-auto group flex items-center gap-3 px-5 h-11 bg-ink text-lime text-[10px] font-bold tracking-[0.24em] uppercase hover:bg-emerald transition"
                >
                  {featuredInCart ? `Added · ${featuredInCart.qty}` : "Order this"}
                  <span className="size-6 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform"><Plus className="size-3" /></span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Category List | Menu Items | Sticky Live Cart */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-8 pb-32 md:pb-20">
        
        {/* Left Column: Vertical Category Quick Links (Desktop Only) */}
        <aside className="hidden md:block w-48 shrink-0 h-fit sticky top-24">
          <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-lime-deep mb-4 pb-3 border-b border-ink">Index</div>
          <nav className="space-y-0">
            {activeCategories.map((c, i) => {
              const count = groupedDishes[c]?.length || 0;
              return (
                <button
                  key={c}
                  onClick={() => {
                    const el = document.getElementById(`category-${c}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full text-left py-3 border-b border-ink/10 text-olive-dark hover:text-ink hover:pl-2 transition-all flex justify-between items-baseline group"
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] text-lime-deep tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-lg">{c}</span>
                  </span>
                  <span className="font-mono text-[9px] text-olive">{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Middle Column: Dishes Grouped by Category Heading */}
        <div className="flex-1 min-w-0 min-h-[50vh]">
          {loading ? (
            <div className="py-24 text-center text-olive-dark flex flex-col items-center justify-center animate-pulse">
              <span className="size-8 border-2 border-ink border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase">Loading Kitchen Menu...</p>
            </div>
          ) : activeCategories.length === 0 ? (
            <div className="py-24 text-center text-olive-dark border-y border-ink/10">
              <p className="font-display text-4xl italic text-ink">Nothing on the register.</p>
              <p className="text-xs mt-3 tracking-widest uppercase font-mono">Try clearing your filters</p>
            </div>
          ) : (
            activeCategories.map((c, ci) => {
              const dishes = groupedDishes[c] || [];
              return (
                <div key={c} id={`category-${c}`} className="mb-14 scroll-mt-24">
                  <div className="mb-6 flex items-end justify-between gap-4 pb-3 border-b-2 border-ink">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-lime-deep">Chapter {String(ci + 1).padStart(2, "0")}</span>
                      <h2 className="font-display text-3xl md:text-5xl text-ink leading-none">
                        {c}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-olive">{dishes.length} entries</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {dishes.map((d, index) => (
                      <DishCard key={d.id} dish={d} index={index} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Sticky Live Cart Widget (Desktop Only) */}
        <aside className="hidden lg:block w-80 shrink-0 h-fit sticky top-24 self-start">
          <div className="bg-cream border border-ink p-5 relative">
            <div className="absolute -top-3 left-4 bg-cream px-2 text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep">The Bill</div>
            <div className="flex items-center justify-between pb-3 border-b border-ink/20">
              <h3 className="font-display text-2xl text-ink flex items-center gap-2">
                <ShoppingBag className="size-4" /> Basket
              </h3>
              <span className="text-[10px] font-mono tracking-widest uppercase text-olive">{cartCount} items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-14 text-center text-olive-dark flex flex-col items-center">
                <ShoppingBag className="size-8 text-olive/30 mb-3" />
                <p className="font-display italic text-lg text-ink">A quiet register.</p>
                <p className="text-[10px] font-mono uppercase tracking-widest mt-2">Add from the menu</p>
              </div>
            ) : (
              <>
                {/* Cart Items list */}
                <div className="max-h-60 overflow-y-auto pr-1 my-4 divide-y divide-ink/10">
                  {cartItems.map(({ dish, qty, dishId }) => {
                    if (!dish) return null;
                    return (
                      <div key={dishId} className="flex gap-3 items-center justify-between py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-ink truncate font-display">{dish.name}</div>
                          <div className="text-[10px] text-olive font-mono">₹{dish.price} × {qty}</div>
                        </div>

                        <div className="flex items-center gap-1 border border-ink/20">
                          <button 
                            onClick={() => setQty(dishId, qty - 1)} 
                            className="size-6 grid place-items-center hover:bg-ink hover:text-cream transition"
                          >
                            <Minus className="size-2.5 text-ink" />
                          </button>
                          <span className="text-[10px] font-mono font-semibold w-4 text-center">{qty}</span>
                          <button 
                            onClick={() => setQty(dishId, qty + 1)} 
                            className="size-6 grid place-items-center hover:bg-ink hover:text-cream transition"
                          >
                            <Plus className="size-2.5 text-ink" />
                          </button>
                        </div>
                        
                        <div className="font-display text-sm text-ink text-right w-14">
                          ₹{dish.price * qty}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals & Fees */}
                <div className="pt-3 border-t border-ink/20 space-y-1.5 text-[11px] text-olive-dark font-mono">
                  <div className="flex justify-between">
                    <span className="uppercase tracking-widest">Subtotal</span>
                    <span className="text-ink">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase tracking-widest">GST 5%</span>
                    <span className="text-ink">₹{gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase tracking-widest">Delivery</span>
                    <span className="text-ink">
                      {delivery === 0 ? <span className="text-emerald font-semibold">Complimentary</span> : `₹${delivery}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 mt-2 border-t border-ink text-ink items-baseline">
                    <span className="font-display text-lg not-italic">Total Due</span>
                    <span className="font-display text-3xl text-ink"><span className="text-lime">₹</span>{total}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <Link 
                  href="/checkout" 
                  className="mt-5 w-full h-12 bg-ink text-lime font-bold text-[10px] tracking-[0.28em] uppercase flex items-center justify-center gap-3 hover:bg-emerald transition group"
                >
                  Settle the Bill <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </aside>
      </section>



      <Footer />
    </div>
  );
}
export default MenuPage;
