import {
  useGetDashboardOverview,
  useGetPeakHours,
  useGetLowStockAlerts,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  ListOrdered,
  Grid2X2,
  ChefHat,
  BarChart3,
  CalendarDays,
  RefreshCw,
  ArrowRight,
  PackageSearch,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 17) return "Selamat siang";
  return "Selamat malam";
}

function getCurrentDate() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default function Dashboard() {
  const { user } = useAuth();
  const branchId = user?.branchId ?? undefined;
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetDashboardOverview(
    { branchId },
    { query: { queryKey: ["dashboard-overview", branchId] } },
  );

  const { data: peakHours, isLoading: isPeakHoursLoading } = useGetPeakHours(
    { branchId },
    { query: { queryKey: ["dashboard-peak-hours", branchId] } },
  );

  const { data: lowStock, isLoading: isLowStockLoading } = useGetLowStockAlerts(
    { branchId },
    { query: { queryKey: ["dashboard-low-stock", branchId] } },
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["dashboard-overview", branchId],
    });
    queryClient.invalidateQueries({
      queryKey: ["dashboard-peak-hours", branchId],
    });
    queryClient.invalidateQueries({
      queryKey: ["dashboard-low-stock", branchId],
    });
    setLastRefreshed(new Date());
  };

  const refreshedLabel = (() => {
    const diffMs = now.getTime() - lastRefreshed.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "baru saja";
    if (diffMin === 1) return "1 menit lalu";
    return `${diffMin} menit lalu`;
  })();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const revenueChange = overview?.revenueChange ?? 0;
  const isPositive = revenueChange > 0;
  const lowStockCount = overview?.lowStockCount ?? 0;

  const allKpiCards = [
    {
      label: "Pendapatan Hari Ini",
      value: isOverviewLoading
        ? null
        : formatCurrency(overview?.todayRevenue || 0),
      sub:
        revenueChange === 0 ? (
          <span className="text-muted-foreground flex items-center gap-1">
            Sama dengan kemarin
          </span>
        ) : isPositive ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />+{revenueChange}% dari kemarin
          </span>
        ) : (
          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {revenueChange}% dari kemarin
          </span>
        ),
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      accent: "border-t-primary",
      gradient: "from-primary/5 to-transparent",
      roles: ["owner", "manager"],
    },
    {
      label: "Pesanan Aktif",
      value: isOverviewLoading ? null : String(overview?.activeOrders || 0),
      sub: (
        <span className="text-muted-foreground">
          {overview?.todayOrders || 0} total hari ini
        </span>
      ),
      icon: Activity,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      accent: "border-t-blue-500",
      gradient: "from-blue-500/5 to-transparent",
      roles: ["owner", "manager"],
    },
    {
      label: "Okupansi Meja",
      value: isOverviewLoading
        ? null
        : `${overview?.activeTables || 0} / ${overview?.totalTables || 0}`,
      sub: (
        <span className="text-muted-foreground">
          {overview?.pendingReservations || 0} reservasi mendatang
        </span>
      ),
      icon: Users,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      accent: "border-t-secondary",
      gradient: "from-secondary/5 to-transparent",
      roles: ["owner", "manager"],
    },
    {
      label: "Peringatan Stok Rendah",
      value: isOverviewLoading ? null : String(lowStockCount),
      sub: (
        <span
          className={
            lowStockCount > 0
              ? "text-destructive/80 font-medium"
              : "text-muted-foreground"
          }
        >
          {lowStockCount > 0
            ? "Item perlu dipesan ulang"
            : "Semua level stok OK"}
        </span>
      ),
      icon: AlertTriangle,
      iconBg: lowStockCount > 0 ? "bg-destructive/10" : "bg-muted",
      iconColor:
        lowStockCount > 0 ? "text-destructive" : "text-muted-foreground",
      accent: lowStockCount > 0 ? "border-t-destructive" : "border-t-border",
      gradient:
        lowStockCount > 0
          ? "from-destructive/5 to-transparent"
          : "from-muted/30 to-transparent",
      alert: lowStockCount > 0,
      roles: ["owner", "manager", "warehouse"],
    },
  ];

  const kpiCards = allKpiCards.filter((card) =>
    card.roles.includes(user?.role ?? ""),
  );

  const allQuickActions = [
    {
      label: "Buka POS",
      href: "/pos",
      icon: ListOrdered,
      color: "bg-primary",
      desc: "Ambil pesanan",
      shadow: "shadow-primary/30",
      roles: ["owner", "manager", "cashier", "waiter"],
    },
    {
      label: "Meja",
      href: "/tables",
      icon: Grid2X2,
      color: "bg-blue-500",
      desc: "Denah lantai",
      shadow: "shadow-blue-500/30",
      roles: ["owner", "manager", "cashier", "waiter"],
    },
    {
      label: "Dapur",
      href: "/kitchen",
      icon: ChefHat,
      color: "bg-orange-500",
      desc: "Antrean langsung",
      shadow: "shadow-orange-500/30",
      roles: ["owner", "manager", "waiter", "chef"],
    },
    {
      label: "Stok",
      href: "/stock",
      icon: PackageSearch,
      color: "bg-amber-500",
      desc: "Manajemen",
      shadow: "shadow-amber-500/30",
      roles: ["owner", "manager", "warehouse"],
    },
    {
      label: "Laporan",
      href: "/reports",
      icon: BarChart3,
      color: "bg-secondary",
      desc: "Analitik",
      shadow: "shadow-secondary/30",
      roles: ["owner", "manager"],
    },
  ];

  const quickActions = allQuickActions.filter((action) =>
    action.roles.includes(user?.role ?? ""),
  );

  const clockDisplay = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm text-muted-foreground font-medium">
              {getGreeting()},
            </p>
            <span className="text-sm font-bold">{user?.name}</span>
            <span className="hidden sm:inline text-muted-foreground/40">·</span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              {getCurrentDate()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dasbor
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm sm:hidden">
            <CalendarDays className="w-3 h-3 inline mr-1" />
            {getCurrentDate()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge
            variant="outline"
            className="text-xs px-3 py-1.5 bg-background gap-1.5 font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Langsung · {clockDisplay}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground group"
            onClick={handleRefresh}
            title={`Diperbarui ${refreshedLabel}`}
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Segarkan</span>
            <span className="hidden sm:inline text-[10px] opacity-60">
              · {refreshedLabel}
            </span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {quickActions.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            className="flex flex-col h-auto py-4 px-4 gap-3 hover:border-primary/30 hover:bg-primary/[0.03] transition-all group justify-start items-start rounded-xl"
            asChild
          >
            <Link href={action.href}>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md",
                  action.color,
                  action.shadow,
                )}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  {action.label}
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {action.desc}
                </div>
              </div>
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
              "border-t-4 shadow-sm hover:shadow-md transition-all duration-200 card-hover overflow-hidden relative",
              card.accent,
              card.alert && "bg-destructive/[0.03]",
            )}
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-60 pointer-events-none",
                card.gradient,
              )}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5 relative">
              <CardTitle
                className={cn(
                  "text-[11px] sm:text-xs font-bold leading-tight uppercase tracking-wide",
                  card.alert ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {card.label}
              </CardTitle>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  card.iconBg,
                )}
              >
                <card.icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 relative">
              {card.value === null ? (
                <Skeleton className="h-8 w-full mb-2" />
              ) : (
                <div
                  className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-black tabular-nums truncate",
                    card.alert && "text-destructive",
                  )}
                >
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
        <Card className="lg:col-span-2 shadow-sm overflow-hidden">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Jam Sibuk
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Volume pesanan per jam hari ini
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/8 text-primary px-2.5 py-1 rounded-full border border-primary/15">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Pesanan
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[260px] px-1 sm:px-3 pb-4 pt-4">
            {isPeakHoursLoading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={peakHours}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(tick) => `${tick}j`}
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
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    }}
                    labelFormatter={(label) =>
                      `${label}:00 – ${Number(label) + 1}:00`
                    }
                    formatter={(val: number) => [val, "Pesanan"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "hsl(var(--primary))",
                      strokeWidth: 0,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl gap-3 bg-muted/5">
                <Activity className="w-9 h-9 opacity-20" />
                <span className="text-sm">Belum ada data pesanan hari ini</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-3 border-b bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Perlu Perhatian
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Item di bawah stok minimum
                </CardDescription>
              </div>
              {(lowStock?.length ?? 0) > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-primary gap-1 px-2"
                  asChild
                >
                  <Link href="/stock">
                    Lihat semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-4 sm:px-5 py-4">
            {isLowStockLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <div className="space-y-2.5 stagger-children">
                {lowStock.map((item: any) => {
                  const pct = Math.min(
                    100,
                    Math.round((item.currentStock / item.minStock) * 100),
                  );
                  return (
                    <div
                      key={item.ingredientId}
                      className="p-3 rounded-xl border border-destructive/25 bg-gradient-to-r from-destructive/8 to-destructive/3 hover:from-destructive/12 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm truncate flex-1 mr-2">
                          {item.ingredientName}
                        </span>
                        <div className="shrink-0 text-right">
                          <span className="font-black text-destructive text-sm tabular-nums">
                            {item.currentStock}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{item.minStock} {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-destructive/12 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5 gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Semua level stok optimal
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
