import { motion } from "framer-motion";
import { Gift, Handshake, Package, HandCoins } from "lucide-react";

const ITEMS = [
  { icon: Gift, title: "Product Quality", desc: "We offer trusted brands and genuine automotive parts only." },
  { icon: Handshake, title: "Expert Support", desc: "Contact us anytime for guidance on finding the right parts." },
  { icon: Package, title: "Warranty Info", desc: "All products include brand warranty details for peace of mind." },
  { icon: HandCoins, title: "Secure Inquiry", desc: "Reach us safely through call or WhatsApp for product details." },
];

export function Features() {
  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ITEMS.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-card shadow-sm p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center text-primary mb-4">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
