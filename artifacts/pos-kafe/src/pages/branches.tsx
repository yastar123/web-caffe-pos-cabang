import { useState } from "react";
import {
  useGetBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  getGetBranchesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Store, MapPin, Phone, Mail, Percent, Edit2, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Branches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  const { data: branches, isLoading } = useGetBranches(
    {},
    { query: { queryKey: getGetBranchesQueryKey({}) } }
  );

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      address: fd.get("address") as string || undefined,
      phone: fd.get("phone") as string || undefined,
      email: fd.get("email") as string || undefined,
      taxRate: fd.get("taxRate") ? Number(fd.get("taxRate")) : 10,
      isActive: fd.get("isActive") === "on",
    };
    try {
      if (editingBranch) {
        await updateBranch.mutateAsync({ id: editingBranch.id, data });
        toast({ title: "Cabang diperbarui" });
      } else {
        await createBranch.mutateAsync({ data });
        toast({ title: "Cabang dibuat" });
      }
      queryClient.invalidateQueries({ queryKey: getGetBranchesQueryKey({}) });
      setIsOpen(false);
      setEditingBranch(null);
    } catch {
      toast({ title: "Gagal menyimpan cabang", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBranch.mutateAsync({ id });
      toast({ title: "Cabang dihapus" });
      queryClient.invalidateQueries({ queryKey: getGetBranchesQueryKey({}) });
    } catch {
      toast({ title: "Gagal menghapus cabang", variant: "destructive" });
    }
  };

  const openEdit = (branch: any) => {
    setEditingBranch(branch);
    setIsOpen(true);
  };

  const activeBranches = branches?.filter((b: any) => b.isActive).length ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cabang</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLoading ? "…" : `${activeBranches} aktif · `}
            Kelola lokasi toko Anda
          </p>
        </div>
        <Button onClick={() => { setEditingBranch(null); setIsOpen(true); }} data-testid="btn-add-branch">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Cabang
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : !branches || branches.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
            <Store className="w-8 h-8 opacity-25" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada cabang</h3>
            <p className="text-sm text-muted-foreground mt-1">Tambahkan lokasi cabang pertama Anda untuk memulai</p>
          </div>
          <Button onClick={() => { setEditingBranch(null); setIsOpen(true); }}>+ Tambah Cabang</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {branches.map((branch: any) => (
            <Card key={branch.id} className={cn("flex flex-col card-hover shadow-sm", !branch.isActive && "opacity-60")}>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg font-bold truncate">{branch.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{branch.address || "Tidak ada alamat"}</span>
                    </p>
                  </div>
                  <Badge
                    variant={branch.isActive ? "default" : "secondary"}
                    className={cn(
                      "shrink-0 text-xs font-semibold",
                      branch.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""
                    )}
                  >
                    {branch.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex-1 space-y-2.5">
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    {branch.phone}
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    {branch.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="w-3.5 h-3.5 text-primary shrink-0" />
                  {branch.taxRate}% pajak
                </div>
              </CardContent>

              <CardFooter className="pt-0 gap-2 border-t p-3 bg-muted/5">
                <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => openEdit(branch)} data-testid={`btn-edit-branch-${branch.id}`}>
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30" data-testid={`btn-del-branch-${branch.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus "{branch.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus cabang secara permanen. Pastikan tidak ada staf atau data aktif yang terkait dengan cabang ini.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(branch.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingBranch(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingBranch ? "Edit Cabang" : "Cabang Baru"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Cabang *</Label>
                <Input id="name" name="name" required defaultValue={editingBranch?.name} autoFocus data-testid="input-branch-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" name="address" defaultValue={editingBranch?.address || ""} data-testid="input-branch-addr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" name="phone" defaultValue={editingBranch?.phone || ""} data-testid="input-branch-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingBranch?.email || ""} data-testid="input-branch-email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tarif Pajak (%)</Label>
                <Input id="taxRate" name="taxRate" type="number" step="0.01" min="0" max="100" defaultValue={editingBranch?.taxRate ?? 10} data-testid="input-branch-tax" />
                <p className="text-xs text-muted-foreground">Diterapkan pada semua transaksi POS di cabang ini</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch id="isActive" name="isActive" defaultChecked={editingBranch ? editingBranch.isActive : true} data-testid="switch-branch-active" />
                <div>
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">Cabang aktif</Label>
                  <p className="text-xs text-muted-foreground">Cabang tidak aktif disembunyikan dari staf</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setEditingBranch(null); }}>Batal</Button>
              <Button type="submit" disabled={createBranch.isPending || updateBranch.isPending} data-testid="btn-save-branch">
                Simpan Cabang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
