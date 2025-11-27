import api from "../api";
import { z } from "zod";

const priceSchema = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  }
  return val;
}, z.number().nonnegative());

const durationSchema = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  }
  return val;
}, z.number().int().positive());

const hasMentorSchema = z
  .preprocess((val) => {
    if (typeof val === "string") {
      return val === "true" || val === "1";
    }
    if (val === null || val === undefined) return false;
    return Boolean(val);
  }, z.boolean())
  .catch(false);

const PackageStatusSchema = z
  .preprocess((val) => {
    if (typeof val === "string") {
      const normalized = val.toUpperCase();
      if (normalized === "ACTIVE" || normalized === "INACTIVE") {
        return normalized;
      }
    }
    return val;
  }, z.enum(["ACTIVE", "INACTIVE"]))
  .catch("ACTIVE");

const MentorSummarySchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  availabilityStatus: z.string().nullable().optional(),
});

const PackagePayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(1000).nullable().optional(),
  price: priceSchema,
  durationDays: durationSchema,
  hasMentor: hasMentorSchema,
  status: PackageStatusSchema,
  mentorIds: z.array(z.number().int().positive()).optional().default([]),
});

export type PackagePayload = z.infer<typeof PackagePayloadSchema>;
export type MentorSummary = z.infer<typeof MentorSummarySchema>;

export const PackageSchema = PackagePayloadSchema.extend({
  id: z.number(),
  mentors: z.array(MentorSummarySchema).optional().default([]),
});

export type Package = z.infer<typeof PackageSchema>;

const PaginationResponseSchema = z.object({
  content: z.array(PackageSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

export type PackagePaginationResponse = z.infer<typeof PaginationResponseSchema>;

export async function listPackages(page = 0, size = 20): Promise<PackagePaginationResponse> {
  try {
    const response = await api.get<unknown>(`/packages`, {
      params: { page, size },
    });
    return PaginationResponseSchema.parse(response.data);
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

export async function getPackage(id: number): Promise<Package> {
  try {
    const response = await api.get<unknown>(`/packages/${id}`);
    return PackageSchema.parse(response.data);
  } catch (error) {
    console.error(`Error fetching package ${id}:`, error);
    throw error;
  }
}

export async function createPackage(payload: PackagePayload): Promise<Package> {
  try {
    const validatedPayload = PackagePayloadSchema.parse(payload);
    const response = await api.post<unknown>(`/packages`, validatedPayload);
    return PackageSchema.parse(response.data);
  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
}

export async function updatePackage(id: number, payload: PackagePayload): Promise<Package> {
  try {
    const validatedPayload = PackagePayloadSchema.parse(payload);
    const response = await api.put<unknown>(`/packages/${id}`, validatedPayload);
    return PackageSchema.parse(response.data);
  } catch (error) {
    console.error(`Error updating package ${id}:`, error);
    throw error;
  }
}

export async function deletePackage(id: number): Promise<void> {
  try {
    await api.delete(`/packages/${id}`);
  } catch (error) {
    console.error(`Error deleting package ${id}:`, error);
    throw error;
  }
}
