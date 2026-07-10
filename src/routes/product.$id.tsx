import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name, slug), brands(name)")
        .eq("id", id).maybeSingle();
      setP(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <SiteShell><div className="p-6"><Skeleton className="h-96" /></div></SiteShell>;
  if (!p) return <SiteShell><div className="p-16 text-center text-muted-foreground">Product not found.</div></SiteShell>;

  const wa = `https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in ${p.product_name} (${money(p.selling_price)}) from MT&B HOUSE.`)}`;

  return (
    <SiteShell>
      <div className="px-4 pt-6 max-w-6xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-card overflow-hidden shadow-sm">
            {p.image_url && <img src={p.image_url} alt={p.product_name} className="h-full w-full object-cover" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{p.categories?.name} {p.brands?.name && ` · ${p.brands.name}`}</div>
            <h1 className="text-3xl font-black mt-1">{p.product_name}</h1>
            <div className="text-3xl text-primary font-bold mt-4">{money(p.selling_price)}</div>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${p.quantity_in_stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {p.quantity_in_stock > 0 ? `${p.quantity_in_stock} in stock` : "Out of stock"}
            </div>
            <p className="mt-6 text-foreground/80 leading-relaxed">{p.description || "No description available."}</p>
            <div className="mt-6 flex gap-3">
              <a href={wa} target="_blank" rel="noreferrer">
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" /> Inquire on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
