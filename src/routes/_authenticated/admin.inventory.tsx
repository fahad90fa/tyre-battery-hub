import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, localDateOf, localToday } from "@/lib/format";
import { matchesQuery } from "@/lib/search";
import { effectivePrice } from "@/lib/pricing";
import { printArea } from "@/lib/print";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, Package, AlertTriangle, Search, X, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  component: Inventory,
});

type Movement = {
  key: string;
  date: string | null;
  type: "in" | "out";
  productId: string | null;
  product: string;
  qty: number;
  unit: number;
  party: string;
  ref: string | null;
};

function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [stockIn, setStockIn] = useState<any[]>([]);
  const [stockOut, setStockOut] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [productFilter, setProductFilter] = useState("");
  const [q, setQ] = useState("");
  const [stockPrint, setStockPrint] = useState(false);

  // Render the print-only stock list, then hand it to the browser.
  useEffect(() => {
    if (!stockPrint) return;
    const t = setTimeout(() => { printArea(); setStockPrint(false); }, 80);
    return () => clearTimeout(t);
  }, [stockPrint]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: sin }, { data: sout }] = await Promise.all([
        supabase.from("products").select("id, product_name, quantity_in_stock, purchase_price, selling_price").order("product_name"),
        supabase.from("stock_purchases").select("*, products(product_name), merchants(name)").order("date", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("invoice_items").select("*, invoices(invoice_id, customer_name, created_at)").order("id", { ascending: false }),
      ]);
      setProducts(p ?? []); setStockIn(sin ?? []); setStockOut(sout ?? []);
    })();
  }, []);

  const movements: Movement[] = useMemo(() => {
    const ins: Movement[] = stockIn.map((r) => ({
      key: `in-${r.id}`,
      date: r.date ?? localDateOf(r.created_at) ?? null,
      type: "in",
      productId: r.product_id,
      product: r.products?.product_name ?? "—",
      qty: Number(r.quantity) || 0,
      unit: Number(r.purchase_price) || 0,
      party: r.merchants?.name ?? r.supplier_name ?? "—",
      ref: r.reference,
    }));
    const outs: Movement[] = stockOut.map((r) => ({
      key: `out-${r.id}`,
      date: localDateOf(r.invoices?.created_at) || null,
      type: "out",
      productId: r.product_id,
      product: r.product_name || "—",
      qty: Number(r.quantity) || 0,
      unit: Number(r.unit_price) || 0,
      party: r.invoices?.customer_name ?? "Walk-in",
      ref: r.invoices?.invoice_id ?? null,
    }));
    return [...ins, ...outs].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [stockIn, stockOut]);

  const filtered = useMemo(() => movements.filter((m) => {
    if (tab === "in" && m.type !== "in") return false;
    if (tab === "out" && m.type !== "out") return false;
    if (productFilter && m.productId !== productFilter) return false;
    if (q && !matchesQuery(`${m.product} ${m.party} ${m.ref ?? ""}`, q)) return false;
    return true;
  }), [movements, tab, productFilter, q]);

  // The stock list to print: the COMPLETE product list with quantity and
  // prices — a physical copy of what's on the shelf. (The search box here
  // also matches parties/refs, so it must not filter the printout; the POS
  // page prints a search-filtered list.)
  const stockList = products;
  const stockListUnits = stockList.reduce((a, p) => a + (Number(p.quantity_in_stock) || 0), 0);
  const stockListValue = stockList.reduce((a, p) => a + Number(p.purchase_price ?? 0) * (Number(p.quantity_in_stock) || 0), 0);

  const totalUnits = products.reduce((a, p) => a + (p.quantity_in_stock ?? 0), 0);
  const stockValue = products.reduce((a, p) => a + Number(p.purchase_price ?? 0) * (p.quantity_in_stock ?? 0), 0);
  const outOfStock = products.filter((p) => (p.quantity_in_stock ?? 0) <= 0).length;
  const selectedProduct = products.find((p) => p.id === productFilter);
  const selIn = productFilter ? filteredSum(movements, productFilter, "in") : 0;
  const selOut = productFilter ? filteredSum(movements, productFilter, "out") : 0;

  return (
    <AdminShell title="Inventory / Stock Movements">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Package} label="Units in stock" value={totalUnits.toLocaleString()} />
        <Kpi icon={Package} label="Stock value (cost)" value={money(stockValue)} />
        <Kpi icon={ArrowDownToLine} label="Stock-in entries" value={String(stockIn.length)} green />
        <Kpi icon={AlertTriangle} label="Out of stock" value={String(outOfStock)} accent={outOfStock > 0} />
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All movements</TabsTrigger>
            <TabsTrigger value="in">Stock In</TabsTrigger>
            <TabsTrigger value="out">Stock Out</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-64">
          <SearchableSelect
            options={products.map((p) => ({ value: p.id, label: p.product_name, hint: `${p.quantity_in_stock} in stock` }))}
            value={productFilter}
            onValueChange={setProductFilter}
            placeholder="Filter by product"
            searchPlaceholder="Search product..."
          />
        </div>
        {productFilter && (
          <Button variant="ghost" size="sm" onClick={() => setProductFilter("")}><X className="h-4 w-4 mr-1" /> Clear</Button>
        )}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search product, party, ref..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => setStockPrint(true)}
                title="Print the complete stock list — every product with its quantity and prices">
          <Printer className="h-4 w-4 mr-2" /> Print stock list
        </Button>
      </div>

      {selectedProduct && (
        <div className="mb-4 rounded-2xl bg-primary/5 border border-primary/20 p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div><div className="text-[10px] uppercase text-muted-foreground tracking-wider">Product</div><b>{selectedProduct.product_name}</b></div>
          <div><div className="text-[10px] uppercase text-muted-foreground tracking-wider">Current stock</div><b className={selectedProduct.quantity_in_stock > 0 ? "" : "text-destructive"}>{selectedProduct.quantity_in_stock}</b></div>
          <div><div className="text-[10px] uppercase text-muted-foreground tracking-wider">Total received</div><b className="text-green-600">+{selIn}</b></div>
          <div><div className="text-[10px] uppercase text-muted-foreground tracking-wider">Total sold / issued</div><b className="text-orange-500">−{selOut}</b></div>
        </div>
      )}

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Product</th>
              <th className="p-3">Qty</th><th className="p-3">Unit price</th><th className="p-3">Amount</th>
              <th className="p-3">From / To</th><th className="p-3">Ref</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 300).map((m) => (
              <tr key={m.key} className="border-t">
                <td className="p-3 whitespace-nowrap">{shortDate(m.date)}</td>
                <td className="p-3">
                  {m.type === "in"
                    ? <span className="inline-flex items-center gap-1 text-green-600 font-medium"><ArrowDownToLine className="h-3.5 w-3.5" /> IN</span>
                    : <span className="inline-flex items-center gap-1 text-orange-500 font-medium"><ArrowUpFromLine className="h-3.5 w-3.5" /> OUT</span>}
                </td>
                <td className="p-3 font-medium">{m.product}</td>
                <td className={`p-3 font-semibold ${m.type === "in" ? "text-green-600" : "text-orange-500"}`}>
                  {m.type === "in" ? "+" : "−"}{m.qty}
                </td>
                <td className="p-3">{money(m.unit)}</td>
                <td className="p-3 font-semibold">{money(m.unit * m.qty)}</td>
                <td className="p-3 text-muted-foreground">{m.party}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{m.ref ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No movements found.</td></tr>}
          </tbody>
        </table>
        {filtered.length > 300 && (
          <div className="p-3 text-xs text-muted-foreground text-center border-t">
            Showing latest 300 of {filtered.length} movements — use the filters to narrow down.
          </div>
        )}
      </div>

      {/* Print-only stock list: hidden on screen; printArea() clones the
          .print-area child, so the wrapper's `hidden` never reaches print. */}
      {stockPrint && (
        <div className="hidden">
          <div className="print-area">
            <div className="border-b-2 border-foreground pb-2 mb-3">
              <div className="text-lg font-black">MT&B HOUSE — Stock List</div>
              <div className="text-sm">
                {shortDate(localToday())}
                {` · all products · ${stockList.length} product${stockList.length === 1 ? "" : "s"} · ${stockListUnits} unit${stockListUnits === 1 ? "" : "s"}`}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase border-b">
                  <th className="py-1.5 pr-2">#</th>
                  <th className="py-1.5 pr-2">Product</th>
                  <th className="py-1.5 pr-2 text-right">Purchase price</th>
                  <th className="py-1.5 pr-2 text-right">Selling price</th>
                  <th className="py-1.5 pr-2 text-right">In stock</th>
                  <th className="py-1.5 text-right">Stock value</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map((p, i) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-1.5 pr-2">{i + 1}</td>
                    <td className="py-1.5 pr-2">{p.product_name}</td>
                    <td className="py-1.5 pr-2 text-right">{money(p.purchase_price)}</td>
                    <td className="py-1.5 pr-2 text-right">{money(effectivePrice(p))}</td>
                    <td className="py-1.5 pr-2 text-right font-semibold">{p.quantity_in_stock ?? 0}</td>
                    <td className="py-1.5 text-right">{money(Number(p.purchase_price ?? 0) * (Number(p.quantity_in_stock) || 0))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="py-2" colSpan={4}>Total</td>
                  <td className="py-2 pr-2 text-right">{stockListUnits}</td>
                  <td className="py-2 text-right">{money(stockListValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function filteredSum(movements: Movement[], productId: string, type: "in" | "out") {
  return movements.filter((m) => m.productId === productId && m.type === type).reduce((a, m) => a + m.qty, 0);
}

function Kpi({ icon: Icon, label, value, green, accent }: { icon: any; label: string; value: string; green?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <Icon className={`h-4 w-4 ${accent ? "text-orange-500" : green ? "text-green-600" : "text-primary"}`} />
      </div>
      <div className={`text-xl font-black mt-1 ${accent ? "text-orange-500" : ""}`}>{value}</div>
    </div>
  );
}
