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
import { CalendarDays, Users, Phone, Mail, Clock, Check, X, LogIn } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

export default function Reservations() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<string>("all");
  const [isNewOpen, setIsNewOpen] = useState(false);

  const { data: reservations, isLoading } = useGetReservations(
    { branchId: branchId ?? undefined, date, status: status !== 'all' ? status as any : undefined },
    { query: { enabled: !!branchId, queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date, status: status !== 'all' ? status as any : undefined }) } }
  );

  const { data: tables } = useGetTables(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: ['tables', branchId] } }
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
          customerName: fd.get('name') as string,
          customerPhone: fd.get('phone') as string,
          customerEmail: fd.get('email') as string || undefined,
          date: fd.get('date') as string,
          time: fd.get('time') as string,
          guestCount: Number(fd.get('guests')),
          tableId: fd.get('tableId') && fd.get('tableId') !== 'none' ? Number(fd.get('tableId')) : undefined,
          depositAmount: fd.get('deposit') ? Number(fd.get('deposit')) : 0,
          notes: fd.get('notes') as string || undefined,
        }
      });
      toast({ title: "Reservation created successfully" });
      queryClient.invalidateQueries({ queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date }) });
      setIsNewOpen(false);
    } catch {
      toast({ title: "Failed to create reservation", variant: "destructive" });
    }
  };

  const handleStatus = async (id: number, newStatus: string) => {
    try {
      await updateRes.mutateAsync({
        id,
        data: { status: newStatus as any }
      });
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: getGetReservationsQueryKey({ branchId: branchId ?? undefined, date }) });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seated': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage bookings and table assignments</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-auto h-10"
            data-testid="input-date"
          />
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button data-testid="btn-new-reservation">New Reservation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>New Reservation</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" required data-testid="input-name"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" required data-testid="input-phone"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" data-testid="input-email"/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" name="date" type="date" required defaultValue={date} data-testid="input-res-date"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input id="time" name="time" type="time" required data-testid="input-res-time"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guests">Guests *</Label>
                      <Input id="guests" name="guests" type="number" min="1" required data-testid="input-guests"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableId">Table</Label>
                      <Select name="tableId">
                        <SelectTrigger data-testid="select-res-table">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {tables?.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>Table {t.number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit">Deposit (IDR)</Label>
                      <Input id="deposit" name="deposit" type="number" defaultValue="0" data-testid="input-deposit"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Special requests..." data-testid="input-notes"/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createRes.isPending} data-testid="btn-submit-res">Save Reservation</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start flex-nowrap h-auto p-1 bg-muted/40 rounded-xl gap-0.5">
          <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">All</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">Pending</TabsTrigger>
          <TabsTrigger value="confirmed" className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">Confirmed</TabsTrigger>
          <TabsTrigger value="seated" className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">Seated</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : reservations?.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <CalendarDays className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No reservations found</h3>
          <p className="text-sm text-muted-foreground/80 mt-1">Try changing the date or status filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {reservations?.map(res => (
            <Card key={res.id} className="flex flex-col card-hover shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {res.customerName}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                      <Phone className="w-3 h-3" /> {res.customerPhone}
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(res.status)}`}>
                    {res.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{res.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{res.guestCount} pax</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 shrink-0">T</div>
                    <span className="font-medium text-foreground">
                      {res.tableNumber ? `Table ${res.tableNumber}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
                {res.notes && (
                  <div className="text-xs bg-muted p-2 rounded-md italic">
                    "{res.notes}"
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 gap-2 border-t p-4 bg-muted/5">
                {res.status === 'pending' && (
                  <>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatus(res.id, 'confirmed')} data-testid={`btn-confirm-${res.id}`}>
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="text-rose-600" onClick={() => handleStatus(res.id, 'cancelled')} data-testid={`btn-cancel-${res.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {res.status === 'confirmed' && (
                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatus(res.id, 'seated')} data-testid={`btn-seat-${res.id}`}>
                    <LogIn className="w-4 h-4 mr-1" /> Seat Guests
                  </Button>
                )}
                {res.status === 'seated' && (
                  <div className="text-sm font-medium text-emerald-600 flex w-full justify-center items-center py-1">
                    <Check className="w-4 h-4 mr-1" /> Currently Seated
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
