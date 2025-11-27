import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { FeedbackCommentPayload } from "@/lib/services/feedbackComment";

const FeedbackCommentSchema = z.object({
  userName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  content: z.string().min(5, "Nội dung phải từ 5 ký tự"),
  targetType: z.string().min(2, "Chọn đối tượng phản hồi"),
  targetId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((val) => (val === "" ? undefined : val as number)),
  rating: z
    .union([z.coerce.number().int().min(1).max(5), z.literal(""), z.undefined()])
    .optional()
    .transform((val) => (val === "" ? undefined : val as number)),
});

type FeedbackCommentFormValues = z.infer<typeof FeedbackCommentSchema>;

interface FeedbackCommentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FeedbackCommentPayload) => Promise<void>;
  initialData?: FeedbackCommentPayload;
  isEdit?: boolean;
}

export function FeedbackCommentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}: FeedbackCommentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackCommentFormValues>({
    resolver: zodResolver(FeedbackCommentSchema),
    defaultValues: initialData ?? {
      userName: "",
      content: "",
      targetType: "SYSTEM",
      targetId: undefined,
      rating: 5,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        userName: "",
        content: "",
        targetType: "SYSTEM",
        targetId: undefined,
        rating: 5,
      });
    }
  }, [initialData, reset]);

  const submitHandler = async (values: FeedbackCommentFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        userName: values.userName,
        content: values.content,
        targetType: values.targetType,
        targetId: values.targetId,
        rating: values.rating,
      });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể gửi phản hồi";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !loading && onOpenChange(value)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật phản hồi" : "Gửi phản hồi chung"}</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Tên hiển thị</Label>
            <Input id="userName" placeholder="Tên của bạn" disabled={loading} {...register("userName")} />
            {errors.userName && <p className="text-sm text-red-500">{errors.userName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetType">Đối tượng</Label>
            <Input id="targetType" placeholder="VD: SYSTEM, PACKAGE, MENTOR" disabled={loading} {...register("targetType")} />
            {errors.targetType && <p className="text-sm text-red-500">{errors.targetType.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetId">ID đối tượng (tuỳ chọn)</Label>
            <Input id="targetId" type="number" min="1" disabled={loading} {...register("targetId")} />
            {errors.targetId && <p className="text-sm text-red-500">{errors.targetId.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Đánh giá (1-5)</Label>
            <Input id="rating" type="number" min="1" max="5" disabled={loading} {...register("rating")} />
            {errors.rating && <p className="text-sm text-red-500">{errors.rating.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea id="content" rows={4} placeholder="Chia sẻ cảm nhận của bạn" disabled={loading} {...register("content")} />
            {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Gửi phản hồi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

