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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isPOS = location === "/pos";

  if (!user) return null;

  const allowedNavItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  if (isPOS) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {/* Top bar for POS */}
        <header className="flex h-14 items-center justify-between px-4 border-b bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Coffee className="w-6 h-6" />
            KopiFlow POS
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user.name} ({user.role})</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
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
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xl gap-3">
          <Coffee className="w-6 h-6" />
          KopiFlow
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {allowedNavItems.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border mt-auto bg-sidebar">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate w-32">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
