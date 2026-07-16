import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import heroTyre from "@/assets/hero-tyre.jpg";

const SLIDES = [
  {
    kicker: "Performance tires",
    title: "Reliable power for every vehicle",
    sub: "Built for strength, stability, and lasting performance.",
  },
  {
    kicker: "All-season grip",
    title: "Confidence on every road",
    sub: "Engineered tread patterns for wet, dry, and rough terrain.",
  },
  {
    kicker: "Trusted brands",
    title: "Sunfull, Hilfy & more",
    sub: "Authentic tyres backed by manufacturer warranty.",
  },
];

export function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[i];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0B1120] mx-4 mt-4">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.15), transparent 60%), radial-gradient(circle at 70% 50%, rgba(37,99,235,0.15), transparent 60%)",
        }}
      />
      <div className="relative grid md:grid-cols-2 gap-6 items-center min-h-[440px] px-5 sm:px-8 py-10">
        <div className="relative order-2 md:order-1 h-[320px] md:h-[420px]">
          <motion.img
            key={i + "img"}
            src={heroTyre}
            alt="Premium tyre"
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_20px_60px_rgba(245,158,11,0.35)]"
            width={1600}
            height={900}
          />
        </div>

        <div className="relative order-1 md:order-2 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-gold text-sm uppercase tracking-[0.2em] mb-3">
                {slide.kicker}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05]">
                {slide.title}
              </h1>
              <p className="mt-4 text-white/70 max-w-md">{slide.sub}</p>
              <button className="mt-6 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-blue-hover)] transition-colors shadow-lg shadow-primary/30">
                Shop Now
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Long Life badge */}
          <div className="absolute -top-4 right-0 md:-right-4 h-20 w-20 rounded-full bg-gold text-[#0B1120] font-bold text-xs hidden md:grid place-items-center rotate-12 shadow-xl"
               style={{ clipPath: "polygon(50% 0%, 60% 8%, 71% 3%, 76% 14%, 88% 14%, 88% 26%, 98% 32%, 92% 43%, 100% 53%, 91% 62%, 96% 74%, 84% 78%, 82% 90%, 71% 87%, 63% 97%, 52% 90%, 41% 100%, 34% 88%, 22% 91%, 20% 79%, 8% 76%, 12% 64%, 2% 56%, 9% 45%, 1% 34%, 12% 29%, 12% 17%, 24% 17%, 29% 6%, 40% 11%)" }}>
            <div className="text-center leading-tight">
              <div>Long</div>
              <div>Life</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-gold hover:text-[#0B1120] text-white grid place-items-center transition-colors"
        aria-label="Prev"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-gold hover:text-[#0B1120] text-white grid place-items-center transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className="h-2 rounded-full transition-all"
            style={{
              width: idx === i ? 24 : 8,
              backgroundColor: idx === i ? "var(--gold)" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
