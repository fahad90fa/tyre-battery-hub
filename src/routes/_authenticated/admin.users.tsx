import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: r } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      (r ?? []).forEach((x) => {
        const arr = roleMap.get(x.user_id) ?? [];
        arr.push(x.role); roleMap.set(x.user_id, arr);
      });
      setRows((p ?? []).map((u) => ({ ...u, roles: roleMap.get(u.id) ?? [] })));
    })();
  }, []);

  return (
    <AdminShell title="Users">
      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Roles</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3"><div className="flex gap-1">{u.roles.map((r: string) => <Badge key={r} variant="secondary">{r}</Badge>)}</div></td>
                <td className="p-3">{shortDate(u.created_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No users yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
