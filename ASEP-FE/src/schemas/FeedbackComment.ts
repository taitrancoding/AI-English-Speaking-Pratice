import { z } from "zod";

export const FeedbackCommentSchema = z.object({
  id: z.number().int().optional(), 

  user_id: z
    .number()
    .int()
    .refine((val) => val > 0, { message: "user_id là bắt buộc và phải > 0" }),

  content: z.string().min(1, "Nội dung không được để trống"),

  target_type: z.enum(["app", "mentor", "package", "session"], {
    message: "target_type phải là 1 trong: app | mentor | package | session",
  }),

  target_id: z
    .number()
    .int()
    .refine((val) => val > 0, { message: "target_id là bắt buộc và phải > 0" }),

  rating: z
    .number()
    .min(1, "Rating tối thiểu là 1")
    .max(5, "Rating tối đa là 5")
    .optional(),

  created_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "created_at phải là ISO datetime string hợp lệ",
    })
    .optional(),

  updated_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "updated_at phải là ISO datetime string hợp lệ",
    })
    .optional(),
});

export type FeedbackComment = z.infer<typeof FeedbackCommentSchema>;
