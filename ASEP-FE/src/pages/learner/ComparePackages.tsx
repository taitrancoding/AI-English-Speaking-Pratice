import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { usePackages } from "@/contexts/PackageContext";
import { useToast } from "@/components/ui/use-toast";
import { purchaseLearnerPackage } from "@/lib/services/learnerPackage";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";

export default function ComparePackages() {
  const { packages, loading, fetchPackages } = usePackages();
  const { toast } = useToast();
  const { learner } = useCurrentLearnerProfile();
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const togglePackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const selectedPkgs = packages.filter((p) => selectedPackages.includes(p.id));

  const handlePurchase = async (packageId: number) => {
    setPurchasing(packageId);
    try {
      await purchaseLearnerPackage({ packageId });
      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã đăng ký gói học thành công.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể đăng ký gói",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const priceFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">So sánh gói học</h1>
        <p className="text-muted-foreground">
          Chọn các gói để so sánh và tìm gói phù hợp nhất với bạn
        </p>
      </div>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn gói để so sánh</CardTitle>
          <CardDescription>Chọn tối đa 3 gói để so sánh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackages.includes(pkg.id)
                    ? "ring-2 ring-primary"
                    : "hover:border-primary"
                }`}
                onClick={() => {
                  if (selectedPackages.length < 3 || selectedPackages.includes(pkg.id)) {
                    togglePackage(pkg.id);
                  } else {
                    toast({
                      title: "Giới hạn",
                      description: "Chỉ có thể so sánh tối đa 3 gói",
                    });
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {selectedPackages.includes(pkg.id) && (
                      <Badge>Đã chọn</Badge>
                    )}
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {priceFormatter.format(pkg.price)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedPkgs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bảng so sánh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Tính năng</th>
                    {selectedPkgs.map((pkg) => (
                      <th key={pkg.id} className="text-center p-4">
                        {pkg.name}
                        <div className="text-sm font-normal text-muted-foreground mt-1">
                          {priceFormatter.format(pkg.price)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Giá</td>
                    {selectedPkgs.map((pkg) => (
                      <td key={pkg.id} className="text-center p-4">
                        {priceFormatter.format(pkg.price)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Thời lượng</td>
                    {selectedPkgs.map((pkg) => (
                      <td key={pkg.id} className="text-center p-4">
                        {pkg.durationDays} ngày
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Mentor đồng hành</td>
                    {selectedPkgs.map((pkg) => (
                      <td key={pkg.id} className="text-center p-4">
                        {pkg.hasMentor ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Trạng thái</td>
                    {selectedPkgs.map((pkg) => (
                      <td key={pkg.id} className="text-center p-4">
                        <Badge
                          variant={pkg.status === "ACTIVE" ? "default" : "secondary"}
                        >
                          {pkg.status === "ACTIVE" ? "Đang mở" : "Tạm khóa"}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Hành động</td>
                    {selectedPkgs.map((pkg) => (
                      <td key={pkg.id} className="text-center p-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(pkg.id);
                          }}
                          disabled={pkg.status !== "ACTIVE" || purchasing === pkg.id}
                        >
                          {purchasing === pkg.id ? "Đang xử lý..." : "Đăng ký ngay"}
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


