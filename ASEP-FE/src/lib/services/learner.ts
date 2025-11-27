import apiClient from "@/lib/api";
import { z } from "zod";

// Request/Response schemas
const LearnerProfileRequestSchema = z.object({
  userId: z.number(),
  proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  learningGoal: z.string().optional(),
  preferredLearningStyle: z.string().optional(),
});

const LearnerProfileResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().nullable().optional(),
  proficiencyLevel: z.string().nullable().optional(),
  englishLevel: z.string().nullable().optional(),
  learningGoal: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  preferredLearningStyle: z.string().nullable().optional(),
  preferences: z.string().nullable().optional(),
  totalPracticeSessions: z.number().default(0),
  total_practice_minutes: z.number().int().nonnegative().default(0).optional(),
  totalScore: z.number().default(0),
  aiScore: z.number().nullable().optional(),
  pronunciationScore: z.number().nullable().optional(),
  totalPracticeMinutes: z.number().nullable().optional().default(0),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const LearnerProfileUpdateSchema = z.object({
  proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  learningGoal: z.string().optional(),
  preferredLearningStyle: z.string().optional(),
});

const LearnerProfilesListResponseSchema = z.object({
  content: z.array(LearnerProfileResponseSchema).optional().default([]),
  totalElements: z.number().optional().default(0),
  totalPages: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(20),
});

export type LearnerProfileRequest = z.infer<typeof LearnerProfileRequestSchema>;
export type LearnerProfileResponse = z.infer<typeof LearnerProfileResponseSchema>;
export type LearnerProfileUpdate = z.infer<typeof LearnerProfileUpdateSchema>;
export type LearnerProfilesListResponse = z.infer<typeof LearnerProfilesListResponseSchema>;

// Learner Profile API calls
export async function createLearnerProfile(
  payload: LearnerProfileRequest
): Promise<LearnerProfileResponse> {
  const validated = LearnerProfileRequestSchema.parse(payload);
  const res = await apiClient.post("/learners/profile", validated);
  return LearnerProfileResponseSchema.parse(res.data);
}

export async function getLearnerProfile(learnerId: number): Promise<LearnerProfileResponse> {
  const res = await apiClient.get(`/learners/profile/${learnerId}`);
  return LearnerProfileResponseSchema.parse(res.data);
}

export async function updateLearnerProfile(
  learnerId: number,
  payload: LearnerProfileUpdate
): Promise<LearnerProfileResponse> {
  const validated = LearnerProfileUpdateSchema.parse(payload);
  const res = await apiClient.put(`/learners/profile/${learnerId}`, validated);
  return LearnerProfileResponseSchema.parse(res.data);
}

export async function deleteLearnerProfile(learnerId: number): Promise<void> {
  await apiClient.delete(`/learners/profile/${learnerId}`);
}

export async function listLearnerProfiles(
  page: number = 0,
  size: number = 20
): Promise<LearnerProfilesListResponse> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await apiClient.get(`/learners/profile?${params.toString()}`);
  return LearnerProfilesListResponseSchema.parse(res.data);
}

export async function getMyLearnerProfile(): Promise<LearnerProfileResponse> {
  const res = await apiClient.get("/learners/profile/me");
  return LearnerProfileResponseSchema.parse(res.data);
}

export async function updateMyLearnerProfile(
  payload: LearnerProfileUpdate
): Promise<LearnerProfileResponse> {
  // Map frontend fields to backend fields
  const backendPayload: any = {};
  if (payload.proficiencyLevel) {
    backendPayload.englishLevel = payload.proficiencyLevel;
  }
  if (payload.learningGoal) {
    backendPayload.goals = payload.learningGoal;
  }
  if (payload.preferredLearningStyle) {
    backendPayload.preferences = payload.preferredLearningStyle;
  }
  
  const res = await apiClient.put("/learners/profile/me", backendPayload);
  return LearnerProfileResponseSchema.parse(res.data);
}
