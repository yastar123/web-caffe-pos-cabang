import { useAuth } from "@/lib/auth";
import {
  useGetBranch,
  useUpdateBranch,
  useUpdateUser,
  getGetBranchQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, User, Store, Percent, MapPin, Phone, Mail, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branch, isLoading: loadingBranch } = useGetBranch(
    branchId || 0,
    { query: { enabled: !!branchId, queryKey: getGetBranchQueryKey(branchId || 0) } }
  );

  const updateBranch = useUpdateBranch();
  const updateUser = useUpdateUser();

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { name: fd.get("name") as string }
      });
      await refreshUser?.();
      toast({ title: "Profil diperbarui" });
    } catch {
      toast({ title: "Gagal memperbarui profil", variant: "destructive" });
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateBranch.mutateAsync({
        id: branchId,
        data: {
          name: fd.get("name") as string,
          address: fd.get("address") as string || undefined,
          phone: fd.get("phone") as string || undefined,
          email: fd.get("email") as string || undefined,
          taxRate: Number(fd.get("taxRate")),
          isActive: branch?.isActive ?? true,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetBranchQueryKey(branchId) });
      toast({ title: "Pengaturan cabang disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan pengaturan cabang", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Kelola preferensi pribadi dan toko</p>
        </div>
      </div>

      {/* Profile card */}
      <Card className="shadow-sm">
        <form onSubmit={handleProfileSubmit}>
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Profil Akun</CardTitle>
                <CardDescription className="text-sm">Perbarui nama Anda dan lihat detail akun</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-primary/20">
                {user?.name?.substring(0, 2) ?? ""}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              {user?.branchId && (
                <div className="ml-auto text-right">
                  <p className="text-[11px] text-muted-foreground">Cabang #{user.branchId}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tampilan</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={user?.name}
                data-testid="input-profile-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-display">Email (ID Login)</Label>
              <Input
                id="email-display"
                value={user?.email || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Hubungi admin untuk mengubah email</p>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/5 pt-4">
            <Button type="submit" disabled={updateUser.isPending} data-testid="btn-save-profile">
              Perbarui Profil
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Branch configuration */}
      {branchId ? (
        <Card className="shadow-sm">
          <form onSubmit={handleBranchSubmit}>
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Konfigurasi Cabang
                    {branch && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        — Mengedit pengaturan untuk {branch.name}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">Kelola cabang yang ditugaskan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {loadingBranch ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="branch-name" className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Nama Cabang
                    </Label>
                    <Input
                      id="branch-name"
                      name="name"
                      required
                      defaultValue={branch?.name}
                      data-testid="input-branch-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-address" className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      Alamat Fisik
                    </Label>
                    <Input
                      id="branch-address"
                      name="address"
                      placeholder="Jalan, Kota, Provinsi"
                      defaultValue={branch?.address || ""}
                      data-testid="input-branch-addr"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch-phone" className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        Telepon Kontak
                      </Label>
                      <Input
                        id="branch-phone"
                        name="phone"
                        defaultValue={branch?.phone || ""}
                        data-testid="input-branch-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch-email" className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        Email Kontak
                      </Label>
                      <Input
                        id="branch-email"
                        name="email"
                        type="email"
                        defaultValue={branch?.email || ""}
                        data-testid="input-branch-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-tax" className="flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                      Tarif Pajak (%)
                    </Label>
                    <Input
                      id="branch-tax"
                      name="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={branch?.taxRate ?? 10}
                      className="max-w-[120px]"
                      data-testid="input-branch-tax"
                    />
                    <p className="text-xs text-muted-foreground">Diterapkan pada semua transaksi POS di cabang ini</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/5 pt-4">
              <Button type="submit" disabled={updateBranch.isPending || loadingBranch} data-testid="btn-save-branch-settings">
                Simpan Pengaturan Cabang
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Anda tidak ditugaskan ke cabang tertentu.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
