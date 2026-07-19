import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Package, Tag, Truck, Users, Wallet, FileText, BarChart3,
  ShoppingCart, LogOut, Wrench, Store, UserCircle, Briefcase, LayoutTemplate,
  Inbox, Settings, Menu, FileSpreadsheet,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { signOut, useAuth } from "@/hooks/useAuth";

const GROUPS: { label: string; links: { to: string; label: string; icon: any; exact?: boolean }[] }[] = [
  { label: "Overview", links: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ]},
  { label: "Inventory", links: [
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/templates", label: "Templates", icon: LayoutTemplate },
    { to: "/admin/stock", label: "Stock Purchases", icon: Truck },
  ]},
  { label: "Accounts", links: [
    { to: "/admin/clients", label: "Customer Accounts", icon: UserCircle },
    { to: "/admin/merchants", label: "Merchant Accounts", icon: Store },
  ]},
  { label: "People", links: [
    { to: "/admin/employees", label: "Employees", icon: Briefcase },
    { to: "/admin/users", label: "Users", icon: Users },
  ]},
  { label: "Sales", links: [
    { to: "/admin/customers", label: "Customer Sales", icon: ShoppingCart },
    { to: "/admin/invoices", label: "Invoices", icon: FileText },
    { to: "/admin/quotations", label: "Quotations", icon: FileSpreadsheet },
  ]},
  { label: "Finance", links: [
    { to: "/admin/expenses", label: "Expenses", icon: Wallet },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  ]},
  { label: "Support", links: [
    { to: "/admin/inbox", label: "Inbox", icon: Inbox },
  ]},
  { label: "Account", links: [
    { to: "/admin/profile", label: "Profile", icon: Settings },
  ]},
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-5 pt-5 pb-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-gold/15 grid place-items-center text-gold">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-sm">MT&B <span className="text-gold">ADMIN</span></div>
          <div className="text-[10px] text-gold">Control Center</div>
        </div>
      </Link>
      <nav className="flex-1 py-3 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-2">
            <div className="px-5 pt-2 pb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/40">{g.label}</div>
            {g.links.map((l) => {
              const active = l.exact ? path === l.to : path.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to as never} onClick={onNavigate}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:text-gold"
                      style={{ color: active ? "var(--gold)" : undefined, background: active ? "rgba(245,158,11,0.08)" : undefined }}>
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="flex items-center gap-3 px-5 py-4 border-t border-sidebar-border text-sm hover:text-gold">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

export function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-0 lg:hidden">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 print:hidden gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
                    className="lg:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-muted -ml-1">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-lg truncate">{title}</h1>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground truncate max-w-[240px]">{user?.email}</div>
        </header>
        <main className="p-4 sm:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
