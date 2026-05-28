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
import { Clock, CheckSquare, RefreshCw, ChefHat, Flame, AlertTriangle } from "lucide-react";
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

function getCardBorderClass(status: string, createdAt: string): string {
  const minutes = getElapsedMinutes(createdAt);
  const urgency = getUrgencyLevel(minutes);
  if (urgency === "critical") return "border-t-rose-500";
  if (urgency === "warn") return "border-t-amber-500";
  switch (status) {
    case "processing": return "border-t-orange-500";
    case "ready": return "border-t-emerald-500";
    default: return "border-t-blue-500";
  }
}

export default function Kitchen() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queue, isLoading } = useGetKitchenQueue(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
        refetchInterval: 30000,
        queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined })
      }
    }
  );

  const updateItemStatus = useUpdateKitchenItemStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined }) });
      },
      onError: () => {
        toast({ title: "Failed to update status", variant: "destructive" });
      }
    }
  });

  const handleUpdateStatus = (_orderId: number, itemId: number, status: "new" | "processing" | "ready" | "served") => {
    updateItemStatus.mutate({ itemId, data: { status } });
  };

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetKitchenQueueQueryKey({ branchId: branchId ?? undefined }) });
  };

  const newCount = queue?.filter(o => o.items.some(i => i.kitchenStatus === "new")).length ?? 0;
  const processingCount = queue?.filter(o => o.items.some(i => i.kitchenStatus === "processing")).length ?? 0;
  const readyCount = queue?.filter(o => o.items.every(i => i.kitchenStatus === "ready")).length ?? 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-start mb-5 sm:mb-6 shrink-0 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <ChefHat className="w-7 h-7 text-primary" />
            Kitchen Display
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Live order queue — auto-refreshes every 30s</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {newCount > 0 && (
            <Badge className="bg-blue-500 text-white border-0 font-semibold px-3 py-1 text-xs">
              {newCount} new
            </Badge>
          )}
          {processingCount > 0 && (
            <Badge className="bg-orange-500 text-white border-0 font-semibold px-3 py-1 text-xs">
              {processingCount} cooking
            </Badge>
          )}
          {readyCount > 0 && (
            <Badge className="bg-emerald-500 text-white border-0 font-semibold px-3 py-1 text-xs">
              {readyCount} ready
            </Badge>
          )}
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            title="Refresh now"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Urgency legend */}
      {queue && queue.length > 0 && (
        <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Timer:</span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;10m — OK
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> 10–20m — Slow
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-semibold">
            <div className="w-2 h-2 rounded-full bg-rose-500" /> &gt;20m — Overdue
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pb-4 stagger-children">
        {queue?.map((order) => {
          const topStatus = order.items[0]?.kitchenStatus ?? "new";
          const elapsedMinutes = getElapsedMinutes(order.createdAt);
          const urgency = getUrgencyLevel(elapsedMinutes);
          return (
            <Card
              key={order.orderId}
              className={cn(
                "flex flex-col border-t-4 shadow-sm hover:shadow-md transition-shadow",
                getCardBorderClass(topStatus, order.createdAt)
              )}
            >
              <CardHeader className={cn(
                "p-3 sm:p-4 border-b pb-3",
                urgency === "critical" ? "bg-rose-50/50 dark:bg-rose-950/10" :
                urgency === "warn" ? "bg-amber-50/50 dark:bg-amber-950/10" :
                "bg-muted/10"
              )}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      #{order.orderNumber}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Table {order.tableNumber || "Takeaway"}
                    </div>
                  </div>
                  <TimerBadge createdAt={order.createdAt} />
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="divide-y flex-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 sm:p-4 transition-colors",
                        item.kitchenStatus === "ready" ? "bg-emerald-50/80 dark:bg-emerald-950/20" : ""
                      )}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm sm:text-base leading-tight flex items-start gap-2">
                            <span className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                              item.kitchenStatus === "ready"
                                ? "bg-emerald-500 text-white"
                                : item.kitchenStatus === "processing"
                                ? "bg-orange-500 text-white"
                                : "bg-primary text-primary-foreground"
                            )}>
                              {item.quantity}
                            </span>
                            <span className={item.kitchenStatus === "ready" ? "line-through opacity-60" : ""}>
                              {item.menuItemName}
                            </span>
                          </div>
                          {item.notes && (
                            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 px-2 py-1 rounded-lg inline-block max-w-full">
                              ⚠ {item.notes}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0">
                          {item.kitchenStatus === "new" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-bold rounded-lg"
                              onClick={() => handleUpdateStatus(order.orderId, item.id, "processing")}
                              data-testid={`btn-process-${item.id}`}
                            >
                              Start
                            </Button>
                          )}
                          {item.kitchenStatus === "processing" && (
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs font-bold rounded-lg"
                              onClick={() => handleUpdateStatus(order.orderId, item.id, "ready")}
                              data-testid={`btn-ready-${item.id}`}
                            >
                              Done
                            </Button>
                          )}
                          {item.kitchenStatus === "ready" && (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 font-semibold">
                              <CheckSquare className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!queue || queue.length === 0) && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
              <ChefHat className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Kitchen is clear!</p>
              <p className="text-sm opacity-60 mt-1">No active orders at the moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
