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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Business performance overview</p>
        </div>
        <div className="flex items-center gap-1.5 bg-card p-1 rounded-lg border shadow-sm flex-wrap sm:flex-nowrap">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-0 focus-visible:ring-0 w-auto text-sm h-8" />
          <span className="text-muted-foreground text-sm px-1">–</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-0 focus-visible:ring-0 w-auto text-sm h-8" />
          <Button onClick={handleApply} size="sm" className="shrink-0 h-8" data-testid="btn-apply-date">Apply</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 stagger-children">
        {[
          { label: "Total Revenue", value: formatIDR(totalRev), Icon: DollarSign },
          { label: "Total Orders", value: String(totalOrd), Icon: ShoppingCart },
          { label: "Avg Order Value", value: formatIDR(avgOrd), Icon: TrendingUp },
          { label: "Top Item", value: topItem, Icon: Award, truncate: true },
        ].map(({ label, value, Icon, truncate }) => (
          <Card key={label} className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className={`text-lg sm:text-2xl font-bold ${truncate ? 'truncate' : ''}`} title={truncate ? value : undefined}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
            <CardTitle className="text-base sm:text-lg">Revenue Trend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[280px] px-1 sm:px-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSummary?.periods || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'MMM d')} fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} dx={-5} tickFormatter={v => `${v/1000}k`} />
                <Tooltip
                  formatter={(v: number) => [formatIDR(v), "Revenue"]}
                  labelFormatter={v => format(new Date(v), 'MMM dd, yyyy')}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
            <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Revenue by payment type</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentStats || []} dataKey="revenue" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3}>
                  {paymentStats?.map((_, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {paymentStats?.map((s, i) => (
                <div key={s.method} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  <span className="capitalize text-muted-foreground">{s.method}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 stagger-children">
        <Card className="shadow-sm">
          <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
            <CardTitle className="text-base sm:text-lg">Top Menu Items</CardTitle>
            <CardDescription className="text-xs sm:text-sm">By quantity sold</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] sm:h-[340px] px-1 sm:px-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems || []} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="menuItemName" type="category" width={110} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="quantity" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="shadow-sm">
            <CardHeader className="px-4 sm:px-6 pt-5 pb-2">
              <CardTitle className="text-base sm:text-lg">Branch Comparison</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Performance by branch</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-4 sm:pl-6">Branch</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right pr-4 sm:pr-6">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchStats?.map(b => (
                    <TableRow key={b.branchId} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium pl-4 sm:pl-6">{b.branchName}</TableCell>
                      <TableCell className="text-right tabular-nums">{b.orders}</TableCell>
                      <TableCell className="text-right font-bold text-primary tabular-nums pr-4 sm:pr-6">{formatIDR(b.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {!branchStats?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-10">No data available</TableCell>
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
