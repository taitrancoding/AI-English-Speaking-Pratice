import { useEffect, useMemo, useState } from "react";
import { usePackages } from "@/contexts/PackageContext";
import { PackageForm } from "@/components/forms/PackageForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Clock, ShieldCheck, Users } from "lucide-react";
import type { Package as PackageType, PackagePayload } from "@/lib/services/package";

export default function Packages() {
  const { packages, loading, error, fetchPackages, deletePackage, addPackage, updatePackage } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleCreatePackage = async (payload: PackagePayload) => {
    await addPackage(payload);
  };

  const handleUpdatePackage = async (payload: PackagePayload) => {
    if (!selectedPackage) return;
    await updatePackage(selectedPackage.id, payload);
    setSelectedPackage(null);
    setIsEdit(false);
  };

  const handleEditClick = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsEdit(true);
    setFormOpen(true);
  };

  const handleDeleteClick = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    await deletePackage(selectedPackage.id);
    setDeleteOpen(false);
    setSelectedPackage(null);
  };

  const statusStyles = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <strong>Lỗi:</strong> {error}
        </div>
      )}
      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải dữ liệu gói học...
        </div>
      )}
      {!loading && packages.length === 0 && !error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có gói học nào. Hãy tạo gói đầu tiên!
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý gói học</h1>
          <p className="text-muted-foreground">
            {packages.length > 0
              ? `Hiện có ${packages.length} gói đang được cấu hình`
              : "Thêm gói mới để người học có thể đăng ký"}
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEdit(false);
            setSelectedPackage(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo gói mới
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>Mã gói #{pkg.id}</CardDescription>
                </div>
                <Badge className={statusStyles(pkg.status)}>{pkg.status === "ACTIVE" ? "Đang mở" : "Tạm dừng"}</Badge>
              </div>
              <div className="mt-3 text-3xl font-bold">
                {priceFormatter.format(pkg.price)}
                <span className="text-base font-medium text-muted-foreground"> / gói</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
              <p className="text-sm text-muted-foreground">{pkg.description || "Chưa có mô tả chi tiết."}</p>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Thời lượng: <strong>{pkg.durationDays}</strong> ngày
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Hỗ trợ mentor: {pkg.hasMentor ? "Có" : "Không"}</span>
              </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Trạng thái: {pkg.status === "ACTIVE" ? "Đang mở bán" : "Ngừng bán"}</span>
                  </div>
                {pkg.mentors && pkg.mentors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Mentor đồng hành</p>
                    <div className="mt-1 space-y-1">
                      {pkg.mentors.map((mentor) => (
                        <div key={mentor.id} className="text-sm">
                          <span className="font-medium">{mentor.name || `Mentor #${mentor.id}`}</span>
                          {mentor.email && <span className="text-muted-foreground"> • {mentor.email}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEditClick(pkg)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Cập nhật
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(pkg)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PackageForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open && isEdit) {
              setSelectedPackage(null);
              setIsEdit(false);
            }
          }}
          isEdit={isEdit}
          initialData={
            isEdit && selectedPackage
              ? {
                  name: selectedPackage.name,
                  description: selectedPackage.description ?? "",
                  price: selectedPackage.price,
                  durationDays: selectedPackage.durationDays,
                  hasMentor: selectedPackage.hasMentor,
                  status: selectedPackage.status,
                  mentorIds: selectedPackage.mentors?.map((m) => m.id) ?? [],
                }
              : undefined
          }
          onSubmit={isEdit ? handleUpdatePackage : handleCreatePackage}
        />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xóa gói <strong>{selectedPackage?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
