import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, summarizeMethods, paymentStatus } from "@/lib/payments";
import { applyPct, impliedPct } from "@/lib/pricing";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { InvoiceQuickView } from "@/components/admin/InvoiceQuickView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, Zap, Banknote, SplitSquareHorizontal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pos")({
  component: PosPage,
});

type CartLine = { product_id: string; name: string; qty: number; price: number; base: number; pct: number; cost: number | null; stock: number };
type PayLine = { method: string; amount: number };

function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [clientId, setClientId] = useState("");
  const [splitMode, setSplitMode] = useState(false);
  const [payLines, setPayLines] = useState<PayLine[]>([{ method: "cash", amount: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [billPct, setBillPct] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("id, product_name, selling_price, purchase_price, quantity_in_stock").order("product_name"),
      supabase.from("clients").select("id, name, account_no, current_balance").order("name"),
    ]);
    setProducts(p ?? []); setClients(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? products.filter((p) => p.product_name?.toLowerCase().includes(needle)) : products;
    return list.slice(0, 30);
  }, [products, q]);

  const total = cart.reduce((a, l) => a + l.qty * l.price, 0);
  // In quick mode the whole bill is cash; in split mode the cashier types amounts.
  const paid = splitMode ? payLines.reduce((a, l) => a + (Number(l.amount) || 0), 0) : total;
  const remaining = Math.max(0, total - paid);
  const status = paymentStatus(total, paid);

  const addToCart = (p: any) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.product_id === p.id);
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l));
      const base = Number(p.selling_price) || 0;
      return [...c, {
        product_id: p.id, name: p.product_name, qty: 1,
        price: base, base, pct: 0, cost: p.purchase_price ?? null,
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
    setCart([]); setCustomerName(""); setClientId(""); setBillPct("");
    setSplitMode(false); setPayLines([{ method: "cash", amount: 0 }]); setDueDate("");
  };

  const complete = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (cart.some((l) => !(l.price > 0))) return toast.error("Set a price for every item");
    if (paid > total) return toast.error("Payments exceed the total");
    if (remaining > 0 && !clientId)
      return toast.error("Credit (udhar) sale — link a customer account so the balance is tracked");

    const name = customerName.trim() ||
      (clientId ? clients.find((c) => c.id === clientId)?.name ?? "Walk-in customer" : "Walk-in customer");
    const activePays: PayLine[] = splitMode
      ? payLines.filter((l) => Number(l.amount) > 0)
      : [{ method: "cash", amount: total }];
    const methodSummary = summarizeMethods(activePays.map((l) => l.method));

    setSaving(true);
    try {
      const invId = "INV-" + Date.now();
      const { data: inv, error } = await supabase.from("invoices").insert({
        invoice_id: invId, customer_name: name, total_amount: total,
        payment_method: methodSummary, payment_status: status,
        client_id: clientId || null,
        due_date: remaining > 0 && dueDate ? dueDate : null,
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
          activePays.map((l) => ({ invoice_id: inv.id, amount: Number(l.amount), method: l.method })),
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

      // Per-item sale rows feed the dashboard/reports.
      await supabase.from("customer_purchases").insert(cart.map((l) => ({
        customer_name: name, product_id: l.product_id,
        quantity_purchased: l.qty, total_price: l.qty * l.price,
        cost_price: l.cost, payment_method: methodSummary, payment_status: status,
        payment_due_date: remaining > 0 && dueDate ? dueDate : null,
      })));

      if (clientId) {
        await supabase.from("client_ledger").insert({
          client_id: clientId, entry_type: "sale", amount: total,
          reference: invId, note: cart.map((l) => `${l.name} × ${l.qty}`).join("; "),
        });
        if (activePays.length > 0) {
          await supabase.from("client_ledger").insert(
            activePays.map((l) => ({
              client_id: clientId, entry_type: "payment", amount: Number(l.amount),
              method: l.method, reference: invId, note: `Paid at sale (${methodLabel(l.method)})`,
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

  return (
    <AdminShell title="Quick Sale (POS)">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Product picker */}
        <div className="lg:col-span-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input autoFocus placeholder="Search product... (type & tap to add)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-11" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)}
                      className="rounded-xl border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors">
                <div className="text-sm font-medium leading-tight line-clamp-2">{p.product_name}</div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{money(p.selling_price)}</span>
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
          <div className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-gold" /> Bill</div>

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
                             onChange={(e) => {
                               const price = Number(e.target.value);
                               setCartLine(i, { price, pct: impliedPct(l.base, price) });
                             }} />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 items-end">
                    <div className="space-y-1">
                      <div className="text-[11px] text-muted-foreground">Adjust % (+/−, manual)</div>
                      <div className="relative">
                        <Input type="number" className="h-9 pr-6 text-right" placeholder="0" value={l.pct || ""}
                               onChange={(e) => {
                                 const pct = Number(e.target.value);
                                 setCartLine(i, { pct, price: applyPct(l.base, pct) });
                               }} />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] text-muted-foreground">Line total</div>
                      <div className="h-9 rounded-md border bg-muted/40 grid place-items-center text-sm font-bold">{money(l.qty * l.price)}</div>
                    </div>
                  </div>
                  {l.pct !== 0 && l.base > 0 && (
                    <div className="mt-1.5 text-[11px] text-muted-foreground">
                      Retail {money(l.base)} {l.pct > 0 ? "+" : ""}{l.pct}% → {money(l.price)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="flex items-center gap-2 border-t pt-2">
              <Label className="text-xs whitespace-nowrap">Adjust all items</Label>
              <div className="relative w-20">
                <Input type="number" className="h-8 pr-4 text-right" placeholder="+/-" value={billPct}
                       onChange={(e) => setBillPct(e.target.value)} />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                const pct = Number(billPct) || 0;
                setCart((c) => c.map((l) => (l.base > 0 ? { ...l, pct, price: applyPct(l.base, pct) } : l)));
              }}>Apply</Button>
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
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-green-600/10 text-green-700 dark:text-green-500 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                <Banknote className="h-4 w-4" /> Full cash — {money(total)}
              </div>
              <Button variant="outline" size="sm" className="h-auto" onClick={() => { setSplitMode(true); setPayLines([{ method: "cash", amount: total }]); }}>
                <SplitSquareHorizontal className="h-4 w-4 mr-1" /> Split / Udhar
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Payments</Label>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPayLines([...payLines, { method: "cash", amount: 0 }])}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setSplitMode(false); setPayLines([{ method: "cash", amount: 0 }]); }}>
                    Full cash
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

      <InvoiceQuickView invoiceRef={viewInvoice} onClose={() => setViewInvoice(null)} />
    </AdminShell>
  );
}
