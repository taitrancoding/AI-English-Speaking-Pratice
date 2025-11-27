import { z } from "zod";

export const LearnerPackageSchema = z.object({
  id: z.number().int().optional(), 

  learner_id: z
    .number()
    .int()
    .refine((val) => !isNaN(val), {
      message: "learner_id phải là số hợp lệ",
    }),

  package_id: z
    .number()
    .int()
    .refine((val) => !isNaN(val), {
      message: "package_id phải là số hợp lệ",
    }),

  transaction_id: z.number().int().nullable().optional(),

  purchase_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "purchase_date phải là ISO datetime hợp lệ",
    })
    .optional(),

  price_at_purchase: z
    .number()
    .nonnegative({ message: "Giá phải >= 0" })
    .nullable()
    .optional(),

  expire_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "expire_date phải là ISO datetime hợp lệ",
    })
    .nullable()
    .optional(),

  payment_status: z
    .enum(["PENDING", "COMPLETED", "FAILED"], {
      message: "payment_status phải là một trong: PENDING | COMPLETED | FAILED",
    })
    .default("PENDING"),

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


export type LearnerPackage = z.infer<typeof LearnerPackageSchema>;
