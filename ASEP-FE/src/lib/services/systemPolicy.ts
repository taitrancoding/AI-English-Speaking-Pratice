import api from "../api";
import { z } from "zod";

const SystemPolicySchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  content: z.string().min(1),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const SystemPolicyPayloadSchema = SystemPolicySchema.omit({ id: true, createdAt: true, updatedAt: true });

const PaginatedPoliciesSchema = z.object({
  content: z.array(SystemPolicySchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type SystemPolicy = z.infer<typeof SystemPolicySchema>;
export type SystemPolicyPayload = z.infer<typeof SystemPolicyPayloadSchema>;
export type SystemPolicyPage = z.infer<typeof PaginatedPoliciesSchema>;

export async function listSystemPolicies(page = 0, size = 20): Promise<SystemPolicyPage> {
  const response = await api.get<unknown>("/system-policies", { params: { page, size } });
  return PaginatedPoliciesSchema.parse(response.data);
}

export async function getSystemPolicy(id: number): Promise<SystemPolicy> {
  const response = await api.get<unknown>(`/system-policies/${id}`);
  return SystemPolicySchema.parse(response.data);
}

export async function createSystemPolicy(payload: SystemPolicyPayload): Promise<SystemPolicy> {
  const validated = SystemPolicyPayloadSchema.parse(payload);
  const response = await api.post<unknown>("/system-policies", validated);
  return SystemPolicySchema.parse(response.data);
}

export async function updateSystemPolicy(id: number, payload: SystemPolicyPayload): Promise<SystemPolicy> {
  const validated = SystemPolicyPayloadSchema.parse(payload);
  const response = await api.put<unknown>(`/system-policies/${id}`, validated);
  return SystemPolicySchema.parse(response.data);
}

export async function deleteSystemPolicy(id: number): Promise<void> {
  await api.delete(`/system-policies/${id}`);
}

