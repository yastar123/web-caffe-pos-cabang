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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp, DollarSign, ShoppingBag, Star, BarChart3, Trophy, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Reports() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const isOwner = user?.role === "owner";

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 29), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [appliedStart, setAppliedStart] = useState(startDate);
  const [appliedEnd, setAppliedEnd] = useState(endDate);

  const queryParams = {
    startDate: appliedStart,
    endDate: appliedEnd,
    branchId: isOwner ? undefined : (branchId ?? undefined),
  };

  const { data: summary, isLoading: loadingSummary } = useGetSalesSummary(
    queryParams,
    { query: { queryKey: getGetSalesSummaryQueryKey(queryParams) } }
  );

  const { data: topItems, isLoading: loadingTop } = useGetTopMenuItems(
    queryParams,
    { query: { queryKey: getGetTopMenuItemsQueryKey(queryParams) } }
  );

  const { data: paymentStats, isLoading: loadingPayment } = useGetPaymentMethodStats(
    queryParams,
    { query: { queryKey: getGetPaymentMethodStatsQueryKey(queryParams) } }
  );

  const { data: branchComparison, isLoading: loadingBranch } = useGetBranchComparison(
    { startDate: appliedStart, endDate: appliedEnd },
    { query: { enabled: isOwner, queryKey: getGetBranchComparisonQueryKey({ startDate: appliedStart, endDate: appliedEnd }) } }
  );

  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (summary?.periods && summary.periods.length > 0) {
      const revenueData = summary.periods.map((r: any) => ({
        "Tanggal": r.date,
        "Pendapatan (IDR)": Number(r.revenue),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueData), "Tren Pendapatan");
    }

    if (topItems && topItems.length > 0) {
      const topData = topItems.map((t: any) => ({
        "Nama Item": t.menuItemName,
        "Jumlah Terjual": Number(t.totalQuantity),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topData), "Item Terlaris");
    }

    if (paymentStats && paymentStats.length > 0) {
      const payData = paymentStats.map((p: any) => ({
        "Metode Pembayaran": p.method,
        "Pendapatan (IDR)": Number(p.revenue),
        "Jumlah Transaksi": Number(p.count ?? 0),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payData), "Metode Pembayaran");
    }

    if (isOwner && branchComparison && branchComparison.length > 0) {
      const branchData = branchComparison.map((b: any) => ({
        "Cabang": b.branchName,
        "Pesanan": Number(b.orders),
        "Pendapatan (IDR)": Number(b.revenue),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(branchData), "Perbandingan Cabang");
    }

    const summarySheet = XLSX.utils.json_to_sheet([{
      "Periode": `${appliedStart} s/d ${appliedEnd}`,
      "Total Pendapatan (IDR)": summary?.totalRevenue ?? 0,
      "Total Pesanan": summary?.totalOrders ?? 0,
      "Rata-rata Nilai Pesanan (IDR)": summary?.averageOrderValue ?? 0,
      "Item Terlaris": topItems?.[0]?.menuItemName ?? "-",
    }]);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan");

    XLSX.writeFile(wb, `laporan-kopiflow-${appliedStart}-${appliedEnd}.xlsx`);
  };

  const kpiCards = [
    {
      label: "Total Pendapatan",
      value: loadingSummary ? null : formatIDR(summary?.totalRevenue || 0),
      icon: DollarSign,
      sub: "dalam periode ini",
    },
    {
      label: "Total Pesanan",
      value: loadingSummary ? null : String(summary?.totalOrders || 0),
      icon: ShoppingBag,
      sub: "transaksi selesai",
    },
    {
      label: "Rata-rata Nilai Pesanan",
      value: loadingSummary ? null : formatIDR(summary?.averageOrderValue || 0),
      icon: TrendingUp,
      sub: "per transaksi",
    },
    {
      label: "Item Terlaris",
      value: loadingSummary ? null : (topItems?.[0]?.menuItemName || "—"),
      icon: Star,
      sub: "terlaris dalam periode ini",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analitik & Laporan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Ikhtisar kinerja bisnis</p>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Dari</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-sm w-36"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Hingga</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-sm w-36"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="h-9"
            onClick={() => { setAppliedStart(startDate); setAppliedEnd(endDate); }}
          >
            Terapkan
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={handleExportExcel}
            disabled={loadingSummary && loadingTop && loadingPayment}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {kpiCards.map(card => (
          <Card key={card.label} className="shadow-sm card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5">
              <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <card.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              {card.value === null ? (
                <Skeleton className="h-8 w-full mb-2" />
              ) : (
                <div className="text-xl sm:text-2xl font-black truncate">{card.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20 px-4 sm:px-6 py-4">
          <CardTitle className="text-base sm:text-lg font-bold">Tren Pendapatan</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Pendapatan harian untuk periode dipilih</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] sm:h-[280px] px-2 sm:px-4 pb-4 pt-6">
          {loadingSummary ? (
            <Skeleton className="w-full h-full" />
          ) : summary?.periods && summary.periods.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.periods} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(new Date(d + "T00:00:00"), 'dd/MM')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(d) => format(new Date(d + "T00:00:00"), 'dd MMM yyyy')}
                  formatter={(v: number) => [formatIDR(v), "Pendapatan"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
              <p className="text-sm">Tidak ada data untuk periode ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Payment Methods */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-4 sm:px-6 py-4">
            <CardTitle className="text-base sm:text-lg font-bold">Metode Pembayaran</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Pendapatan berdasarkan jenis pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] pt-6 pb-4">
            {loadingPayment ? (
              <Skeleton className="w-full h-full" />
            ) : paymentStats && paymentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStats}
                    dataKey="revenue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ method, percent }) => `${method} ${Math.round(percent * 100)}%`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                  >
                    {paymentStats.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [formatIDR(v), "Pendapatan"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-sm">Tidak ada data pembayaran</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Menu Items */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-4 sm:px-6 py-4">
            <CardTitle className="text-base sm:text-lg font-bold">Item Menu Terlaris</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Berdasarkan jumlah terjual dalam periode dipilih</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] px-2 sm:px-4 pb-4 pt-6">
            {loadingTop ? (
              <Skeleton className="w-full h-full" />
            ) : topItems && topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="menuItemName"
                    width={90}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.length > 12 ? v.substring(0, 12) + "…" : v}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [v, "Terjual"]}
                    labelFormatter={(v) => v}
                  />
                  <Bar dataKey="totalQuantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-sm">Tidak ada data penjualan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branch Comparison (owner only) */}
      {isOwner && (
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-4 sm:px-6 py-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Perbandingan Cabang
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Kinerja per cabang dalam periode dipilih</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loadingBranch ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : branchComparison && branchComparison.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left pb-3 font-semibold">Cabang</th>
                      <th className="text-right pb-3 font-semibold">Pesanan</th>
                      <th className="text-right pb-3 font-semibold">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {branchComparison.map((b: any, i: number) => (
                      <tr key={b.branchId} className={cn("hover:bg-muted/30 transition-colors", i === 0 && "text-primary font-semibold")}>
                        <td className="py-3 flex items-center gap-2">
                          {i === 0 && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {b.branchName}
                        </td>
                        <td className="py-3 text-right tabular-nums">{b.orders.toLocaleString("id-ID")}</td>
                        <td className="py-3 text-right tabular-nums">{formatIDR(b.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-sm">Tidak ada data untuk periode ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
