import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { 
  useGetIngredients, 
  useGetLowStockAlerts, 
  useCreateIngredient, 
  useCreateStockMovement,
  useGetPurchaseOrders,
  useCreatePurchaseOrder,
  getGetIngredientsQueryKey,
  getGetLowStockAlertsQueryKey,
  getGetPurchaseOrdersQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, Package, ArrowDownUp, Plus, Search, Trash2 } from "lucide-react";

export default function Stock() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isAddIngOpen, setIsAddIngOpen] = useState(false);
  const [movementIng, setMovementIng] = useState<any>(null);
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);

  // PO line items state
  interface POLineItem { ingredientId: number; ingredientName: string; quantity: number; unit: string; unitCost: number; totalCost: number; }
  const [poItems, setPoItems] = useState<POLineItem[]>([]);
  const [poIngId, setPoIngId] = useState<string>("");
  const [poQty, setPoQty] = useState<string>("");
  const [poUnitCost, setPoUnitCost] = useState<string>("");

  const addPOItem = () => {
    const ing = ingredients?.find(i => i.id.toString() === poIngId);
    if (!ing || !poQty || !poUnitCost) return;
    const qty = Number(poQty);
    const cost = Number(poUnitCost);
    setPoItems(prev => [...prev.filter(i => i.ingredientId !== ing.id), {
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: qty,
      unit: ing.unit,
      unitCost: cost,
      totalCost: qty * cost,
    }]);
    setPoIngId("");
    setPoQty("");
    setPoUnitCost("");
  };

  const removePOItem = (ingredientId: number) => setPoItems(prev => prev.filter(i => i.ingredientId !== ingredientId));

  const formatIDRStock = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const poTotal = poItems.reduce((sum, i) => sum + i.totalCost, 0);

  const { data: ingredients, isLoading: loadingIngs } = useGetIngredients(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetIngredientsQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: lowStock } = useGetLowStockAlerts(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetLowStockAlertsQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: purchaseOrders } = useGetPurchaseOrders(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetPurchaseOrdersQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const createIng = useCreateIngredient();
  const moveStock = useCreateStockMovement();
  const createPO = useCreatePurchaseOrder();

  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createIng.mutateAsync({
        data: {
          branchId: branchId!,
          name: fd.get('name') as string,
          unit: fd.get('unit') as string,
          currentStock: 0,
          minStock: Number(fd.get('minStock')),
        }
      });
      toast({ title: "Ingredient added" });
      queryClient.invalidateQueries({ queryKey: getGetIngredientsQueryKey({ branchId: branchId ?? undefined }) });
      setIsAddIngOpen(false);
    } catch {
      toast({ title: "Failed to add ingredient", variant: "destructive" });
    }
  };

  const handleCreatePO = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (poItems.length === 0) {
      toast({ title: "Add at least one item to the purchase order", variant: "destructive" });
      return;
    }
    const fd = new FormData(e.currentTarget);
    try {
      await createPO.mutateAsync({
        data: {
          branchId: branchId!,
          supplierName: fd.get('supplierName') as string,
          expectedDelivery: fd.get('expectedDelivery') as string || undefined,
          notes: fd.get('notes') as string || undefined,
          items: poItems,
        }
      });
      toast({ title: "Purchase order created" });
      queryClient.invalidateQueries({ queryKey: getGetPurchaseOrdersQueryKey({ branchId: branchId ?? undefined }) });
      setIsNewPOOpen(false);
      setPoItems([]);
    } catch {
      toast({ title: "Failed to create purchase order", variant: "destructive" });
    }
  };

  const handleMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await moveStock.mutateAsync({
        data: {
          branchId: branchId!,
          ingredientId: movementIng.id,
          type: fd.get('type') as any,
          quantity: Number(fd.get('quantity')),
          notes: fd.get('notes') as string || undefined,
        }
      });
      toast({ title: "Stock updated" });
      queryClient.invalidateQueries({ queryKey: getGetIngredientsQueryKey({ branchId: branchId ?? undefined }) });
      queryClient.invalidateQueries({ queryKey: getGetLowStockAlertsQueryKey({ branchId: branchId ?? undefined }) });
      setMovementIng(null);
    } catch {
      toast({ title: "Failed to update stock", variant: "destructive" });
    }
  };

  const filteredIngs = ingredients?.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) || [];
  
  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { color: "text-rose-600 bg-rose-50", text: "Out of Stock" };
    if (current <= min) return { color: "text-destructive bg-destructive/10", text: "Low Stock" };
    if (current <= min * 1.5) return { color: "text-amber-600 bg-amber-50", text: "Running Low" };
    return { color: "text-emerald-600 bg-emerald-50", text: "Healthy" };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Stock & Inventory</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage ingredients and purchase orders</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 stagger-children">
        <Card className="shadow-sm card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-3 sm:px-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight">Total Ingredients</CardTitle>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">{ingredients?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-3 sm:px-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium text-amber-800 leading-tight">Low Stock</CardTitle>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">{lowStock?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-3 sm:px-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium text-rose-800 leading-tight">Out of Stock</CardTitle>
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">{ingredients?.filter(i => Number(i.currentStock) <= 0).length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingredients" className="w-full border rounded-xl bg-card shadow-sm">
        <div className="border-b px-4 pt-1 pb-0">
          <TabsList className="bg-transparent space-x-4 p-0">
            <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-3 sm:px-4 pb-3 text-sm">Ingredients</TabsTrigger>
            <TabsTrigger value="po" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-3 sm:px-4 pb-3 text-sm">Purchase Orders</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ingredients" className="p-0 m-0 border-none outline-none">
          <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/20">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search ingredients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background h-10"
                data-testid="input-search-ing"
              />
            </div>
            <Dialog open={isAddIngOpen} onOpenChange={setIsAddIngOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-ing"><Plus className="w-4 h-4 mr-2"/> Add Ingredient</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddIngredient}>
                  <DialogHeader>
                    <DialogTitle>Add New Ingredient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" required data-testid="input-ing-name"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit (e.g., kg, L, pcs) *</Label>
                        <Input id="unit" name="unit" required data-testid="input-ing-unit"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Minimum Stock *</Label>
                        <Input id="minStock" name="minStock" type="number" step="0.01" required data-testid="input-ing-min"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">Primary Supplier</Label>
                      <Input id="supplierName" name="supplierName" data-testid="input-ing-supp"/>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createIng.isPending} data-testid="btn-save-ing">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingIngs ? (
                Array.from({length: 6}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse"/></TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex justify-between"><div className="h-3 w-16 bg-muted rounded animate-pulse"/><div className="h-3 w-12 bg-muted rounded animate-pulse"/></div>
                        <div className="h-2 w-full bg-muted rounded-full animate-pulse"/>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-5 w-20 bg-muted rounded-full animate-pulse"/></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse"/></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-20 bg-muted rounded ml-auto animate-pulse"/></TableCell>
                  </TableRow>
                ))
              ) : filteredIngs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No ingredients found
                  </TableCell>
                </TableRow>
              ) : null}
              {!loadingIngs && filteredIngs.map((item) => {
                const current = Number(item.currentStock);
                const min = Number(item.minStock);
                const status = getStockStatus(current, min);
                const percent = Math.min(100, Math.max(0, (current / (min * 3)) * 100));

                return (
                  <TableRow key={item.id} className={current <= min ? 'bg-destructive/5 hover:bg-destructive/10' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="w-[300px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold tabular-nums">{current} {item.unit}</span>
                        <span className="text-muted-foreground tabular-nums">Min: {min}</span>
                      </div>
                      <Progress value={percent} className={`h-2 ${current <= min ? '[&>div]:bg-destructive' : current <= min * 1.5 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} border-none font-semibold px-2 py-0.5`}>
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.supplierName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setMovementIng(item)} data-testid={`btn-move-${item.id}`}>
                        <ArrowDownUp className="w-3 h-3 mr-2" /> Record
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="po" className="p-0 m-0 border-none outline-none">
          <div className="p-4 border-b flex justify-end bg-muted/20">
            <Dialog open={isNewPOOpen} onOpenChange={setIsNewPOOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-new-po"><Plus className="w-4 h-4 mr-2"/> New Purchase Order</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreatePO}>
                  <DialogHeader>
                    <DialogTitle>New Purchase Order</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplierName">Supplier Name *</Label>
                        <Input id="supplierName" name="supplierName" required placeholder="e.g. PT Sumber Bahan" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                        <Input id="expectedDelivery" name="expectedDelivery" type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="po-notes">Notes</Label>
                      <Input id="po-notes" name="notes" placeholder="Order details or special instructions" />
                    </div>

                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-muted/30 px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-semibold">Order Items *</span>
                        {poItems.length > 0 && <span className="text-xs text-muted-foreground">{poItems.length} item{poItems.length !== 1 ? 's' : ''} · {formatIDRStock(poTotal)}</span>}
                      </div>

                      <div className="p-3 space-y-2 bg-muted/10">
                        <div className="grid grid-cols-[1fr_80px_90px_32px] gap-1.5 items-end">
                          <div className="space-y-1">
                            <Label className="text-xs">Ingredient</Label>
                            <Select value={poIngId} onValueChange={setPoIngId}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                              <SelectContent>
                                {ingredients?.map(ing => (
                                  <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name} ({ing.unit})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Qty</Label>
                            <Input value={poQty} onChange={e => setPoQty(e.target.value)} type="number" step="0.01" min="0.01" placeholder="0" className="h-9 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Unit Cost (IDR)</Label>
                            <Input value={poUnitCost} onChange={e => setPoUnitCost(e.target.value)} type="number" step="1" min="1" placeholder="0" className="h-9 text-xs" />
                          </div>
                          <Button type="button" size="icon" className="h-9 w-8 shrink-0 mt-5" onClick={addPOItem} disabled={!poIngId || !poQty || !poUnitCost}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {poItems.length > 0 && (
                        <div className="divide-y">
                          {poItems.map(item => (
                            <div key={item.ingredientId} className="px-3 py-2 flex items-center justify-between gap-2 text-sm hover:bg-muted/20">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium truncate">{item.ingredientName}</span>
                                <span className="text-muted-foreground ml-2">{item.quantity} {item.unit} × {formatIDRStock(item.unitCost)}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-primary tabular-nums">{formatIDRStock(item.totalCost)}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removePOItem(item.ingredientId)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="px-3 py-2 bg-muted/20 flex justify-between items-center font-bold text-sm">
                            <span>Total</span>
                            <span className="text-primary tabular-nums">{formatIDRStock(poTotal)}</span>
                          </div>
                        </div>
                      )}

                      {poItems.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground border-t">
                          Add items to the order above
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsNewPOOpen(false); setPoItems([]); }}>Cancel</Button>
                    <Button type="submit" disabled={createPO.isPending || poItems.length === 0}>Create Order</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No purchase orders found</TableCell>
                </TableRow>
              ) : (
                purchaseOrders?.map(po => (
                  <TableRow key={po.id}>
                    <TableCell>{format(new Date(po.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{po.supplierName}</TableCell>
                    <TableCell className="tabular-nums">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(po.totalAmount))}</TableCell>
                    <TableCell>{po.expectedDelivery ? format(new Date(po.expectedDelivery), 'MMM dd') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{po.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Dialog open={!!movementIng} onOpenChange={(open) => !open && setMovementIng(null)}>
        <DialogContent>
          <form onSubmit={handleMovement}>
            <DialogHeader>
              <DialogTitle>Record Stock Movement: {movementIng?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Movement Type *</Label>
                <Select name="type" required>
                  <SelectTrigger data-testid="select-move-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (Receive)</SelectItem>
                    <SelectItem value="out">Stock Out (Waste/Use)</SelectItem>
                    <SelectItem value="adjustment">Adjustment (Audit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({movementIng?.unit}) *</Label>
                <Input id="quantity" name="quantity" type="number" step="0.01" required data-testid="input-move-qty"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Reason for movement" data-testid="input-move-notes"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={moveStock.isPending} data-testid="btn-save-move">Save Movement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
