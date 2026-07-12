import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Archive, MailOpen, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  component: InboxAdmin,
});

function InboxAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");

  const load = async () => {
    const { data } = await supabase.from("reports_inbox").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("reports_inbox").update({ status }).eq("id", id); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete message?")) return;
    await supabase.from("reports_inbox").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = { all: rows.length, new: rows.filter((r) => r.status === "new").length, read: rows.filter((r) => r.status === "read").length, archived: rows.filter((r) => r.status === "archived").length };

  return (
    <AdminShell title="Support Inbox">
      <div className="flex gap-2 mb-4">
        {(["all", "new", "read", "archived"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ml-2 opacity-70">{counts[f]}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className={`rounded-2xl bg-card p-5 shadow-sm ${r.status === "new" ? "border-l-4 border-gold" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">{r.from_name}</div>
                  <Badge variant={r.status === "new" ? "default" : "secondary"}>{r.status}</Badge>
                  {r.from_email && <span className="text-xs text-muted-foreground">{r.from_email}</span>}
                  {r.from_phone && <span className="text-xs text-muted-foreground">· {r.from_phone}</span>}
                </div>
                {r.subject && <div className="mt-1 text-sm font-medium">{r.subject}</div>}
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{r.message}</p>
                <div className="text-xs text-muted-foreground mt-2">{shortDate(r.created_at)}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                {r.status !== "read" && <Button size="icon" variant="ghost" title="Mark read" onClick={() => setStatus(r.id, "read")}><MailOpen className="h-4 w-4" /></Button>}
                {r.status !== "new" && <Button size="icon" variant="ghost" title="Mark new" onClick={() => setStatus(r.id, "new")}><Mail className="h-4 w-4" /></Button>}
                {r.status !== "archived" && <Button size="icon" variant="ghost" title="Archive" onClick={() => setStatus(r.id, "archived")}><Archive className="h-4 w-4" /></Button>}
                <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">No messages.</div>}
      </div>
    </AdminShell>
  );
}
