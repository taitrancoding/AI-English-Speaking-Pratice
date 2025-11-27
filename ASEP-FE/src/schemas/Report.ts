import { z } from "zod";

export const ReportSchema = z.object({
  id: z.number().optional(), 

  adminId: z
    .number()
    .int()
    .positive()
    .describe("adminId là bắt buộc và phải > 0"),

  fileUrl: z
    .string()
    .url("fileUrl phải là đường dẫn hợp lệ")
    .min(1, "fileUrl không được để trống"),

  reportType: z
    .string()
    .min(1, "reportType không được để trống"),

  generatedAt: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "generatedAt phải là chuỗi ngày giờ hợp lệ (ISO)" }
    ),

  dataSummary: z.string().optional(), 
});


export type Report = z.infer<typeof ReportSchema>;
