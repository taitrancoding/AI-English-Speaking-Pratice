import { createContext } from "react";
import { User, UserRole } from "@/schemas/User";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string } | User, newToken?: string | null) => Promise<User>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
