import { z } from "zod";

export const SystemPolicySchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Tiêu đề chính sách không được để trống"),
  content: z.string().min(1, "Nội dung chính sách không được để trống"),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const SystemPolicyPayloadSchema = SystemPolicySchema.partial({ id: true, createdAt: true, updatedAt: true }).required({
  title: true,
  content: true,
});

export type SystemPolicy = z.infer<typeof SystemPolicySchema>;
export type SystemPolicyPayload = z.infer<typeof SystemPolicyPayloadSchema>;
