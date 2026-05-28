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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Store, UserCircle, Save, Shield, Mail, Phone, MapPin, Percent, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  owner:     "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  manager:   "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  cashier:   "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
  waiter:    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  chef:      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
  warehouse: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300",
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branch, isLoading: loadingBranch } = useGetBranch(
    user?.branchId || 0,
    { query: { enabled: !!user?.branchId, queryKey: getGetBranchQueryKey(user?.branchId || 0) } }
  );

  const updateBranch = useUpdateBranch();
  const updateUser = useUpdateUser();

  const handleBranchSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branch) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateBranch.mutateAsync({
        id: branch.id,
        data: {
          name: fd.get("name") as string,
          address: fd.get("address") as string,
          phone: fd.get("phone") as string,
          email: fd.get("email") as string,
          taxRate: Number(fd.get("taxRate")),
        }
      });
      toast({ title: "Branch settings saved" });
      queryClient.invalidateQueries({ queryKey: getGetBranchQueryKey(branch.id) });
    } catch {
      toast({ title: "Failed to save branch settings", variant: "destructive" });
    }
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { name: fd.get("name") as string }
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Profile updated" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const initials = user?.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() ?? "?";
  const roleColor = ROLE_COLORS[user?.role ?? ""] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage personal and store preferences</p>
      </div>

      <div className="grid gap-6 stagger-children">

        {/* Profile Card */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/20 border-b">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Account Profile</CardTitle>
            </div>
            <CardDescription>Update your name and view your account details</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSave}>
            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Avatar + identity row */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 text-primary flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase shadow-inner border border-primary/20">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background" title="Online" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{user?.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize font-medium mt-1", roleColor)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role}
                  </Badge>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Display Name</Label>
                  <Input id="profile-name" name="name" defaultValue={user?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                    Email (Login ID)
                  </Label>
                  <Input id="profile-email" disabled value={user?.email} className="bg-muted/40 text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" /> Contact admin to change email
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4 bg-muted/10 justify-end">
              <Button type="submit" disabled={updateUser.isPending} className="gap-2">
                <Save className="w-4 h-4" /> Update Profile
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Branch Configuration */}
        {["owner", "manager"].includes(user?.role || "") && (
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Branch Configuration</CardTitle>
              </div>
              <CardDescription>
                {branch ? `Editing settings for ${branch.name}` : "Manage your assigned branch"}
              </CardDescription>
            </CardHeader>

            {loadingBranch ? (
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </CardContent>
            ) : branch ? (
              <form onSubmit={handleBranchSave}>
                <CardContent className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="branch-name">Branch Name</Label>
                    <Input id="branch-name" name="name" defaultValue={branch.name} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="branch-address" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Physical Address
                    </Label>
                    <Input id="branch-address" name="address" defaultValue={branch.address ?? ""} placeholder="Street, City, Province" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-phone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Contact Phone
                    </Label>
                    <Input id="branch-phone" name="phone" defaultValue={branch.phone ?? ""} placeholder="+62..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Contact Email
                    </Label>
                    <Input id="branch-email" name="email" type="email" defaultValue={branch.email ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-tax" className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground" /> Tax Rate (%)
                    </Label>
                    <Input id="branch-tax" name="taxRate" type="number" step="0.1" min="0" max="100" defaultValue={Number(branch.taxRate)} required />
                    <p className="text-xs text-muted-foreground">Applied to all POS transactions at this branch</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 bg-muted/10 justify-end">
                  <Button type="submit" disabled={updateBranch.isPending} className="gap-2">
                    <Save className="w-4 h-4" /> Save Branch Settings
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                <Info className="w-5 h-5 mx-auto mb-2 opacity-40" />
                You are not assigned to a specific branch.
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
