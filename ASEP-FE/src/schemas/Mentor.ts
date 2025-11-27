import { z } from "zod";

export const MentorSchema = z.object({
  id: z.number().int().optional(),
  user_id: z.number().int().refine((val) => !isNaN(val), { message: "user_id phải là số hợp lệ" }),
  bio: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  experience_years: z.number().int().nonnegative().optional().nullable(),
  total_students: z.number().int().nonnegative().optional().nullable(),
  availability_status: z.enum(["AVAILABLE", "BUSY", "INACTIVE", "DISABLED"]).optional().nullable(),
  created_at: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), { message: "created_at phải là ISO datetime hợp lệ" }),
  updated_at: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), { message: "updated_at phải là ISO datetime hợp lệ" }),
});


export type Mentor = z.infer<typeof MentorSchema>;
