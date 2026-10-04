import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useCompany, saveCompany, type Company } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Landmark, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: BusinessSettings,
});

const BUSINESS: { key: keyof Company; label: string; hint?: string }[] = [
  { key: "name", label: "Short name (logo)", hint: "Shown big on slips, e.g. MT&B House Auto Hub" },
  { key: "fullName", label: "Full business name", hint: "Printed under the logo" },
  { key: "tagline", label: "Tagline" },
  { key: "phone", label: "Phone number" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "address", label: "Address" },
  { key: "branch", label: "Branch" },
];
const BANK: { key: keyof Company; label: string; hint?: string }[] = [
  { key: "bankName", label: "Bank name" },
  { key: "bankAccountTitle", label: "Account title" },
  { key: "bankAccountNumber", label: "Account number", hint: "Once filled in, every slip prints the transfer details" },
  { key: "bankIban", label: "IBAN" },
];

/** Owner-editable company details — slips, letterheads, contact page. */
function BusinessSettings() {
  const live = useCompany();
  const [form, setForm] = useState<Company>(live);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(live); }, [live]);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await saveCompany(form);
      if (error) return toast.error(error);
      toast.success("Business details saved — slips, letterheads and the website now use them");
    } finally {
      setSaving(false);
    }
  };

  const field = ({ key, label, hint }: { key: keyof Company; label: string; hint?: string }) => (
    <div key={key} className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );

  return (
    <AdminShell title="Business Settings">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-gold" /> Business details</div>
          <div className="text-xs text-muted-foreground">Printed on every invoice, quotation and ledger, and shown on the website's contact page.</div>
          <div className="grid sm:grid-cols-2 gap-3">{BUSINESS.map(field)}</div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3 h-fit">
          <div className="font-semibold flex items-center gap-2"><Landmark className="h-4 w-4 text-gold" /> Bank transfer details</div>
          <div className="text-xs text-muted-foreground">
            Leave blank to keep them off the slip. Fill in the account number and every slip you send out carries it automatically.
          </div>
          <div className="grid gap-3">{BANK.map(field)}</div>
        </div>
      </div>
      <Button className="mt-4 w-full lg:w-auto" onClick={save} disabled={saving}>
        <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save business details"}
      </Button>
    </AdminShell>
  );
}
