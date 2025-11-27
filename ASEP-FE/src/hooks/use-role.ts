import { useAuth } from "./use-auth";
import { UserRole } from "@/schemas/User";

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
}

export function useIsLearner(): boolean {
  const { user } = useAuth();
  return user?.role === UserRole.LEARNER;
}

export function useIsMentor(): boolean {
  const { user } = useAuth();
  return user?.role === UserRole.MENTOR;
}

export function useCanAccess(roles: UserRole[]): boolean {
  const { canAccess } = useAuth();
  return canAccess(roles);
}
