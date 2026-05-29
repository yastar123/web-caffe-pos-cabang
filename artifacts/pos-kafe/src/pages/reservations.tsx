import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { 
  useGetReservations, 
  useCreateReservation, 
  useUpdateReservation,
  useGetTables,
  getGetReservationsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Users, Phone, Clock, Check, X, LogIn, Edit2, ChevronLeft, ChevronRight, Mail, StickyNote } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: "Menunggu",     color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",   dot: "bg-amber-500"   },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",     dot: "bg-blue-500"    },
  seated:    { label: "Duduk",        color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800", dot: "bg-emerald-500" },
  cancelled: { label: "Dibatalkan",   color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",     dot: "bg-rose-500"    },
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isToday(d)) return "Hari Ini";
  if (isTomorrow(d)) return "Besok";
  if (isYesterday(d)) return "Kemarin";
  return format(d, "EEE, d MMM");
}

export default function Reservations() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [status, setStatus] = useState<string>("all");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<any>(null);

  const { data: reservations, isLoading } = useGetReservations(
    { branchId: branchId ?? undefined, date, status: status !== "all" ? status as any : undefined },
    { query: { enabled: !!branchId, queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date, status: status !== "all" ? status as any : undefined }) } }
  );

  const { data: tables } = useGetTables(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: ["tables", branchId] } }
  );

  const createRes = useCreateReservation();
  const updateRes = useUpdateReservation();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createRes.mutateAsync({
        data: {
          branchId: branchId!,
          customerName: fd.get("name") as string,
          customerPhone: fd.get("phone") as string,
          customerEmail: fd.get("email") as string || undefined,
          date: fd.get("date") as string,
          time: fd.get("time") as string,
          guestCount: Number(fd.get("guests")),
          tableId: fd.get("tableId") && fd.get("tableId") !== "none" ? Number(fd.get("tableId")) : undefined,
          depositAmount: fd.get("deposit") ? Number(fd.get("deposit")) : 0,
          notes: fd.get("notes") as string || undefined,
        }
      });
      toast({ title: "Reservasi berhasil dibuat" });
      queryClient.invalidateQueries({ queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date }) });
      setIsNewOpen(false);
    } catch {
      toast({ title: "Gagal membuat reservasi", variant: "destructive" });
    }
  };

  const handleStatus = async (id: number, newStatus: string) => {
    try {
      await updateRes.mutateAsync({ id, data: { status: newStatus as any } });
      toast({ title: "Status diperbarui" });
      queryClient.invalidateQueries({ queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date }) });
    } catch {
      toast({ title: "Gagal memperbarui status", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRes) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateRes.mutateAsync({
        id: editingRes.id,
        data: {
          customerName: fd.get("name") as string,
          customerPhone: fd.get("phone") as string,
          customerEmail: fd.get("email") as string || undefined,
          date: fd.get("date") as string,
          time: fd.get("time") as string,
          guestCount: Number(fd.get("guests")),
          tableId: fd.get("tableId") && fd.get("tableId") !== "none" ? Number(fd.get("tableId")) : undefined,
          depositAmount: fd.get("deposit") ? Number(fd.get("deposit")) : 0,
          notes: fd.get("notes") as string || undefined,
        }
      });
      toast({ title: "Reservasi diperbarui" });
      queryClient.invalidateQueries({ queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date }) });
      setEditingRes(null);
    } catch {
      toast({ title: "Gagal memperbarui reservasi", variant: "destructive" });
    }
  };

  const navigateDate = (dir: 1 | -1) => {
    const d = new Date(date + "T00:00:00");
    const next = dir === 1 ? addDays(d, 1) : subDays(d, 1);
    setDate(format(next, "yyyy-MM-dd"));
  };

  const allRes = reservations ?? [];
  const pending = allRes.filter((r: any) => r.status === "pending").length;
  const confirmed = allRes.filter((r: any) => r.status === "confirmed").length;
  const seated = allRes.filter((r: any) => r.status === "seated").length;
  const totalGuests = allRes.reduce((s: number, r: any) => s + (r.guestCount || 0), 0);

  const STATUS_TAB_LABELS: Record<string, string> = {
    all: "Semua",
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    seated: "Duduk",
    cancelled: "Dibatalkan",
  };

  const ReservationForm = ({ defaultValues, onSubmit, isPending }: { defaultValues?: any; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isPending: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Tamu *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.customerName} autoFocus data-testid="input-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telepon *</Label>
          <Input id="phone" name="phone" required defaultValue={defaultValues?.customerPhone} data-testid="input-phone" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultValues?.customerEmail || ""} data-testid="input-email" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Tanggal *</Label>
          <Input id="date" name="date" type="date" required defaultValue={defaultValues?.date || date} data-testid="input-res-date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Waktu *</Label>
          <Input id="time" name="time" type="time" required defaultValue={defaultValues?.time} data-testid="input-res-time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Tamu *</Label>
          <Input id="guests" name="guests" type="number" min="1" required defaultValue={defaultValues?.guestCount} data-testid="input-guests" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tableId">Meja</Label>
          <Select name="tableId" defaultValue={defaultValues?.tableId ? defaultValues.tableId.toString() : "none"}>
            <SelectTrigger data-testid="select-res-table"><SelectValue placeholder="Belum Ditugaskan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Belum Ditugaskan</SelectItem>
              {tables?.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>Meja {t.number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit">Deposit (IDR)</Label>
          <Input id="deposit" name="deposit" type="number" defaultValue={defaultValues?.depositAmount || 0} data-testid="input-deposit" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Permintaan Khusus</Label>
        <Textarea id="notes" name="notes" placeholder="Info alergi, preferensi tempat duduk..." defaultValue={defaultValues?.notes || ""} data-testid="input-notes" />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reservasi</h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola pemesanan dan penugasan meja</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-new-reservation">+ Reservasi Baru</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader><DialogTitle>Reservasi Baru</DialogTitle></DialogHeader>
              <ReservationForm onSubmit={handleCreate} isPending={createRes.isPending} />
              <DialogFooter>
                <Button type="submit" disabled={createRes.isPending} data-testid="btn-submit-res">Simpan Reservasi</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "Total Reservasi", value: allRes.length, sub: `${totalGuests} tamu`, color: "text-foreground", icon: CalendarDays },
          { label: "Menunggu", value: pending, sub: "menunggu konfirmasi", color: "text-amber-600 dark:text-amber-400", icon: Clock },
          { label: "Dikonfirmasi", value: confirmed, sub: "siap didudukkan", color: "text-blue-600 dark:text-blue-400", icon: Check },
          { label: "Duduk", value: seated, sub: "sedang makan", color: "text-emerald-600 dark:text-emerald-400", icon: Users },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm card-hover">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className={`text-xl sm:text-2xl font-bold tabular-nums ${s.color}`}>{isLoading ? "—" : s.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date navigation + status filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="relative flex-1 sm:flex-none">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 h-9 w-full sm:w-auto font-medium"
              data-testid="input-date"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => navigateDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {date !== format(new Date(), "yyyy-MM-dd") && (
            <Button variant="ghost" size="sm" className="text-xs h-9" onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}>
              Hari Ini
            </Button>
          )}
          <span className="hidden sm:inline text-sm font-semibold text-muted-foreground">{formatDateLabel(date)}</span>
        </div>

        <Tabs value={status} onValueChange={setStatus}>
          <TabsList className="overflow-x-auto justify-start flex-nowrap h-auto p-1 bg-muted/40 rounded-xl gap-0.5">
            {["all", "pending", "confirmed", "seated", "cancelled"].map((s) => (
              <TabsTrigger key={s} value={s} className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                {STATUS_TAB_LABELS[s] ?? s}
                {s !== "all" && s !== "cancelled" && (
                  <span className="ml-1 text-[10px] opacity-60">
                    ({allRes.filter((r: any) => r.status === s).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Reservation cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : reservations?.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 opacity-25" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tidak ada reservasi untuk {formatDateLabel(date)}</h3>
            <p className="text-sm text-muted-foreground mt-1">Coba tanggal lain atau buat reservasi baru</p>
          </div>
          <Button variant="outline" onClick={() => setIsNewOpen(true)}>+ Reservasi Baru</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {reservations?.map((res: any) => {
            const cfg = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.pending;
            return (
              <Card key={res.id} className={cn("flex flex-col card-hover shadow-sm transition-all", res.status === "cancelled" && "opacity-60")}>
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{res.customerName}</CardTitle>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{res.customerPhone}</span>
                        {res.customerEmail && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{res.customerEmail}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize shrink-0 text-xs font-semibold flex items-center gap-1.5", cfg.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{res.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{res.guestCount} tamu</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <div className="w-3.5 h-3.5 rounded bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary border border-primary/20 shrink-0">M</div>
                      <span className="font-semibold text-foreground">
                        {res.tableNumber ? `Meja ${res.tableNumber}` : <span className="text-muted-foreground font-normal">Belum Ditugaskan</span>}
                      </span>
                    </div>
                  </div>
                  {res.notes && (
                    <div className="flex gap-2 text-xs bg-muted/50 p-2.5 rounded-lg">
                      <StickyNote className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="italic text-muted-foreground">{res.notes}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 gap-2 border-t p-3 bg-muted/5">
                  {res.status === "pending" && (
                    <>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 h-8" onClick={() => handleStatus(res.id, "confirmed")} data-testid={`btn-confirm-${res.id}`}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Konfirmasi
                      </Button>
                      <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8" onClick={() => handleStatus(res.id, "cancelled")} data-testid={`btn-cancel-${res.id}`}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {res.status === "confirmed" && (
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8" onClick={() => handleStatus(res.id, "seated")} data-testid={`btn-seat-${res.id}`}>
                      <LogIn className="w-3.5 h-3.5 mr-1" /> Dudukkan Tamu
                    </Button>
                  )}
                  {res.status === "seated" && (
                    <div className="text-sm font-medium text-emerald-600 flex w-full justify-center items-center py-1 gap-1">
                      <Check className="w-4 h-4" /> Sedang Makan
                    </div>
                  )}
                  {res.status === "cancelled" && (
                    <div className="text-xs text-muted-foreground flex w-full justify-center items-center py-1">Dibatalkan</div>
                  )}
                  {res.status !== "cancelled" && res.status !== "seated" && (
                    <Button size="sm" variant="ghost" className="shrink-0 h-8 w-8 p-0" onClick={() => setEditingRes(res)} title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRes} onOpenChange={(open) => { if (!open) setEditingRes(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          {editingRes && (
            <form onSubmit={handleEdit}>
              <DialogHeader><DialogTitle>Edit Reservasi</DialogTitle></DialogHeader>
              <ReservationForm defaultValues={editingRes} onSubmit={handleEdit} isPending={updateRes.isPending} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingRes(null)}>Batal</Button>
                <Button type="submit" disabled={updateRes.isPending}>Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
