import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  useGetIngredients,
  useCreateIngredient,
  useRecordStockMovement,
  useGetPurchaseOrders,
  useCreatePurchaseOrder,
  useDeleteIngredient,
  getGetIngredientsQueryKey,
  getGetPurchaseOrdersQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  AlertTriangle,
  PackageSearch,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function getStockStatus(
  current: number,
  min: number,
): { label: string; color: string; barColor: string } {
  if (current === 0)
    return {
      label: "Kehabisan Stok",
      color:
        "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      barColor: "bg-rose-500",
    };
  if (current < min)
    return {
      label: "Stok Rendah",
      color:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      barColor: "bg-amber-500",
    };
  if (current < min * 1.5)
    return {
      label: "Hampir Habis",
      color:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800",
      barColor: "bg-yellow-500",
    };
  return {
    label: "Baik",
    color:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    barColor: "bg-emerald-500",
  };
}

export default function Stock() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ingredients");
  const [isIngredientOpen, setIsIngredientOpen] = useState(false);
  const [isPoOpen, setIsPoOpen] = useState(false);
  const [movementIng, setMovementIng] = useState<any>(null);
  const [poItems, setPoItems] = useState<
    { ingredientId: number; quantity: number; unitCost: number }[]
  >([]);

  const { data: ingredients, isLoading: loadingIngredients } =
    useGetIngredients(
      { branchId: branchId ?? undefined },
      {
        query: {
          enabled: !!branchId,
          queryKey: getGetIngredientsQueryKey({
            branchId: branchId ?? undefined,
          }),
        },
      },
    );

  const { data: purchaseOrders, isLoading: loadingPos } = useGetPurchaseOrders(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!branchId,
        queryKey: getGetPurchaseOrdersQueryKey({
          branchId: branchId ?? undefined,
        }),
      },
    },
  );

  const createIngredient = useCreateIngredient();
  const moveStock = useRecordStockMovement();
  const deleteIngredient = useDeleteIngredient();
  const createPO = useCreatePurchaseOrder();

  const handleDeleteIngredient = async (ingredient: any) => {
    if (
      !window.confirm(
        `Hapus bahan "${ingredient.name}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    try {
      await deleteIngredient.mutateAsync({ id: ingredient.id });
      toast({ title: "Bahan dihapus" });
      queryClient.invalidateQueries({
        queryKey: getGetIngredientsQueryKey({
          branchId: branchId ?? undefined,
        }),
      });
    } catch {
      toast({ title: "Gagal menghapus bahan", variant: "destructive" });
    }
  };

  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createIngredient.mutateAsync({
        data: {
          branchId: branchId!,
          name: fd.get("name") as string,
          unit: fd.get("unit") as string,
          minStock: Number(fd.get("minStock")),
          currentStock: 0,
          costPerUnit: fd.get("costPerUnit")
            ? Number(fd.get("costPerUnit"))
            : 0,
          imageUrl: (fd.get("imageUrl") as string) || null,
        },
      });
      toast({ title: "Bahan ditambahkan" });
      queryClient.invalidateQueries({
        queryKey: getGetIngredientsQueryKey({
          branchId: branchId ?? undefined,
        }),
      });
      setIsIngredientOpen(false);
    } catch {
      toast({ title: "Gagal menambahkan bahan", variant: "destructive" });
    }
  };

  const handleCreatePO = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (poItems.length === 0) {
      toast({
        title: "Tambahkan setidaknya satu item ke pesanan pembelian",
        variant: "destructive",
      });
      return;
    }
    try {
      await createPO.mutateAsync({
        data: {
          branchId: branchId!,
          supplierName: fd.get("supplier") as string,
          expectedDelivery: (fd.get("expectedDelivery") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
          items: poItems.map((item) => {
            const ing = ingredients?.find(
              (i: any) => i.id === item.ingredientId,
            );
            return {
              ingredientId: item.ingredientId,
              ingredientName: ing?.name ?? "",
              quantity: item.quantity,
              unit: ing?.unit ?? "",
              unitCost: item.unitCost,
              totalCost: item.quantity * item.unitCost,
            };
          }),
        },
      });
      toast({ title: "Pesanan pembelian dibuat" });
      queryClient.invalidateQueries({
        queryKey: getGetPurchaseOrdersQueryKey({
          branchId: branchId ?? undefined,
        }),
      });
      setIsPoOpen(false);
      setPoItems([]);
    } catch {
      toast({
        title: "Gagal membuat pesanan pembelian",
        variant: "destructive",
      });
    }
  };

  const handleMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!movementIng) return;
    try {
      await moveStock.mutateAsync({
        data: {
          ingredientId: movementIng.id,
          branchId: branchId!,
          type: fd.get("type") as "in" | "out" | "adjustment",
          quantity: Number(fd.get("quantity")),
          notes: (fd.get("notes") as string) || undefined,
        },
      });
      toast({ title: "Stok diperbarui" });
      queryClient.invalidateQueries({
        queryKey: getGetIngredientsQueryKey({
          branchId: branchId ?? undefined,
        }),
      });
      setMovementIng(null);
    } catch {
      toast({ title: "Gagal memperbarui stok", variant: "destructive" });
    }
  };

  const filtered =
    ingredients?.filter((i: any) =>
      i.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const totalIngredients = ingredients?.length ?? 0;
  const lowStockCount =
    ingredients?.filter((i: any) => i.currentStock < i.minStock).length ?? 0;
  const outOfStockCount =
    ingredients?.filter((i: any) => i.currentStock === 0).length ?? 0;

  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const poTotal = poItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stok & Inventaris
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola bahan dan pesanan pembelian
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        {[
          {
            label: "Total Bahan",
            value: totalIngredients,
            color: "text-foreground",
            icon: PackageSearch,
          },
          {
            label: "Stok Rendah",
            value: lowStockCount,
            color: "text-amber-600 dark:text-amber-400",
            icon: AlertTriangle,
          },
          {
            label: "Kehabisan Stok",
            value: outOfStockCount,
            color: "text-rose-600 dark:text-rose-400",
            icon: AlertTriangle,
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className={cn("text-2xl font-bold tabular-nums", s.color)}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          if (v === "purchase-orders") setSearch("");
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <TabsList className="bg-muted/40 rounded-xl p-1 h-auto gap-0.5">
            <TabsTrigger
              value="ingredients"
              className="rounded-lg font-semibold text-sm"
            >
              Bahan
            </TabsTrigger>
            <TabsTrigger
              value="purchase-orders"
              className="rounded-lg font-semibold text-sm"
            >
              Pesanan Pembelian
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {activeTab === "ingredients" && (
              <Input
                placeholder="Cari bahan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-sm w-full sm:w-48"
                data-testid="input-search-stock"
              />
            )}
            <Dialog open={isIngredientOpen} onOpenChange={setIsIngredientOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 shrink-0"
                  data-testid="btn-add-ingredient"
                >
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Tambah Bahan</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleAddIngredient}>
                  <DialogHeader>
                    <DialogTitle>Tambah Bahan Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        autoFocus
                        data-testid="input-ing-name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">
                          Satuan (mis., kg, L, pcs) *
                        </Label>
                        <Input
                          id="unit"
                          name="unit"
                          required
                          placeholder="kg"
                          data-testid="input-ing-unit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Stok Minimum *</Label>
                        <Input
                          id="minStock"
                          name="minStock"
                          type="number"
                          step="0.01"
                          required
                          data-testid="input-ing-min"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerUnit">
                        Biaya per Satuan (IDR){" "}
                        <span className="text-muted-foreground font-normal">
                          Opsional
                        </span>
                      </Label>
                      <Input
                        id="costPerUnit"
                        name="costPerUnit"
                        type="number"
                        data-testid="input-ing-cost"
                      />
                    </div>
                    <ImageUploadField
                      name="imageUrl"
                      label="Gambar Bahan (Opsional)"
                      folder="pos-kafe/stock"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createIngredient.isPending}
                      data-testid="btn-save-ingredient"
                    >
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isPoOpen}
              onOpenChange={(open) => {
                setIsPoOpen(open);
                if (!open) setPoItems([]);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 shrink-0"
                  data-testid="btn-new-po"
                >
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Pesanan Pembelian</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[640px]">
                <form onSubmit={handleCreatePO}>
                  <DialogHeader>
                    <DialogTitle>Pesanan Pembelian Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Nama Pemasok *</Label>
                        <Input
                          id="supplier"
                          name="supplier"
                          required
                          data-testid="input-po-supplier"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedDelivery">
                          Perkiraan Pengiriman
                        </Label>
                        <Input
                          id="expectedDelivery"
                          name="expectedDelivery"
                          type="date"
                          data-testid="input-po-delivery"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Detail pesanan atau instruksi khusus"
                        data-testid="input-po-notes"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Item Pesanan *</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPoItems((prev) => [
                              ...prev,
                              { ingredientId: 0, quantity: 1, unitCost: 0 },
                            ])
                          }
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Baris
                        </Button>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Bahan</TableHead>
                              <TableHead className="w-20">Jml</TableHead>
                              <TableHead className="w-28">
                                Biaya Satuan (IDR)
                              </TableHead>
                              <TableHead className="w-8" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {poItems.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center text-muted-foreground text-sm py-6"
                                >
                                  Tambahkan item ke pesanan di atas
                                </TableCell>
                              </TableRow>
                            ) : (
                              poItems.map((pi, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="py-2">
                                    <Select
                                      value={pi.ingredientId.toString()}
                                      onValueChange={(val) =>
                                        setPoItems((prev) =>
                                          prev.map((p, i) =>
                                            i === idx
                                              ? {
                                                  ...p,
                                                  ingredientId: Number(val),
                                                }
                                              : p,
                                          ),
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Pilih bahan" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ingredients?.map((ing: any) => (
                                          <SelectItem
                                            key={ing.id}
                                            value={ing.id.toString()}
                                          >
                                            {ing.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      value={pi.quantity}
                                      onChange={(e) =>
                                        setPoItems((prev) =>
                                          prev.map((p, i) =>
                                            i === idx
                                              ? {
                                                  ...p,
                                                  quantity: Number(
                                                    e.target.value,
                                                  ),
                                                }
                                              : p,
                                          ),
                                        )
                                      }
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={pi.unitCost}
                                      onChange={(e) =>
                                        setPoItems((prev) =>
                                          prev.map((p, i) =>
                                            i === idx
                                              ? {
                                                  ...p,
                                                  unitCost: Number(
                                                    e.target.value,
                                                  ),
                                                }
                                              : p,
                                          ),
                                        )
                                      }
                                      className="h-8 text-xs"
                                    />
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        setPoItems((prev) =>
                                          prev.filter((_, i) => i !== idx),
                                        )
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {poTotal > 0 && (
                        <div className="text-right text-sm font-bold mt-2 text-primary">
                          Total: {formatIDR(poTotal)}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPoOpen(false);
                        setPoItems([]);
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={createPO.isPending}
                      data-testid="btn-submit-po"
                    >
                      Buat Pesanan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="ingredients" className="mt-0">
          {loadingIngredients ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Bahan</TableHead>
                    <TableHead>Level Stok</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Biaya/Unit
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-16 text-muted-foreground"
                      >
                        <PackageSearch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Bahan tidak ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((ing: any) => {
                      const status = getStockStatus(
                        Number(ing.currentStock),
                        Number(ing.minStock),
                      );
                      const pct = Math.min(
                        100,
                        ing.minStock > 0
                          ? (Number(ing.currentStock) / Number(ing.minStock)) *
                              100
                          : 100,
                      );
                      return (
                        <TableRow key={ing.id} className="hover:bg-muted/20">
                          <TableCell>
                            <p className="font-semibold text-sm">{ing.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Min: {ing.minStock} {ing.unit}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    status.barColor,
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold tabular-nums whitespace-nowrap">
                                {ing.currentStock}{" "}
                                <span className="text-muted-foreground font-normal text-xs">
                                  {ing.unit}
                                </span>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-semibold",
                                status.color,
                              )}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm tabular-nums">
                            {ing.costPerUnit ? (
                              formatIDR(Number(ing.costPerUnit))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setMovementIng(ing)}
                                data-testid={`btn-record-${ing.id}`}
                              >
                                Catat
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleDeleteIngredient(ing)}
                                data-testid={`btn-delete-${ing.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-0">
          {loadingPos ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pemasok</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Perkiraan
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!purchaseOrders || purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-16 text-muted-foreground"
                      >
                        Pesanan pembelian tidak ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders?.map((po: any) => (
                      <TableRow key={po.id}>
                        <TableCell>
                          {format(new Date(po.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {po.supplierName}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(Number(po.totalAmount))}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {po.expectedDelivery
                            ? format(new Date(po.expectedDelivery), "MMM dd")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {po.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!movementIng}
        onOpenChange={(open) => !open && setMovementIng(null)}
      >
        <DialogContent>
          <form onSubmit={handleMovement}>
            <DialogHeader>
              <DialogTitle>
                Catat Pergerakan Stok: {movementIng?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Jenis Pergerakan *</Label>
                <Select name="type" required>
                  <SelectTrigger data-testid="select-move-type">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stok Masuk (Terima)</SelectItem>
                    <SelectItem value="out">
                      Stok Keluar (Penggunaan/Pemborosan)
                    </SelectItem>
                    <SelectItem value="adjustment">
                      Penyesuaian (Audit)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah ({movementIng?.unit}) *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  required
                  data-testid="input-move-qty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Alasan pergerakan"
                  data-testid="input-move-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={moveStock.isPending}
                data-testid="btn-save-move"
              >
                Simpan Pergerakan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
