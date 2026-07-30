"use client";

import { motion } from "motion/react";
import { Check, Clock, MapPin, Navigation } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";
import { BRANCHES, findDish } from "@/lib/data";

function Branches() {
  const branchId = useStore((s) => s.branchId);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8">
        <div className="text-xs uppercase tracking-widest text-olive font-mono">Kitchen Network</div>
        <h1 className="font-display text-5xl md:text-6xl mt-2 leading-[0.95] text-ink">
          three kitchens. <span className="italic text-emerald">one promise.</span>
        </h1>
        <p className="mt-4 text-olive-dark max-w-xl leading-relaxed">
          Kitchen branches are automatically allotted strictly based on your live GPS location to guarantee piping-hot deliveries. Users order from their nearest allotted branch.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-lime/10 border border-lime/30 text-xs font-mono text-ink flex items-center gap-3">
          <Navigation className="size-4 text-lime-deep shrink-0 fill-lime" />
          <span>Automatic Branch Allotment Active · Nearest Kitchen is calculated via GPS coordinates.</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 grid md:grid-cols-3 gap-5">
        {BRANCHES.map((b, i) => {
          const selected = b.id === branchId;
          const feat = b.featured.map((id) => findDish(id)!).filter(Boolean).slice(0, 2);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-3xl border-2 transition ${
                selected ? "border-ink bg-white shadow-lg" : "border-ink/10 bg-white"
              }`}
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={b.hero} alt={b.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                {selected ? (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-lime text-ink text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Check className="size-3" /> Your Allotted Kitchen Zone
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-ink/70 text-cream text-[10px] font-mono uppercase tracking-widest">
                    Kitchen Zone
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4 text-cream">
                  <div className="text-xs uppercase tracking-widest text-lime">{b.tagline}</div>
                  <div className="font-display text-2xl">{b.name}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 text-sm text-olive-dark font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    Radius: {b.distanceKm} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    Avg: {b.etaMin} min
                  </span>
                </div>
                <p className="mt-3 text-sm text-olive-dark">{b.vibe}</p>
                <div className="mt-4 flex gap-2">
                  {feat.map((f) => (
                    <div key={f.id} className="flex-1 bg-cream rounded-xl p-2.5">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="text-[11px] mt-1.5 font-medium truncate">{f.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 w-full h-11 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center border border-ink/10 text-olive-dark bg-ink/5">
                  {selected ? "✓ Your Allotted Branch" : "GPS Allotment Only"}
                </div>
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
