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
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        data: { name: fd.get('name') as string, branchId: branchId! }
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
      categoryId: Number(fd.get('categoryId')),
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      price: Number(fd.get('price')),
      station: fd.get('station') as any,
      preparationTime: Number(fd.get('preparationTime')),
      isAvailable: fd.get('isAvailable') === 'on',
      imageUrl: fd.get('imageUrl') as string || undefined
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

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Manage items, prices, and availability</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="btn-add-cat">Add Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <form onSubmit={handleCategorySubmit}>
                <DialogHeader>
                  <DialogTitle>New Category</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input id="cat-name" name="name" required autoFocus data-testid="input-cat-name"/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCat.isPending} data-testid="btn-save-cat">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isItemOpen} onOpenChange={(open) => { setIsItemOpen(open); if(!open) setEditingItem(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)} data-testid="btn-add-item"><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleItemSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'New Menu Item'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" required defaultValue={editingItem?.name} data-testid="input-item-name"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (IDR) *</Label>
                      <Input id="price" name="price" type="number" required defaultValue={editingItem?.price} data-testid="input-item-price"/>
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
                      <Select name="station" defaultValue={editingItem?.station || 'bar'}>
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
                    <Textarea id="description" name="description" defaultValue={editingItem?.description} data-testid="input-item-desc"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime">Prep Time (mins) *</Label>
                      <Input id="prepTime" name="preparationTime" type="number" required defaultValue={editingItem?.preparationTime || 5} data-testid="input-item-prep"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input id="imageUrl" name="imageUrl" type="url" defaultValue={editingItem?.imageUrl} data-testid="input-item-img"/>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="isAvailable" name="isAvailable" defaultChecked={editingItem ? editingItem.isAvailable : true} data-testid="switch-item-avail"/>
                    <Label htmlFor="isAvailable">Available for order</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending} data-testid="btn-save-item">Save Item</Button>
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
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg mb-6">
            <TabsTrigger value="all" className="rounded-md">All Categories</TabsTrigger>
            {categories?.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-md">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {loadingItems ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : items?.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <h3 className="text-lg font-medium text-muted-foreground">No menu items found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items?.map(item => (
            <Card key={item.id} className="overflow-hidden group flex flex-col relative">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm" onClick={() => openEdit(item)} data-testid={`btn-edit-item-${item.id}`}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" data-testid={`btn-del-item-${item.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone. It will remove the item from the menu.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="h-48 bg-muted relative flex items-center justify-center border-b">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Badge variant="destructive" className="text-base px-3 py-1">Unavailable</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-bold leading-tight">{item.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description || "No description"}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-primary font-bold text-lg">{formatIDR(Number(item.price))}</p>
                  <span className="text-xs font-medium text-muted-foreground capitalize px-2 py-1 bg-muted rounded-md">{item.station}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
