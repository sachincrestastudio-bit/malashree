"use client";

import Link from "next/link";

import { motion } from "motion/react";
import { ArrowRight, Clock, Utensils, ShieldCheck, Plus, Quote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { getBranch, findDish } from "@/lib/data";



function Home() {
  const branchId = useStore(s => s.branchId);
  const orders = useStore(s => s.orders);
  const add = useStore(s => s.addToCart);
  const branch = getBranch(branchId);
  const featured = branch.featured.map(id => findDish(id)!).filter(Boolean);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const issue = `Vol. ${new Date().getFullYear()} · Issue ${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Masthead */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-4 border-b-2 border-ink">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.24em] uppercase text-olive-dark">
          <span>{issue}</span>
          <span className="hidden sm:inline">The Malashree Gazette · Front Page</span>
          <span>{today}</span>
        </div>
      </section>

      {/* Editorial Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-20 grid md:grid-cols-12 gap-8 md:gap-12 items-end">
          <div className="md:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime-deep"
            >
              <span className="h-px w-10 bg-lime" />
              Édition Directe · From {branch.area}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
              className="font-display mt-5 text-[clamp(3rem,8.5vw,7rem)] leading-[0.9] tracking-[-0.02em] text-ink"
            >
              Cooked <span className="italic text-emerald">slow.</span><br />
              Delivered <span className="italic text-emerald">direct.</span>
            </motion.h1>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="border-l-2 border-lime pl-4">
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-olive">The Lede</div>
                <p className="mt-2 text-sm text-olive-dark leading-relaxed italic font-light">
                  No aggregators. No marked-up menus. Malashree launches its own direct-order kitchen line — hand-pounded spices, copper pots, and 18-hour dals arriving from {branch.name}.
                </p>
              </div>
              <div className="border-l-2 border-ink/20 pl-4">
                <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-olive">By the numbers</div>
                <div className="mt-2 space-y-1 font-mono text-[11px] text-olive-dark">
                  <div className="flex justify-between"><span>Kitchen ETA</span><span className="text-ink">{branch.etaMin} min</span></div>
                  <div className="flex justify-between"><span>Distance</span><span className="text-ink">{branch.distanceKm} km</span></div>
                  <div className="flex justify-between"><span>Reader rating</span><span className="text-ink">★ 4.8 / 12k</span></div>
                  <div className="flex justify-between"><span>Service fee</span><span className="text-emerald">Nil</span></div>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-10 flex items-center gap-4"
            >
              <Link href="/menu" className="group h-12 pl-6 pr-2 inline-flex items-center gap-4 bg-ink text-lime text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-emerald transition">
                Open the register
                <span className="size-9 grid place-items-center bg-lime text-ink group-hover:rotate-90 transition-transform">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              <Link href="/branches" className="text-[11px] font-mono tracking-[0.24em] uppercase text-olive-dark hover:text-ink underline underline-offset-4 decoration-lime decoration-2">
                Switch branch
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="md:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ink">
              <img src={branch.hero} alt={branch.name} className="w-full h-full object-cover grayscale-[10%] scale-[1.02]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[9px] font-mono tracking-[0.28em] uppercase text-cream/80">
                <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-lime animate-pulse" />Live from kitchen</span>
                <span>Plate N°01</span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-cream">
                <div className="text-[10px] uppercase tracking-[0.28em] text-lime">Today at {branch.area}</div>
                <div className="font-display text-2xl md:text-3xl mt-1 leading-[1.05]">{branch.tagline}</div>
                <div className="text-xs text-cream/70 mt-1 italic font-light">"{branch.vibe}"</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-cream border border-ink px-4 py-3">
              <div className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime-deep">Use code</div>
              <div className="font-display text-2xl leading-none mt-1">{branch.offers[0].code}</div>
              <div className="text-[10px] mt-1 text-olive-dark">{branch.offers[0].sub}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-ink text-cream py-5 overflow-hidden border-y border-ink">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0">
              {["fresh ingredients", "no service fees", "30-minute promise", "hand-rolled rotis", "direct from kitchen", "real prices", "fresh ingredients", "no service fees", "30-minute promise", "hand-rolled rotis"].map((t, j) => (
                <span key={j} className="font-display text-2xl flex items-center gap-12">
                  <span className="italic">{t}</span>
                  <span className="size-2 rounded-full bg-lime" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Brand Story Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
          <img 
            src="https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80" 
            alt="Traditional Indian kitchen prep" 
            className="w-full h-full object-cover grayscale-[15%]" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/75 via-ink/20 to-transparent" />
          <div className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.28em] uppercase text-cream/80">Feature № 02 · Kitchen</div>
          <div className="absolute bottom-6 left-6 right-6 text-cream">
            <Quote className="size-5 text-lime mb-2" />
            <p className="font-display italic text-xl leading-relaxed">
              "No shortcuts. We pound our spices, hand-roll our rotis, and cook in copper vessels. That is the Malashree promise."
            </p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-lime mt-3 font-mono">— Chef Rajesh Malashree</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-lime" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-lime-deep font-mono">Chapter 02 · Heritage</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl mt-4 text-ink leading-[0.95]">
            A heritage of flavour,<br/>cooked for the <span className="italic text-emerald">soul.</span>
          </h2>
          <p className="mt-6 text-olive-dark text-base leading-relaxed first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:text-emerald">
            At Malashree, we believe that food is more than sustenance—it is a connection to home. That is why we cook everything fresh daily. No pre-cooked base gravies, no artificial coloring, and no third-party delivery markups.
          </p>
          <p className="mt-4 text-olive-dark text-sm leading-relaxed italic font-light">
            By handling our own delivery direct from our three specialized kitchens, we ensure your paneer lababdar arrives piping hot, and your garlic naan remains soft and buttery.
          </p>
          <div className="mt-8 grid grid-cols-3 border-t border-b border-ink/20 divide-x divide-ink/10">
            <div className="py-4 pr-3">
              <div className="font-display text-3xl text-ink">100<span className="text-lime">%</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-olive-dark mt-1">Fresh daily</div>
            </div>
            <div className="py-4 px-3">
              <div className="font-display text-3xl text-ink">18<span className="text-lime text-xl">h</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-olive-dark mt-1">Dal slow-cook</div>
            </div>
            <div className="py-4 pl-3">
              <div className="font-display text-3xl text-ink italic">Direct</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-olive-dark mt-1">Zero markup</div>
            </div>
          </div>
        </div>
      </section>



      {/* Signature Masterpieces */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24 border-t border-ink/10">
        <div className="flex items-end justify-between mb-10 pb-4 border-b-2 border-ink">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.28em] text-lime-deep">
              <span className="h-px w-8 bg-lime" />
              Chapter 03 · The Chef's Register
            </div>
            <h2 className="font-display text-4xl md:text-6xl mt-3 leading-[0.95]">Signature <span className="italic text-emerald">masterpieces</span></h2>
          </div>
          <Link href="/menu" className="hidden sm:flex text-[10px] font-mono tracking-[0.24em] uppercase items-center gap-2 text-ink hover:text-emerald transition group">
            Full register <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featured.map((d, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                className="group bg-white overflow-hidden border border-ink/10 hover:border-emerald transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.06] transition-all duration-[900ms]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.28em] text-cream">N°{num}</div>
                    {d.tag && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="h-px w-3 bg-lime" />
                      <span className="text-[9px] font-mono tracking-[0.28em] uppercase text-lime">{d.tag}</span>
                    </div>
                    )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-mono text-cream tracking-widest">
                    <span className={`size-2.5 border ${d.veg ? "border-lime" : "border-red-400"} grid place-items-center`}>
                      <span className={`size-1 rounded-full ${d.veg ? "bg-lime" : "bg-red-400"}`} />
                    </span>
                    <span>★ {d.rating}</span>
                    <span className="opacity-50">/</span>
                    <span className="uppercase">{d.category}</span>
                  </div>
                      </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-2xl text-ink leading-[1.05]">{d.name}</h3>
                  <p className="text-xs text-olive-dark mt-2 leading-relaxed italic font-light line-clamp-2 flex-1">"{d.desc}"</p>
                  <div className="mt-4 pt-3 border-t border-ink/10 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-[0.24em] text-olive">Course</div>
                      <div className="font-display text-2xl text-ink leading-none mt-0.5"><span className="text-lime">₹</span>{d.price}</div>
                    </div>
                    <button 
                      onClick={() => add(d.id)}
                      className="group/btn flex items-center gap-2 pl-3 pr-1 h-9 border border-ink text-ink text-[10px] font-bold tracking-[0.24em] uppercase hover:bg-ink hover:text-lime transition"
                    >
                      Add
                      <span className="size-7 grid place-items-center bg-ink text-lime group-hover/btn:bg-lime group-hover/btn:text-ink transition"><Plus className="size-3" /></span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Offers strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-lime" />
          <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-lime-deep">The Classifieds</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {branch.offers.map((o, i) => (
            <motion.div key={o.code}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden p-8 bg-ink text-cream border-y-2 border-lime"
            >
              <div className="absolute -right-8 -top-8 size-48 rounded-full bg-emerald/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-lime">Classified № {String(i + 1).padStart(2, "0")}</div>
                  <div className="text-[10px] font-mono text-cream/40">{today}</div>
                </div>
                <div className="font-display text-4xl mt-3 leading-[1]">{o.title}</div>
                <div className="text-cream/70 mt-2 text-sm italic font-light">{o.sub}</div>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-lime text-lime font-mono text-sm tracking-[0.24em]">
                  ▸ {o.code}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 border-t border-ink/10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink/10">
          {[
            { icon: Utensils, title: "Cooked, not assembled", body: "Copper pots. Hand-pounded spice mixes. Slow flame. Every plate leaves the pass in under twelve minutes of finish." },
            { icon: ShieldCheck, title: "Our riders, our promise", body: "In-house delivery only. No aggregator queues. No commission spread across your bill." },
            { icon: Clock, title: "The 30-minute promise", body: `Optimized routes from ${branch.area}. If we take longer than ${branch.etaMin + 5} minutes, your dessert is on us.` },
          ].map((f, i) => (
            <div key={i} className="px-2 md:px-8 py-6 md:py-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.28em] text-lime-deep">№ {String(i + 1).padStart(2, "0")}</span>
                <f.icon className="size-4 text-emerald" />
          </div>
              <h4 className="font-display text-2xl text-ink mt-3 leading-[1.05]">{f.title}</h4>
              <p className="text-sm text-olive-dark mt-2 italic font-light leading-relaxed">{f.body}</p>
        </div>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      {orders.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 border-t border-ink/10 pt-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-lime" />
            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-lime-deep">Archives · Order Again</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.slice(0, 3).map(o => (
              <Link href="/menu" key={o.id} className="bg-white p-5 border border-ink/10 hover:border-ink transition group">
                <div className="flex justify-between items-baseline">
                  <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-olive-dark">Order · {o.id}</div>
                  <div className="text-[10px] font-mono text-olive">{new Date(o.date).toLocaleDateString()}</div>
                </div>
                <div className="mt-3 font-display text-2xl text-ink">{o.items.length} plate{o.items.length > 1 ? "s" : ""}</div>
                <div className="mt-1 font-mono text-xs text-olive-dark">Total · <span className="text-ink">₹{o.total}</span></div>
                <div className="mt-4 text-[10px] font-mono tracking-[0.24em] uppercase text-emerald group-hover:translate-x-1 transition-transform flex items-center gap-1">Reorder <ArrowRight className="size-3" /></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="bg-ink text-cream p-8 sm:p-12 md:p-20 relative overflow-hidden border-y-2 border-lime">
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] font-mono tracking-[0.28em] uppercase text-cream/60">
            <span>Letters to the Editor</span>
            <span>№ 04</span>
          </div>
          <Quote className="size-10 text-lime mt-6" />
          <div className="mt-4 font-display text-3xl md:text-5xl leading-[1.05] max-w-3xl italic">
            "Same Malashree paneer I've ordered for years — but the app is just <span className="not-italic bg-lime text-ink px-2">faster, smoother, cheaper.</span>"
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-mono tracking-[0.28em] uppercase text-lime">
            <span className="h-px w-8 bg-lime" />
            Priya R. · Regular · Pimple Saudagar
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
