import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { shortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

/** The login the app was handed over with — not the owner's. */
const DEV_DEFAULT_EMAIL = "admin@example.com";

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  roles: string[];
};

const dateTime = (s: string | null) =>
  s ? new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

const isAdminRow = (u: UserRow) => u.roles.includes("admin");

function explain(error: { message: string; hint?: string | null }) {
  if (/row-level security|permission denied/i.test(error.message)) {
    return {
      message: "Not allowed by the database",
      description: "Only admins can change roles, and the database needs the latest update (admin roles) before roles can be changed here.",
    };
  }
  return { message: error.message, description: error.hint ?? undefined };
}

function UsersAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [partial, setPartial] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let list: UserRow[];
    const { data, error } = await supabase.rpc("admin_list_users");
    if (!error && data) {
      list = data.map((u) => ({ ...u, roles: u.roles ?? [] }));
      setPartial(false);
    } else {
      // Database not yet updated: only accounts that have a profile row.
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, string[]>();
      (r ?? []).forEach((x) => roleMap.set(x.user_id, [...(roleMap.get(x.user_id) ?? []), x.role]));
      list = (p ?? []).map((u) => ({ ...u, last_sign_in_at: null, roles: roleMap.get(u.id) ?? [] }));
      setPartial(true);
    }
    // Admins first, then newest accounts.
    list.sort((a, b) => Number(isAdminRow(b)) - Number(isAdminRow(a)) || (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const adminCount = rows.filter(isAdminRow).length;

  const grantAdmin = async (u: UserRow) => {
    setBusyId(u.id);
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: u.id, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (error) {
        const e = explain(error);
        return toast.error(e.message, { description: e.description });
      }
      toast.success(`${u.email ?? "User"} is now an admin`);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const revokeAdmin = async (u: UserRow) => {
    const self = u.id === user?.id;
    const question = self
      ? "Revoke YOUR OWN admin access?\n\nYou will lose access to the admin panel straight away. Only do this once another admin login (e.g. the owner's) works."
      : `Revoke admin access from ${u.email ?? "this user"}?`;
    if (!confirm(question)) return;
    setBusyId(u.id);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", u.id)
        .eq("role", "admin")
        .select("id");
      if (error) {
        const e = explain(error);
        return toast.error(e.message, { description: e.description });
      }
      if (!data || data.length === 0) {
        return toast.error("Nothing was revoked", {
          description: "The database did not allow it — it needs the latest update (admin roles) before roles can be changed here.",
        });
      }
      toast.success(`Admin access revoked from ${u.email ?? "user"}`);
      if (self) return navigate({ to: "/" });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell title="Users">
      <div className="rounded-2xl bg-card p-5 shadow-sm mb-4 text-sm">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <Info className="h-4 w-4 text-primary" /> Setting up the owner's own admin login
        </div>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>On the sign-in page, create an account with the owner's email (or use "Forgot password?" if that email already has an account) and confirm the email.</li>
          <li>Back here, signed in as an existing admin, press <b>Grant admin</b> on that account.</li>
          <li>Sign out and sign in with the owner's email to check it works.</li>
          <li>Then revoke admin from the developer account ({DEV_DEFAULT_EMAIL}).</li>
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          Each admin changes their own login email and password under Profile &amp; Settings. The last admin can never be revoked.
        </p>
      </div>

      {partial && !loading && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 p-3 mb-4 text-sm">
          Showing only accounts that have a profile, without last sign-in. Run the latest database update (admin roles) to list every login account and to grant or revoke admin here.
        </div>
      )}

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Roles</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Last sign-in</th>
              <th className="p-3 text-right">Admin access</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const admin = isAdminRow(u);
              const self = u.id === user?.id;
              const onlyAdmin = admin && adminCount <= 1;
              const devDefault = (u.email ?? "").toLowerCase() === DEV_DEFAULT_EMAIL;
              return (
                <tr key={u.id} className="border-t align-top">
                  <td className="p-3">
                    <div className="font-medium">{u.email ?? "—"}{self && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}</div>
                    {devDefault && (
                      <div className="text-xs text-amber-600 mt-0.5">Developer default account — revoke once your own admin login works</div>
                    )}
                  </td>
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.length === 0 && <span className="text-xs text-muted-foreground">none</span>}
                      {u.roles.map((r) => <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>)}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{shortDate(u.created_at)}</td>
                  <td className="p-3 whitespace-nowrap">{partial ? "—" : dateTime(u.last_sign_in_at)}</td>
                  <td className="p-3 text-right">
                    {admin ? (
                      <Button
                        size="sm" variant="outline"
                        disabled={busyId !== null || onlyAdmin}
                        title={onlyAdmin ? "The only admin can't be revoked — grant admin to another account first" : undefined}
                        onClick={() => revokeAdmin(u)}
                      >
                        <ShieldOff className="h-4 w-4 mr-1" />{busyId === u.id ? "Revoking..." : "Revoke admin"}
                      </Button>
                    ) : (
                      <Button size="sm" disabled={busyId !== null} onClick={() => grantAdmin(u)}>
                        <ShieldCheck className="h-4 w-4 mr-1" />{busyId === u.id ? "Granting..." : "Grant admin"}
                      </Button>
                    )}
                    {onlyAdmin && <div className="text-[11px] text-muted-foreground mt-1">Only admin</div>}
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No users yet.</td></tr>}
            {loading && rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Loading…</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
