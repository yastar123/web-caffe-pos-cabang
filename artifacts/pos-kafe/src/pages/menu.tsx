import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGetMenuCategories,
  useGetMenuItems,
  useCreateMenuCategory,
  useUpdateMenuCategory,
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
import { Plus, Edit2, Trash2, UtensilsCrossed, Clock, ChefHat } from "lucide-react";
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
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: categories, isLoading: loadingCat } = useGetMenuCategories(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuCategoriesQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: items, isLoading: loadingItems } = useGetMenuItems(
    { branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) } }
  );

  const createCat = useCreateMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCat.mutateAsync({
        data: { name: fd.get("name") as string, branchId: branchId! }
      });
      toast({ title: "Category added" });
      queryClient.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey({ branchId: branchId ?? undefined }) });
      setIsCatOpen(false);
    } catch {
      toast({ title: "Failed to add category", variant: "destructive" });
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
        toast({ title: "Item updated" });
      } else {
        await createItem.mutateAsync({ data });
        toast({ title: "Item added" });
      }
      queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) });
      setIsItemOpen(false);
      setEditingItem(null);
    } catch {
      toast({ title: "Failed to save item", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem.mutateAsync({ id });
      toast({ title: "Item deleted" });
      queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) });
    } catch {
      toast({ title: "Failed to delete item", variant: "destructive" });
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage items, prices, and availability</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="btn-add-cat">
                <Plus className="w-4 h-4 mr-1.5" /> Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <form onSubmit={handleCategorySubmit}>
                <DialogHeader>
                  <DialogTitle>New Category</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input id="cat-name" name="name" required autoFocus data-testid="input-cat-name" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCat.isPending} data-testid="btn-save-cat">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isItemOpen} onOpenChange={(open) => { setIsItemOpen(open); if (!open) setEditingItem(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)} data-testid="btn-add-item">
                <Plus className="w-4 h-4 mr-1.5" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleItemSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "New Menu Item"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" required defaultValue={editingItem?.name} data-testid="input-item-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (IDR) *</Label>
                      <Input id="price" name="price" type="number" required defaultValue={editingItem?.price} data-testid="input-item-price" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category *</Label>
                      <Select name="categoryId" defaultValue={editingItem?.categoryId?.toString()}>
                        <SelectTrigger data-testid="select-item-cat">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station">Station *</Label>
                      <Select name="station" defaultValue={editingItem?.station || "bar"}>
                        <SelectTrigger data-testid="select-item-station">
                          <SelectValue placeholder="Select station" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar (Drinks)</SelectItem>
                          <SelectItem value="kitchen">Kitchen (Food)</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={editingItem?.description} data-testid="input-item-desc" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime">Prep Time (mins) *</Label>
                      <Input id="prepTime" name="preparationTime" type="number" required defaultValue={editingItem?.preparationTime || 5} data-testid="input-item-prep" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input id="imageUrl" name="imageUrl" type="url" defaultValue={editingItem?.imageUrl} data-testid="input-item-img" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="isAvailable" name="isAvailable" defaultChecked={editingItem ? editingItem.isAvailable : true} data-testid="switch-item-avail" />
                    <Label htmlFor="isAvailable">Available for order</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending} data-testid="btn-save-item">
                    Save Item
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
              All
              {items && <span className="ml-1.5 text-[10px] opacity-60">({items.length})</span>}
            </TabsTrigger>
            {categories?.map(cat => (
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
            <h3 className="text-lg font-semibold text-foreground">No menu items yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first item to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
          {items?.map(item => (
            <Card
              key={item.id}
              className="overflow-hidden group flex flex-col relative card-hover shadow-sm hover:shadow-md"
            >
              {/* Edit/Delete overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
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
                      <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone and will remove the item from the menu.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
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
                      Unavailable
                    </Badge>
                  </div>
                )}
                {/* Prep time badge */}
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      STATION_COLORS[item.station] ?? "bg-muted text-muted-foreground"
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
