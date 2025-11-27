
import { z } from "zod";

export enum UserRole {
  ADMIN = "ADMIN",
  MENTOR = "MENTOR",
  LEARNER = "LEARNER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

// Schema Zod để validate object User
export const UserSchema = z.object({
  id: z.number().optional(), 
  email: z.string().email().max(100).optional().nullable(),
  password: z.string().max(255).optional().nullable(),
  name: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).default(UserRole.LEARNER),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  deletedAt: z.string().datetime().nullable().optional(), 
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;
