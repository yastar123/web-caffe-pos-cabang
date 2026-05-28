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
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Store, UserCircle, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
          name: fd.get('name') as string,
          address: fd.get('address') as string,
          phone: fd.get('phone') as string,
          email: fd.get('email') as string,
          taxRate: Number(fd.get('taxRate'))
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
        data: {
          name: fd.get('name') as string,
        }
      });
      toast({ title: "Profile updated. Refresh to see changes globally." });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-5 sm:space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage personal and store preferences</p>
      </div>

      <div className="grid gap-8 stagger-children">
        <Card>
          <CardHeader className="bg-muted/20 border-b">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle>Account Settings</CardTitle>
            </div>
            <CardDescription>Update your personal profile details</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSave}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold uppercase shadow-inner border border-primary/20">
                  {user?.name.substring(0, 2)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role} Account</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Display Name</Label>
                  <Input id="profile-name" name="name" defaultValue={user?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email (Login ID)</Label>
                  <Input id="profile-email" disabled value={user?.email} className="bg-muted text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Contact admin to change email</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4 bg-muted/10 justify-end">
              <Button type="submit" disabled={updateUser.isPending}><Save className="w-4 h-4 mr-2"/> Update Profile</Button>
            </CardFooter>
          </form>
        </Card>

        {['owner', 'manager'].includes(user?.role || '') && (
          <Card>
            <CardHeader className="bg-muted/20 border-b">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <CardTitle>Branch Configuration</CardTitle>
              </div>
              <CardDescription>Manage details for your assigned branch</CardDescription>
            </CardHeader>
            {loadingBranch ? (
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            ) : branch ? (
              <form onSubmit={handleBranchSave}>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="branch-name">Branch Name</Label>
                    <Input id="branch-name" name="name" defaultValue={branch.name} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="branch-address">Physical Address</Label>
                    <Input id="branch-address" name="address" defaultValue={branch.address} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-phone">Contact Phone</Label>
                    <Input id="branch-phone" name="phone" defaultValue={branch.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-email">Contact Email</Label>
                    <Input id="branch-email" name="email" type="email" defaultValue={branch.email ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-tax">Tax Rate (%)</Label>
                    <Input id="branch-tax" name="taxRate" type="number" step="0.1" defaultValue={branch.taxRate} required />
                    <p className="text-xs text-muted-foreground">Applied to all POS transactions</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 bg-muted/10 justify-end">
                  <Button type="submit" disabled={updateBranch.isPending}><Save className="w-4 h-4 mr-2"/> Save Branch Settings</Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="p-6 text-center text-muted-foreground">
                You are not assigned to a specific branch.
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
