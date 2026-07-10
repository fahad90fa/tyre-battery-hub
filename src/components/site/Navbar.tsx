import { Link } from "@tanstack/react-router";
import { Search, User, ChevronDown, Wrench } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative h-6 w-11 rounded-full bg-muted transition-colors"
            style={{ backgroundColor: dark ? "var(--gold)" : undefined }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-gold transition-all"
              style={{ left: dark ? "1.5rem" : "0.125rem", backgroundColor: dark ? "white" : "var(--gold)" }}
            />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gold/15 grid place-items-center text-gold">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-foreground">
                MT&B <span className="text-gold">HOUSE</span>
              </div>
              <div className="text-[10px] text-gold tracking-wide">
                Muzaffar Tyre And Battery House
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className="text-primary relative"
          >
            Home
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded" />
          </Link>
          <a href="#shop" className="hover:text-primary transition-colors">Shop</a>
          <button className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            Pages <ChevronDown className="h-4 w-4" />
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Account">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
