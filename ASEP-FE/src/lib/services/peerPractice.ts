import apiClient from "@/lib/api";
import { z } from "zod";

const PeerPracticeSessionSchema = z.object({
  id: z.number(),
  learner1Id: z.number(),
  learner1Name: z.string(),
  learner2Id: z.number(),
  learner2Name: z.string(),
  topic: z.string(),
  scenario: z.string(),
  status: z.string(),
  websocketUrl: z.string(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  durationMinutes: z.number().nullable().optional(),
  aiFeedback: z.string().nullable().optional(),
});

export type PeerPracticeSession = z.infer<typeof PeerPracticeSessionSchema>;

const PeerPracticeRequestSchema = z.object({
  topic: z.string(),
  scenario: z.string(),
  preferredLevel: z.string().optional(),
  enableAiFeedback: z.boolean().optional(),
});

export type PeerPracticeRequest = z.infer<typeof PeerPracticeRequestSchema>;

export async function findMatch(request: PeerPracticeRequest): Promise<PeerPracticeSession> {
  const validated = PeerPracticeRequestSchema.parse(request);
  const response = await apiClient.post("/peer-practice/find-match", validated);
  return PeerPracticeSessionSchema.parse(response.data);
}

export async function getActiveSession(): Promise<PeerPracticeSession> {
  const response = await apiClient.get("/peer-practice/active");
  return PeerPracticeSessionSchema.parse(response.data);
}

export async function endSession(sessionId: number): Promise<void> {
  await apiClient.post(`/peer-practice/${sessionId}/end`);
}

export async function getSessionHistory(): Promise<PeerPracticeSession[]> {
  const response = await apiClient.get("/peer-practice/history");
  return z.array(PeerPracticeSessionSchema).parse(response.data);
}


