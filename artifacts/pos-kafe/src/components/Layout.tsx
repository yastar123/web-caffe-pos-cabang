import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Coffee,
  LayoutDashboard,
  Grid2X2,
  ListOrdered,
  ChefHat,
  CalendarDays,
  MenuSquare,
  PackageSearch,
  LineChart,
  Users,
  Store,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "manager"] },
  { href: "/pos", label: "POS", icon: ListOrdered, roles: ["owner", "manager", "cashier", "waiter"] },
  { href: "/tables", label: "Tables", icon: Grid2X2, roles: ["owner", "manager", "cashier", "waiter"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["owner", "manager", "waiter", "chef"] },
  { href: "/reservations", label: "Reservations", icon: CalendarDays, roles: ["owner", "manager", "cashier", "waiter"] },
  { href: "/menu", label: "Menu", icon: MenuSquare, roles: ["owner", "manager"] },
  { href: "/stock", label: "Stock", icon: PackageSearch, roles: ["owner", "manager", "warehouse"] },
  { href: "/reports", label: "Reports", icon: LineChart, roles: ["owner", "manager"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["owner", "manager", "cashier"] },
  { href: "/branches", label: "Branches", icon: Store, roles: ["owner"] },
  { href: "/users", label: "Staff", icon: UserCog, roles: ["owner", "manager"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["owner", "manager"] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPOS = location === "/pos";

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  if (isPOS) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <header className="flex h-14 items-center justify-between px-4 border-b bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Coffee className="w-6 h-6" />
            <span className="hidden sm:inline">KopiFlow POS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">
              {user.name} <span className="text-muted-foreground capitalize">({user.role})</span>
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xl gap-3 shrink-0">
        <Coffee className="w-6 h-6 shrink-0" />
        <span>KopiFlow</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-0.5 px-2">
          {allowedNavItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border shrink-0 bg-sidebar">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="shrink-0 min-w-[44px] min-h-[44px]">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile: overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: slide-in sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-sidebar border-r flex flex-col z-50 transition-transform duration-300 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="absolute top-3 right-3 z-10">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="min-h-[44px] min-w-[44px]">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center gap-3 px-4 h-14 border-b bg-card shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="min-h-[44px] min-w-[44px]"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Coffee className="w-5 h-5" />
            KopiFlow
          </div>
          <div className="ml-auto text-xs text-muted-foreground capitalize">{user.role}</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
