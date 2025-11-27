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
import type { MentorFeedbackPayload } from "@/lib/services/feedback";

const FeedbackFormSchema = z.object({
  mentorId: z.coerce.number().int().positive("Mentor ID phải là số dương"),
  learnerId: z.coerce.number().int().positive("Learner ID phải là số dương"),
  sessionId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  rating: z
    .union([z.coerce.number().min(0).max(5), z.literal(""), z.undefined()])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  pronunciationComment: z.string().max(2000).optional().or(z.literal("")),
  grammarComment: z.string().max(2000).optional().or(z.literal("")),
  improvementSuggestion: z.string().max(2000).optional().or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof FeedbackFormSchema>;

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MentorFeedbackPayload) => Promise<void>;
  initialData?: MentorFeedbackPayload;
  isEdit?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
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
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(FeedbackFormSchema),
    defaultValues: initialData ?? {
      mentorId: 0,
      learnerId: 0,
      sessionId: undefined,
      rating: undefined,
      pronunciationComment: "",
      grammarComment: "",
      improvementSuggestion: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        mentorId: 0,
        learnerId: 0,
        sessionId: undefined,
        rating: undefined,
        pronunciationComment: "",
        grammarComment: "",
        improvementSuggestion: "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (values: FeedbackFormData) => {
    setError("");
    setSubmitting(true);
    try {
      const payload: MentorFeedbackPayload = {
        mentorId: values.mentorId,
        learnerId: values.learnerId,
        sessionId: values.sessionId as number | undefined,
        rating: values.rating as number | undefined,
        pronunciationComment: values.pronunciationComment || undefined,
        grammarComment: values.grammarComment || undefined,
        improvementSuggestion: values.improvementSuggestion || undefined,
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
          <DialogTitle>{isEdit ? "Cập nhật phản hồi" : "Thêm phản hồi"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mentorId">Mentor ID</Label>
              <Input id="mentorId" type="number" min={1} disabled={submitting} {...register("mentorId")} />
              {errors.mentorId && <p className="text-sm text-red-500">{errors.mentorId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="learnerId">Learner ID</Label>
              <Input id="learnerId" type="number" min={1} disabled={submitting} {...register("learnerId")} />
              {errors.learnerId && <p className="text-sm text-red-500">{errors.learnerId.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID (tùy chọn)</Label>
              <Input id="sessionId" type="number" min={1} disabled={submitting} {...register("sessionId")} />
              {errors.sessionId && <p className="text-sm text-red-500">{errors.sessionId.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Đánh giá (0-5)</Label>
              <Input id="rating" type="number" step="0.5" min={0} max={5} disabled={submitting} {...register("rating")} />
              {errors.rating && <p className="text-sm text-red-500">{errors.rating.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciationComment">Nhận xét phát âm</Label>
            <Textarea id="pronunciationComment" rows={3} disabled={submitting} {...register("pronunciationComment")} />
            {errors.pronunciationComment && (
              <p className="text-sm text-red-500">{errors.pronunciationComment.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grammarComment">Nhận xét ngữ pháp</Label>
            <Textarea id="grammarComment" rows={3} disabled={submitting} {...register("grammarComment")} />
            {errors.grammarComment && <p className="text-sm text-red-500">{errors.grammarComment.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvementSuggestion">Gợi ý cải thiện</Label>
            <Textarea id="improvementSuggestion" rows={3} disabled={submitting} {...register("improvementSuggestion")} />
            {errors.improvementSuggestion && (
              <p className="text-sm text-red-500">{errors.improvementSuggestion.message as string}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Thêm phản hồi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

