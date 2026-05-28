import { useGetDashboardOverview, useGetPeakHours, useGetLowStockAlerts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening at your branch today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-background">Live Updates</Badge>
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-3xl font-bold">{formatCurrency(overview?.todayRevenue || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">+{overview?.revenueChange || 0}%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{overview?.activeOrders || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total orders today: {overview?.todayOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Table Occupancy</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{overview?.activeTables || 0} / {overview?.totalTables || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.pendingReservations || 0} reservations upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-destructive">{overview?.lowStockCount || 0}</div>
            )}
            <p className="text-xs text-destructive/80 mt-1">
              Items need reordering
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Peak Hours (Orders by Hour)</CardTitle>
            <CardDescription>Order volume distributed across today's operating hours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isPeakHoursLoading ? (
              <Skeleton className="w-full h-full" />
            ) : peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHours}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(tick) => `${tick}:00`} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    labelFormatter={(label) => `${label}:00 - ${Number(label)+1}:00`}
                  />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No data available for today yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock List */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Inventory items below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {isLowStockLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <div className="space-y-4">
                {lowStock.map((item) => (
                  <div key={item.ingredientId} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{item.ingredientName}</span>
                      <span className="text-xs text-muted-foreground">Min: {item.minStock} {item.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-destructive">{item.currentStock}</span>
                      <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="h-full min-h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                All stock levels are optimal
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
