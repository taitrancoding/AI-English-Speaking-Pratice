import api from "../api";
import { z } from "zod";

const MentorSummarySchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
  availabilityStatus: z.string().nullable().optional(),
});

const LearnerPackageSchema = z.object({
  id: z.number(),
  learnerId: z.number().optional(),
  packageId: z.number(),
  transactionId: z.number().nullable().optional(),
  priceAtPurchase: z.number().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  expireDate: z.string().nullable().optional(),
  paymentStatus: z.string().nullable().optional(),
  packageName: z.string().nullable().optional(),
  packageDescription: z.string().nullable().optional(),
  packageDurationDays: z.number().nullable().optional(),
  mentors: z.array(MentorSummarySchema).optional().default([]),
});

const LearnerPackagePageSchema = z.object({
  content: z.array(LearnerPackageSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  number: z.number().default(0),
  size: z.number().default(20),
});

const PurchasePayloadSchema = z.object({
  packageId: z.number(),
  transactionId: z.number().optional(),
});

export type LearnerPackage = z.infer<typeof LearnerPackageSchema>;
export type LearnerPackagePage = z.infer<typeof LearnerPackagePageSchema>;
export type LearnerPackagePurchasePayload = z.infer<typeof PurchasePayloadSchema>;

export async function listMyLearnerPackages(page = 0, size = 50): Promise<LearnerPackagePage> {
  const response = await api.get<unknown>("/learner-packages", { params: { page, size } });
  return LearnerPackagePageSchema.parse(response.data);
}

export async function purchaseLearnerPackage(payload: LearnerPackagePurchasePayload): Promise<LearnerPackage> {
  const validated = PurchasePayloadSchema.parse(payload);
  const response = await api.post<unknown>("/learner-packages", {
    packageId: validated.packageId,
    transactionId: validated.transactionId,
  });
  const data = response.data;
  // Handle both direct response and nested data
  return LearnerPackageSchema.parse(data);
}

export async function cancelLearnerPackage(id: number): Promise<void> {
  await api.delete(`/learner-packages/${id}`);
}

