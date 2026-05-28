import { useState, useEffect } from "react";
import { 
  useGetCustomers, 
  useCreateCustomer, 
  useUpdateCustomer,
  getGetCustomersQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Phone, Mail, Award, Calendar, Users, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const TIER_CONFIG = {
  bronze:   { color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', icon: '🥉' },
  silver:   { color: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-600', icon: '🥈' },
  gold:     { color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-700', icon: '🥇' },
  platinum: { color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', icon: '💎' },
};

export default function Customers() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: customers, isLoading } = useGetCustomers(
    { search },
    { query: { queryKey: getGetCustomersQueryKey({ search }) } }
  );

  const createCust = useCreateCustomer();
  const updateCust = useUpdateCustomer();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCust.mutateAsync({
        data: {
          name: fd.get('name') as string,
          phone: fd.get('phone') as string,
          email: fd.get('email') as string || undefined,
          birthdate: fd.get('birthdate') as string || undefined,
          notes: fd.get('notes') as string || undefined,
        }
      });
      toast({ title: "Customer added" });
      queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey({ search }) });
      setIsAddOpen(false);
    } catch {
      toast({ title: "Failed to add customer", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await updateCust.mutateAsync({
        id: selectedCustomer.id,
        data: {
          name: fd.get('name') as string,
          phone: fd.get('phone') as string,
          email: fd.get('email') as string || undefined,
          birthdate: fd.get('birthdate') as string || undefined,
          notes: fd.get('notes') as string || undefined,
        }
      });
      toast({ title: "Customer updated" });
      queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey({ search }) });
      setSelectedCustomer(null);
    } catch {
      toast({ title: "Failed to update customer", variant: "destructive" });
    }
  };

  const getTierConfig = (t: string) => TIER_CONFIG[t as keyof typeof TIER_CONFIG] ?? { color: 'bg-muted text-muted-foreground', icon: '—' };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // Summary stats
  const totalCustomers = customers?.length ?? 0;
  const totalPoints = customers?.reduce((s: number, c: any) => s + (c.loyaltyPoints ?? 0), 0) ?? 0;
  const goldPlusTiers = customers?.filter((c: any) => c.membershipTier === 'gold' || c.membershipTier === 'platinum').length ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Loyalty program and customer database</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-card h-10"
              data-testid="input-search-cust"
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="btn-add-cust"><Plus className="w-4 h-4 mr-2"/> Add Customer</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required data-testid="input-cust-name"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" required data-testid="input-cust-phone"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" data-testid="input-cust-email"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Birthdate</Label>
                    <Input id="birthdate" name="birthdate" type="date" data-testid="input-cust-birth"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" name="notes" data-testid="input-cust-notes"/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCust.isPending}>Save Customer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && customers && customers.length > 0 && (
        <div className="grid grid-cols-3 gap-3 stagger-children">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm card-hover">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none tabular-nums">{totalCustomers}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm card-hover">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none tabular-nums">{goldPlusTiers}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Gold+</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm card-hover">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none tabular-nums">{totalPoints.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total pts</div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({length: 6}).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" style={{width: j === 0 ? '120px' : j === 4 ? '80px' : '60px'}} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : customers?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No customers found</TableCell></TableRow>
              ) : (
                customers?.map((c: any) => {
                  const tier = getTierConfig(c.membershipTier ?? '');
                  return (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCustomer(c)} data-testid={`row-cust-${c.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/10">
                            {c.name.substring(0, 2)}
                          </div>
                          {c.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.phone}</div>
                        {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize font-semibold gap-1 ${tier.color}`}>
                          <span>{tier.icon}</span>
                          {c.membershipTier ?? 'standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{(c.loyaltyPoints ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatIDR(Number(c.totalSpend))}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.visitCount}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
        <SheetContent className="sm:max-w-md flex flex-col h-full overflow-hidden p-0">
          {selectedCustomer && (() => {
            const tier = getTierConfig(selectedCustomer.membershipTier ?? '');
            return (
              <>
                <div className="bg-muted/30 p-6 border-b shrink-0">
                  <SheetHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold uppercase shadow-sm border-2 border-primary/20">
                        {selectedCustomer.name.substring(0, 2)}
                      </div>
                      <div>
                        <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                        <Badge variant="outline" className={`capitalize mt-1 gap-1 ${tier.color}`}>
                          <span>{tier.icon}</span>
                          {selectedCustomer.membershipTier ?? 'standard'} Member
                        </Badge>
                      </div>
                    </div>
                    <SheetDescription asChild>
                      <div className="grid grid-cols-1 gap-y-2 mt-2 text-sm text-foreground">
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground shrink-0"/>{selectedCustomer.phone}</div>
                        {selectedCustomer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground shrink-0"/>{selectedCustomer.email}</div>}
                        {selectedCustomer.birthdate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground shrink-0"/>{format(new Date(selectedCustomer.birthdate), 'MMMM dd, yyyy')}</div>}
                      </div>
                    </SheetDescription>
                  </SheetHeader>
                </div>

                <div className="grid grid-cols-3 gap-px bg-border shrink-0">
                  <div className="bg-card p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Loyalty Points</div>
                    <div className="text-xl font-bold text-primary flex items-center justify-center gap-1">
                      <Award className="w-4 h-4"/>
                      {(selectedCustomer.loyaltyPoints ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-card p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Total Spend</div>
                    <div className="text-sm font-bold tabular-nums">{formatIDR(Number(selectedCustomer.totalSpend))}</div>
                  </div>
                  <div className="bg-card p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Visits</div>
                    <div className="text-xl font-bold tabular-nums">{selectedCustomer.visitCount ?? 0}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="font-semibold text-lg mb-4">Edit Details</h3>
                  <form id="edit-cust" onSubmit={handleEdit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input id="edit-name" name="name" required defaultValue={selectedCustomer.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input id="edit-phone" name="phone" required defaultValue={selectedCustomer.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" name="email" type="email" defaultValue={selectedCustomer.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-birthdate">Birthdate</Label>
                      <Input id="edit-birthdate" name="birthdate" type="date" defaultValue={selectedCustomer.birthdate ? selectedCustomer.birthdate.split('T')[0] : ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Input id="edit-notes" name="notes" defaultValue={selectedCustomer.notes} />
                    </div>
                  </form>
                </div>
                <div className="p-4 border-t bg-card shrink-0">
                  <Button type="submit" form="edit-cust" className="w-full" disabled={updateCust.isPending}>Save Changes</Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
