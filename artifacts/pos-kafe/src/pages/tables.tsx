import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetTables, useUpdateTableStatus, getGetTablesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, AlertCircle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
    cardBorder: "hover:border-emerald-400/60",
  },
  occupied: {
    label: "Occupied",
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    bar: "bg-rose-500",
    icon: Users,
    cardBorder: "border-rose-200/60 dark:border-rose-900/40",
  },
  reserved: {
    label: "Reserved",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    bar: "bg-amber-500",
    icon: Clock,
    cardBorder: "border-amber-200/60 dark:border-amber-900/40",
  },
  cleaning: {
    label: "Cleaning",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
    bar: "bg-slate-400",
    icon: Sparkles,
    cardBorder: "border-slate-200/60",
  },
};

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
        toast({ title: "Table status updated" });
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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
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

  const statusCounts = {
    available: tables?.filter(t => t.status === "available").length ?? 0,
    occupied: tables?.filter(t => t.status === "occupied").length ?? 0,
    reserved: tables?.filter(t => t.status === "reserved").length ?? 0,
    cleaning: tables?.filter(t => t.status === "cleaning").length ?? 0,
  };

  const totalTables = (tables?.length ?? 0);
  const occupancyPct = totalTables > 0 ? Math.round((statusCounts.occupied / totalTables) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Table Floor Plan</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage tables and current occupancy</p>
        </div>
      </div>

      {/* Status summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {(["available", "occupied", "reserved", "cleaning"] as const).map(status => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const count = statusCounts[status];
          return (
            <div key={status} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm card-hover",
              count > 0 && status === "occupied" ? "border-rose-200 dark:border-rose-900" : ""
            )}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.badge)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-lg leading-none">{count}</div>
                <div className="text-xs text-muted-foreground capitalize mt-0.5">{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy progress */}
      {totalTables > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border bg-card shadow-sm">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold">Overall Occupancy</span>
              <span className="text-sm font-bold">{occupancyPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            {statusCounts.occupied} of {totalTables} tables
          </div>
        </div>
      )}

      <Tabs value={activeArea} onValueChange={setActiveArea} className="w-full">
        <TabsList className="mb-5 bg-muted/40 rounded-xl p-1">
          <TabsTrigger value="indoor" data-testid="tab-indoor" className="rounded-lg text-sm font-semibold">
            Indoor
            <Badge variant="secondary" className="ml-1.5 text-[10px] font-bold h-4 px-1.5 rounded-full">
              {tablesByArea["indoor"]?.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outdoor" data-testid="tab-outdoor" className="rounded-lg text-sm font-semibold">
            Outdoor
            <Badge variant="secondary" className="ml-1.5 text-[10px] font-bold h-4 px-1.5 rounded-full">
              {tablesByArea["outdoor"]?.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="vip" data-testid="tab-vip" className="rounded-lg text-sm font-semibold">
            VIP Lounge
            <Badge variant="secondary" className="ml-1.5 text-[10px] font-bold h-4 px-1.5 rounded-full">
              {tablesByArea["vip"]?.length ?? 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {areas.map((area) => (
          <TabsContent key={area} value={area} className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
              {tablesByArea[area]?.map((table) => {
                const cfg = STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available;
                const Icon = cfg.icon;
                return (
                  <Card
                    key={table.id}
                    className={cn(
                      "overflow-hidden flex flex-col transition-all duration-200 border-t-4 card-hover",
                      cfg.bar.replace("bg-", "border-t-"),
                      cfg.cardBorder
                    )}
                  >
                    <CardHeader className="pb-1 pt-3 px-3 sm:px-4">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Table</div>
                          <CardTitle className="text-2xl font-black leading-none mt-0.5">{table.number}</CardTitle>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] flex items-center gap-1 shrink-0 font-semibold", cfg.badge)}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{cfg.label}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-1 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center text-xs text-muted-foreground mb-3 gap-1">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">{table.capacity}</span>
                        <span>seats</span>
                      </div>
                      <div>
                        {table.status === "available" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8 font-semibold rounded-lg"
                            onClick={() => handleStartOrder(table.id)}
                            data-testid={`btn-start-order-${table.id}`}
                          >
                            Start Order
                          </Button>
                        )}
                        {table.status === "occupied" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8 font-semibold rounded-lg"
                            variant="secondary"
                            onClick={() => handleStartOrder(table.id)}
                            data-testid={`btn-view-order-${table.id}`}
                          >
                            Add Order
                          </Button>
                        )}
                        {table.status === "cleaning" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8 font-semibold rounded-lg"
                            variant="outline"
                            onClick={() => handleUpdateStatus(table.id, "available")}
                            data-testid={`btn-mark-clean-${table.id}`}
                          >
                            Mark Clean
                          </Button>
                        )}
                        {table.status === "reserved" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8 font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white border-0"
                            onClick={() => handleUpdateStatus(table.id, "occupied")}
                            data-testid={`btn-seat-reserved-${table.id}`}
                          >
                            Seat Guests
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(!tablesByArea[area] || tablesByArea[area].length === 0) && (
                <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed">
                  <div className="text-sm font-medium">No tables in this area</div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
