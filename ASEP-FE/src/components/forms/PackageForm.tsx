import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { PackagePayload } from "@/lib/services/package";
import { Checkbox } from "@/components/ui/checkbox";
import { useMentor } from "@/contexts/MentorContext";

const PackageFormSchema = z.object({
  name: z.string().min(2, "Tên gói tối thiểu 2 ký tự"),
  description: z
    .string()
    .max(1000, "Mô tả tối đa 1000 ký tự")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().nonnegative("Giá phải là số không âm"),
  durationDays: z.coerce.number().int().positive("Số ngày phải > 0"),
  hasMentor: z.boolean(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  mentorIds: z.array(z.number().int().positive()).optional().default([]),
});

type PackageFormData = z.infer<typeof PackageFormSchema>;

interface PackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PackagePayload) => Promise<void>;
  initialData?: PackagePayload;
  isEdit?: boolean;
}

export const PackageForm: React.FC<PackageFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { mentors, loading: mentorLoading, error: mentorError, fetchMentors } = useMentor();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(PackageFormSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      price: 0,
      durationDays: 30,
      hasMentor: false,
      status: "ACTIVE",
      mentorIds: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        durationDays: 30,
        hasMentor: false,
        status: "ACTIVE",
        mentorIds: [],
      });
    }
  }, [initialData, reset]);

  const hasMentor = watch("hasMentor");
  const status = watch("status");
  const mentorIds = watch("mentorIds");

  useEffect(() => {
    if (open) {
      fetchMentors().catch(() => undefined);
    }
  }, [open, fetchMentors]);

  useEffect(() => {
    if (!hasMentor) {
      setValue("mentorIds", []);
    }
  }, [hasMentor, setValue]);

  const toggleMentorSelection = (mentorId: number) => {
    const current = mentorIds || [];
    if (current.includes(mentorId)) {
      setValue(
        "mentorIds",
        current.filter((id) => id !== mentorId)
      );
    } else {
      setValue("mentorIds", [...current, mentorId]);
    }
  };

  const handleFormSubmit = async (values: PackageFormData) => {
    setError("");
    setSubmitting(true);
    try {
      const payload: PackagePayload = {
        ...values,
        description: values.description || undefined,
      };
      await onSubmit(payload);
      onOpenChange(false);
      reset(initialData ?? {
        name: "",
        description: "",
        price: 0,
        durationDays: 30,
        hasMentor: false,
        status: "ACTIVE",
      });
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
          <DialogTitle>{isEdit ? "Cập nhật gói học" : "Tạo gói học mới"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên gói</Label>
            <Input id="name" placeholder="Nhập tên gói" disabled={submitting} {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết gói"
              rows={3}
              disabled={submitting}
              {...register("description")}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VND)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="1000"
                placeholder="Nhập giá"
                disabled={submitting}
                {...register("price")}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">Thời lượng (ngày)</Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                placeholder="Số ngày"
                disabled={submitting}
                {...register("durationDays")}
              />
              {errors.durationDays && <p className="text-sm text-red-500">{errors.durationDays.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Hỗ trợ Mentor</Label>
              <p className="text-sm text-muted-foreground">Bao gồm mentor đồng hành trong gói</p>
            </div>
            <Switch
              checked={hasMentor}
              onCheckedChange={(value) => setValue("hasMentor", value)}
              disabled={submitting}
            />
          </div>

          {hasMentor && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn mentor đồng hành</Label>
                {mentorLoading && <span className="text-xs text-muted-foreground">Đang tải...</span>}
              </div>
              {mentorError && <p className="text-sm text-red-500">{mentorError}</p>}
              <div className="max-h-56 overflow-y-auto rounded-lg border p-3 space-y-2">
                {mentors.length === 0 && !mentorLoading && (
                  <p className="text-sm text-muted-foreground">Chưa có mentor nào khả dụng.</p>
                )}
                {mentors.map((mentor) => (
                  <label
                    key={mentor.id}
                    className="flex items-center justify-between rounded-md border border-muted/60 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{mentor.name || `Mentor #${mentor.id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {mentor.email || "Chưa có email"} • {mentor.specialization || mentor.skills || "Chưa cập nhật"}
                      </p>
                    </div>
                    <Checkbox
                      checked={mentorIds?.includes(mentor.id)}
                      onCheckedChange={() => toggleMentorSelection(mentor.id)}
                      disabled={submitting}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Đang mở bán</SelectItem>
                <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Cập nhật" : "Tạo gói"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

