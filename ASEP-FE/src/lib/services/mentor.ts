import apiClient from "@/lib/api";
import { z } from "zod";

// Request/Response schemas
const MentorRequestSchema = z.object({
  userId: z.number(),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().optional(),
});

const MentorResponseSchema = z.object({
  id: z.number(),
  userId: z.number().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  // hourlyRate: z.number().nullable().optional(),
  rating: z.number().nullable().optional().default(0),
  totalStudents: z.number().nullable().optional().default(0),
  experienceYears: z.number().nullable().optional(),
  availabilityStatus: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const MentorUpdateSchema = z.object({
  specialization: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  availabilityStatus: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
});

const MentorsListResponseSchema = z.object({
  content: z.array(MentorResponseSchema).optional().default([]),
  totalElements: z.number().optional().default(0),
  totalPages: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(20),
});

const MentorLearnerSummarySchema = z.object({
  learnerId: z.number(),
  learnerName: z.string().nullable().optional(),
  learnerEmail: z.string().nullable().optional(),
  packageId: z.number().nullable().optional(),
  packageName: z.string().nullable().optional(),
  packageDescription: z.string().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  expireDate: z.string().nullable().optional(),
  paymentStatus: z.string().nullable().optional(),
});

const MentorLearnerPageSchema = z.object({
  content: z.array(MentorLearnerSummarySchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(0),
});

export type MentorRequest = z.infer<typeof MentorRequestSchema>;
export type MentorResponse = z.infer<typeof MentorResponseSchema>;
export type MentorUpdate = z.infer<typeof MentorUpdateSchema>;
export type MentorsListResponse = z.infer<typeof MentorsListResponseSchema>;
export type MentorLearnerSummary = z.infer<typeof MentorLearnerSummarySchema>;
export type MentorLearnerPage = z.infer<typeof MentorLearnerPageSchema>;

// Mentor API calls
export async function createMentor(payload: MentorRequest): Promise<MentorResponse> {
  const validated = MentorRequestSchema.parse(payload);
  const res = await apiClient.post("/mentors", validated);
  return MentorResponseSchema.parse(res.data);
}

export async function getMentor(mentorId: number): Promise<MentorResponse> {
  const res = await apiClient.get(`/mentors/${mentorId}`);
  return MentorResponseSchema.parse(res.data);
}

export async function updateMentor(mentorId: number, payload: MentorUpdate): Promise<MentorResponse> {
  const validated = MentorUpdateSchema.parse(payload);
  const res = await apiClient.put(`/mentors/${mentorId}`, validated);
  return MentorResponseSchema.parse(res.data);
}

export async function deleteMentor(mentorId: number): Promise<void> {
  await apiClient.delete(`/mentors/${mentorId}`);
}

export async function listMentors(page: number = 0, size: number = 20): Promise<MentorsListResponse> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await apiClient.get(`/mentors?${params.toString()}`);
  return MentorsListResponseSchema.parse(res.data);
}

export async function getCurrentMentorProfile(): Promise<MentorResponse> {
  const res = await apiClient.get("/mentors/me");
  return MentorResponseSchema.parse(res.data);
}

export async function updateCurrentMentorProfile(payload: MentorUpdate): Promise<MentorResponse> {
  const validated = MentorUpdateSchema.parse(payload);
  const res = await apiClient.put("/mentors/me", validated);
  return MentorResponseSchema.parse(res.data);
}

export async function listMyLearners(page = 0, size = 20): Promise<MentorLearnerPage> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  const res = await apiClient.get(`/mentors/me/learners?${params.toString()}`);
  return MentorLearnerPageSchema.parse(res.data);
}
