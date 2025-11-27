import { z } from "zod";

export const LearnerProfileSchema = z.object({
  id: z.number().int().optional(), 

  user_id: z
    .number()
    .int()
    .refine((val) => !isNaN(val), { message: "user_id phải là số hợp lệ" }),

  english_level: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
      message:
        "english_level phải là một trong: BEGINNER | INTERMEDIATE | ADVANCED",
    })
    .default("BEGINNER"),

  goals: z.string().nullable().optional(), 
  preferences: z.string().nullable().optional(),

  ai_score: z.number().min(0, { message: "ai_score phải >= 0" }).nullable().optional(),
  pronunciation_score: z
    .number()
    .min(0, { message: "pronunciation_score phải >= 0" })
    .nullable()
    .optional(),

  total_practice_minutes: z
    .number()
    .int()
    .nonnegative({ message: "total_practice_minutes phải >= 0" })
    .default(0)
    .optional(),

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

export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;
