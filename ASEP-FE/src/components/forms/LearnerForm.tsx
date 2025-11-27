import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const LearnerSchema = z.object({
  name: z.string().min(8, "Tên phải có ít nhất 8 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .regex(/^(|(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,})$/, "Mật khẩu phải >=8 ký tự, chứa chữ hoa & ký tự đặc biệt")
    .optional()
    .or(z.literal("")),
  englishLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goals: z.string().optional(),
  preferences: z.string().optional(),
});

type LearnerFormData = z.infer<typeof LearnerSchema>;

interface LearnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LearnerFormData) => Promise<void>;
  initialData?: LearnerFormData & { id?: number };
  isEdit?: boolean;
}

export const LearnerForm: React.FC<LearnerFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LearnerFormData>({
    resolver: zodResolver(LearnerSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      englishLevel: "beginner",
      goals: "",
      preferences: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const englishLevel = watch("englishLevel");

  const handleFormSubmit = async (data: LearnerFormData) => {
    setError("");
    setLoading(true);

    try {
      if (isEdit && !data.password) {
        const { password, ...dataWithoutPassword } = data;
        await onSubmit(dataWithoutPassword as LearnerFormData);
      } else {
        await onSubmit(data);
      }
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      const axiosError = err as Record<string, unknown>;
      const apiMessage = (axiosError?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      setError((apiMessage?.message as string) || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật Learner" : "Thêm Learner Mới"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và Tên</Label>
            <Input
              id="name"
              placeholder="Nhập họ và tên"
              {...register("name")}
              disabled={loading}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu {!isEdit && "*"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEdit ? "Để trống nếu không đổi" : "Nhập mật khẩu (tối thiểu 8 ký tự)"}
              {...register("password")}
              disabled={loading}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="englishLevel">Trình độ Tiếng Anh</Label>
            <Select
              value={englishLevel}
              onValueChange={(value) => setValue("englishLevel", value as "beginner" | "intermediate" | "advanced")}
            >
              <SelectTrigger id="englishLevel" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                <SelectItem value="intermediate">Trung cấp</SelectItem>
                <SelectItem value="advanced">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Mục tiêu</Label>
            <Textarea
              id="goals"
              placeholder="Nhập mục tiêu học tập"
              {...register("goals")}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Sở thích</Label>
            <Textarea
              id="preferences"
              placeholder="Nhập sở thích học tập"
              {...register("preferences")}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
