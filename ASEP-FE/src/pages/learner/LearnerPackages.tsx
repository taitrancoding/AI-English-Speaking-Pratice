import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePackages } from "@/contexts/PackageContext";
import { AlertCircle, RefreshCcw, Loader2 } from "lucide-react";
import { purchaseLearnerPackage, listMyLearnerPackages, type LearnerPackage } from "@/lib/services/learnerPackage";
import { useToast } from "@/components/ui/use-toast";

const LearnerPackages: React.FC = () => {
  const { toast } = useToast();
  const { packages, loading, error, fetchPackages } = usePackages();
  const [ownedPackages, setOwnedPackages] = useState<LearnerPackage[]>([]);
  const [ownedLoading, setOwnedLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const fetchOwnedPackages = useCallback(async () => {
    setOwnedLoading(true);
    try {
      const response = await listMyLearnerPackages();
      setOwnedPackages(response.content ?? []);
    } catch (err) {
      console.error("Failed to load learner packages", err);
      toast({
        variant: "destructive",
        title: "Không thể tải gói đã đăng ký",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setOwnedLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPackages();
    fetchOwnedPackages();
  }, [fetchPackages, fetchOwnedPackages]);

  const ownedMap = useMemo(() => {
    const map = new Map<number, LearnerPackage>();
    ownedPackages.forEach((pkg) => map.set(pkg.packageId, pkg));
    return map;
  }, [ownedPackages]);

  const handlePurchase = async (packageId: number) => {
    setPurchasingId(packageId);
    try {
      const result = await purchaseLearnerPackage({ packageId });
      toast({
        title: "Đăng ký thành công",
        description: `Bạn đã đăng ký gói #${result.packageId}.`,
      });
      await fetchOwnedPackages();
    } catch (err) {
      console.error("Failed to purchase package", err);
      toast({
        variant: "destructive",
        title: "Không thể đăng ký gói",
        description: "Vui lòng kiểm tra trạng thái thanh toán hoặc thử lại.",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Gói học tiếng Anh</h1>
          <p className="text-muted-foreground mt-2">Chọn gói phù hợp với mục tiêu luyện tập của bạn</p>
        </div>
        <Button variant="outline" onClick={() => fetchPackages()} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-600">
          Đang tải gói học...
        </div>
      )}

      {!loading && packages.length === 0 && !error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-600">
          Chưa có gói học nào được mở bán.
        </div>
      )}

      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription className="mt-1 max-w-2xl">
                  {pkg.description || "Gói học chưa có mô tả."}
                </CardDescription>
                  </div>
              <div className="text-right">
                <p className="text-3xl font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(pkg.price)}
                </p>
                <Badge variant={pkg.status === "ACTIVE" ? "default" : "secondary"} className="mt-2">
                  {pkg.status === "ACTIVE" ? "Đang mở" : "Tạm khóa"}
                </Badge>
                  </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Thời lượng</p>
                  <p className="font-semibold">{pkg.durationDays} ngày</p>
                </div>
                  <div>
                  <p className="text-muted-foreground">Mentor đồng hành</p>
                  {pkg.mentors && pkg.mentors.length > 0 ? (
                    <div className="space-y-1">
                      {pkg.mentors.map((mentor) => (
                        <div key={mentor.id}>
                          <p className="font-semibold">{mentor.name || `Mentor #${mentor.id}`}</p>
                          <p className="text-xs text-muted-foreground">{mentor.email || "Chưa có email"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <p className="font-semibold">{pkg.hasMentor ? "Có" : "Không"}</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Trạng thái</p>
                  <p className="font-semibold">{pkg.status === "ACTIVE" ? "Có thể đăng ký" : "Ngừng bán"}</p>
                </div>
              </div>
              <Button
                className="w-full"
                variant={ownedMap.has(pkg.id) ? "outline" : "default"}
                disabled={pkg.status !== "ACTIVE" || ownedMap.has(pkg.id) || purchasingId === pkg.id}
                onClick={() => handlePurchase(pkg.id)}
              >
                {ownedMap.has(pkg.id)
                  ? "Đã đăng ký"
                  : purchasingId === pkg.id
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng ký...
                      </>
                    )
                  : "Đăng ký gói"}
              </Button>
              </CardContent>
            </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Các gói bạn đã đăng ký</CardTitle>
          <CardDescription>Quản lý và nâng cấp/hạ cấp gói của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ownedLoading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
          {!ownedLoading && ownedPackages.length === 0 && (
            <p className="text-sm text-muted-foreground">Bạn chưa đăng ký gói nào.</p>
          )}
          {ownedPackages.map((pkg) => (
            <div key={pkg.id} className="rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{pkg.packageName || `Gói #${pkg.packageId}`}</p>
                <Badge variant="secondary">{pkg.paymentStatus || "PENDING"}</Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                Ngày mua: {pkg.purchaseDate ? new Date(pkg.purchaseDate).toLocaleDateString("vi-VN") : "Không rõ"}
                {pkg.expireDate && (
                  <> • Hết hạn: {new Date(pkg.expireDate).toLocaleDateString("vi-VN")}</>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Nâng cấp gói",
                      description: "Tính năng đang được phát triển. Vui lòng liên hệ admin để nâng cấp.",
                    });
                  }}
                >
                  Nâng cấp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Hạ cấp gói",
                      description: "Tính năng đang được phát triển. Vui lòng liên hệ admin để hạ cấp.",
                    });
                  }}
                >
                  Hạ cấp
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnerPackages;
