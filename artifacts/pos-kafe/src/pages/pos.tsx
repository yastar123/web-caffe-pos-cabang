import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGetMenuCategories,
  useGetMenuItems,
  useGetTables,
  useGetBranch,
  useCreateOrder,
  useProcessPayment,
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey,
  getGetTablesQueryKey,
  getGetBranchQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  X as XIcon,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

const PAYMENT_METHODS = [
  { key: "cash" as const, label: "Tunai", Icon: Banknote },
  { key: "card" as const, label: "Kartu", Icon: CreditCard },
  { key: "qris" as const, label: "QRIS", Icon: QrCode },
  { key: "ewallet" as const, label: "E-Wallet", Icon: Wallet },
];

export default function POS() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("table") || "";
  });
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qris" | "ewallet" | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showPaymentHint, setShowPaymentHint] = useState(false);
  const tableInitialized = useRef(false);

  const { data: categories, isLoading: loadingCategories } = useGetMenuCategories(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuCategoriesQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: menuItems, isLoading: loadingItems } = useGetMenuItems(
    { branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined },
    { query: { enabled: !!branchId, queryKey: getGetMenuItemsQueryKey({ branchId: branchId ?? undefined, categoryId: activeCategory !== "all" ? Number(activeCategory) : undefined }) } }
  );

  const { data: tables } = useGetTables(
    { branchId: branchId ?? undefined },
    { query: { enabled: !!branchId, queryKey: getGetTablesQueryKey({ branchId: branchId ?? undefined }) } }
  );

  const { data: branch } = useGetBranch(
    branchId || 0,
    { query: { enabled: !!branchId, queryKey: getGetBranchQueryKey(branchId || 0) } }
  );

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  useEffect(() => {
    if (tables && !tableInitialized.current) {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam && tables.some((t: any) => t.id.toString() === tableParam)) {
        setSelectedTable(tableParam);
      }
      tableInitialized.current = true;
    }
  }, [tables]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [menuItems, search]);

  const addToCart = (item: any): void => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.menuItemId === id);
      if (item && item.quantity + delta <= 0) {
        return prev.filter(i => i.menuItemId !== id);
      }
      return prev.map(i =>
        i.menuItemId === id ? { ...i, quantity: i.quantity + delta } : i
      );
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.menuItemId !== id));
  };

  const TAX_RATE = branch?.taxRate != null ? Number(branch.taxRate) / 100 : 0.1;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal - discountAmount) * TAX_RATE;
  const grandTotal = Math.max(0, subtotal - discountAmount + tax);

  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleProcessOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    if (!paymentMethod) {
      setShowPaymentHint(true);
      toast({ title: "Pilih metode pembayaran", description: "Pilih cara pembayaran pelanggan.", variant: "destructive" });
      return;
    }
    setShowPaymentHint(false);
    try {
      const order = await createOrder.mutateAsync({
        data: {
          tableId: Number(selectedTable),
          branchId: branchId!,
          items: cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity, notes: item.notes })),
          notes,
          discountAmount
        }
      });
      await processPayment.mutateAsync({
        data: {
          orderId: order.id,
          branchId: branchId!,
          amount: grandTotal,
          method: paymentMethod as any,
        }
      });
      toast({ title: "Pesanan berhasil diproses" });
      setCart([]);
      setNotes("");
      setDiscountAmount(0);
      setPaymentMethod(null);
      setSelectedTable("");
      setCartOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetTablesQueryKey({ branchId: branchId ?? undefined }) });
      setLocation("/tables");
    } catch {
      toast({ title: "Gagal memproses pesanan", variant: "destructive" });
    }
  };

  const renderCartItems = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
      {cart.length === 0 ? (
        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
          <UtensilsCrossed className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium text-sm">Keranjang kosong</p>
          <p className="text-xs opacity-70 mt-1">Ketuk item menu untuk menambahkan</p>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div
              key={item.menuItemId}
              className="flex items-center gap-3 bg-muted/30 hover:bg-muted/50 p-3 rounded-xl border hover:border-primary/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{formatIDR(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg border-border hover:border-destructive/40 hover:bg-destructive/5"
                  onClick={() => updateQuantity(item.menuItemId, -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg border-border hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => updateQuantity(item.menuItemId, 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="w-20 text-right font-bold text-sm text-primary shrink-0 tabular-nums">
                {formatIDR(item.price * item.quantity)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => removeFromCart(item.menuItemId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="pt-3">
            <Textarea
              placeholder="Tambah catatan pesanan (opsional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[72px] resize-none text-sm bg-muted/30"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderCartFooter = () => (
    <div className="p-4 border-t bg-card shrink-0 space-y-3">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground tabular-nums">{formatIDR(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Diskon</span>
          <div className="w-24">
            <Input
              type="number"
              value={discountAmount || ""}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              className="h-7 text-right text-xs"
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Pajak ({Math.round(TAX_RATE * 100)}%)</span>
          <span className="font-medium text-foreground tabular-nums">{formatIDR(tax)}</span>
        </div>
        <div className="flex justify-between items-center font-bold text-base pt-2 border-t">
          <span>Total</span>
          <span className="text-primary text-lg tabular-nums">{formatIDR(grandTotal)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Metode Pembayaran</span>
          {showPaymentHint && !paymentMethod && (
            <div className="flex items-center gap-1 text-destructive text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              Wajib dipilih
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PAYMENT_METHODS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => { setPaymentMethod(key === paymentMethod ? null : key); setShowPaymentHint(false); }}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold capitalize transition-all",
                paymentMethod === key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : showPaymentHint && !paymentMethod
                  ? "border-destructive/50 bg-destructive/5 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/60"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-bold rounded-xl shadow-sm"
        size="lg"
        disabled={cart.length === 0 || !selectedTable || createOrder.isPending || processPayment.isPending}
        onClick={handleProcessOrder}
        data-testid="btn-process-order"
      >
        {createOrder.isPending || processPayment.isPending ? "Memproses..." : "Proses Pesanan"}
      </Button>

      {!paymentMethod && cart.length > 0 && selectedTable && (
        <p className="text-center text-xs text-muted-foreground">
          Pilih metode pembayaran untuk menyelesaikan pesanan
        </p>
      )}
    </div>
  );

  if (!branchId) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted/40 flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 opacity-25" />
        </div>
        <div>
          <p className="text-xl font-bold">Tidak ada cabang yang ditugaskan</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Akun Anda belum terhubung ke cabang tertentu. Hubungi admin untuk mengatur penugasan cabang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full bg-background overflow-hidden">
        {/* LEFT: Menu panel */}
        <div className="flex-1 lg:w-[60%] lg:flex-none flex flex-col border-r h-full overflow-hidden">
          <div className="p-4 border-b space-y-3 shrink-0 bg-card">
            {/* Mobile table selector banner */}
            <div className="lg:hidden">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger
                  className={cn(
                    "w-full h-9 text-sm font-semibold",
                    !selectedTable && "border-amber-400/60 bg-amber-50/60 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                  )}
                  data-testid="select-table-top"
                >
                  <SelectValue placeholder="⚠ Pilih meja terlebih dahulu" />
                </SelectTrigger>
                <SelectContent>
                  {tables?.filter((t: any) => t.status === "available" || t.id.toString() === selectedTable).map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      Meja {t.number}
                      {t.status === "occupied" ? " (terisi)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari item menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
                data-testid="input-search-menu"
              />
            </div>

            {loadingCategories ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/40 rounded-xl gap-0.5">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">Semua</TabsTrigger>
                  {categories?.map((cat: any) => (
                    <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-lg text-xs font-semibold whitespace-nowrap">
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-accent/10">
            {loadingItems ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
                <Search className="h-10 w-10 mb-3 opacity-20" />
                <p className="font-medium">Item tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map((item: any) => {
                  const inCart = cart.find(c => c.menuItemId === item.id);
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "cursor-pointer transition-all overflow-hidden flex flex-col select-none group",
                        item.isAvailable
                          ? "hover:border-primary hover:shadow-md active:scale-[0.98]"
                          : "opacity-60 cursor-not-allowed",
                        inCart ? "border-primary/60 ring-2 ring-primary/20 shadow-sm" : ""
                      )}
                      onClick={() => item.isAvailable && addToCart(item)}
                      data-testid={`card-menu-item-${item.id}`}
                    >
                      <div className="h-28 sm:h-32 bg-muted relative flex items-center justify-center border-b overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center group-hover:from-primary/10 transition-all duration-300">
                            <UtensilsCrossed className="h-9 w-9 text-muted-foreground/25 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-full">Habis</span>
                          </div>
                        )}
                        {inCart && (
                          <div className="absolute top-1.5 right-1.5 animate-bounce-in">
                            <Badge className="bg-primary text-primary-foreground text-xs font-black h-5 min-w-[20px] flex items-center justify-center px-1.5 rounded-full shadow-md">
                              {inCart.quantity}
                            </Badge>
                          </div>
                        )}
                        {inCart && (
                          <div className="absolute bottom-0 inset-x-0 h-1 bg-primary/80 transition-all duration-300" />
                        )}
                      </div>
                      <CardContent className="p-3 flex flex-col flex-1 justify-between">
                        <p className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2">{item.name}</p>
                        <div className="flex items-center justify-between mt-2 gap-1">
                          <p className="text-primary font-bold text-xs sm:text-sm tabular-nums">{formatIDR(Number(item.price))}</p>
                          {item.isAvailable && !inCart && (
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                              <Plus className="w-3 h-3 text-primary" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Spacer for mobile floating button */}
          <div className="h-20 lg:hidden shrink-0" />
        </div>

        {/* RIGHT: Cart panel (desktop only) */}
        <div className="hidden lg:flex w-[40%] flex-col h-full bg-card shrink-0">
          <div className="p-4 border-b shrink-0 flex items-center gap-3">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="flex-1" data-testid="select-table">
                <SelectValue placeholder="Pilih Meja" />
              </SelectTrigger>
              <SelectContent>
                {tables?.filter((t: any) => t.status === "available" || t.id.toString() === selectedTable).map((t: any) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    Meja {t.number}
                    {t.status === "occupied" ? " (terisi)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cart.length > 0 && (
              <Badge variant="secondary" className="shrink-0 font-bold">
                {totalItems} item
              </Badge>
            )}
          </div>
          {renderCartItems()}
          {renderCartFooter()}
        </div>
      </div>

      {/* Mobile: floating cart button */}
      {cart.length > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-20 lg:hidden animate-bounce-in">
          <Button
            className="w-full h-14 text-base font-bold shadow-2xl rounded-2xl flex items-center justify-between px-5"
            onClick={() => setCartOpen(true)}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-5 h-5" />
              <span>{totalItems} item</span>
              {selectedTable && tables && (
                <span className="text-primary-foreground/70 font-normal">
                  · {(() => { const t = tables.find((t: any) => t.id.toString() === selectedTable); return t ? `Meja ${t.number}` : ""; })()}
                </span>
              )}
            </div>
            <span className="tabular-nums font-black">{formatIDR(grandTotal)}</span>
          </Button>
        </div>
      )}

      {/* Mobile: cart sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="bottom"
          className="h-[92vh] flex flex-col p-0 rounded-t-2xl lg:hidden border-t-0"
        >
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setCartOpen(false)}
              >
                <XIcon className="w-4 h-4" />
              </Button>
              <SheetTitle className="flex-1 text-left text-base">Pesanan Anda</SheetTitle>
              <div className="shrink-0">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-table-mobile">
                    <SelectValue placeholder="Pilih Meja" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables?.filter((t: any) => t.status === "available" || t.id.toString() === selectedTable).map((t: any) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        Meja {t.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>
          {renderCartItems()}
          {renderCartFooter()}
        </SheetContent>
      </Sheet>
    </>
  );
}
