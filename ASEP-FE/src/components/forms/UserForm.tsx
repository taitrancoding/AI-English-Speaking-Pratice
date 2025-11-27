import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const passwordPolicyMessage = "Mật khẩu phải >= 8 ký tự, chứa 1 chữ hoa và 1 ký tự đặc biệt";

const UserSchema = z.object({
  name: z.string().min(8, "Tên phải có ít nhất 8 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .regex(/^(|(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,})$/, passwordPolicyMessage)
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MENTOR", "LEARNER"]),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

type UserFormData = z.infer<typeof UserSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData & { id?: number };
  isEdit?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
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
  } = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      role: "LEARNER",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const selectedRole = watch("role");
  const selectedStatus = watch("status");

  const handleFormSubmit = async (data: UserFormData) => {
    setError("");
    setLoading(true);

    try {
      // Nếu edit mode và password rỗng, không gửi password
      if (isEdit && !data.password) {
        const { password, ...dataWithoutPassword } = data;
        await onSubmit(dataWithoutPassword as UserFormData);
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
          <DialogTitle>{isEdit ? "Cập nhật User" : "Thêm User Mới"}</DialogTitle>
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
              Mật khẩu {!isEdit && <span className="text-red-500">*</span>}
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
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as "ADMIN" | "MENTOR" | "LEARNER")}
            >
              <SelectTrigger id="role" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MENTOR">Mentor</SelectItem>
                <SelectItem value="LEARNER">Learner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={selectedStatus} onValueChange={(value) => setValue("status", value as "ACTIVE" | "DISABLED")}>
              <SelectTrigger id="status" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="DISABLED">Vô hiệu</SelectItem>
              </SelectContent>
            </Select>
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
