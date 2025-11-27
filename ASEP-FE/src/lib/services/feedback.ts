import api from "../api";
import { z } from "zod";

const MentorFeedbackPayloadSchema = z.object({
  mentorId: z.number().int().positive(),
  learnerId: z.number().int().positive(),
  sessionId: z.number().int().positive().optional(),
  pronunciationComment: z.string().max(2000).optional().or(z.literal("")),
  grammarComment: z.string().max(2000).optional().or(z.literal("")),
  improvementSuggestion: z.string().max(2000).optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional(),
});

export type MentorFeedbackPayload = z.infer<typeof MentorFeedbackPayloadSchema>;

export const MentorFeedbackSchema = MentorFeedbackPayloadSchema.extend({
  id: z.number(),
});

export type MentorFeedback = z.infer<typeof MentorFeedbackSchema>;

const PaginationResponseSchema = z.object({
  content: z.array(MentorFeedbackSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

export async function listMentorFeedbacks(mentorId: number, page = 0, size = 20): Promise<PaginationResponse> {
  try {
    const response = await api.get<unknown>(`/mentor-feedbacks/mentor/${mentorId}`, {
      params: { page, size },
    });
    return PaginationResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching mentor feedbacks:", error);
    throw error;
  }
}

export async function getMentorFeedback(id: number): Promise<MentorFeedback> {
  try {
    const response = await api.get<unknown>(`/mentor-feedbacks/${id}`);
    return MentorFeedbackSchema.parse(response.data);
  } catch (error) {
    console.error(`Error fetching mentor feedback ${id}:`, error);
    throw error;
  }
}

export async function createMentorFeedback(payload: MentorFeedbackPayload): Promise<MentorFeedback> {
  try {
    const validatedPayload = MentorFeedbackPayloadSchema.parse(payload);
    const response = await api.post<unknown>(`/mentor-feedbacks`, validatedPayload);
    return MentorFeedbackSchema.parse(response.data);
  } catch (error) {
    console.error("Error creating mentor feedback:", error);
    throw error;
  }
}

export async function updateMentorFeedback(id: number, payload: MentorFeedbackPayload): Promise<MentorFeedback> {
  try {
    const validatedPayload = MentorFeedbackPayloadSchema.parse(payload);
    const response = await api.put<unknown>(`/mentor-feedbacks/${id}`, validatedPayload);
    return MentorFeedbackSchema.parse(response.data);
  } catch (error) {
    console.error(`Error updating mentor feedback ${id}:`, error);
    throw error;
  }
}

export async function deleteMentorFeedback(id: number): Promise<void> {
  try {
    await api.delete(`/mentor-feedbacks/${id}`);
  } catch (error) {
    console.error(`Error deleting mentor feedback ${id}:`, error);
    throw error;
  }
}
