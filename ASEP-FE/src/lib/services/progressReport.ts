import api from "../api";
import { z } from "zod";

const dateSchema = z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
  message: "Ngày không hợp lệ",
});

const ProgressReportPayloadSchema = z.object({
  learnerId: z.number().int().positive(),
  weekStart: dateSchema,
  weekEnd: dateSchema,
  totalSessions: z.number().int().nonnegative(),
  avgPronunciation: z.number().min(0).max(100),
  avgGrammar: z.number().min(0).max(100),
  avgVocabulary: z.number().min(0).max(100),
  improvementNotes: z.string().max(4000).optional().or(z.literal("")),
});

export type ProgressReportPayload = z.infer<typeof ProgressReportPayloadSchema>;

export const ProgressReportSchema = ProgressReportPayloadSchema.extend({
  id: z.number(),
  generatedAt: z.string().optional(),
});

export type ProgressReport = z.infer<typeof ProgressReportSchema>;

const PaginationResponseSchema = z.object({
  content: z.array(ProgressReportSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type ProgressReportPage = z.infer<typeof PaginationResponseSchema>;

export async function listByLearner(learnerId: number, page = 0, size = 20): Promise<ProgressReportPage> {
  try {
    const response = await api.get<unknown>(`/reports/progress/learner/${learnerId}`, {
      params: { page, size },
    });
    return PaginationResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    throw error;
  }
}

export async function listMine(page = 0, size = 20): Promise<ProgressReportPage> {
  try {
    const response = await api.get<unknown>(`/reports/progress/me`, {
      params: { page, size },
    });
    return PaginationResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching my progress reports:", error);
    throw error;
  }
}

export async function createProgressReport(payload: ProgressReportPayload): Promise<ProgressReport> {
  try {
    const validated = ProgressReportPayloadSchema.parse(payload);
    const response = await api.post<unknown>(`/reports/progress`, validated);
    return ProgressReportSchema.parse(response.data);
  } catch (error) {
    console.error("Error creating progress report:", error);
    throw error;
  }
}

export async function updateProgressReport(id: number, payload: ProgressReportPayload): Promise<ProgressReport> {
  try {
    const validated = ProgressReportPayloadSchema.parse(payload);
    const response = await api.put<unknown>(`/reports/progress/${id}`, validated);
    return ProgressReportSchema.parse(response.data);
  } catch (error) {
    console.error(`Error updating progress report ${id}:`, error);
    throw error;
  }
}

export async function deleteProgressReport(id: number): Promise<void> {
  try {
    await api.delete(`/reports/progress/${id}`);
  } catch (error) {
    console.error(`Error deleting progress report ${id}:`, error);
    throw error;
  }
}

export async function getProgressReport(id: number): Promise<ProgressReport> {
  try {
    const response = await api.get<unknown>(`/reports/progress/${id}`);
    return ProgressReportSchema.parse(response.data);
  } catch (error) {
    console.error(`Error fetching progress report ${id}:`, error);
    throw error;
  }
}

