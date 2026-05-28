import { useGetDashboardOverview, useGetPeakHours, useGetLowStockAlerts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

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
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  const revenueChange = overview?.revenueChange ?? 0;
  const isPositive = revenueChange >= 0;

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: isOverviewLoading ? null : formatCurrency(overview?.todayRevenue || 0),
      sub: isPositive
        ? <span className="text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{revenueChange}% from yesterday</span>
        : <span className="text-rose-600 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" />{revenueChange}% from yesterday</span>,
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      accent: false,
    },
    {
      label: "Active Orders",
      value: isOverviewLoading ? null : String(overview?.activeOrders || 0),
      sub: <span className="text-muted-foreground">{overview?.todayOrders || 0} total today</span>,
      icon: Activity,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      accent: false,
    },
    {
      label: "Table Occupancy",
      value: isOverviewLoading ? null : `${overview?.activeTables || 0} / ${overview?.totalTables || 0}`,
      sub: <span className="text-muted-foreground">{overview?.pendingReservations || 0} reservations upcoming</span>,
      icon: Users,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      accent: false,
    },
    {
      label: "Low Stock Alerts",
      value: isOverviewLoading ? null : String(overview?.lowStockCount || 0),
      sub: <span className={(overview?.lowStockCount || 0) > 0 ? "text-destructive/80" : "text-muted-foreground"}>Items need reordering</span>,
      icon: AlertTriangle,
      iconBg: (overview?.lowStockCount || 0) > 0 ? "bg-destructive/10" : "bg-muted",
      iconColor: (overview?.lowStockCount || 0) > 0 ? "text-destructive" : "text-muted-foreground",
      accent: (overview?.lowStockCount || 0) > 0,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-xs sm:text-sm px-3 py-1.5 bg-background gap-2 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Updates
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {kpiCards.map((card) => (
          <Card
            key={card.label}
            className={`shadow-sm hover:shadow-md transition-all duration-200 ${card.accent ? 'border-destructive/30 bg-destructive/5' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5">
              <CardTitle className={`text-[11px] sm:text-sm font-medium leading-tight ${card.accent ? 'text-destructive' : 'text-muted-foreground'}`}>
                {card.label}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              {card.value === null ? (
                <Skeleton className="h-8 w-full mb-1" />
              ) : (
                <div className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${card.accent ? 'text-destructive' : ''}`}>
                  {card.value}
                </div>
              )}
              <p className="text-[11px] sm:text-xs mt-1 flex items-center gap-1 flex-wrap">
                {card.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Peak Hours Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
            <CardTitle className="text-base sm:text-lg">Peak Hours</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Order volume by hour today</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[260px] px-1 sm:px-3 pb-4">
            {isPeakHoursLoading ? (
              <Skeleton className="w-full h-full" />
            ) : peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHours} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(label) => `${label}:00 – ${Number(label)+1}:00`}
                  />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--primary))' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg gap-2">
                <Activity className="w-8 h-8 opacity-20" />
                <span className="text-sm">No order data for today yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
            <CardTitle className="text-base sm:text-lg">Needs Attention</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Items below minimum stock</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-4 sm:px-5 pb-4">
            {isLowStockLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <div className="space-y-2.5">
                {lowStock.map((item) => (
                  <div key={item.ingredientId} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{item.ingredientName}</span>
                      <span className="text-xs text-muted-foreground">Min: {item.minStock} {item.unit}</span>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-bold text-destructive text-sm">{item.currentStock}</span>
                      <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/10 gap-2">
                <ShoppingBag className="w-8 h-8 opacity-20" />
                <p className="text-sm">All stock levels are optimal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
