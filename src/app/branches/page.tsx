"use client";


import { motion } from "motion/react";
import { Check, Clock, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { BRANCHES, findDish } from "@/lib/data";



function Branches() {
  const branchId = useStore(s => s.branchId);
  const setBranch = useStore(s => s.setBranch);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8">
        <div className="text-xs uppercase tracking-widest text-olive">All branches</div>
        <h1 className="font-display text-5xl md:text-6xl mt-2 leading-[0.95]">
          three kitchens. <span className="italic">one promise.</span>
        </h1>
        <p className="mt-4 text-olive-dark max-w-xl">Pick a branch to personalize your menu, offers and delivery time. Changing branch resets your cart.</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 grid md:grid-cols-3 gap-5">
        {BRANCHES.map((b, i) => {
          const selected = b.id === branchId;
          const feat = b.featured.map(id => findDish(id)!).slice(0, 2);
          return (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-3xl border-2 transition ${selected ? "border-ink bg-white" : "border-transparent bg-white hover:border-ink/30"}`}
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={b.hero} alt={b.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                {selected && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-lime text-ink text-xs font-bold flex items-center gap-1">
                    <Check className="size-3" /> Currently delivering
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4 text-cream">
                  <div className="text-xs uppercase tracking-widest text-lime">{b.tagline}</div>
                  <div className="font-display text-2xl">{b.name}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 text-sm text-olive-dark">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" />{b.distanceKm} km</span>
                  <span className="flex items-center gap-1"><Clock className="size-3.5" />{b.etaMin} min</span>
                </div>
                <p className="mt-3 text-sm text-olive-dark">{b.vibe}</p>
                <div className="mt-4 flex gap-2">
                  {feat.map(f => (
                    <div key={f.id} className="flex-1 bg-cream rounded-xl p-2.5">
                      <img src={f.image} alt={f.name} className="w-full aspect-square object-cover rounded-lg" />
                      <div className="text-[11px] mt-1.5 font-medium truncate">{f.name}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setBranch(b.id)}
                  disabled={selected}
                  className={`mt-5 w-full h-11 rounded-full font-medium text-sm transition ${selected ? "bg-ink/5 text-olive-dark cursor-default" : "bg-ink text-cream hover:bg-ink/90"}`}
                >
                  {selected ? "Currently selected" : "Order from here"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </section>
      <Footer />
    </div>
  );
}
export default Branches;
