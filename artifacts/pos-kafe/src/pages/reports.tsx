import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { 
  useGetSalesSummary,
  useGetTopMenuItems,
  useGetPaymentMethodStats,
  useGetBranchComparison,
  getGetSalesSummaryQueryKey,
  getGetTopMenuItemsQueryKey,
  getGetPaymentMethodStatsQueryKey,
  getGetBranchComparisonQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, Award } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appliedParams, setAppliedParams] = useState({ startDate, endDate });

  const queryParams = { 
    branchId: isOwner ? undefined : (user?.branchId ?? undefined),
    startDate: appliedParams.startDate,
    endDate: appliedParams.endDate
  };

  const { data: salesSummary } = useGetSalesSummary(queryParams, { query: { queryKey: getGetSalesSummaryQueryKey(queryParams) } });
  const { data: topItems } = useGetTopMenuItems({ ...queryParams, limit: 10 }, { query: { queryKey: getGetTopMenuItemsQueryKey({ ...queryParams, limit: 10 }) } });
  const { data: paymentStats } = useGetPaymentMethodStats(queryParams, { query: { queryKey: getGetPaymentMethodStatsQueryKey(queryParams) } });
  const { data: branchStats } = useGetBranchComparison(queryParams, { query: { enabled: isOwner, queryKey: getGetBranchComparisonQueryKey(queryParams) } });

  const handleApply = () => setAppliedParams({ startDate, endDate });

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const totalRev = salesSummary?.totalRevenue || 0;
  const totalOrd = salesSummary?.totalOrders || 0;
  const avgOrd = totalOrd > 0 ? totalRev / totalOrd : 0;
  const topItem = topItems?.[0]?.menuItemName || "N/A";

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Business performance overview</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-0 focus-visible:ring-0 w-auto" />
          <span className="text-muted-foreground">-</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-0 focus-visible:ring-0 w-auto" />
          <Button onClick={handleApply} className="shrink-0" data-testid="btn-apply-date">Apply</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalRev)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrd}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(avgOrd)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Item</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={topItem}>{topItem}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSummary?.periods || []} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'MMM dd')} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={v => `Rp ${v/1000}k`} />
                <Tooltip 
                  formatter={(v: number) => [formatIDR(v), "Revenue"]}
                  labelFormatter={v => format(new Date(v), 'MMM dd, yyyy')}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentStats || []} dataKey="revenue" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {paymentStats?.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatIDR(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {paymentStats?.map((s, i) => (
                <div key={s.method} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  <span className="capitalize">{s.method}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Menu Items</CardTitle>
            <CardDescription>By quantity sold</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems || []} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                <Bar dataKey="quantity" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Branch Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchStats?.map(b => (
                    <TableRow key={b.branchId}>
                      <TableCell className="font-medium">{b.branchName}</TableCell>
                      <TableCell className="text-right">{b.orders}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatIDR(b.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {!branchStats?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
