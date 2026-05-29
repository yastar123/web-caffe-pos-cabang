import { useState, useEffect } from "react";
import {
  useGetKitchenQueue,
  useUpdateKitchenItemStatus,
  getGetKitchenQueueQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckSquare, RefreshCw, ChefHat, Flame, AlertTriangle, CheckCheck, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function getUrgencyLevel(minutes: number): "ok" | "warn" | "critical" {
  if (minutes < 10) return "ok";
  if (minutes < 20) return "warn";
  return "critical";
}

function TimerBadge({ createdAt }: { createdAt: string }) {
  const [minutes, setMinutes] = useState(() => getElapsedMinutes(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(getElapsedMinutes(createdAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const urgency = getUrgencyLevel(minutes);

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold",
      urgency === "ok" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      urgency === "warn" && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      urgency === "critical" && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800 urgency-pulse"
    )}>
      {urgency === "critical" && <Flame className="w-3 h-3" />}
      {urgency === "warn" && <AlertTriangle className="w-3 h-3" />}
      {urgency === "ok" && <Clock className="w-3 h-3" />}
      {minutes}m
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, isUpdating }: {
  order: any;
  onUpdateStatus: (orderId: number, itemId: number, status: "new" | "processing" | "ready" | "served") => void;
  isUpdating: boolean;
}) {
  const elapsedMinutes = getElapsedMinutes(order.createdAt);
  const urgency = getUrgencyLevel(elapsedMinutes);
  const allReady = order.items.every((i: any) => i.kitchenStatus === "ready" || i.kitchenStatus === "served");

  return (
    <Card className={cn(
      "flex flex-col border-l-4 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up",
      urgency === "critical" ? "border-l-rose-500" : urgency === "warn" ? "border-l-amber-500" : "border-l-primary",
      allReady && "ring-1 ring-emerald-500/30 opacity-80"
    )}>
      <CardHeader className={cn(
        "p-3 border-b pb-2.5",
        urgency === "critical" ? "bg-rose-50/60 dark:bg-rose-950/10" :
        urgency === "warn" ? "bg-amber-50/60 dark:bg-amber-950/10" :
        "bg-muted/20"
      )}>
        <div className="flex justify-between items-center gap-2">
          <div>
            <CardTitle className="text-sm font-black tracking-tight">
              #{order.orderNumber}
            </CardTitle>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              Meja {order.tableNumber || "Bawa Pulang"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TimerBadge createdAt={order.createdAt} />
            {allReady && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                ✓ Selesai
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <div className="divide-y">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className={cn(
                "p-3 transition-colors",
                item.kitchenStatus === "ready" ? "bg-emerald-50/60 dark:bg-emerald-950/15" :
                item.kitchenStatus === "served" ? "bg-muted/30 opacity-60" : ""
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0",
                      item.kitchenStatus === "ready" || item.kitchenStatus === "served"
                        ? "bg-emerald-500 text-white"
                        : item.kitchenStatus === "processing"
                        ? "bg-orange-500 text-white"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {item.quantity}
                    </span>
                    <span className={cn(
                      "truncate",
                      (item.kitchenStatus === "ready" || item.kitchenStatus === "served") && "line-through opacity-60"
                    )}>
                      {item.menuItemName}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 px-2 py-0.5 rounded inline-block">
                      ⚠ {item.notes}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {item.kitchenStatus === "new" && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-[11px] font-bold rounded-lg px-2.5"
                      onClick={() => onUpdateStatus(order.orderId, item.id, "processing")}
                      disabled={isUpdating}
                    >
                      Mulai
                    </Button>
                  )}
                  {item.kitchenStatus === "processing" && (
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white h-7 text-[11px] font-bold rounded-lg px-2.5"
                      onClick={() => onUpdateStatus(order.orderId, item.id, "ready")}
                      disabled={isUpdating}
                    >
                      Siap
                    </Button>
                  )}
                  {item.kitchenStatus === "ready" && (
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 font-semibold text-[10px] h-5 px-1.5">
                        <CheckSquare className="w-2.5 h-2.5 mr-1" />
                        Siap
                      </Badge>
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                        onClick={() => onUpdateStatus(order.orderId, item.id, "served")}
                      >
                        Disajikan
                      </button>
                    </div>
                  )}
                  {item.kitchenStatus === "served" && (
                    <span className="text-[10px] text-muted-foreground font-medium">Disajikan</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const COLUMNS = [
  {
    key: "new",
    label: "Pesanan Baru",
    color: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    headerBg: "bg-blue-50/80 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900",
    emptyText: "Tidak ada pesanan baru",
    icon: Zap,
  },
  {
    key: "processing",
    label: "Memasak",
    color: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
    headerBg: "bg-orange-50/80 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900",
    emptyText: "Tidak ada yang dimasak",
    icon: Flame,
  },
  {
    key: "ready",
    label: "Siap Disajikan",
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-50/80 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900",
    emptyText: "Belum ada item siap",
    icon: CheckSquare,
  },
] as const;

export default function Kitchen() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isServingAll, setIsServingAll] = useState(false);

  const { data: queue, isLoading } = useGetKitchenQueue(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
        refetchInterval: 20000,
        queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined })
      }
    }
  );

  const updateItemStatus = useUpdateKitchenItemStatus({
    mutation: {
      onError: () => {
        toast({ title: "Gagal memperbarui status", variant: "destructive" });
      }
    }
  });

  const handleUpdateStatus = (_orderId: number, itemId: number, status: "new" | "processing" | "ready" | "served") => {
    updateItemStatus.mutate({ itemId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined }) });
      }
    });
  };

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined }) });
  };

  const handleServeAllReady = async () => {
    const readyItems = queue?.flatMap((o: any) => o.items.filter((i: any) => i.kitchenStatus === "ready")) ?? [];
    if (readyItems.length === 0) return;
    setIsServingAll(true);
    try {
      await Promise.all(
        readyItems.map((item: any) =>
          updateItemStatus.mutateAsync({ itemId: item.id, data: { status: "served" } })
        )
      );
      queryClient.invalidateQueries({ queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined }) });
      toast({ title: `${readyItems.length} item ditandai disajikan` });
    } catch {
      toast({ title: "Beberapa item tidak dapat disajikan", variant: "destructive" });
    } finally {
      setIsServingAll(false);
    }
  };

  const getOrderColumn = (order: any): "new" | "processing" | "ready" | null => {
    const statuses = order.items.map((i: any) => i.kitchenStatus);
    if (statuses.includes("new")) return "new";
    if (statuses.includes("processing")) return "processing";
    if (statuses.every((s: string) => s === "ready")) return "ready";
    if (statuses.every((s: string) => s === "served")) return null;
    return "ready";
  };

  const sortedQueue = queue
    ? [...queue].sort((a: any, b: any) => getElapsedMinutes(b.createdAt) - getElapsedMinutes(a.createdAt))
    : [];

  const columns = {
    new: sortedQueue.filter((o: any) => getOrderColumn(o) === "new"),
    processing: sortedQueue.filter((o: any) => getOrderColumn(o) === "processing"),
    ready: sortedQueue.filter((o: any) => getOrderColumn(o) === "ready"),
  };

  const totalActive = sortedQueue.length;
  const readyCount = columns.ready.flatMap((o: any) => o.items.filter((i: any) => i.kitchenStatus === "ready")).length;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              {[1, 2].map(j => <Skeleton key={j} className="h-44 w-full rounded-xl" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b bg-card shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-3 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" />
              Tampilan Dapur
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {totalActive > 0 ? `${totalActive} pesanan aktif` : "Tidak ada pesanan aktif"} · pembaruan otomatis setiap 20 detik
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {readyCount > 0 && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1.5"
                onClick={handleServeAllReady}
                disabled={isServingAll}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {isServingAll ? "Menyajikan..." : `Sajikan Semua Siap (${readyCount})`}
              </Button>
            )}
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground px-3 py-1.5 rounded-full border transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Segarkan
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {totalActive === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 p-8">
            <div className="w-20 h-20 rounded-3xl bg-muted/40 flex items-center justify-center">
              <ChefHat className="w-10 h-10 opacity-25" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">Dapur bersih!</p>
              <p className="text-sm opacity-60 mt-1">Tidak ada pesanan aktif saat ini</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 h-full divide-y sm:divide-y-0 sm:divide-x divide-border">
            {COLUMNS.map((col) => {
              const orders = columns[col.key];
              const ColIcon = col.icon;
              return (
                <div key={col.key} className="flex flex-col h-full min-h-0 overflow-hidden">
                  {/* Column header */}
                  <div className={cn("px-4 py-3 shrink-0 flex items-center justify-between", col.headerBg)}>
                    <div className={cn("flex items-center gap-2 font-bold text-sm", col.color)}>
                      <ColIcon className="w-4 h-4" />
                      {col.label}
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white",
                      col.dot
                    )}>
                      {orders.length}
                    </div>
                  </div>

                  {/* Cards scroll area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/10">
                    {orders.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/40 gap-2 border-2 border-dashed rounded-xl mt-2">
                        <ColIcon className="w-7 h-7" />
                        <span className="text-xs font-medium">{col.emptyText}</span>
                      </div>
                    ) : (
                      orders.map((order: any) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          onUpdateStatus={handleUpdateStatus}
                          isUpdating={updateItemStatus.isPending}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
