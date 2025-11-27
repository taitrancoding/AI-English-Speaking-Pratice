import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface Transaction {
  id: number;
  learnerId: number;
  learnerName: string;
  packageId: number;
  packageName: string;
  priceAtPurchase: number;
  purchaseDate: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  expireDate?: string;
}

export default function Transactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [moderateOpen, setModerateOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/learner-packages/admin", {
        params: { page: 0, size: 100 }
      });
      const data = response.data?.content || [];
      
      // Map to Transaction format (data already includes learnerName and packageName from backend)
      const mapped = data.map((item: any) => ({
        id: item.id,
        learnerId: item.learnerId,
        learnerName: item.learnerName || `Learner #${item.learnerId}`,
        packageId: item.packageId,
        packageName: item.packageName || `Package #${item.packageId}`,
        priceAtPurchase: item.priceAtPurchase ? parseFloat(item.priceAtPurchase) : 0,
        purchaseDate: item.purchaseDate,
        paymentStatus: item.paymentStatus || "PENDING",
        expireDate: item.expireDate,
      }));
      
      setTransactions(mapped);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch transactions";
      setError(msg);
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleModerate = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModerateOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;
    
    try {
      await apiClient.put(`/learner-packages/${selectedTransaction.id}/approve`);
      toast({
        title: "Đã phê duyệt",
        description: `Giao dịch #${selectedTransaction.id} đã được phê duyệt.`,
      });
      await fetchTransactions();
      setModerateOpen(false);
      setSelectedTransaction(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể phê duyệt giao dịch",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    
    try {
      await apiClient.put(`/learner-packages/${selectedTransaction.id}/reject`);
      toast({
        title: "Đã từ chối",
        description: `Giao dịch #${selectedTransaction.id} đã bị từ chối.`,
      });
      await fetchTransactions();
      setModerateOpen(false);
      setSelectedTransaction(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể từ chối giao dịch",
      });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500 text-white">Hoàn thành</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Đang chờ</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500 text-white">Thất bại</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = transactions
    .filter(t => t.paymentStatus === "COMPLETED")
    .reduce((sum, t) => sum + (t.priceAtPurchase || 0), 0);

  const pendingCount = transactions.filter(t => t.paymentStatus === "PENDING").length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Giao dịch</h1>
          <p className="text-muted-foreground">
            Quản lý và phê duyệt các giao dịch mua gói học của học viên
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên học viên hoặc gói..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Đang chờ</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="FAILED">Thất bại</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Gói học</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Ngày mua</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không có giao dịch nào
                </TableCell>
              </TableRow>
            )}
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">#{transaction.id}</TableCell>
                <TableCell>{transaction.learnerName}</TableCell>
                <TableCell>{transaction.packageName}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(transaction.priceAtPurchase)}
                </TableCell>
                <TableCell>
                  {transaction.purchaseDate
                    ? new Date(transaction.purchaseDate).toLocaleDateString("vi-VN")
                    : "—"}
                </TableCell>
                <TableCell>{statusBadge(transaction.paymentStatus)}</TableCell>
                <TableCell className="text-right">
                  {transaction.paymentStatus === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate(transaction)}
                    >
                      Phê duyệt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Moderate Dialog */}
      <AlertDialog open={moderateOpen} onOpenChange={setModerateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phê duyệt giao dịch</AlertDialogTitle>
            <AlertDialogDescription>
              Giao dịch #{selectedTransaction?.id} - {selectedTransaction?.learnerName} mua gói{" "}
              {selectedTransaction?.packageName}
              <br />
              Giá:{" "}
              {selectedTransaction &&
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedTransaction.priceAtPurchase)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button variant="destructive" onClick={handleReject}>
              Từ chối
            </Button>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600">
              Phê duyệt
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

