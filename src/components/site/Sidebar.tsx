import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

type Category = {
  name: string;
  subs?: { name: string; brands?: string[] }[];
};

const CATEGORIES: Category[] = [
  {
    name: "TYRES",
    subs: [
      { name: "145/70R12", brands: ["Sunfull", "Hilfy"] },
      { name: "145R12", brands: ["Sunfull"] },
    ],
  },
  { name: "TUBES" },
  { name: "BATTERIES" },
  { name: "CAR MATS" },
  { name: "CAR CARE" },
  { name: "CAR DECORATION ITEMS" },
  { name: "CAR LEDS" },
  { name: "CAR ENGINE OILS" },
  { name: "ZIAD FILTER HOUSE" },
  { name: "RIMS" },
];

export function Sidebar() {
  const [openCat, setOpenCat] = useState<string | null>("TYRES");
  const [openSub, setOpenSub] = useState<string | null>("145/70R12");

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] flex-col bg-sidebar text-sidebar-foreground pt-6 overflow-y-auto z-40">
      <div className="px-6 pb-4 text-[11px] tracking-[0.2em] text-sidebar-muted border-b border-sidebar-border">
        TYRES
      </div>
      <nav className="flex-1">
        {CATEGORIES.map((cat) => {
          const isOpen = openCat === cat.name;
          const hasSubs = !!cat.subs?.length;
          return (
            <div
              key={cat.name}
              className="border-b border-sidebar-border/60"
            >
              <button
                onClick={() =>
                  hasSubs
                    ? setOpenCat(isOpen ? null : cat.name)
                    : setOpenCat(cat.name)
                }
                className="w-full flex items-center justify-between px-6 py-4 text-[13px] tracking-[0.15em] transition-colors hover:text-gold"
                style={{ color: isOpen ? "var(--gold)" : undefined }}
              >
                <span>{cat.name}</span>
                {hasSubs && (
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-gold"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && hasSubs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {cat.subs!.map((sub) => {
                        const subOpen = openSub === sub.name;
                        return (
                          <div key={sub.name}>
                            <button
                              onClick={() =>
                                setOpenSub(subOpen ? null : sub.name)
                              }
                              className="w-full flex items-center justify-between px-3 py-2 text-[13px] transition-colors hover:text-gold"
                              style={{ color: subOpen ? "var(--gold)" : undefined }}
                            >
                              <span>{sub.name}</span>
                              <motion.span
                                animate={{ rotate: subOpen ? 90 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-gold"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.span>
                            </button>
                            <AnimatePresence initial={false}>
                              {subOpen && sub.brands && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 rounded-2xl bg-sidebar-card px-4 py-3 space-y-3">
                                    {sub.brands.map((b) => (
                                      <div
                                        key={b}
                                        className="flex items-center gap-3 text-[13px] text-sidebar-foreground/85"
                                      >
                                        <span className="h-2 w-2 rounded-full border border-sidebar-muted" />
                                        {b}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
