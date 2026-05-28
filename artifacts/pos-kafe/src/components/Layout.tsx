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
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useDarkMode } from "@/hooks/use-dark-mode";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "manager"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/pos", label: "POS", icon: ListOrdered, roles: ["owner", "manager", "cashier", "waiter"] },
      { href: "/tables", label: "Tables", icon: Grid2X2, roles: ["owner", "manager", "cashier", "waiter"] },
      { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["owner", "manager", "waiter", "chef"] },
      { href: "/reservations", label: "Reservations", icon: CalendarDays, roles: ["owner", "manager", "cashier", "waiter"] },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/menu", label: "Menu", icon: MenuSquare, roles: ["owner", "manager"] },
      { href: "/stock", label: "Stock", icon: PackageSearch, roles: ["owner", "manager", "warehouse"] },
      { href: "/reports", label: "Reports", icon: LineChart, roles: ["owner", "manager"] },
      { href: "/customers", label: "Customers", icon: Users, roles: ["owner", "manager", "cashier"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/branches", label: "Branches", icon: Store, roles: ["owner"] },
      { href: "/users", label: "Staff", icon: UserCog, roles: ["owner", "manager"] },
      { href: "/settings", label: "Settings", icon: Settings, roles: ["owner", "manager"] },
    ],
  },
];

const ALL_PAGES = NAV_GROUPS.flatMap(g => g.items);

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  const isPOS = location === "/pos";

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  if (!user) return null;

  const currentPage = ALL_PAGES.find(p => location.startsWith(p.href));

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Coffee className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-base leading-tight text-sidebar-foreground">KopiFlow</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">POS System</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <nav className="px-2 space-y-4">
          {NAV_GROUPS.map((group) => {
            const allowedItems = group.items.filter(item => item.roles.includes(user.role));
            if (allowedItems.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {allowedItems.map((item) => {
                    const isActive = location.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[42px] relative group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-foreground/40 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "w-[17px] h-[17px] shrink-0",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                        )} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-primary/20">
            {user.name.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Logout"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  if (isPOS) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <header className="flex h-14 items-center justify-between px-4 border-b bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Coffee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base hidden sm:inline">KopiFlow POS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">
              {user.name} <span className="text-muted-foreground capitalize">({user.role})</span>
            </span>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">← Back</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-sidebar border-r flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile: overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: slide-in sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar border-r flex flex-col z-50 transition-transform duration-300 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="absolute top-3 right-3 z-10">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="min-h-[40px] min-w-[40px] h-9 w-9">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center gap-3 px-4 h-14 border-b bg-card shrink-0 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="min-h-[40px] min-w-[40px] h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Coffee className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-primary">
              {currentPage ? currentPage.label : "KopiFlow"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
