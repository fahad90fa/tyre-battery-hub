import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, ChevronDown, Wrench, LogOut, LayoutDashboard, Menu, Home, ShoppingBag, Info, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, signOut } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function Navbar() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toggle = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden h-9 w-9 shrink-0 grid place-items-center rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative hidden sm:block h-6 w-11 shrink-0 rounded-full bg-muted transition-colors"
            style={{ backgroundColor: dark ? "var(--gold)" : undefined }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full transition-all"
              style={{ left: dark ? "1.5rem" : "0.125rem", backgroundColor: dark ? "white" : "var(--gold)" }}
            />
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gold/15 grid place-items-center text-gold">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-extrabold tracking-tight text-foreground whitespace-nowrap">
                MT&B <span className="text-gold">HOUSE</span>
              </div>
              <div className="text-[10px] text-gold tracking-wide truncate">
                Muzaffar Tyre And Battery House
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-primary transition-colors">
              Pages <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link to="/about">About</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/contact">Contact</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 grid place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {(user.email ?? "?")[0].toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account"><User className="h-4 w-4 mr-2" /> My Account</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Sign in">
              <User className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} dark={dark} onToggleTheme={toggle} />
    </header>
  );
}

function MobileMenu({ open, onClose, dark, onToggleTheme }: { open: boolean; onClose: () => void; dark: boolean; onToggleTheme: () => void }) {
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    if (!open || cats.length > 0) return;
    (async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").order("display_order");
      setCats(data ?? []);
    })();
  }, [open, cats.length]);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto bg-sidebar text-sidebar-foreground border-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-gold/15 grid place-items-center text-gold">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-sm">MT&B <span className="text-gold">HOUSE</span></div>
            <div className="text-[10px] text-gold">Muzaffar Tyre And Battery House</div>
          </div>
        </div>

        <nav className="py-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to as never} onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 text-sm hover:text-gold transition-colors">
              <l.icon className="h-4 w-4 text-gold" /> {l.label}
            </Link>
          ))}
        </nav>

        {cats.length > 0 && (
          <>
            <div className="px-5 pt-4 pb-2 text-[11px] tracking-[0.2em] text-sidebar-foreground/50 border-t border-sidebar-border">
              SHOP CATEGORIES
            </div>
            <nav className="pb-4">
              {cats.map((c) => (
                <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} onClick={onClose}
                      className="flex items-center gap-3 px-5 py-2.5 text-[13px] hover:text-gold transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
                  {c.name}
                </Link>
              ))}
            </nav>
          </>
        )}

        <div className="px-5 py-4 border-t border-sidebar-border flex items-center justify-between">
          <span className="text-xs text-sidebar-foreground/60">Dark mode</span>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="relative h-6 w-11 rounded-full bg-white/10 transition-colors"
            style={{ backgroundColor: dark ? "var(--gold)" : undefined }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full transition-all bg-white"
              style={{ left: dark ? "1.5rem" : "0.125rem" }}
            />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to as never}
      activeProps={{ className: "text-primary relative" }}
      className="hover:text-primary transition-colors"
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}
