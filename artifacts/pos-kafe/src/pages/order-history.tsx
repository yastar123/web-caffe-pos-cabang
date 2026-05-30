import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGetOrders,
  getGetOrdersQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderHistory() {
  const { user } = useAuth();
  const branchId =
    user?.role === "owner" ? undefined : (user?.branchId ?? undefined);
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useGetOrders(
    { branchId: branchId ?? undefined },
    {
      query: {
        enabled: !!user,
        queryKey: getGetOrdersQueryKey({ branchId: branchId ?? undefined }),
      },
    },
  );

  const filtered = useMemo(() => {
    const list = orders ?? [];
    return list.filter((o: any) => {
      if (startDate && new Date(o.createdAt) < new Date(startDate))
        return false;
      if (endDate && new Date(o.createdAt) > new Date(endDate + "T23:59:59"))
        return false;
      if (!q) return true;
      const ql = q.toLowerCase();
      if ((o.orderNumber ?? "").toLowerCase().includes(ql)) return true;
      if ((o.staffName ?? "").toLowerCase().includes(ql)) return true;
      return o.items.some((i: any) =>
        (i.menuItemName ?? "").toLowerCase().includes(ql),
      );
    });
  }, [orders, q, startDate, endDate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Pemesanan</h1>
          <p className="text-sm text-muted-foreground">
            Hanya dapat dilihat oleh pemilik dan manajer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari (nomor pesanan / nama menu / staf)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: getGetOrdersQueryKey({
                  branchId: branchId ?? undefined,
                }),
              })
            }
          >
            Segarkan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs">Dari</Label>
            <Input
              type="date"
              value={startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value || undefined)}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs">Sampai</Label>
            <Input
              type="date"
              value={endDate ?? ""}
              onChange={(e) => setEndDate(e.target.value || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground">
            Tidak ada riwayat pemesanan.
          </div>
        ) : (
          filtered.map((o: any) => (
            <Card key={o.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">#{o.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(o.createdAt), "yyyy-MM-dd HH:mm")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      Rp {Number(o.total).toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {o.staffName ?? "-"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm font-semibold">Items</div>
                    <ul className="mt-2 space-y-1">
                      {o.items.map((i: any) => (
                        <li key={i.id} className="text-sm">
                          {i.quantity}× {i.menuItemName}{" "}
                          <span className="text-muted-foreground">
                            — Rp {Number(i.totalPrice).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Detail</div>
                    <div className="text-sm mt-2">Status: {o.status}</div>
                    <div className="text-sm">
                      Meja: {o.tableNumber || "Bawa Pulang"}
                    </div>
                    <div className="text-sm">Catatan: {o.notes || "-"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
