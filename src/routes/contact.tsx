import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MT&B HOUSE" },
      { name: "description", content: "Get in touch with Muzaffar Tyre And Battery House." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteShell>
      <div className="px-4 pt-8 max-w-4xl mx-auto">
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
      </div>
    </SiteShell>
  );
}
