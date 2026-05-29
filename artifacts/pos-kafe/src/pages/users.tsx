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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserCog, Edit2, UserCheck, UserX, Users as UsersIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  owner:     { label: "Pemilik",   color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
  manager:   { label: "Manajer",   color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
  cashier:   { label: "Kasir",     color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800" },
  waiter:    { label: "Pelayan",   color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  chef:      { label: "Koki",      color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" },
  warehouse: { label: "Gudang",    color: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700" },
};

const ROLES = ["owner", "manager", "cashier", "waiter", "chef", "warehouse"] as const;

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users, isLoading } = useGetUsers(
    { branchId: undefined, role: roleFilter !== "all" ? roleFilter as any : undefined },
    { query: { queryKey: getGetUsersQueryKey({ branchId: undefined, role: roleFilter !== "all" ? roleFilter as any : undefined }) } }
  );

  const { data: branches } = useGetBranches(
    { query: { queryKey: ["branches-list"] as const } }
  );

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const filtered = users?.filter((u: any) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      role: fd.get("role") as string,
      branchId: fd.get("branchId") && fd.get("branchId") !== "all" ? Number(fd.get("branchId")) : null,
      isActive: fd.get("isActive") === "on",
    };
    if (!editingUser) {
      data.password = fd.get("password") as string;
    }
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, data });
        toast({ title: "Staf diperbarui" });
      } else {
        await createUser.mutateAsync({ data });
        toast({ title: "Akun staf dibuat" });
      }
      queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey({}) });
      setIsOpen(false);
      setEditingUser(null);
    } catch {
      toast({ title: "Gagal menyimpan staf", variant: "destructive" });
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setIsOpen(true);
  };

  const totalUsers = users?.length ?? 0;
  const activeCount = users?.filter((u: any) => u.isActive).length ?? 0;
  const inactiveCount = totalUsers - activeCount;

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return "Semua Cabang";
    return branches?.find((b: any) => b.id === branchId)?.name || `Cabang #${branchId}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            Direktori Staf
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola akses sistem dan peran</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingUser(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)} data-testid="btn-add-user">
              + Tambah Staf
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit Staf" : "Akun Staf Baru"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input id="name" name="name" required defaultValue={editingUser?.name} autoFocus data-testid="input-user-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email / Nama Pengguna *</Label>
                  <Input id="email" name="email" type="email" required defaultValue={editingUser?.email} data-testid="input-user-email" />
                </div>
                {!editingUser ? (
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi Sementara *</Label>
                    <Input id="password" name="password" type="password" required data-testid="input-user-pw" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="password">Reset Kata Sandi <span className="text-muted-foreground font-normal text-xs">(kosongkan jika tidak diubah)</span></Label>
                    <Input id="password" name="password" type="password" placeholder="Kata sandi baru..." data-testid="input-user-pw-reset" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Peran *</Label>
                    <Select name="role" defaultValue={editingUser?.role || "cashier"}>
                      <SelectTrigger data-testid="select-user-role">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => (
                          <SelectItem key={r} value={r}>
                            {ROLE_CONFIG[r]?.label ?? r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Cabang</Label>
                    <Select name="branchId" defaultValue={editingUser?.branchId?.toString() || "all"}>
                      <SelectTrigger data-testid="select-user-branch">
                        <SelectValue placeholder="Semua Cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Cabang</SelectItem>
                        {branches?.map((b: any) => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch id="isActive" name="isActive" defaultChecked={editingUser ? editingUser.isActive : true} data-testid="switch-user-active" />
                  <div>
                    <Label htmlFor="isActive" className="font-medium cursor-pointer">Akun aktif</Label>
                    <p className="text-xs text-muted-foreground">Akun tidak aktif tidak dapat masuk</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending} data-testid="btn-save-user">
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        {[
          { label: "Total Staf", value: totalUsers, icon: UsersIcon, color: "text-foreground" },
          { label: "Aktif", value: activeCount, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Tidak Aktif", value: inactiveCount, icon: UserX, color: "text-rose-600 dark:text-rose-400" },
        ].map(s => (
          <Card key={s.label} className="shadow-sm card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className={cn("text-2xl font-bold tabular-nums", s.color)}>{isLoading ? "—" : s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Cari nama atau email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-sm pl-4"
            data-testid="input-search-users"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44 h-9 text-sm" data-testid="select-role-filter">
              <SelectValue placeholder="Filter berdasarkan Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              {ROLES.map(r => (
                <SelectItem key={r} value={r}>{ROLE_CONFIG[r]?.label ?? r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(roleFilter !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs gap-1"
              onClick={() => { setRoleFilter("all"); setSearchQuery(""); }}
            >
              <X className="w-3.5 h-3.5" />
              Hapus Filter
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Anggota Staf</TableHead>
                  <TableHead className="hidden sm:table-cell">Peran</TableHead>
                  <TableHead className="hidden md:table-cell">Cabang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                      <UserCog className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Tidak ada staf yang sesuai filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u: any) => {
                    const roleCfg = ROLE_CONFIG[u.role] ?? { label: u.role, color: "bg-muted text-muted-foreground border-border" };
                    return (
                      <TableRow key={u.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-primary/20">
                              {u.name.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={cn("text-xs font-semibold", roleCfg.color)}>
                            {roleCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {getBranchName(u.branchId)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.isActive ? "default" : "secondary"}
                            className={cn("text-xs font-semibold", u.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "")}
                          >
                            {u.isActive ? "Aktif" : "Dinonaktifkan"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(u)}
                            data-testid={`btn-edit-user-${u.id}`}
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
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              Menampilkan {filtered.length} dari {totalUsers} anggota staf
            </p>
          )}
        </>
      )}
    </div>
  );
}
