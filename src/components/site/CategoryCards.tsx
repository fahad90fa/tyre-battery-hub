import { motion } from "framer-motion";
import showcase from "@/assets/category-showcase.jpg";

const CATS = [
  { name: "145/70R12", items: 2 },
  { name: "145R12", items: 1 },
  { name: "145R13", items: 2 },
  { name: "155R13", items: 1 },
  { name: "165R13", items: 2 },
];

export function CategoryCards() {
  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATS.map((c, i) => (
          <motion.article
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl bg-card shadow-sm p-4 overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-3 right-3 z-10 rounded-full bg-[#0F172A] text-white text-[11px] px-3 py-1">
              Items ({c.items})
            </div>
            <div className="text-xs text-muted-foreground mb-1">Category</div>
            <div className="text-lg font-bold text-foreground">{c.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Items ({c.items})
            </div>
            <div className="mt-3 aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={showcase}
                alt={c.name}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
