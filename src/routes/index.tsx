import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/site/Sidebar";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { CategoryCards } from "@/components/site/CategoryCards";
import { Features } from "@/components/site/Features";
import { PremiumBanner } from "@/components/site/PremiumBanner";
import { Deals } from "@/components/site/Deals";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MT&B HOUSE — Muzaffar Tyre And Battery House" },
      {
        name: "description",
        content:
          "Premium tyres, batteries, tubes and car care products from trusted brands. Reliable performance with warranty and expert support.",
      },
      { property: "og:title", content: "MT&B HOUSE — Muzaffar Tyre And Battery House" },
      { property: "og:description", content: "Premium tyres, batteries, tubes and car care from trusted brands." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[240px]">
        <Navbar />
        <main className="pb-10">
          <Hero />
          <CategoryCards />
          <Features />
          <PremiumBanner />
          <Deals />
          <Testimonials />
        </main>
      </div>
    </div>
  );
}
