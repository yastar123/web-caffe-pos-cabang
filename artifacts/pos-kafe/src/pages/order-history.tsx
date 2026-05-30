import { useState } from "react";
import { useGetOrders, useVoidOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar,
  Clock,
  User,
  DollarSign,
  XCircle,
  Eye,
  Filter,
  ChevronDown,
  Receipt
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", label: "Menunggu" },
  confirmed: { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Dikonfirmasi" },
  preparing: { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Disiapkan" },
  ready: { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Siap" },
  served: { bg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", label: "Disajikan" },
  completed: { bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Selesai" },
  voided: { bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Dibatalkan" },
};

export default function OrderHistory() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useGetOrders(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
      }
    }
  );

  const voidOrder = useVoidOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pesanan berhasil dibatalkan" });
      },
      onError: () => {
        toast({ title: "Gagal membatalkan pesanan", variant: "destructive" });
      }
    }
  });

  const handleVoidOrder = (orderId: number) => {
    if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      voidOrder.mutate({ id: orderId, data: { reason: "Dibatalkan oleh manajemen" } });
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.staffName && order.staffName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedOrders = [...filteredOrders].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Receipt className="w-7 h-7 text-primary" />
              Riwayat Pemesanan
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {sortedOrders.length} pesanan ditemukan
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor pesanan, meja, atau staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(STATUS_COLORS).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Tidak ada pesanan ditemukan</p>
              <p className="text-muted-foreground text-sm mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? "Coba ubah filter atau kata kunci pencarian" 
                  : "Belum ada pesanan yang dibuat"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order: any) => {
            const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg font-bold">
                          #{order.orderNumber}
                        </CardTitle>
                        <Badge className={cn("font-semibold", statusColor.bg, statusColor.text)}>
                          {statusColor.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Meja {order.tableNumber}
                        </div>
                        {order.staffName && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {order.staffName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      {order.status !== "completed" && order.status !== "voided" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleVoidOrder(order.id)}
                          disabled={voidOrder.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Batalkan
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                      {order.total.toLocaleString('id-ID')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">#{selectedOrder.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Meja {selectedOrder.tableNumber} • {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Item Pesanan</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.menuItemName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x {item.unitPrice.toLocaleString('id-ID')}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            Catatan: {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold">
                        {item.totalPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{selectedOrder.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%)</span>
                  <span>{selectedOrder.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{selectedOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Catatan Pesanan</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
