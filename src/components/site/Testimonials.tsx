import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import avatar from "@/assets/testimonial-avatar.jpg";

const T = [
  {
    name: "Ahsan Malik",
    msg: "Found the exact parts I needed for my car. Quality is great and the product details helped me choose the right ones easily.",
  },
  {
    name: "Iman Qureshi",
    msg: "Reliable products, quick responses on WhatsApp and the delivery arrived on time. Highly recommended for tyre and battery needs.",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % T.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="px-4 mt-10 mb-10">
      <div className="relative rounded-3xl bg-muted p-10 overflow-hidden">
        <Quote className="absolute top-6 left-6 h-10 w-10 text-gold/70" />
        <div className="max-w-2xl mx-auto text-center min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={avatar}
                alt={T[i].name}
                width={80}
                height={80}
                className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-card"
              />
              <p className="mt-6 text-foreground/80 leading-relaxed">{T[i].msg}</p>
              <div className="mt-4 font-bold">{T[i].name}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {T.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className="h-2 rounded-full transition-all"
              style={{ width: idx === i ? 24 : 8, backgroundColor: idx === i ? "var(--gold)" : "var(--border)" }}
              aria-label={`Testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
