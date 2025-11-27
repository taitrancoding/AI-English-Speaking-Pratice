import api from "../api";
import { z } from "zod";

const FeedbackCommentSchema = z.object({
  id: z.number(),
  userId: z.number().nullable().optional(),
  userName: z.string().nullable().optional(),
  content: z.string(),
  targetType: z.string(),
  targetId: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const FeedbackCommentPayloadSchema = z.object({
  content: z.string().min(5, "Nội dung phải từ 5 ký tự"),
  userName: z.string().min(2),
  targetType: z.string().min(2),
  targetId: z.number().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

const FeedbackCommentPageSchema = z.object({
  content: z.array(FeedbackCommentSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type FeedbackComment = z.infer<typeof FeedbackCommentSchema>;
export type FeedbackCommentPayload = z.infer<typeof FeedbackCommentPayloadSchema>;
export type FeedbackCommentPage = z.infer<typeof FeedbackCommentPageSchema>;

export async function listFeedbackCommentsByUser(userId: number, page = 0, size = 20): Promise<FeedbackCommentPage> {
  const response = await api.get<unknown>(`/feedback-comments/user/${userId}`, { params: { page, size } });
  return FeedbackCommentPageSchema.parse(response.data);
}

export async function createFeedbackComment(payload: FeedbackCommentPayload): Promise<FeedbackComment> {
  const validated = FeedbackCommentPayloadSchema.parse(payload);
  const response = await api.post<unknown>("/feedback-comments", validated);
  return FeedbackCommentSchema.parse(response.data);
}

export async function updateFeedbackComment(id: number, payload: FeedbackCommentPayload): Promise<FeedbackComment> {
  const validated = FeedbackCommentPayloadSchema.parse(payload);
  const response = await api.put<unknown>(`/feedback-comments/${id}`, validated);
  return FeedbackCommentSchema.parse(response.data);
}

export async function deleteFeedbackComment(id: number): Promise<void> {
  await api.delete(`/feedback-comments/${id}`);
}

