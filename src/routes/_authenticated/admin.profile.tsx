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

const MIN_PASSWORD = 8;
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function ProfileAdmin() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", avatar_url: "" });
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState<"" | "profile" | "email" | "password">("");

  const userId = user?.id;
  const userEmail = user?.email ?? "";

  // Load the profile, and keep profiles.email in step with the login email
  // (it changes only once an email change is confirmed). Keyed on id/email
  // so a token refresh doesn't wipe what is being typed.
  useEffect(() => {
    if (!userId) return;
    setNewEmail(userEmail);
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", avatar_url: data.avatar_url ?? "" });
      }
      if (userEmail && (!data || data.email !== userEmail)) {
        void supabase.from("profiles").upsert({ id: userId, email: userEmail });
      }
    });
  }, [userId, userEmail]);

  const saveProfile = async () => {
    if (!user) return;
    setBusy("profile");
    try {
      let { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email, ...profile });
      // Database not yet updated (no phone column): save the rest.
      if (error && /phone/i.test(error.message)) {
        const { phone: _phone, ...rest } = profile;
        ({ error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email, ...rest }));
        if (!error) return toast.warning("Name saved. Phone was not saved — the database needs the latest update.");
      }
      if (error) return toast.error(error.message);
      toast.success("Profile updated");
    } finally {
      setBusy("");
    }
  };

  const changeEmail = async () => {
    if (!user) return;
    const next = newEmail.trim().toLowerCase();
    if (!looksLikeEmail(next)) return toast.error("Enter a valid email address");
    if (next === userEmail.toLowerCase()) return toast.error("That is already your login email");
    setBusy("email");
    try {
      const { error } = await supabase.auth.updateUser(
        { email: next },
        { emailRedirectTo: `${window.location.origin}/admin/profile` },
      );
      if (error) return toast.error(error.message);
      toast.success("Confirmation link sent", {
        description:
          `Supabase has emailed a confirmation link to ${next}` +
          ` (and also to ${userEmail} when secure email change is on — open the link in both).` +
          ` Your login email changes only once the link is confirmed; until then keep signing in with ${userEmail}.`,
        duration: 15000,
      });
    } finally {
      setBusy("");
    }
  };

  const changePassword = async () => {
    if (!user?.email) return toast.error("This account has no email address to check the password against");
    if (!pw.current) return toast.error("Enter your current password");
    if (pw.next.length < MIN_PASSWORD) return toast.error(`New password must be at least ${MIN_PASSWORD} characters`);
    if (pw.next !== pw.confirm) return toast.error("New passwords do not match");
    if (pw.next === pw.current) return toast.error("New password must be different from the current one");
    setBusy("password");
    try {
      // Prove it's really the account holder before changing the password.
      const check = await supabase.auth.signInWithPassword({ email: user.email, password: pw.current });
      if (check.error) return toast.error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({ password: pw.next });
      if (error) return toast.error(error.message);
      toast.success("Password changed — use the new password next time you sign in");
      setPw({ current: "", next: "", confirm: "" });
    } finally {
      setBusy("");
    }
  };

  const pendingEmail = user?.new_email;

  return (
    <AdminShell title="Profile & Settings">
      <div className="grid lg:grid-cols-2 gap-4 max-w-4xl">
        <div className="rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="font-semibold">Account</div>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Login email</Label>
            <div className="flex gap-2">
              <Input id="login-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Button
                variant="outline"
                onClick={changeEmail}
                disabled={busy !== "" || !newEmail.trim() || newEmail.trim().toLowerCase() === userEmail.toLowerCase()}
              >
                {busy === "email" ? "Sending..." : "Change email"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingEmail
                ? `Change to ${pendingEmail} is waiting for confirmation — open the link emailed to you. Until then you sign in with ${userEmail}.`
                : "A confirmation link is emailed before the change takes effect."}
            </p>
          </div>
          <div className="space-y-1.5"><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <Button onClick={saveProfile} className="w-full" disabled={busy !== ""}>
            {busy === "profile" ? "Saving..." : "Save profile"}
          </Button>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <div className="font-semibold">Change password</div>
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
          <Button onClick={changePassword} className="w-full" disabled={busy !== ""}>
            {busy === "password" ? "Changing..." : "Change password"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Forgotten the current password (or signed in with Google)? Sign out and use "Forgot password?" on the sign-in page.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
