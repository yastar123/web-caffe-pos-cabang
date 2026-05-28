import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGetMenuCategories,
  useGetMenuItems,
  useGetTables,
  useCreateOrder,
  useProcessPayment,
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey,
  getGetTablesQueryKey
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
  Image as ImageIcon,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  X as XIcon,
  UtensilsCrossed,
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

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  qris: QrCode,
  ewallet: Wallet,
};

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

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  useEffect(() => {
    if (tables && !tableInitialized.current) {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam && tables.some(t => t.id.toString() === tableParam)) {
        setSelectedTable(tableParam);
      }
      tableInitialized.current = true;
    }
  }, [tables]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [menuItems, search]);

  const addToCart = (item: any) => {
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

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal - discountAmount) * 0.1;
  const grandTotal = Math.max(0, subtotal - discountAmount + tax);

  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleProcessOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
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
      if (paymentMethod) {
        await processPayment.mutateAsync({
          data: {
            orderId: order.id,
            branchId: branchId!,
            amount: grandTotal,
            method: paymentMethod as any,
          }
        });
      }
      toast({ title: "Order processed successfully" });
      setCart([]);
      setNotes("");
      setDiscountAmount(0);
      setPaymentMethod(null);
      setSelectedTable("");
      setCartOpen(false);
      setLocation("/tables");
    } catch {
      toast({ title: "Failed to process order", variant: "destructive" });
    }
  };

  const selectedTableName = tables?.find(t => t.id.toString() === selectedTable);

  const renderCartItems = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
      {cart.length === 0 ? (
        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
          <UtensilsCrossed className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium text-sm">Cart is empty</p>
          <p className="text-xs opacity-70 mt-1">Tap menu items to add them</p>
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
                <p className="text-xs text-muted-foreground mt-0.5">{formatIDR(item.price)}</p>
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
              <div className="w-20 text-right font-bold text-sm text-primary shrink-0">
                {formatIDR(item.price * item.quantity)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => removeFromCart(item.menuItemId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="pt-3">
            <Textarea
              placeholder="Add order notes (optional)..."
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
          <span className="font-medium text-foreground">{formatIDR(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Discount</span>
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
          <span>Tax (10%)</span>
          <span className="font-medium text-foreground">{formatIDR(tax)}</span>
        </div>
        <div className="flex justify-between items-center font-bold text-base pt-2 border-t">
          <span>Total</span>
          <span className="text-primary text-lg">{formatIDR(grandTotal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(["cash", "card", "qris", "ewallet"] as const).map(method => {
          const Icon = PAYMENT_ICONS[method];
          return (
            <button
              key={method}
              onClick={() => setPaymentMethod(method === paymentMethod ? null : method)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold capitalize transition-all",
                paymentMethod === method
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="w-4 h-4" />
              {method}
            </button>
          );
        })}
      </div>

      <Button
        className="w-full h-12 text-base font-bold rounded-xl shadow-sm"
        size="lg"
        disabled={cart.length === 0 || !selectedTable || createOrder.isPending || processPayment.isPending}
        onClick={handleProcessOrder}
        data-testid="btn-process-order"
      >
        {createOrder.isPending || processPayment.isPending ? "Processing..." : "Process Order"}
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex h-full w-full bg-background overflow-hidden">
        {/* LEFT: Menu panel */}
        <div className="flex-1 lg:w-[60%] lg:flex-none flex flex-col border-r h-full overflow-hidden">
          <div className="p-4 border-b space-y-3 shrink-0 bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
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
                  <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">All</TabsTrigger>
                  {categories?.map(cat => (
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
                <p className="font-medium">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map(item => {
                  const inCart = cart.find(c => c.menuItemId === item.id);
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "cursor-pointer transition-all overflow-hidden flex flex-col select-none",
                        item.isAvailable
                          ? "hover:border-primary hover:shadow-md active:scale-[0.98]"
                          : "opacity-60 cursor-not-allowed",
                        inCart ? "border-primary/50 ring-1 ring-primary/20" : ""
                      )}
                      onClick={() => item.isAvailable && addToCart(item)}
                      data-testid={`card-menu-item-${item.id}`}
                    >
                      <div className="h-28 sm:h-32 bg-muted relative flex items-center justify-center border-b overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                            <UtensilsCrossed className="h-9 w-9 text-muted-foreground/25" />
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-full">Sold Out</span>
                          </div>
                        )}
                        {inCart && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary text-primary-foreground text-xs font-bold h-5 min-w-[20px] flex items-center justify-center px-1.5 rounded-full">
                              {inCart.quantity}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 flex flex-col flex-1 justify-between">
                        <p className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-primary font-bold text-xs sm:text-sm mt-2">{formatIDR(Number(item.price))}</p>
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
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {tables?.filter(t => t.status === "available" || t.id.toString() === selectedTable).map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    Table {t.number}
                    {t.status === "occupied" ? " (occupied)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cart.length > 0 && (
              <Badge variant="secondary" className="shrink-0 font-bold">
                {totalItems} items
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
            className="w-full h-14 text-base font-bold shadow-2xl rounded-2xl"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2.5" />
            {totalItems} item{totalItems !== 1 ? "s" : ""} · {formatIDR(grandTotal)}
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
              <SheetTitle className="flex-1 text-left text-base">Your Order</SheetTitle>
              <div className="shrink-0">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-table-mobile">
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables?.filter(t => t.status === "available" || t.id.toString() === selectedTable).map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        Table {t.number}
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
