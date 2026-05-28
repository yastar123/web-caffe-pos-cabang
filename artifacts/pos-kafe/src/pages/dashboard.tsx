import { useGetDashboardOverview, useGetPeakHours, useGetLowStockAlerts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Activity, TrendingUp, TrendingDown, ListOrdered, Grid2X2, ChefHat, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const branchId = user?.branchId ?? undefined;

  const { data: overview, isLoading: isOverviewLoading } = useGetDashboardOverview(
    { branchId },
    { query: { queryKey: ["dashboard-overview", branchId] } }
  );

  const { data: peakHours, isLoading: isPeakHoursLoading } = useGetPeakHours(
    { branchId },
    { query: { queryKey: ["dashboard-peak-hours", branchId] } }
  );

  const { data: lowStock, isLoading: isLowStockLoading } = useGetLowStockAlerts(
    { branchId },
    { query: { queryKey: ["dashboard-low-stock", branchId] } }
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

  const revenueChange = overview?.revenueChange ?? 0;
  const isPositive = revenueChange >= 0;
  const lowStockCount = overview?.lowStockCount ?? 0;

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: isOverviewLoading ? null : formatCurrency(overview?.todayRevenue || 0),
      sub: isPositive
        ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{revenueChange}% from yesterday</span>
        : <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"><TrendingDown className="w-3 h-3" />{revenueChange}% from yesterday</span>,
      icon: DollarSign,
      iconClass: "bg-primary/10 text-primary",
      borderColor: "border-t-primary",
    },
    {
      label: "Active Orders",
      value: isOverviewLoading ? null : String(overview?.activeOrders || 0),
      sub: <span className="text-muted-foreground">{overview?.todayOrders || 0} total today</span>,
      icon: Activity,
      iconClass: "bg-blue-500/10 text-blue-500",
      borderColor: "border-t-blue-500",
    },
    {
      label: "Table Occupancy",
      value: isOverviewLoading ? null : `${overview?.activeTables || 0} / ${overview?.totalTables || 0}`,
      sub: <span className="text-muted-foreground">{overview?.pendingReservations || 0} reservations upcoming</span>,
      icon: Users,
      iconClass: "bg-secondary/10 text-secondary",
      borderColor: "border-t-secondary",
    },
    {
      label: "Low Stock Alerts",
      value: isOverviewLoading ? null : String(lowStockCount),
      sub: <span className={lowStockCount > 0 ? "text-destructive/80 font-medium" : "text-muted-foreground"}>
        {lowStockCount > 0 ? "Items need reordering" : "All stock levels OK"}
      </span>,
      icon: AlertTriangle,
      iconClass: lowStockCount > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
      borderColor: lowStockCount > 0 ? "border-t-destructive" : "border-t-border",
      alert: lowStockCount > 0,
    },
  ];

  const quickActions = [
    { label: "Open POS", href: "/pos", icon: ListOrdered, color: "bg-primary" },
    { label: "Tables", href: "/tables", icon: Grid2X2, color: "bg-blue-500" },
    { label: "Kitchen", href: "/kitchen", icon: ChefHat, color: "bg-orange-500" },
    { label: "Reports", href: "/reports", icon: BarChart3, color: "bg-secondary" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs px-3 py-1.5 bg-background gap-1.5 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live Updates
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Button
            key={action.href}
            variant="outline"
            className="flex flex-row sm:flex-col h-auto py-3 px-4 sm:px-2 gap-3 sm:gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group justify-start sm:justify-center"
            asChild
          >
            <Link href={action.href}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", action.color)}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-xs font-semibold text-muted-foreground group-hover:text-foreground">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {kpiCards.map((card) => (
          <Card
            key={card.label}
            className={cn(
              "border-t-4 shadow-sm hover:shadow-md transition-all duration-200 card-hover",
              card.borderColor,
              card.alert && "bg-destructive/5"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5">
              <CardTitle className={cn(
                "text-[11px] sm:text-xs font-semibold leading-tight uppercase tracking-wide",
                card.alert ? "text-destructive" : "text-muted-foreground"
              )}>
                {card.label}
              </CardTitle>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", card.iconClass)}>
                <card.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              {card.value === null ? (
                <Skeleton className="h-8 w-full mb-2" />
              ) : (
                <div className={cn(
                  "text-xl sm:text-2xl lg:text-3xl font-bold tabular-nums truncate",
                  card.alert && "text-destructive"
                )}>
                  {card.value}
                </div>
              )}
              <div className="text-[11px] sm:text-xs mt-1.5 flex items-center gap-1 flex-wrap min-h-[18px]">
                {card.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
        {/* Peak Hours Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Peak Hours</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Order volume by hour today</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Orders
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[260px] px-1 sm:px-3 pb-4 pt-4">
            {isPeakHoursLoading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHours} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(tick) => `${tick}h`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    labelFormatter={(label) => `${label}:00 – ${Number(label) + 1}:00`}
                    formatter={(val: number) => [val, "Orders"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    dot={false}
                    activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl gap-3 bg-muted/5">
                <Activity className="w-9 h-9 opacity-20" />
                <span className="text-sm">No order data for today yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Needs Attention</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Items below minimum stock</CardDescription>
              </div>
              {(lowStock?.length ?? 0) > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" asChild>
                  <Link href="/stock">View all</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-4 sm:px-5 py-4">
            {isLowStockLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <div className="space-y-2 stagger-children">
                {lowStock.map((item) => {
                  const pct = Math.min(100, Math.round((item.currentStock / item.minStock) * 100));
                  return (
                    <div key={item.ingredientId} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm truncate">{item.ingredientName}</span>
                        <div className="shrink-0 ml-2 text-right">
                          <span className="font-bold text-destructive text-sm">{item.currentStock}</span>
                          <span className="text-xs text-muted-foreground">/{item.minStock} {item.unit}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-destructive/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5 gap-3">
                <ShoppingBag className="w-9 h-9 opacity-20" />
                <p className="text-sm font-medium">All stock levels are optimal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
