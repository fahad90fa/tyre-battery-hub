import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "", avatar_url: "" });
  const [pw, setPw] = useState({ next: "", confirm: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: (data as any).phone ?? "", avatar_url: (data as any).avatar_url ?? "" });
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email, ...profile });
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    if (!pw.next || pw.next.length < 6) return toast.error("Password too short");
    if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    if (error) return toast.error(error.message);
    toast.success("Password changed");
    setPw({ next: "", confirm: "" });
  };

  return (
    <AdminShell title="Profile & Settings">
      <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
        <div className="rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="font-semibold">Account</div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <Button onClick={saveProfile} className="w-full">Save profile</Button>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="font-semibold">Change password</div>
          <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
          <Button onClick={changePassword} className="w-full">Change password</Button>
        </div>
      </div>
    </AdminShell>
  );
}
