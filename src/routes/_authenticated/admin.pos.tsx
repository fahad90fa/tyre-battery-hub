import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, localToday } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, summarizeMethods, paymentStatus } from "@/lib/payments";
import { effectivePrice } from "@/lib/pricing";
import { matchesQuery } from "@/lib/search";
import { printArea } from "@/lib/print";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { InvoiceQuickView } from "@/components/admin/InvoiceQuickView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, Zap, Banknote, SplitSquareHorizontal, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pos")({
  component: PosPage,
});

type CartLine = { product_id: string; name: string; qty: number; price: number; cost: number | null; stock: number };
type PayLine = { method: string; amount: number };

function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [clientId, setClientId] = useState("");
  const [saleDate, setSaleDate] = useState(() => localToday());
  const [splitMode, setSplitMode] = useState(false);
  // "" = auto: the whole bill in cash. Typing an amount records exactly what
  // was received; the rest becomes udhar on the linked account.
  const [cashReceived, setCashReceived] = useState("");
  const [payLines, setPayLines] = useState<PayLine[]>([{ method: "cash", amount: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);
  const [stockPrint, setStockPrint] = useState(false);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("id, product_name, selling_price, purchase_price, quantity_in_stock").order("product_name"),
      supabase.from("clients").select("id, name, account_no, current_balance").order("name"),
    ]);
    setProducts(p ?? []); setClients(c ?? []);
  };
  useEffect(() => { load(); }, []);

  // Every typed word must appear in the name, in any order — so
  // "Bandalayar 12 Evergreen" and "Evergreen Bandalayar 12" both match.
  const matches = useMemo(
    () => (q.trim() ? products.filter((p) => matchesQuery(p.product_name, q)) : products),
    [products, q],
  );
  const filtered = useMemo(() => matches.slice(0, q.trim() ? 60 : 30), [matches, q]);

  // Render the print-only stock list, then hand it to the browser.
  useEffect(() => {
    if (!stockPrint) return;
    const t = setTimeout(() => { printArea(); setStockPrint(false); }, 80);
    return () => clearTimeout(t);
  }, [stockPrint]);

  const total = cart.reduce((a, l) => a + l.qty * l.price, 0);
  const paid = splitMode
    ? payLines.reduce((a, l) => a + (Number(l.amount) || 0), 0)
    : (cashReceived === "" ? total : Math.max(0, Number(cashReceived) || 0));
  const remaining = Math.max(0, total - paid);
  const status = paymentStatus(total, paid);

  const addToCart = (p: any) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.product_id === p.id);
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      return [...c, {
        product_id: p.id, name: p.product_name, qty: 1,
        price: effectivePrice(p), cost: p.purchase_price ?? null,
        stock: p.quantity_in_stock ?? 0,
      }];
    });
  };
  const setCartLine = (i: number, patch: Partial<CartLine>) =>
    setCart((c) => c.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const createProduct = async (name: string) => {
    const { data, error } = await supabase.from("products")
      .insert({ product_name: name, quantity_in_stock: 0, purchase_price: 0, selling_price: 0 })
      .select().maybeSingle();
    if (error) return toast.error(error.message);
    if (data) {
      setProducts((ps) => [...ps, data]);
      addToCart(data);
      toast.success(`New product "${name}" added — set its price in the cart`);
    }
  };

  const reset = () => {
    setCart([]); setCustomerName(""); setClientId(""); setSaleDate(localToday());
    setSplitMode(false); setCashReceived(""); setPayLines([{ method: "cash", amount: 0 }]); setDueDate("");
  };

  const complete = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (cart.some((l) => !(l.price > 0))) return toast.error("Set a price for every item");
    if (paid > total) return toast.error("Payments exceed the total");
    if (remaining > 0 && !clientId)
      return toast.error("Credit (udhar) sale — link a customer account so the balance is tracked");

    const name = customerName.trim() ||
      (clientId ? clients.find((c) => c.id === clientId)?.name ?? "Walk-in customer" : "Walk-in customer");
    const activePays: PayLine[] = (splitMode
      ? payLines
      : [{ method: "cash", amount: paid }]).filter((l) => Number(l.amount) > 0);
    const methodSummary = summarizeMethods(activePays.map((l) => l.method));
    const txDate = saleDate || localToday();

    setSaving(true);
    try {
      const invId = "INV-" + Date.now();
      const { data: inv, error } = await supabase.from("invoices").insert({
        invoice_id: invId, customer_name: name, total_amount: total,
        payment_method: methodSummary, payment_status: status,
        client_id: clientId || null,
        due_date: remaining > 0 && dueDate ? dueDate : null,
        // Backdated sale: file the invoice under the chosen day (midday keeps
        // it on that local date in every timezone-sensitive report).
        ...(txDate !== localToday() ? { created_at: new Date(`${txDate}T12:00:00`).toISOString() } : {}),
      }).select().maybeSingle();
      if (error || !inv) return toast.error(error?.message ?? "Could not create invoice");

      const { error: itemsErr } = await supabase.from("invoice_items").insert(cart.map((l) => ({
        invoice_id: inv.id, product_id: l.product_id, product_name: l.name,
        quantity: l.qty, unit_price: l.price, total_price: l.qty * l.price,
        cost_price: l.cost,
      })));
      if (itemsErr) {
        await supabase.from("invoices").delete().eq("id", inv.id);
        return toast.error(itemsErr.message);
      }

      if (activePays.length > 0 && total > 0) {
        await supabase.from("invoice_payments").insert(
          activePays.map((l) => ({ invoice_id: inv.id, amount: Number(l.amount), method: l.method, payment_date: txDate })),
        );
      }

      // Stock out — aggregate per product (same product can't repeat in cart,
      // but keep it safe) and decrement.
      const deltas = new Map<string, number>();
      cart.forEach((l) => deltas.set(l.product_id, (deltas.get(l.product_id) ?? 0) + l.qty));
      for (const [pid, qty] of deltas) {
        const prod = products.find((p) => p.id === pid);
        if (prod) {
          await supabase.from("products").update({
            quantity_in_stock: Math.max(0, prod.quantity_in_stock - qty),
          }).eq("id", pid);
        }
      }

      // Per-item sale rows feed the dashboard/reports — never fail silently.
      const { error: cpErr } = await supabase.from("customer_purchases").insert(cart.map((l) => ({
        customer_name: name, product_id: l.product_id,
        quantity_purchased: l.qty, total_price: l.qty * l.price,
        cost_price: l.cost, payment_method: methodSummary, payment_status: status,
        purchase_date: txDate,
        payment_due_date: remaining > 0 && dueDate ? dueDate : null,
      })));
      if (cpErr) toast.error(`Sale saved, but the sales history row failed: ${cpErr.message}`);

      if (clientId) {
        await supabase.from("client_ledger").insert({
          client_id: clientId, entry_type: "sale", amount: total,
          reference: invId, note: cart.map((l) => `${l.name} × ${l.qty}`).join("; "),
          entry_date: txDate,
        });
        if (activePays.length > 0) {
          await supabase.from("client_ledger").insert(
            activePays.map((l) => ({
              client_id: clientId, entry_type: "payment", amount: Number(l.amount),
              method: l.method, reference: invId, note: `Paid at sale (${methodLabel(l.method)})`,
              entry_date: txDate,
            })),
          );
        }
      }

      toast.success(remaining > 0
        ? `Sale done — ${money(remaining)} udhar (${invId})`
        : `Sale done — ${money(total)} received (${invId})`);
      setLastInvoice(invId);
      setViewInvoice(invId);
      reset();
      load();
    } finally {
      setSaving(false);
    }
  };

  const stockUnits = matches.reduce((a, p) => a + (Number(p.quantity_in_stock) || 0), 0);

  return (
    <AdminShell title="Quick Sale (POS)">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Product picker */}
        <div className="lg:col-span-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input autoFocus placeholder="Search product... (any word order)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-11" />
            </div>
            <Button variant="outline" className="h-11" onClick={() => setStockPrint(true)}
                    title="Print the stock list currently matching the search">
              <Printer className="h-4 w-4 mr-2" /> Print stock list
            </Button>
          </div>
          {q.trim() && (
            <div className="mb-2 text-xs text-muted-foreground">
              {matches.length} product{matches.length === 1 ? "" : "s"} · {stockUnits} unit{stockUnits === 1 ? "" : "s"} in stock
              {matches.length > filtered.length ? ` — showing first ${filtered.length}, print for the full list` : ""}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)}
                      className="rounded-xl border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors">
                <div className="text-sm font-medium leading-tight line-clamp-2">{p.product_name}</div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{money(effectivePrice(p))}</span>
                  <span className={p.quantity_in_stock > 0 ? "text-muted-foreground" : "text-destructive"}>
                    {p.quantity_in_stock > 0 ? `${p.quantity_in_stock} left` : "no stock"}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && q.trim() && (
              <button onClick={() => createProduct(q.trim())}
                      className="rounded-xl border border-dashed p-3 text-left hover:border-primary transition-colors col-span-full">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Plus className="h-4 w-4" /> Add “{q.trim()}” as a new product
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Cart / bill */}
        <div className="lg:col-span-2 rounded-2xl bg-card p-4 shadow-sm space-y-3 h-fit">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-gold" /> Bill</div>
            <div className="flex items-center gap-1.5">
              <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Sale date</Label>
              <Input type="date" value={saleDate} max={localToday()} className="h-8 w-36 text-xs"
                     onChange={(e) => e.target.value && setSaleDate(e.target.value)} />
            </div>
          </div>
          {saleDate !== localToday() && (
            <div className="rounded-lg bg-primary/5 border border-primary/30 px-3 py-1.5 text-xs">
              This sale will be recorded under <b>{shortDate(saleDate)}</b>, not today.
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Tap products to add them here.</div>
          ) : (
            <div className="space-y-2">
              {cart.map((l, i) => (
                <div key={l.product_id} className="rounded-xl border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium leading-tight flex-1 min-w-0 truncate">{l.name}</div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setCart(cart.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[11px] text-muted-foreground">Quantity</div>
                      <div className="flex items-center rounded-lg border h-9">
                        <button className="px-2.5 h-full hover:bg-muted rounded-l-lg" onClick={() => setCartLine(i, { qty: Math.max(1, l.qty - 1) })}><Minus className="h-3.5 w-3.5" /></button>
                        <Input type="number" className="h-full flex-1 border-0 text-center px-1" value={l.qty}
                               onChange={(e) => setCartLine(i, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                        <button className="px-2.5 h-full hover:bg-muted rounded-r-lg" onClick={() => setCartLine(i, { qty: l.qty + 1 })}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] text-muted-foreground">Price (Rs)</div>
                      <Input type="number" className="h-9" placeholder="0" value={l.price || ""}
                             onChange={(e) => setCartLine(i, { price: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">Line total</div>
                    <div className="text-sm font-bold">{money(l.qty * l.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-black border-t pt-2">
            <span>Total</span><span>{money(total)}</span>
          </div>

          {/* Customer — optional for cash sales */}
          <details className="rounded-xl border p-3" open={!!clientId || !!customerName}>
            <summary className="text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
              Customer (optional — walk-in by default)
            </summary>
            <div className="mt-2 space-y-2">
              <Input placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <SearchableSelect
                options={clients.map((c) => ({
                  value: c.id, label: `${c.account_no ? `${c.account_no} · ` : ""}${c.name}`,
                  hint: Number(c.current_balance) > 0 ? `owes ${money(c.current_balance)}` : undefined,
                }))}
                value={clientId}
                onValueChange={(v) => {
                  const c = clients.find((x) => x.id === v);
                  setClientId(v);
                  if (!customerName) setCustomerName(c?.name ?? "");
                }}
                placeholder="Account (needed only for udhar)"
                searchPlaceholder="Search by ID, name..."
              />
            </div>
          </details>

          {/* Payment */}
          {!splitMode ? (
            <div className="rounded-xl border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-green-600" /> Cash received now (Rs)</Label>
                <Button variant="outline" size="sm" onClick={() => { setSplitMode(true); setPayLines([{ method: "cash", amount: paid }]); }}>
                  <SplitSquareHorizontal className="h-4 w-4 mr-1" /> Split methods
                </Button>
              </div>
              <Input type="number" className="h-10 font-semibold" placeholder={total ? `${total} (full bill)` : "0"}
                     value={cashReceived}
                     onChange={(e) => setCashReceived(e.target.value)} />
              <div className="text-[11px] text-muted-foreground">
                Leave blank for the full bill in cash — or type what was actually received; the rest stays as udhar on the account.
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cash: <b className="text-foreground">{money(paid)}</b></span>
                <span className={remaining > 0 ? "text-orange-500 font-semibold" : "text-green-600 font-semibold"}>
                  {remaining > 0 ? `Udhar: ${money(remaining)}` : "Fully paid"}
                </span>
              </div>
              {remaining > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Due date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Payments</Label>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPayLines([...payLines, { method: "cash", amount: 0 }])}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setSplitMode(false); setCashReceived(""); setPayLines([{ method: "cash", amount: 0 }]); }}>
                    Cash only
                  </Button>
                </div>
              </div>
              {payLines.map((l, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={l.method} onValueChange={(v) => setPayLines((ls) => ls.map((x, j) => j === i ? { ...x, method: v } : x))}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Amount" value={l.amount || ""}
                         onChange={(e) => setPayLines((ls) => ls.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} />
                  {payLines.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setPayLines(payLines.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Paid: <b className="text-foreground">{money(paid)}</b></span>
                <span className={remaining > 0 ? "text-orange-500 font-semibold" : "text-green-600 font-semibold"}>
                  {remaining > 0 ? `Udhar: ${money(remaining)}` : "Fully paid"}
                </span>
              </div>
              {remaining > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Due date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <Button className="w-full h-12 text-base font-bold" onClick={complete} disabled={saving || cart.length === 0}>
            {saving ? "Saving..." : remaining > 0 ? `Complete — ${money(remaining)} udhar` : `Complete sale — ${money(total)}`}
          </Button>
          {lastInvoice && (
            <Button variant="outline" className="w-full" onClick={() => setViewInvoice(lastInvoice)}>
              Print last invoice ({lastInvoice})
            </Button>
          )}
        </div>
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
                {q.trim() ? ` · search: “${q.trim()}”` : " · all products"}
                {` · ${matches.length} product${matches.length === 1 ? "" : "s"} · ${stockUnits} unit${stockUnits === 1 ? "" : "s"}`}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase border-b">
                  <th className="py-1.5 pr-2">#</th>
                  <th className="py-1.5 pr-2">Product</th>
                  <th className="py-1.5 pr-2 text-right">Price</th>
                  <th className="py-1.5 text-right">In stock</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((p, i) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-1.5 pr-2">{i + 1}</td>
                    <td className="py-1.5 pr-2">{p.product_name}</td>
                    <td className="py-1.5 pr-2 text-right">{money(effectivePrice(p))}</td>
                    <td className="py-1.5 text-right font-semibold">{p.quantity_in_stock ?? 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="py-2" colSpan={3}>Total units</td>
                  <td className="py-2 text-right">{stockUnits}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <InvoiceQuickView invoiceRef={viewInvoice} onClose={() => setViewInvoice(null)} />
    </AdminShell>
  );
}
