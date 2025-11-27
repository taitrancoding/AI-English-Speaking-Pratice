import { z } from "zod";

export const MentorFeedbackSchema = z.object({
  id: z.number().int().optional(), 

  mentor_id: z
    .number()
    .int()
    .refine((val) => !isNaN(val), {
      message: "mentor_id phải là số hợp lệ",
    }),

  learner_id: z
    .number()
    .int()
    .refine((val) => !isNaN(val), {
      message: "learner_id phải là số hợp lệ",
    }),

  session_id: z
    .number()
    .int()
    .nullable()
    .optional()
    .refine((val) => val == null || !isNaN(val), {
      message: "session_id phải là số hợp lệ hoặc null",
    }),

  pronunciation_comment: z.string().nullable().optional(),
  grammar_comment: z.string().nullable().optional(),

  rating: z
    .number()
    .min(0, { message: "rating phải >= 0" })
    .max(5, { message: "rating tối đa là 5" })
    .nullable()
    .optional(),

  improvement_suggestion: z.string().nullable().optional(),

  created_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "created_at phải là ISO datetime hợp lệ",
    })
    .optional(),

  updated_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "updated_at phải là ISO datetime hợp lệ",
    })
    .optional(),
});

export type MentorFeedback = z.infer<typeof MentorFeedbackSchema>;
