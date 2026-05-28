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
import { Search, Plus, Edit2, ShieldAlert, Users as UsersIcon, UserCheck, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  owner:     { color: "text-purple-800 dark:text-purple-300", bg: "bg-purple-600" },
  manager:   { color: "text-blue-800 dark:text-blue-300",   bg: "bg-blue-600" },
  cashier:   { color: "text-teal-800 dark:text-teal-300",   bg: "bg-teal-600" },
  waiter:    { color: "text-amber-800 dark:text-amber-300", bg: "bg-amber-500" },
  chef:      { color: "text-orange-800 dark:text-orange-300", bg: "bg-orange-500" },
  warehouse: { color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-500" },
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "owner":     return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
    case "manager":   return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    case "cashier":   return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
    case "waiter":    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "chef":      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    case "warehouse": return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700";
    default:          return "bg-muted text-muted-foreground";
  }
};

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
    query: { queryKey: ["branches"] }
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
            name: fd.get("name") as string,
            email: fd.get("email") as string,
            role: fd.get("role") as any,
            branchId: fd.get("branchId") ? Number(fd.get("branchId")) : undefined,
            isActive: fd.get("isActive") === "on",
          }
        });
        toast({ title: "Staff updated" });
      } else {
        await createUser.mutateAsync({
          data: {
            name: fd.get("name") as string,
            email: fd.get("email") as string,
            password: fd.get("password") as string,
            role: fd.get("role") as any,
            branchId: fd.get("branchId") ? Number(fd.get("branchId")) : undefined,
          }
        });
        toast({ title: "Staff account created" });
      }
      queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
      setIsOpen(false);
      setEditingUser(null);
    } catch {
      toast({ title: "Failed to save staff", variant: "destructive" });
    }
  };

  const filteredUsers = users?.filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalActive = users?.filter((u: any) => u.isActive).length ?? 0;
  const totalInactive = (users?.length ?? 0) - totalActive;

  const ROLES = ["owner", "manager", "cashier", "waiter", "chef", "warehouse"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage system access and roles</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingUser(null); }}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-user"><Plus className="w-4 h-4 mr-1.5" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit Staff" : "New Staff Account"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required defaultValue={editingUser?.name} autoFocus />
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
                    <Select name="role" defaultValue={editingUser?.role || "waiter"}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch</Label>
                    <Select name="branchId" defaultValue={editingUser?.branchId?.toString()}>
                      <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
                      <SelectContent>
                        {branches?.map((b: any) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Switch id="isActive" name="isActive" defaultChecked={editingUser ? editingUser.isActive : true} />
                  <div>
                    <Label htmlFor="isActive" className="cursor-pointer">Account active</Label>
                    <p className="text-xs text-muted-foreground">Inactive accounts cannot log in</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        <Card className="shadow-sm card-hover">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UsersIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums">{users?.length ?? 0}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Total Staff</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm card-hover border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{totalActive}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm card-hover border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
              <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400">{totalInactive}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Inactive</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-muted/20 p-3 rounded-xl border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background h-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background h-10">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || roleFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-10 shrink-0" onClick={() => { setSearch(""); setRoleFilter("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-4 sm:pl-6">Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Branch</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right pr-4 sm:pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-36 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell className="hidden md:table-cell"><div className="h-4 w-14 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6"><div className="h-7 w-7 bg-muted rounded ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No staff found matching your filters
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.map((u: any) => {
                const cfg = ROLE_CONFIG[u.role];
                const initials = u.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                  <TableRow key={u.id} className={cn("transition-colors", !u.isActive && "opacity-55 bg-muted/10")}>
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0", cfg?.bg ?? "bg-primary")}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize font-medium text-xs", getRoleColor(u.role))}>
                        {u.role === "owner" && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {u.branchId ? (branches?.find((b: any) => b.id === u.branchId)?.name ?? "—") : (
                        <span className="text-xs italic text-muted-foreground/60">All Branches</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", u.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-sm font-medium">{u.isActive ? "Active" : "Disabled"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingUser(u); setIsOpen(true); }} data-testid={`btn-edit-${u.id}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredUsers && filteredUsers.length > 0 && (
          <div className="border-t px-4 sm:px-6 py-2.5 bg-muted/10 text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users?.length ?? 0} staff members
          </div>
        )}
      </Card>
    </div>
  );
}
