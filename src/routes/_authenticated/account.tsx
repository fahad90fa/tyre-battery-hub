import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { money, shortDate } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/account")({
  component: Account,
});

function Account() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("customer_purchases").select("*").eq("customer_id", user.id).order("purchase_date", { ascending: false })
      .then(({ data }) => setPurchases(data ?? []));
    supabase.from("invoices").select("*").eq("customer_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setInvoices(data ?? []));
  }, [user]);

  const debit = purchases.filter((p) => p.payment_status === "unpaid").reduce((s, p) => s + Number(p.total_price), 0);

  return (
    <SiteShell>
      <div className="px-4 pt-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black">My Account</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Stat label="Total Orders" value={String(purchases.length)} />
          <Stat label="Invoices" value={String(invoices.length)} />
          <Stat label="Outstanding" value={money(debit)} accent={debit > 0} />
        </div>

        <Card title="Order history">
          <Table headers={["Date", "Item", "Qty", "Total", "Status"]}
                 rows={purchases.map((p) => [
                   shortDate(p.purchase_date), p.customer_name, p.quantity_purchased, money(p.total_price),
                   <span className={p.payment_status === "paid" ? "text-green-600" : "text-destructive"}>{p.payment_status}</span>
                 ])} empty="No purchases yet." />
        </Card>

        <Card title="Invoices">
          <Table headers={["Invoice", "Date", "Total", "Status"]}
                 rows={invoices.map((i) => [i.invoice_id, shortDate(i.created_at), money(i.total_amount), i.payment_status])}
                 empty="No invoices yet." />
        </Card>
      </div>
    </SiteShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card shadow-sm p-5">
      <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-2 ${accent ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="px-5 py-4 border-b font-semibold">{title}</div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Table({ headers, rows, empty }: { headers: string[]; rows: any[][]; empty: string }) {
  if (rows.length === 0) return <div className="text-center text-sm text-muted-foreground py-6">{empty}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground">
            {headers.map((h) => <th key={h} className="pb-2 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => <td key={j} className="py-3 pr-3">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
