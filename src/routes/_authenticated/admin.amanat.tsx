import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { shortDate, localToday } from "@/lib/format";
import { inStockFirst } from "@/lib/pricing";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, PackageCheck, PackageOpen, Trash2, Undo2, Phone, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/amanat")({
  component: AmanatPage,
});

const emptyForm = {
  customer_name: "", phone: "", client_id: "", product_id: "", item_name: "",
  quantity: 1, given_date: localToday(), expected_return_date: "", notes: "",
};

function AmanatPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [tab, setTab] = useState("out");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: a }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("amanat_items").select("*").order("given_date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("products").select("id, product_name, quantity_in_stock").order("product_name"),
      supabase.from("clients").select("id, name, account_no, phone").order("name"),
    ]);
    setRows(a ?? []); setProducts(p ?? []); setClients(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.customer_name.trim()) return toast.error("Customer name required");
    if (!form.item_name.trim()) return toast.error("Item name required");
    if (!(Number(form.quantity) > 0)) return toast.error("Quantity must be at least 1");

    setSaving(true);
    try {
      const { data, error } = await supabase.from("amanat_items").insert({
        customer_name: form.customer_name.trim(),
        phone: form.phone || null,
        client_id: form.client_id || null,
        product_id: form.product_id || null,
        item_name: form.item_name.trim(),
        quantity: Number(form.quantity),
        given_date: form.given_date || localToday(),
        expected_return_date: form.expected_return_date || null,
        notes: form.notes || null,
        status: "out",
      }).select().maybeSingle();
      if (error) return toast.error(error.message);
      toast.success(`Amanat ${data?.amanat_no ?? ""} recorded — ${form.item_name} × ${form.quantity}`);
      setForm({ ...emptyForm, given_date: form.given_date });
      load();
    } finally {
      setSaving(false);
    }
  };

  const markReturned = async (r: any, qty?: number) => {
    const returned = qty ?? r.quantity;
    const { error } = await supabase.from("amanat_items").update({
      status: "returned",
      returned_date: localToday(),
      returned_quantity: returned,
      updated_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.item_name} marked returned`);
    load();
  };

  const reopen = async (r: any) => {
    const { error } = await supabase.from("amanat_items").update({
      status: "out", returned_date: null, returned_quantity: 0, updated_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this amanat record?")) return;
    const { error } = await supabase.from("amanat_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const today = localToday();
  const filtered = useMemo(() => rows.filter((r) => {
    if (tab === "out" && r.status !== "out") return false;
    if (tab === "returned" && r.status !== "returned") return false;
    if (q && !`${r.amanat_no ?? ""} ${r.customer_name} ${r.phone ?? ""} ${r.item_name}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [rows, tab, q]);

  const outRows = rows.filter((r) => r.status === "out");
  const outItems = outRows.reduce((a, r) => a + Number(r.quantity), 0);
  const overdue = outRows.filter((r) => r.expected_return_date && r.expected_return_date < today);

  return (
    <AdminShell title="Amanat (Security Deposit)">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi icon={PackageOpen} label="Items out on amanat" value={String(outItems)} accent={outItems > 0} />
        <Kpi icon={PackageOpen} label="Open records" value={String(outRows.length)} />
        <Kpi icon={AlertTriangle} label="Overdue returns" value={String(overdue.length)} accent={overdue.length > 0} />
        <Kpi icon={PackageCheck} label="Returned" value={String(rows.length - outRows.length)} green />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3 h-fit">
          <div className="font-semibold">Give item on amanat</div>

          <div className="space-y-1.5"><Label>Customer name <span className="text-destructive">*</span></Label>
            <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Customer name" />
          </div>
          <div className="space-y-1.5"><Label>Phone number</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03xx-xxxxxxx" />
          </div>
          <div className="space-y-1.5"><Label>Link customer account (optional)</Label>
            <SearchableSelect
              options={clients.map((c) => ({ value: c.id, label: `${c.account_no ? `${c.account_no} · ` : ""}${c.name}`, hint: c.phone ?? undefined }))}
              value={form.client_id}
              onValueChange={(v) => {
                const c = clients.find((x) => x.id === v);
                setForm({
                  ...form, client_id: v,
                  customer_name: form.customer_name || (c?.name ?? ""),
                  phone: form.phone || (c?.phone ?? ""),
                });
              }}
              placeholder="—" searchPlaceholder="Search by ID, name..."
            />
          </div>

          <div className="space-y-1.5"><Label>Item <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={inStockFirst(products).map((p) => ({ value: p.id, label: p.product_name, hint: `${p.quantity_in_stock ?? 0} in stock` }))}
              value={form.product_id}
              onValueChange={(v) => {
                const p = products.find((x) => x.id === v);
                setForm({ ...form, product_id: v, item_name: p?.product_name ?? form.item_name });
              }}
              placeholder={form.item_name || "Select product"}
              searchPlaceholder="Search or type any item name..."
              onCreate={(name) => setForm({ ...form, product_id: "", item_name: name })}
              createLabel="Use custom item"
            />
            {form.item_name && (
              <div className="text-[11px] text-muted-foreground">Item: <b className="text-foreground">{form.item_name}</b></div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Quantity</Label>
              <Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5"><Label>Date given</Label>
              <Input type="date" value={form.given_date} onChange={(e) => setForm({ ...form, given_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5"><Label>Expected return (optional)</Label>
            <Input type="date" value={form.expected_return_date} onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })} />
          </div>
          <div className="space-y-1.5"><Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Old battery ke badle, wapas karega..." />
          </div>

          <Button className="w-full" onClick={add} disabled={saving}>
            {saving ? "Saving..." : <><Plus className="h-4 w-4 mr-2" /> Record amanat</>}
          </Button>
        </div>

        <div className="lg:col-span-2 min-w-0 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="out">On amanat{outRows.length ? ` (${outRows.length})` : ""}</TabsTrigger>
                <TabsTrigger value="returned">Returned</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customer, phone, item..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Ref</th><th className="p-3">Date</th><th className="p-3">Customer</th>
                  <th className="p-3">Item</th><th className="p-3">Qty</th><th className="p-3">Status</th><th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isOverdue = r.status === "out" && r.expected_return_date && r.expected_return_date < today;
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 font-mono text-xs text-primary whitespace-nowrap">{r.amanat_no ?? "—"}</td>
                      <td className="p-3 whitespace-nowrap">
                        {shortDate(r.given_date)}
                        {r.expected_return_date && r.status === "out" && (
                          <div className={`text-[10px] ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                            {isOverdue ? "overdue " : "due "}{shortDate(r.expected_return_date)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{r.customer_name}</div>
                        {r.phone && (
                          <a href={`tel:${r.phone}`} className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:text-primary">
                            <Phone className="h-3 w-3" /> {r.phone}
                          </a>
                        )}
                      </td>
                      <td className="p-3">
                        {r.item_name}
                        {r.notes && <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{r.notes}</div>}
                      </td>
                      <td className="p-3 font-semibold">{r.quantity}</td>
                      <td className="p-3">
                        {r.status === "out"
                          ? <span className={isOverdue ? "text-destructive font-semibold" : "text-orange-500"}>{isOverdue ? "overdue" : "on amanat"}</span>
                          : <span className="text-green-600">returned<div className="text-[10px] text-muted-foreground">{shortDate(r.returned_date)}</div></span>}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {r.status === "out" ? (
                          <Button size="sm" onClick={() => markReturned(r)}>
                            <PackageCheck className="h-4 w-4 mr-1" /> Returned
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Mark as still out" onClick={() => reopen(r)}>
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nothing here.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Kpi({ icon: Icon, label, value, green, accent }: { icon: any; label: string; value: string; green?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <Icon className={`h-4 w-4 ${accent ? "text-orange-500" : green ? "text-green-600" : "text-primary"}`} />
      </div>
      <div className={`text-xl font-black mt-1 ${accent ? "text-orange-500" : green ? "text-green-600" : ""}`}>{value}</div>
    </div>
  );
}
