import { z } from "zod";

export const AiPracticeSessionSchema = z.object({
  id: z.number().int().optional(),

  learner_id: z
    .number()
    .int()
    .refine((val) => val > 0, { message: "learner_id là bắt buộc và phải > 0" }),

  topic: z.string().min(1, "Topic không được để trống"),
  scenario: z.string().min(1, "Scenario không được để trống"),
  duration_minutes: z.number().int().positive("Duration phải > 0").default(1),

  pronunciation_score: z.number().min(0).max(10).nullable().optional(),
  grammar_score: z.number().min(0).max(10).nullable().optional(),
  vocabulary_score: z.number().min(0).max(10).nullable().optional(),

  ai_feedback: z.string().nullable().optional(),
  audio_url: z.string().url("Audio URL không hợp lệ").nullable().optional(),
  ai_version: z.string().nullable().optional(),

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

export type AiPracticeSession = z.infer<typeof AiPracticeSessionSchema>;
