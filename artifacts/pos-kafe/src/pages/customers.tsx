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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Star, Search, Edit2, Phone, Mail, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  bronze:   { color: "bg-amber-700/15 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",   icon: "🥉" },
  silver:   { color: "bg-slate-200/60 text-slate-700 border-slate-300 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-600",   icon: "🥈" },
  gold:     { color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700", icon: "🥇" },
  platinum: { color: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700", icon: "💎" },
  standard: { color: "bg-muted text-muted-foreground border-border", icon: "👤" },
};

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: customers, isLoading } = useGetCustomers(
    { search: debouncedSearch || undefined },
    { query: { queryKey: getGetCustomersQueryKey({ search: debouncedSearch || undefined }) } }
  );

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCustomer.mutateAsync({
        data: {
          name: fd.get("name") as string,
          phone: fd.get("phone") as string,
          email: fd.get("email") as string || undefined,
          birthdate: fd.get("birthdate") as string || undefined,
          notes: fd.get("notes") as string || undefined,
        }
      });
      toast({ title: "Pelanggan ditambahkan" });
      queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey({}) });
      setIsAddOpen(false);
    } catch {
      toast({ title: "Gagal menambahkan pelanggan", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateCustomer.mutateAsync({
        id: editingCustomer.id,
        data: {
          name: fd.get("name") as string,
          phone: fd.get("phone") as string,
          email: fd.get("email") as string || undefined,
          birthdate: fd.get("birthdate") as string || undefined,
          notes: fd.get("notes") as string || undefined,
        }
      });
      toast({ title: "Pelanggan diperbarui" });
      queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey({}) });
      setEditingCustomer(null);
    } catch {
      toast({ title: "Gagal memperbarui pelanggan", variant: "destructive" });
    }
  };

  const totalCustomers = customers?.length ?? 0;
  const goldPlusCustomers = customers?.filter((c: any) =>
    ["gold", "platinum"].includes(c.membershipTier)
  ).length ?? 0;
  const totalPoints = customers?.reduce((s: number, c: any) => s + (c.loyaltyPoints || 0), 0) ?? 0;

  const getTier = (c: any) => c.membershipTier || "standard";

  const CustomerForm = ({ defaultValues, onSubmit, isPending }: { defaultValues?: any; onSubmit: any; isPending: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} autoFocus data-testid="input-cust-name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon *</Label>
          <Input id="phone" name="phone" required defaultValue={defaultValues?.phone} data-testid="input-cust-phone" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email || ""} data-testid="input-cust-email" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthdate">Tanggal Lahir</Label>
        <Input id="birthdate" name="birthdate" type="date" defaultValue={defaultValues?.birthdate || ""} data-testid="input-cust-birth" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes || ""} data-testid="input-cust-notes" />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pelanggan</h1>
          <p className="text-muted-foreground mt-1 text-sm">Program loyalitas dan basis data pelanggan</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-customer">+ Tambah Pelanggan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleAdd}>
              <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
              <CustomerForm onSubmit={handleAdd} isPending={createCustomer.isPending} />
              <DialogFooter>
                <Button type="submit" disabled={createCustomer.isPending} data-testid="btn-save-customer">Simpan Pelanggan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 stagger-children">
        {[
          { label: "Total Pelanggan", value: totalCustomers, icon: Users, color: "text-foreground" },
          { label: "Gold+", value: goldPlusCustomers, icon: Star, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Total Poin", value: totalPoints.toLocaleString("id-ID"), icon: Star, color: "text-primary" },
        ].map(s => (
          <Card key={s.label} className="shadow-sm card-hover">
            <CardContent className="p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <div className="hidden sm:flex w-9 h-9 rounded-lg bg-primary/8 items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className={cn("text-xl sm:text-2xl font-bold tabular-nums", s.color)}>{isLoading ? "—" : s.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama, telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
          data-testid="input-search-customers"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm">
        <div className="rounded-xl border overflow-hidden min-w-[360px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Kontak</TableHead>
                <TableHead>Tingkatan</TableHead>
                <TableHead className="hidden md:table-cell text-right">Poin</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Total Pembelanjaan</TableHead>
                <TableHead className="hidden md:table-cell text-right">Kunjungan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!customers || customers.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Pelanggan tidak ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => {
                  const tier = getTier(c);
                  const tierCfg = TIER_CONFIG[tier] ?? TIER_CONFIG.standard;
                  return (
                    <TableRow key={c.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />{c.phone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                          {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs font-semibold capitalize", tierCfg.color)}>
                          {tierCfg.icon} {tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right font-semibold tabular-nums text-primary">
                        {(c.loyaltyPoints || 0).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right tabular-nums text-sm">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.totalSpend || 0)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right text-sm tabular-nums">
                        {c.visitCount || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingCustomer(c)}
                          data-testid={`btn-edit-customer-${c.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => { if (!open) setEditingCustomer(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          {editingCustomer && (
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit Detail</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                    {editingCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{editingCustomer.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />{editingCustomer.loyaltyPoints || 0} poin</span>
                      <span>{editingCustomer.visitCount || 0} kunjungan</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Lengkap</Label>
                  <Input id="edit-name" name="name" required defaultValue={editingCustomer.name} data-testid="input-edit-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Nomor Telepon</Label>
                    <Input id="edit-phone" name="phone" required defaultValue={editingCustomer.phone} data-testid="input-edit-phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingCustomer.email || ""} data-testid="input-edit-email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-birthdate">Tanggal Lahir</Label>
                  <Input id="edit-birthdate" name="birthdate" type="date" defaultValue={editingCustomer.birthdate || ""} data-testid="input-edit-birth" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Catatan</Label>
                  <Textarea id="edit-notes" name="notes" defaultValue={editingCustomer.notes || ""} data-testid="input-edit-notes" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>Batal</Button>
                <Button type="submit" disabled={updateCustomer.isPending}>Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
