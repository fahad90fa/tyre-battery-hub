import { motion } from "framer-motion";
import banner from "@/assets/premium-collection.jpg";

export function PremiumBanner() {
  return (
    <section className="px-4 mt-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#0B1120]">
        <img
          src={banner}
          alt="Premium tyre collection"
          loading="lazy"
          width={1600}
          height={700}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/60 to-transparent" />

        {/* sparkles */}
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold animate-sparkle"
            style={{
              left: `${20 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        <div className="relative grid md:grid-cols-2 items-center min-h-[360px] p-6 sm:p-10">
          <div />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white text-right md:text-left"
          >
            <div className="text-sm tracking-[0.3em] text-white/70 uppercase">Tires</div>
            <div className="mt-2 text-4xl sm:text-5xl md:text-6xl font-black leading-none">
              <span className="text-transparent" style={{ WebkitTextStroke: "2px var(--brand-blue)" }}>
                PREMIUM
              </span>
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px var(--brand-blue)" }}>
                COLLECTION
              </span>
            </div>
            <div className="mt-6 text-gold text-xl font-semibold">Performance</div>
            <p className="mt-2 text-white/70 max-w-sm">
              High-quality tires built for grip, safety &amp; durability.
            </p>
            <button className="mt-5 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-[#0B1120] hover:opacity-90 transition-opacity">
              Explore Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
