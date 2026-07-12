import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MT&B HOUSE" },
      { name: "description", content: "Get in touch with Muzaffar Tyre And Battery House." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  from_name: z.string().trim().min(1, "Name required").max(100),
  from_email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  from_phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message required").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ from_name: "", from_email: "", from_phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("reports_inbox").insert({ ...parsed.data, status: "new" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ from_name: "", from_email: "", from_phone: "", subject: "", message: "" });
  };

  return (
    <SiteShell>
      <div className="px-4 pt-8 pb-16 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black">Contact us</h1>
        <p className="mt-3 text-muted-foreground">We'd love to help you find the right parts.</p>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {[
            { icon: Phone, label: "Phone", value: "+92 300 0000000" },
            { icon: MessageCircle, label: "WhatsApp", value: "+92 300 0000000" },
            { icon: Mail, label: "Email", value: "info@mtbhouse.com" },
            { icon: MapPin, label: "Address", value: "Muzaffargarh, Punjab, Pakistan" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl bg-card p-6 shadow-sm">
              <div className="h-11 w-11 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className="font-semibold mt-1">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-card p-6 shadow-sm">
          <div className="font-bold text-lg mb-4">Send us a message</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.from_phone} onChange={(e) => setForm({ ...form, from_phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="space-y-1.5 md:col-span-2"><Label>Message *</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          </div>
          <Button onClick={submit} disabled={busy} className="mt-4">
            <Send className="h-4 w-4 mr-2" /> {busy ? "Sending..." : "Send message"}
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
