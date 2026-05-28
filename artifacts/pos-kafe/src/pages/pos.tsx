import { useState, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, Trash2, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function POS() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qris" | "ewallet" | null>(null);

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
    setCart(prev => prev.map(item => {
      if (item.menuItemId === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.menuItemId !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal - discountAmount) * 0.1;
  const grandTotal = Math.max(0, subtotal - discountAmount + tax);

  const formatIDR = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

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
      setLocation("/tables");
    } catch (err) {
      toast({ title: "Failed to process order", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <div className="w-[60%] flex flex-col border-r h-full overflow-hidden">
        <div className="p-4 border-b space-y-4 shrink-0 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-menu"
            />
          </div>
          
          {loadingCategories ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
                {categories?.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id.toString()} className="rounded-md">
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-accent/20">
          {loadingItems ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:border-primary transition-all overflow-hidden flex flex-col"
                  onClick={() => item.isAvailable && addToCart(item)}
                  data-testid={`card-menu-item-${item.id}`}
                >
                  <div className="h-32 bg-muted relative flex items-center justify-center border-b">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-semibold text-destructive">
                        Sold Out
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex flex-col flex-1 justify-between">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <p className="text-primary font-bold mt-2">{formatIDR(Number(item.price))}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[40%] flex flex-col h-full bg-card shrink-0">
        <div className="p-4 border-b shrink-0 flex items-center gap-4">
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-[180px]" data-testid="select-table">
              <SelectValue placeholder="Select Table" />
            </SelectTrigger>
            <SelectContent>
              {tables?.filter(t => t.status === "available").map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>Table {t.number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm font-medium text-muted-foreground">
            New Order
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center">
              <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Tap items to add to your order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.menuItemId} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.menuItemId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.menuItemId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="w-20 text-right font-semibold text-sm">
                    {formatIDR(item.price * item.quantity)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromCart(item.menuItemId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Textarea 
              placeholder="Add order notes (optional)..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none text-sm bg-muted/50"
            />
          </div>
        </div>

        <div className="p-4 border-t bg-card shrink-0 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <div className="w-24">
                <Input 
                  type="number" 
                  value={discountAmount || ''} 
                  onChange={(e) => setDiscountAmount(Number(e.target.value))} 
                  className="h-7 text-right"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium">{formatIDR(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span className="text-primary">{formatIDR(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['cash', 'card', 'qris', 'ewallet'] as const).map(method => (
              <Button 
                key={method}
                variant={paymentMethod === method ? "default" : "outline"}
                className={`text-xs capitalize ${paymentMethod === method ? '' : 'bg-muted/30'}`}
                onClick={() => setPaymentMethod(method === paymentMethod ? null : method)}
              >
                {method}
              </Button>
            ))}
          </div>

          <Button 
            className="w-full h-12 text-lg font-bold" 
            size="lg"
            disabled={cart.length === 0 || !selectedTable || createOrder.isPending || processPayment.isPending}
            onClick={handleProcessOrder}
            data-testid="btn-process-order"
          >
            {createOrder.isPending ? "Processing..." : "Process Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
