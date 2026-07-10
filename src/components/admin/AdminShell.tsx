import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Package, Tag, Truck, Users, Wallet,
  FileText, BarChart3, ShoppingCart, LogOut, Wrench
} from "lucide-react";
import { signOut, useAuth } from "@/hooks/useAuth";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/stock", label: "Stock Purchases", icon: Truck },
  { to: "/admin/customers", label: "Customer Sales", icon: ShoppingCart },
  { to: "/admin/expenses", label: "Expenses", icon: Wallet },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
];

export function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-[240px] bg-sidebar text-sidebar-foreground shrink-0">
        <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-6 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-gold/15 grid place-items-center text-gold">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-sm">MT&B <span className="text-gold">ADMIN</span></div>
            <div className="text-[10px] text-gold">Control Center</div>
          </div>
        </Link>
        <nav className="flex-1 py-3">
          {LINKS.map((l) => {
            const active = l.exact ? path === l.to : path.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to as never} className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:text-gold"
                    style={{ color: active ? "var(--gold)" : undefined, background: active ? "rgba(245,158,11,0.08)" : undefined }}>
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="flex items-center gap-3 px-5 py-4 border-t border-sidebar-border text-sm hover:text-gold">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="font-bold text-lg">{title}</h1>
          <div className="text-xs text-muted-foreground truncate max-w-[240px]">{user?.email}</div>
        </header>
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
