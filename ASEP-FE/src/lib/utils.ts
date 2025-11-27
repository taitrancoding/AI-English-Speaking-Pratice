import { UserRole } from "@/schemas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// export function normalizeUserRole(role?: string | null): UserRole {
//   if (!role) return UserRole.LEARNER;
//   switch (role.toUpperCase()) {
//     case "ADMIN":
//       return UserRole.ADMIN;
//     case "MENTOR":
//       return UserRole.MENTOR;
//     default:
//       return UserRole.LEARNER;
//   }
// }

