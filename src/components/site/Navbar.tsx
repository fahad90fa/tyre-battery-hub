import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, ChevronDown, Wrench, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth, signOut } from "@/hooks/useAuth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [dark, setDark] = useState(false);
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
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative h-6 w-11 rounded-full bg-muted transition-colors"
            style={{ backgroundColor: dark ? "var(--gold)" : undefined }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full transition-all"
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

        <div className="flex items-center gap-3">
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
    </header>
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
