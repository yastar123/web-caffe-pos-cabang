import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  useGetMenuCategories,
  useGetMenuItems,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, UtensilsCrossed, Clock, ChefHat, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATION_COLORS: Record<string, string> = {
  bar: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  kitchen: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  dessert: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
};

export default function Menu() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCat, setEditingCat] = useState<any>(null);

  const { data: categories, isLoading: loadingCat } = useGetMenuCategories(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuCategoriesQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: items, isLoading: loadingItems } = useGetMenuItems(
    { branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) } }
  );

  const createCat = useCreateMenuCategory();
  const updateCat = useUpdateMenuCategory();
  const deleteCat = useDeleteMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const invalidateCats = () => queryClient.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey({ branchId: branchId ?? undefined }) });

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCat.mutateAsync({
        data: { name: fd.get("name") as string, branchId: branchId! }
      });
      toast({ title: "Kategori ditambahkan" });
      invalidateCats();
      setIsCatOpen(false);
    } catch {
      toast({ title: "Gagal menambahkan kategori", variant: "destructive" });
    }
  };

  const handleCategoryUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCat) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateCat.mutateAsync({ id: editingCat.id, data: { name: fd.get("name") as string } });
      toast({ title: "Kategori diubah namanya" });
      invalidateCats();
      setEditingCat(null);
    } catch {
      toast({ title: "Gagal mengubah nama kategori", variant: "destructive" });
    }
  };

  const handleCategoryDelete = async (id: number) => {
    try {
      await deleteCat.mutateAsync({ id });
      toast({ title: "Kategori dihapus" });
      invalidateCats();
      if (activeCategory === id.toString()) setActiveCategory("all");
    } catch {
      toast({ title: "Gagal menghapus kategori — hapus semua item terlebih dahulu", variant: "destructive" });
    }
  };

  const handleItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      branchId: branchId!,
      categoryId: Number(fd.get("categoryId")),
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      station: fd.get("station") as any,
      preparationTime: Number(fd.get("preparationTime")),
      isAvailable: fd.get("isAvailable") === "on",
      imageUrl: fd.get("imageUrl") as string || undefined
    };
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, data });
        toast({ title: "Item diperbarui" });
      } else {
        await createItem.mutateAsync({ data });
        toast({ title: "Item ditambahkan" });
      }
      queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) });
      setIsItemOpen(false);
      setEditingItem(null);
    } catch {
      toast({ title: "Gagal menyimpan item", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem.mutateAsync({ id });
      toast({ title: "Item dihapus" });
      queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) });
    } catch {
      toast({ title: "Gagal menghapus item", variant: "destructive" });
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsItemOpen(true);
  };

  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manajemen Menu</h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola item, harga, dan ketersediaan</p>
        </div>
        <div className="flex gap-2">
          {/* Manage Categories dialog */}
          <Dialog open={isCatManageOpen} onOpenChange={setIsCatManageOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="Kelola kategori">
                <Settings2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Kelola Kategori</DialogTitle>
              </DialogHeader>
              <div className="py-2 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {editingCat ? (
                  <form onSubmit={handleCategoryUpdate} className="flex gap-2 items-center bg-muted/50 rounded-lg p-3">
                    <Input name="name" defaultValue={editingCat.name} required autoFocus className="flex-1" />
                    <Button type="submit" size="sm" disabled={updateCat.isPending}>Simpan</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingCat(null)}>Batal</Button>
                  </form>
                ) : null}
                {categories?.map((cat: any) => (
                  <div key={cat.id} className={cn("flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-card", editingCat?.id === cat.id && "ring-2 ring-primary")}>
                    <span className="font-medium text-sm flex-1 truncate">{cat.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCat(cat)} title="Ubah Nama">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus "{cat.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ini akan menghapus kategori secara permanen. Semua item menu dalam kategori ini harus dihapus terlebih dahulu.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCategoryDelete(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-6">Belum ada kategori</p>
                )}
              </div>
              <DialogFooter>
                <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Kategori Baru</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <form onSubmit={handleCategorySubmit}>
                      <DialogHeader>
                        <DialogTitle>Kategori Baru</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cat-name">Nama</Label>
                          <Input id="cat-name" name="name" required autoFocus data-testid="input-cat-name" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createCat.isPending} data-testid="btn-save-cat">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isItemOpen} onOpenChange={(open) => { setIsItemOpen(open); if (!open) setEditingItem(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)} data-testid="btn-add-item">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleItemSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Item Menu Baru"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama *</Label>
                      <Input id="name" name="name" required defaultValue={editingItem?.name} data-testid="input-item-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga (IDR) *</Label>
                      <Input id="price" name="price" type="number" required defaultValue={editingItem?.price} data-testid="input-item-price" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Kategori *</Label>
                      <Select name="categoryId" defaultValue={editingItem?.categoryId?.toString()}>
                        <SelectTrigger data-testid="select-item-cat">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station">Stasiun *</Label>
                      <Select name="station" defaultValue={editingItem?.station || "bar"}>
                        <SelectTrigger data-testid="select-item-station">
                          <SelectValue placeholder="Pilih stasiun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar (Minuman)</SelectItem>
                          <SelectItem value="kitchen">Dapur (Makanan)</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" defaultValue={editingItem?.description} data-testid="input-item-desc" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Waktu Persiapan (menit) *</Label>
                    <Input id="prepTime" name="preparationTime" type="number" required defaultValue={editingItem?.preparationTime || 5} data-testid="input-item-prep" />
                  </div>
                  <ImageUploadField
                    key={editingItem?.id ?? "new"}
                    name="imageUrl"
                    defaultValue={editingItem?.imageUrl}
                    label="Gambar Menu"
                    folder="pos-kafe/menu"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="isAvailable" name="isAvailable" defaultChecked={editingItem ? editingItem.isAvailable : true} data-testid="switch-item-avail" />
                    <Label htmlFor="isAvailable">Tersedia untuk dipesan</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending} data-testid="btn-save-item">
                    Simpan Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loadingCat ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/40 rounded-xl mb-6 gap-0.5">
            <TabsTrigger value="all" className="rounded-lg font-semibold text-xs sm:text-sm">
              Semua
              {items && <span className="ml-1.5 text-[10px] opacity-60">({items.length})</span>}
            </TabsTrigger>
            {categories?.map((cat: any) => (
              <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {loadingItems ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : items?.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 opacity-25" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Belum ada item menu</h3>
            <p className="text-sm text-muted-foreground mt-1">Tambahkan item pertama Anda untuk memulai</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
          {items?.map((item: any) => (
            <Card
              key={item.id}
              className="overflow-hidden group flex flex-col relative card-hover shadow-sm hover:shadow-md"
            >
              {/* Edit/Delete overlay — always visible on touch, hover-only on desktop */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 shadow-md bg-card/90 backdrop-blur-sm"
                  onClick={() => openEdit(item)}
                  data-testid={`btn-edit-item-${item.id}`}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      className="h-7 w-7 shadow-md bg-destructive/90 hover:bg-destructive text-white backdrop-blur-sm"
                      data-testid={`btn-del-item-${item.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus "{item.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan dan akan menghapus item dari menu.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Image area */}
              <div className="h-44 bg-muted relative flex items-center justify-center border-b overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/8 to-secondary/15 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-card/60 flex items-center justify-center border border-white/40 shadow-sm">
                      <UtensilsCrossed className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-background/75 backdrop-blur-[1px] flex items-center justify-center">
                    <Badge variant="destructive" className="shadow-sm text-xs font-bold px-3 py-1">
                      Tidak Tersedia
                    </Badge>
                  </div>
                )}
                {/* Prep time badge */}
                <div className="absolute bottom-2 left-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] font-semibold bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-2.5 h-2.5" />
                    {item.preparationTime}m
                  </div>
                </div>
              </div>

              <CardContent className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <p className="text-primary font-bold text-sm sm:text-base">{formatIDR(Number(item.price))}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold capitalize px-2 py-0 h-5",
                      (item.station ? STATION_COLORS[item.station] : null) ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    <ChefHat className="w-2.5 h-2.5 mr-1" />
                    {item.station}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
