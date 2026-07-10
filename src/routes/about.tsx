import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Wrench, ShieldCheck, Award, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MT&B HOUSE" },
      { name: "description", content: "Muzaffar Tyre And Battery House — trusted tyre and battery specialists." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <div className="px-4 pt-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black">About MT&B HOUSE</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
          Muzaffar Tyre And Battery House has served drivers for years, offering authentic tyres,
          batteries, tubes, and premium car care products backed by manufacturer warranty and
          honest expert advice.
        </p>
        <div className="grid md:grid-cols-4 gap-4 mt-10">
          {[
            { icon: Wrench, title: "Expert Fitting", desc: "Professional installation on the spot." },
            { icon: ShieldCheck, title: "Warranty", desc: "Every product carries brand warranty." },
            { icon: Award, title: "Trusted Brands", desc: "Sunfull, Hilfy, MRF, CEAT, Exide and more." },
            { icon: MapPin, title: "Local Service", desc: "Serving Muzaffargarh and surrounding areas." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center text-primary mb-3">
                <Icon className="h-6 w-6" />
              </div>
              <div className="font-semibold">{title}</div>
              <div className="text-sm text-muted-foreground mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
