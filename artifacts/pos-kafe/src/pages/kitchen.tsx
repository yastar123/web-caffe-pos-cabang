import { useState } from "react";
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
import { Clock, CheckSquare, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
    updateItemStatus.mutate({ 
      itemId, 
      data: { status } 
    });
  };

  const getBorderColor = (status: string) => {
    switch(status) {
      case "new": return "border-blue-500";
      case "processing": return "border-orange-500";
      case "ready": return "border-emerald-500";
      default: return "border-border";
    }
  };

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
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-5 sm:mb-6 shrink-0 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kitchen Display</h1>
          <p className="text-muted-foreground text-sm">Active orders to be prepared</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-refresh every 30s
          </div>
          {queue && queue.length > 0 && (
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              {queue.length} active order{queue.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 overflow-auto pb-4">
        {queue?.map((order) => (
          <Card key={order.orderId} className={`flex flex-col border-t-4 shadow-md ${getBorderColor(order.items[0]?.kitchenStatus ?? 'new')}`}>
            <CardHeader className="p-3 sm:p-4 bg-muted/10 border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">Order #{order.orderNumber}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-0.5">Table {order.tableNumber || "Takeaway"}</div>
                </div>
                <Badge variant="outline" className="font-mono text-sm px-2 py-1">
                  {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)}m
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="divide-y flex-1">
                {order.items.map((item) => (
                  <div key={item.id} className={`p-4 ${item.kitchenStatus === 'ready' ? 'bg-emerald-50 dark:bg-emerald-950/20 opacity-60' : ''}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg leading-tight flex items-start gap-2">
                          <span className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center text-sm shrink-0 mt-0.5">
                            {item.quantity}
                          </span>
                          {item.menuItemName}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-rose-600 dark:text-rose-400 font-medium mt-1 bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded inline-block">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="shrink-0 flex flex-col gap-2">
                        {item.kitchenStatus === "new" && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleUpdateStatus(order.orderId, item.id, "processing")}
                            data-testid={`btn-process-${item.id}`}
                          >
                            Start
                          </Button>
                        )}
                        {item.kitchenStatus === "processing" && (
                          <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => handleUpdateStatus(order.orderId, item.id, "ready")}
                            data-testid={`btn-ready-${item.id}`}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {item.kitchenStatus === "ready" && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
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
        ))}
        {(!queue || queue.length === 0) && (
          <div className="col-span-full h-64 flex items-center justify-center text-xl text-muted-foreground border border-dashed rounded-xl bg-muted/5">
            No active orders in the kitchen.
          </div>
        )}
      </div>
    </div>
  );
}