import api from "../api";
import { z } from "zod";

const ReportPayloadSchema = z.object({
  adminId: z.number().int().positive(),
  fileUrl: z.string().url("fileUrl phải là đường dẫn hợp lệ"),
  reportType: z.string().min(1, "reportType không được để trống"),
  dataSummary: z.string().max(4000).optional(),
});

export type ReportPayload = z.infer<typeof ReportPayloadSchema>;

export const ReportSchema = ReportPayloadSchema.extend({
  id: z.number(),
  generatedAt: z.string().nullable().optional(),
});

export type Report = z.infer<typeof ReportSchema>;

const PaginationResponseSchema = z.object({
  content: z.array(ReportSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

export async function listReports(page = 0, size = 20): Promise<PaginationResponse> {
  try {
    const response = await api.get<unknown>(`/reports`, {
      params: { page, size },
    });
    return PaginationResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

export async function getReport(id: number): Promise<Report> {
  try {
    const response = await api.get<unknown>(`/reports/${id}`);
    return ReportSchema.parse(response.data);
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
}

export async function createReport(payload: ReportPayload): Promise<Report> {
  try {
    const validated = ReportPayloadSchema.parse(payload);
    const response = await api.post<unknown>(`/reports`, validated);
    return ReportSchema.parse(response.data);
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}

export async function updateReport(id: number, payload: ReportPayload): Promise<Report> {
  try {
    const validated = ReportPayloadSchema.parse(payload);
    const response = await api.put<unknown>(`/reports/${id}`, validated);
    return ReportSchema.parse(response.data);
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    throw error;
  }
}

export async function deleteReport(id: number): Promise<void> {
  try {
    await api.delete(`/reports/${id}`);
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
}
