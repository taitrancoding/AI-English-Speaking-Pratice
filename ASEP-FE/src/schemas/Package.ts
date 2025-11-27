import { z } from "zod";

export const PackageSchema = z.object({
  id: z.number().int().optional(),

  name: z.string().min(1, { message: "Tên gói không được để trống" }),

  description: z.string().nullable().optional(),

  price: z
    .number()
    .nonnegative({ message: "Giá phải >= 0" }),

  duration_days: z
    .number()
    .int({ message: "duration_days phải là số nguyên" })
    .positive({ message: "Số ngày hiệu lực phải > 0" }),

  has_mentor: z.boolean({ message: "has_mentor phải là true hoặc false" }),

  status: z
    .enum(["ACTIVE", "INACTIVE", "ARCHIVED"], {
      message: "status phải là: ACTIVE | INACTIVE | ARCHIVED",
    })
    .default("ACTIVE"),

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

export type Package = z.infer<typeof PackageSchema>;
