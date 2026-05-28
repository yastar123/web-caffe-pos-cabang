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
import { Clock, CheckSquare } from "lucide-react";
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
    return <div className="p-8">Loading kitchen queue...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Display System</h1>
          <p className="text-muted-foreground">Active orders to be prepared</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
          <Clock className="w-4 h-4" />
          Auto-refreshing every 30s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-auto pb-4">
        {queue?.map((order) => (
          <Card key={order.orderId} className={`flex flex-col border-t-4 shadow-md ${getBorderColor(order.items[0]?.kitchenStatus ?? 'new')}`}>
            <CardHeader className="p-4 bg-muted/10 border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">Order #{order.orderNumber}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">Table {order.tableNumber || "Takeaway"}</div>
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