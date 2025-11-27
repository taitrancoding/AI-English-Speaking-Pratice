import apiClient from "@/lib/api";
import { z } from "zod";

// Request/Response schemas
const passwordPolicy = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(8),
  password: z.string().regex(passwordPolicy),
  role: z.enum(["ADMIN", "MENTOR", "LEARNER"]),
});

const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
  role: z.enum(["ADMIN", "MENTOR", "LEARNER"]).optional(),
  // Backend may return DISABLED as well; accept it to avoid parse errors
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DISABLED"]).nullish().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const UserUpdateSchema = z.object({
  name: z.string().min(8).optional(),
  avatarUrl: z.string().optional(),
  password: z.string().regex(passwordPolicy).optional(),
  role: z.enum(["ADMIN", "MENTOR", "LEARNER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DISABLED"]).optional(),
});

const UsersListResponseSchema = z.object({
  content: z.array(UserResponseSchema).optional().default([]),
  totalElements: z.number().optional().default(0),
  totalPages: z.number().optional().default(0),
  number: z.number().optional().default(0),
  size: z.number().optional().default(20),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;

// User API calls
export async function createUser(payload: CreateUserRequest): Promise<UserResponse> {
  const validated = CreateUserRequestSchema.parse(payload);
  const res = await apiClient.post("/users", validated);
  return UserResponseSchema.parse(res.data);
}

export async function getUser(userId: number): Promise<UserResponse> {
  const res = await apiClient.get(`/users/${userId}`);
  return UserResponseSchema.parse(res.data);
}

export async function updateUser(userId: number, payload: UserUpdate): Promise<UserResponse> {
  const validated = UserUpdateSchema.parse(payload);
  const res = await apiClient.put(`/users/${userId}`, validated);
  return UserResponseSchema.parse(res.data);
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}

export async function listUsers(
  page: number = 0,
  size: number = 20,
  role?: string,
  status?: string
): Promise<UsersListResponse> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (role) params.append("role", role);
  if (status) params.append("status", status);

  const res = await apiClient.get(`/users?${params.toString()}`);
  return UsersListResponseSchema.parse(res.data);
}
