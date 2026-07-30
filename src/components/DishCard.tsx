import { motion } from "motion/react";
import { Heart, Plus, Star, Minus } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Dish } from "@/lib/data";

export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const setQty = useStore((s) => s.setQty);
  const favs = useStore((s) => s.favorites);
  const toggle = useStore((s) => s.toggleFav);
  const inCart = cart.find((c) => c.dishId === dish.id);
  const isFav = favs.includes(dish.id);
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.2, 0.7, 0.2, 1] }}
      className="group relative bg-white overflow-hidden border border-ink/10 hover:border-lime/60 transition-all duration-500 rounded-[2px]"
    >
      {/* Editorial folio number */}
      <div className="absolute top-3 left-3 z-10 font-display text-[10px] tracking-[0.25em] text-cream mix-blend-difference">
        N°{num}
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="w-full h-full object-cover grayscale-[15%] transition-all duration-[900ms] ease-out group-hover:grayscale-0 group-hover:scale-[1.06]"
        />
        {/* Emerald wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-90" />
        <button
          onClick={() => toggle(dish.id)}
          aria-label="Save"
          className="absolute top-3 right-3 size-8 grid place-items-center rounded-full border border-cream/30 backdrop-blur-md bg-ink/20 hover:bg-cream hover:border-cream transition group/fav"
        >
          <Heart
            className={`size-3.5 transition ${isFav ? "fill-lime text-lime" : "text-cream group-hover/fav:text-ink"}`}
          />
        </button>
        {dish.tag && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <span className="h-px w-4 bg-lime" />
            <span className="text-[9px] tracking-[0.28em] uppercase text-lime font-semibold">
              {dish.tag}
            </span>
            <span className="h-px w-4 bg-lime" />
          </div>
        )}
        {/* Bottom overlay meta */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-cream">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-cream/70 font-mono">
            <span>{dish.category}</span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-1">
              <Star className="size-2.5 fill-lime text-lime" />
              {dish.rating}
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl leading-[1.05] mt-2 text-cream">
            {dish.name}
          </h3>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[11px] sm:text-xs text-olive-dark leading-relaxed line-clamp-2 min-h-[32px] sm:min-h-[36px] italic font-light">
          "{dish.desc}"
        </p>
        <div className="mt-4 pt-3 border-t border-ink/10 flex items-end justify-between gap-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-olive font-mono">Price</div>
            <div className="font-display text-2xl sm:text-3xl text-ink leading-none mt-0.5">
              <span className="text-lime">₹</span>
              {dish.price}
            </div>
          </div>
          {inCart ? (
            <div className="flex items-center gap-1 border border-ink text-ink h-9">
              <button
                onClick={() => setQty(dish.id, inCart.qty - 1)}
                className="size-9 grid place-items-center hover:bg-ink hover:text-cream transition"
              >
                <Minus className="size-3" />
              </button>
              <span className="font-mono text-xs font-semibold w-6 text-center">{inCart.qty}</span>
              <button
                onClick={() => setQty(dish.id, inCart.qty + 1)}
                className="size-9 grid place-items-center hover:bg-ink hover:text-cream transition"
              >
                <Plus className="size-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => add(dish.id)}
              className="group/btn flex items-center gap-2 pl-4 pr-2 h-9 border border-ink text-ink text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-ink hover:text-lime transition-all"
            >
              Add
              <span className="size-6 grid place-items-center bg-ink text-lime group-hover/btn:bg-lime group-hover/btn:text-ink transition">
                <Plus className="size-3" />
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
