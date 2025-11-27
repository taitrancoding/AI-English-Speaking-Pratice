import { z } from "zod";
import { LearnerProfileSchema } from "./LearnerProfile"; 

export const ProgressReportSchema = z.object({
  id: z.number().int().optional(),

  learner: LearnerProfileSchema,

  weekStart: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "weekStart phải là định dạng ngày hợp lệ (ISO)",
    }),

  weekEnd: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "weekEnd phải là định dạng ngày hợp lệ (ISO)",
    }),

  totalSessions: z
    .number()
    .int()
    .nonnegative({ message: "totalSessions phải >= 0" }),

  avgPronunciation: z
    .number()
    .min(0, { message: "Phải >= 0" })
    .max(10, { message: "Phải <= 10" })
    .nullable()
    .optional(),

  avgGrammar: z
    .number()
    .min(0, { message: "Phải >= 0" })
    .max(10, { message: "Phải <= 10" })
    .nullable()
    .optional(),

  avgVocabulary: z
    .number()
    .min(0, { message: "Phải >= 0" })
    .max(10, { message: "Phải <= 10" })
    .nullable()
    .optional(),

  generatedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "generatedAt phải là datetime hợp lệ (ISO)",
    }),

  improvementNotes: z.string().nullable().optional(),
});

export type ProgressReport = z.infer<typeof ProgressReportSchema>;
