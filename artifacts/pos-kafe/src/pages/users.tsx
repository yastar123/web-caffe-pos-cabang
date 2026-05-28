import { useState } from "react";
import { 
  useGetUsers, 
  useGetBranches,
  useCreateUser, 
  useUpdateUser,
  getGetUsersQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit2, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, isLoading } = useGetUsers(undefined, {
    query: { queryKey: getGetUsersQueryKey() }
  });

  const { data: branches } = useGetBranches({
    query: { queryKey: ['branches'] }
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ 
          id: editingUser.id, 
          data: {
            name: fd.get('name') as string,
            email: fd.get('email') as string,
            role: fd.get('role') as any,
            branchId: fd.get('branchId') ? Number(fd.get('branchId')) : undefined,
          } 
        });
        toast({ title: "Staff updated" });
      } else {
        await createUser.mutateAsync({ 
          data: {
            name: fd.get('name') as string,
            email: fd.get('email') as string,
            password: fd.get('password') as string,
            role: fd.get('role') as any,
            branchId: fd.get('branchId') ? Number(fd.get('branchId')) : undefined,
          } 
        });
        toast({ title: "Staff created" });
      }
      queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
      setIsOpen(false);
      setEditingUser(null);
    } catch {
      toast({ title: "Failed to save staff", variant: "destructive" });
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cashier': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'waiter': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'chef': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warehouse': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsers = users?.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground mt-1">Manage system access and roles</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) setEditingUser(null); }}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-user"><Plus className="w-4 h-4 mr-2"/> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit Staff' : 'New Staff Account'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required defaultValue={editingUser?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email / Username *</Label>
                  <Input id="email" name="email" required defaultValue={editingUser?.email} />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password *</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select name="role" defaultValue={editingUser?.role || 'waiter'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="waiter">Waiter</SelectItem>
                        <SelectItem value="chef">Chef</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch Assignment</Label>
                    <Select name="branchId" defaultValue={editingUser?.branchId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Branches (Owner/Admin)" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches?.map(b => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch id="isActive" name="isActive" defaultChecked={editingUser ? editingUser.isActive : true} />
                  <Label htmlFor="isActive">Account is active (can login)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-xl border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="cashier">Cashier</SelectItem>
            <SelectItem value="waiter">Waiter</SelectItem>
            <SelectItem value="chef">Chef</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : filteredUsers?.map(u => (
                <TableRow key={u.id} className={!u.isActive ? "opacity-60 bg-muted/10" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${u.role === 'owner' ? 'bg-purple-600 text-white' : 'bg-primary/10 text-primary'}`}>
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize font-medium ${getRoleColor(u.role)}`}>
                      {u.role === 'owner' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.branchId ? branches?.find(b => b.id === u.branchId)?.name : 'All Branches'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-sm font-medium">{u.isActive ? 'Active' : 'Disabled'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingUser(u); setIsOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
