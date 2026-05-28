import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useGetTables, useUpdateTableStatus, getGetTablesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, AlertCircle, CheckCircle2, Clock, Sparkles, RefreshCw, Grid2X2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    barCls: "bg-emerald-500",
    borderCls: "border-t-emerald-500",
    cardBg: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
    icon: CheckCircle2,
  },
  occupied: {
    label: "Occupied",
    badgeCls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    barCls: "bg-rose-500",
    borderCls: "border-t-rose-500",
    cardBg: "bg-rose-50/20 dark:bg-rose-950/10",
    icon: Users,
  },
  reserved: {
    label: "Reserved",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    barCls: "bg-amber-500",
    borderCls: "border-t-amber-500",
    cardBg: "bg-amber-50/20 dark:bg-amber-950/10",
    icon: Clock,
  },
  cleaning: {
    label: "Cleaning",
    badgeCls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
    barCls: "bg-slate-400",
    borderCls: "border-t-slate-400",
    cardBg: "bg-slate-50/30 dark:bg-slate-900/10",
    icon: Sparkles,
  },
};

function TableCard({ table, onStartOrder, onUpdateStatus }: {
  table: any;
  onStartOrder: (id: number) => void;
  onUpdateStatus: (id: number, status: "available" | "occupied" | "reserved" | "cleaning") => void;
}) {
  const cfg = STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available;
  const Icon = cfg.icon;

  return (
    <div className={cn(
      "relative group rounded-2xl border-2 border-t-4 p-4 flex flex-col gap-3 transition-all duration-200 card-hover cursor-default shadow-sm",
      cfg.borderCls,
      cfg.cardBg,
      "bg-card dark:bg-card"
    )}>
      {/* Table number */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Table</div>
          <div className="text-4xl font-black leading-none text-foreground tracking-tight">{table.number}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-bold flex items-center gap-1 shrink-0 py-0.5 px-2", cfg.badgeCls)}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </Badge>
      </div>

      {/* Capacity */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(table.capacity, 8) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full border",
                table.status === "occupied"
                  ? "bg-rose-400 border-rose-300"
                  : "bg-muted border-border"
              )}
            />
          ))}
        </div>
        <span className="font-medium">{table.capacity} seats</span>
      </div>

      {/* Action */}
      <div className="mt-auto">
        {table.status === "available" && (
          <Button
            size="sm"
            className="w-full h-8 text-xs font-bold rounded-xl"
            onClick={() => onStartOrder(table.id)}
            data-testid={`btn-start-order-${table.id}`}
          >
            Start Order
          </Button>
        )}
        {table.status === "occupied" && (
          <Button
            size="sm"
            className="w-full h-8 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-0"
            onClick={() => onStartOrder(table.id)}
            data-testid={`btn-view-order-${table.id}`}
          >
            Add Order
          </Button>
        )}
        {table.status === "cleaning" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs font-bold rounded-xl"
            onClick={() => onUpdateStatus(table.id, "available")}
            data-testid={`btn-mark-clean-${table.id}`}
          >
            Mark Clean
          </Button>
        )}
        {table.status === "reserved" && (
          <Button
            size="sm"
            className="w-full h-8 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0"
            onClick={() => onUpdateStatus(table.id, "occupied")}
            data-testid={`btn-seat-reserved-${table.id}`}
          >
            Seat Guests
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Tables() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [activeArea, setActiveArea] = useState<string>("indoor");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: tables, isLoading } = useGetTables(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
        refetchInterval: 30000,
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: getGetTablesQueryKey({ branchId: branchId ?? undefined }) });
    setTimeout(() => setIsRefreshing(false), 600);
  }, [queryClient, branchId]);

  const handleStartOrder = (tableId: number) => setLocation(`/pos?table=${tableId}`);
  const handleUpdateStatus = (tableId: number, status: "available" | "occupied" | "reserved" | "cleaning") => {
    updateStatus.mutate({ id: tableId, data: { status } });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const areas = ["indoor", "outdoor", "vip"];
  const tablesByArea = areas.reduce((acc: Record<string, any[]>, area) => {
    acc[area] = tables?.filter((t: any) => t.area === area) || [];
    return acc;
  }, {} as Record<string, any[]>);

  const statusCounts = {
    available: tables?.filter((t: any) => t.status === "available").length ?? 0,
    occupied:  tables?.filter((t: any) => t.status === "occupied").length ?? 0,
    reserved:  tables?.filter((t: any) => t.status === "reserved").length ?? 0,
    cleaning:  tables?.filter((t: any) => t.status === "cleaning").length ?? 0,
  };

  const totalTables = tables?.length ?? 0;
  const occupancyPct = totalTables > 0 ? Math.round((statusCounts.occupied / totalTables) * 100) : 0;

  const AREA_LABELS: Record<string, string> = {
    indoor: "Indoor",
    outdoor: "Outdoor",
    vip: "VIP Lounge",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Grid2X2 className="w-6 h-6 text-primary" />
            Floor Plan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {statusCounts.occupied} of {totalTables} tables occupied · auto-refreshes every 30s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {(["available", "occupied", "reserved", "cleaning"] as const).map(status => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const count = statusCounts[status];
          return (
            <div
              key={status}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-t-4 bg-card shadow-sm transition-all",
                cfg.borderCls
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.badgeCls)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none tabular-nums">{count}</div>
                <div className="text-xs text-muted-foreground capitalize mt-0.5 font-medium">{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy bar */}
      {totalTables > 0 && (
        <div className="px-4 py-3.5 rounded-xl border bg-card shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold">Overall Occupancy</span>
            <span className={cn(
              "text-sm font-black tabular-nums",
              occupancyPct >= 80 ? "text-rose-600 dark:text-rose-400" :
              occupancyPct >= 50 ? "text-amber-600 dark:text-amber-400" :
              "text-emerald-600 dark:text-emerald-400"
            )}>{occupancyPct}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                occupancyPct >= 80 ? "bg-rose-500" :
                occupancyPct >= 50 ? "bg-amber-500" :
                "bg-emerald-500"
              )}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
            <span>0 tables</span>
            <span className="font-medium">{statusCounts.occupied} occupied</span>
            <span>{totalTables} total</span>
          </div>
        </div>
      )}

      {/* Area tabs */}
      <Tabs value={activeArea} onValueChange={setActiveArea}>
        <TabsList className="bg-muted/40 rounded-xl p-1 mb-5 h-auto gap-1">
          {areas.map(area => (
            <TabsTrigger
              key={area}
              value={area}
              data-testid={`tab-${area}`}
              className="rounded-lg text-sm font-bold gap-1.5 py-2 px-3"
            >
              {AREA_LABELS[area]}
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black",
                activeArea === area
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {tablesByArea[area]?.length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {areas.map(area => (
          <TabsContent key={area} value={area} className="mt-0">
            {!tablesByArea[area]?.length ? (
              <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No tables in this area</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
                {tablesByArea[area].map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onStartOrder={handleStartOrder}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
