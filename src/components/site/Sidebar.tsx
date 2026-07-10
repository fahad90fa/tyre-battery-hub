import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Sub = { id: string; name: string; slug: string };
type Cat = { id: string; name: string; slug: string; subs: Sub[] };

export function Sidebar() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [openCat, setOpenCat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase
        .from("categories")
        .select("id, name, slug, subcategories(id, name, slug)")
        .order("display_order");
      const rows: Cat[] = (c ?? []).map((x: any) => ({
        id: x.id, name: x.name, slug: x.slug,
        subs: x.subcategories ?? [],
      }));
      setCats(rows);
      if (rows[0]) setOpenCat(rows[0].name);
    })();
  }, []);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] flex-col bg-sidebar text-sidebar-foreground pt-6 overflow-y-auto z-40">
      <div className="px-6 pb-4 text-[11px] tracking-[0.2em] text-sidebar-muted border-b border-sidebar-border">
        SHOP CATEGORIES
      </div>
      <nav className="flex-1">
        {cats.map((cat) => {
          const isOpen = openCat === cat.name;
          const hasSubs = cat.subs.length > 0;
          return (
            <div key={cat.id} className="border-b border-sidebar-border/60">
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.name)}
                className="w-full flex items-center justify-between px-6 py-4 text-[13px] tracking-[0.15em] transition-colors hover:text-gold"
                style={{ color: isOpen ? "var(--gold)" : undefined }}
              >
                <Link to="/category/$slug" params={{ slug: cat.slug }} className="text-left flex-1">
                  {cat.name}
                </Link>
                {hasSubs && (
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.25 }} className="text-gold">
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
                    <div className="px-4 pb-4">
                      <div className="rounded-2xl bg-sidebar-card px-4 py-3 space-y-2">
                        {cat.subs.map((s) => (
                          <Link
                            key={s.id}
                            to="/shop"
                            search={{ sub: s.slug } as never}
                            className="flex items-center gap-3 text-[13px] text-sidebar-foreground/85 hover:text-gold transition-colors py-1"
                          >
                            <span className="h-2 w-2 rounded-full border border-sidebar-muted" />
                            {s.name}
                          </Link>
                        ))}
                      </div>
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
