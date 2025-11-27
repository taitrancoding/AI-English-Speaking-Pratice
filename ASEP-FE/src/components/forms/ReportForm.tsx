import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { ReportPayload } from "@/lib/services/report";

const ReportFormSchema = z.object({
  adminId: z.coerce.number().int().positive("Admin ID phải là số dương"),
  reportType: z.string().min(2, "Loại báo cáo tối thiểu 2 ký tự"),
  fileUrl: z.string().url("Đường dẫn file phải hợp lệ"),
  dataSummary: z.string().max(4000, "Tóm tắt tối đa 4000 ký tự").optional().or(z.literal("")),
});

type ReportFormData = z.infer<typeof ReportFormSchema>;

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ReportPayload) => Promise<void>;
  initialData?: ReportPayload;
  isEdit?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: initialData ?? {
      adminId: 1,
      reportType: "",
      fileUrl: "",
      dataSummary: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        adminId: 1,
        reportType: "",
        fileUrl: "",
        dataSummary: "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (values: ReportFormData) => {
    setError("");
    setSubmitting(true);
    try {
      const payload: ReportPayload = {
        adminId: values.adminId,
        reportType: values.reportType,
        fileUrl: values.fileUrl,
        dataSummary: values.dataSummary || undefined,
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !submitting && onOpenChange(value)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật báo cáo" : "Tạo báo cáo mới"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminId">Admin ID</Label>
            <Input id="adminId" type="number" min={1} disabled={submitting} {...register("adminId")} />
            {errors.adminId && <p className="text-sm text-red-500">{errors.adminId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Loại báo cáo</Label>
            <Input id="reportType" placeholder="VD: FINANCIAL" disabled={submitting} {...register("reportType")} />
            {errors.reportType && <p className="text-sm text-red-500">{errors.reportType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">Đường dẫn file</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://..."
              disabled={submitting}
              {...register("fileUrl")}
            />
            {errors.fileUrl && <p className="text-sm text-red-500">{errors.fileUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataSummary">Tóm tắt dữ liệu</Label>
            <Textarea
              id="dataSummary"
              placeholder="Nhập mô tả hoặc ghi chú"
              rows={4}
              disabled={submitting}
              {...register("dataSummary")}
            />
            {errors.dataSummary && <p className="text-sm text-red-500">{errors.dataSummary.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Cập nhật" : "Tạo báo cáo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

