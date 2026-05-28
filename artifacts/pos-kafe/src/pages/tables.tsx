import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetTables, useUpdateTableStatus, getGetTablesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Tables() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [activeArea, setActiveArea] = useState<string>("indoor");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useGetTables(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
        queryKey: getGetTablesQueryKey({ branchId: branchId ?? undefined }),
      },
    }
  );

  const updateStatus = useUpdateTableStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Table status updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetTablesQueryKey({ branchId: branchId ?? undefined }) });
      },
      onError: () => {
        toast({ title: "Failed to update table status", variant: "destructive" });
      },
    },
  });

  const handleStartOrder = (tableId: number) => {
    setLocation(`/pos?table=${tableId}`);
  };

  const handleUpdateStatus = (tableId: number, status: "available" | "occupied" | "reserved" | "cleaning") => {
    updateStatus.mutate({ id: tableId, data: { status } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "occupied": return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "reserved": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "cleaning": return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "occupied": return <Users className="w-4 h-4 mr-1" />;
      case "reserved": return <Clock className="w-4 h-4 mr-1" />;
      case "cleaning": return <AlertCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const areas = ["indoor", "outdoor", "vip"];
  const tablesByArea = areas.reduce((acc, area) => {
    acc[area] = tables?.filter((t) => t.area === area) || [];
    return acc;
  }, {} as Record<string, typeof tables>);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Table Floor Plan</h1>
        <p className="text-muted-foreground mt-1">Manage tables and current occupancy</p>
      </div>

      <Tabs value={activeArea} onValueChange={setActiveArea} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="indoor" data-testid="tab-indoor">Indoor</TabsTrigger>
          <TabsTrigger value="outdoor" data-testid="tab-outdoor">Outdoor</TabsTrigger>
          <TabsTrigger value="vip" data-testid="tab-vip">VIP Lounge</TabsTrigger>
        </TabsList>

        {areas.map((area) => (
          <TabsContent key={area} value={area} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tablesByArea[area]?.map((table) => (
                <Card key={table.id} className="overflow-hidden flex flex-col">
                  <div className={`h-2 w-full ${
                    table.status === 'available' ? 'bg-emerald-500' :
                    table.status === 'occupied' ? 'bg-rose-500' :
                    table.status === 'reserved' ? 'bg-amber-500' :
                    'bg-slate-500'
                  }`} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">Table {table.number}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(table.status)}>
                        {getStatusIcon(table.status)}
                        <span className="capitalize">{table.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Users className="w-4 h-4 mr-2" />
                      Capacity: {table.capacity} pax
                    </div>
                    <div className="flex gap-2 mt-auto">
                      {table.status === "available" && (
                        <Button 
                          className="w-full" 
                          onClick={() => handleStartOrder(table.id)}
                          data-testid={`btn-start-order-${table.id}`}
                        >
                          Start Order
                        </Button>
                      )}
                      {table.status === "occupied" && (
                        <Button 
                          className="w-full" 
                          variant="secondary"
                          onClick={() => handleStartOrder(table.id)} // Could go to POS to edit order
                          data-testid={`btn-view-order-${table.id}`}
                        >
                          View Order
                        </Button>
                      )}
                      {table.status === "cleaning" && (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleUpdateStatus(table.id, "available")}
                          data-testid={`btn-mark-clean-${table.id}`}
                        >
                          Mark Clean
                        </Button>
                      )}
                      {table.status === "reserved" && (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleUpdateStatus(table.id, "occupied")}
                          data-testid={`btn-seat-reserved-${table.id}`}
                        >
                          Seat Guests
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!tablesByArea[area] || tablesByArea[area].length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  No tables found in this area.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}