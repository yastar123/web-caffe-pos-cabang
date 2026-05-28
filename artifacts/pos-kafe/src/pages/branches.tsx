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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Store, Phone, Mail, MapPin, Plus, Edit2, Trash2, Building2, CheckCircle, XCircle, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Branches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  const { data: branches, isLoading } = useGetBranches({
    query: { queryKey: getGetBranchesQueryKey() }
  });

  const createBr = useCreateBranch();
  const updateBr = useUpdateBranch();
  const deleteBr = useDeleteBranch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      address: fd.get("address") as string || "",
      phone: fd.get("phone") as string || "",
      email: fd.get("email") as string || "",
      taxRate: Number(fd.get("taxRate")),
      isActive: fd.get("isActive") === "on",
    };
    try {
      if (editingBranch) {
        await updateBr.mutateAsync({ id: editingBranch.id, data });
        toast({ title: "Branch updated" });
      } else {
        await createBr.mutateAsync({ data });
        toast({ title: "Branch created" });
      }
      queryClient.invalidateQueries({ queryKey: getGetBranchesQueryKey() });
      setIsOpen(false);
      setEditingBranch(null);
    } catch {
      toast({ title: "Failed to save branch", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBr.mutateAsync({ id });
      toast({ title: "Branch deleted" });
      queryClient.invalidateQueries({ queryKey: getGetBranchesQueryKey() });
    } catch {
      toast({ title: "Failed to delete branch", variant: "destructive" });
    }
  };

  const openEdit = (b: any) => { setEditingBranch(b); setIsOpen(true); };

  const activeBranches = branches?.filter((b: any) => b.isActive).length ?? 0;
  const totalBranches = branches?.length ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your store locations</p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border">
              <Building2 className="w-4 h-4" />
              <span className="font-medium tabular-nums">{activeBranches}/{totalBranches}</span>
              <span>active</span>
            </div>
          )}
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingBranch(null); }}>
            <DialogTrigger asChild>
              <Button data-testid="btn-add-branch"><Plus className="w-4 h-4 mr-1.5" /> Add Branch</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingBranch ? "Edit Branch" : "New Branch"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Branch Name *</Label>
                    <Input id="name" name="name" required defaultValue={editingBranch?.name} autoFocus data-testid="input-branch-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={editingBranch?.address} placeholder="e.g. Jl. Sudirman No.1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={editingBranch?.phone} placeholder="+62..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingBranch?.email} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input id="taxRate" name="taxRate" type="number" step="0.1" min="0" max="100" required defaultValue={editingBranch?.taxRate ?? 10} />
                    <p className="text-xs text-muted-foreground">Applied to all POS transactions at this branch</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Switch id="isActive" name="isActive" defaultChecked={editingBranch ? editingBranch.isActive : true} />
                    <div>
                      <Label htmlFor="isActive" className="cursor-pointer">Branch is active</Label>
                      <p className="text-xs text-muted-foreground">Inactive branches are hidden from staff</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createBr.isPending || updateBr.isPending}>Save Branch</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Branch grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)
        ) : branches?.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Building2 className="w-8 h-8 opacity-25" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No branches yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Add your first branch location to get started</p>
            </div>
            <Button onClick={() => setIsOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Branch</Button>
          </div>
        ) : branches?.map((b: any) => (
          <Card key={b.id} className={cn("flex flex-col relative overflow-hidden card-hover shadow-sm transition-all", !b.isActive && "opacity-65 grayscale-[25%]")}>
            {/* Active indicator strip */}
            <div className={cn("absolute top-0 left-0 right-0 h-0.5", b.isActive ? "bg-gradient-to-r from-primary/80 to-primary/40" : "bg-muted")} />

            <CardHeader className="pb-3 bg-muted/20 border-b pt-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{b.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-0.5">
                      <Percent className="w-3 h-3" />
                      <span>{Number(b.taxRate)}% tax</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={b.isActive ? "default" : "secondary"}
                  className={cn("shrink-0 text-xs gap-1 font-semibold", b.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" : "")}
                >
                  {b.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {b.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex-1 space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/60" />
                <span className="line-clamp-2">{b.address || <span className="italic opacity-50">No address</span>}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                <span>{b.phone || <span className="italic opacity-50">—</span>}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                <span className="truncate">{b.email || <span className="italic opacity-50">—</span>}</span>
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 gap-2 mt-auto border-t bg-muted/5">
              <Button variant="outline" className="flex-1 h-8 text-sm" onClick={() => openEdit(b)} data-testid={`btn-edit-${b.id}`}>
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" data-testid={`btn-del-${b.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{b.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone. Ensure no users, tables, or orders are attached to this branch before deleting.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(b.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
