import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { money } from "@/lib/format";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [cat, setCat] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      setCat(c);
      if (c) {
        const { data: p } = await supabase.from("products").select("*").eq("category_id", c.id);
        setProducts(p ?? []);
      }
    })();
  }, [slug]);

  return (
    <SiteShell>
      <div className="px-4 pt-6">
        <h1 className="text-3xl font-black">{cat?.name ?? "Category"}</h1>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.length === 0 && (
            <div className="col-span-full rounded-2xl bg-card p-16 text-center text-muted-foreground">
              No products in this category yet.
            </div>
          )}
          {products.map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="block rounded-2xl bg-card shadow-sm overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="aspect-square bg-muted">
                {p.image_url && <img src={p.image_url} alt={p.product_name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="font-semibold truncate">{p.product_name}</div>
                <div className="text-primary font-bold mt-1">{money(p.selling_price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
