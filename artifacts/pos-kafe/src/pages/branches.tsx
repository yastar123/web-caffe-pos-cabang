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
import { Store, Phone, Mail, MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      name: fd.get('name') as string,
      address: fd.get('address') as string || "",
      phone: fd.get('phone') as string || "",
      email: fd.get('email') as string || "",
      taxRate: Number(fd.get('taxRate')),
      isActive: fd.get('isActive') === 'on'
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

  const openEdit = (b: any) => {
    setEditingBranch(b);
    setIsOpen(true);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground mt-1">Manage multiple store locations</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) setEditingBranch(null); }}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-branch"><Plus className="w-4 h-4 mr-2"/> Add Branch</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingBranch ? 'Edit Branch' : 'New Branch'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input id="name" name="name" required defaultValue={editingBranch?.name} data-testid="input-branch-name"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={editingBranch?.address} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={editingBranch?.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={editingBranch?.email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%) *</Label>
                  <Input id="taxRate" name="taxRate" type="number" step="0.1" required defaultValue={editingBranch?.taxRate || 10} />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch id="isActive" name="isActive" defaultChecked={editingBranch ? editingBranch.isActive : true} />
                  <Label htmlFor="isActive">Branch is active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createBr.isPending || updateBr.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : branches?.map(b => (
          <Card key={b.id} className={`flex flex-col relative overflow-hidden ${!b.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}>
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{b.name}</CardTitle>
                    <div className="text-xs font-medium text-muted-foreground mt-1">Tax: {Number(b.taxRate)}%</div>
                  </div>
                </div>
                <Badge variant={b.isActive ? "default" : "secondary"}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{b.address || 'No address specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{b.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{b.email || '-'}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2 mt-auto">
              <Button variant="outline" className="flex-1" onClick={() => openEdit(b)} data-testid={`btn-edit-${b.id}`}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" data-testid={`btn-del-${b.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. Make sure no users or tables are attached to this branch.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(b.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
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
