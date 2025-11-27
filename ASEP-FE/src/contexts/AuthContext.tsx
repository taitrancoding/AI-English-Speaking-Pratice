import React, { useEffect, useState, ReactNode } from "react";

import { User, UserRole, UserStatus } from "@/schemas/User";
import { AuthContext, AuthContextType } from "./AuthContextType";
import * as authService from "@/lib/services/auth";
import { TokenResponseSchema, type TokenResponse } from "@/schemas/Auth";

const LOCAL_AUTH_KEY = "asep_auth";

// Parse JWT payload
function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Convert string to UserRole enum safely
function stringToUserRole(role?: string | null): UserRole {
  if (!role) return UserRole.LEARNER;

  switch (role.toUpperCase()) {
    case "ADMIN":
      return UserRole.ADMIN;
    case "MENTOR":
      return UserRole.MENTOR;
    case "LEARNER":
      return UserRole.LEARNER;
    default:
      return UserRole.LEARNER;
  }
}

// Build User object from JWT payload
function buildUserFromPayload(payload: Record<string, unknown> | null): User | null {
  if (!payload) return null;

  const email = (payload.sub as string) || (payload.email as string) || "";
  const roleStr = (payload.role as string) || (payload.authorities as string[])?.[0] || "LEARNER";
  const role = stringToUserRole(roleStr);

  // Try to get userId from various possible fields
  let idCandidate: number | undefined = undefined;
  
  if (payload.userId !== undefined) {
    if (typeof payload.userId === 'number') {
      idCandidate = payload.userId;
    } else if (typeof payload.userId  === 'string') {
      const parsed = parseInt(payload.userId, 10);
      if (!isNaN(parsed)) idCandidate = parsed;
    }
  }
  
  if (idCandidate === undefined && payload.id !== undefined) {
    if (typeof payload.id === 'number') {
      idCandidate = payload.id;
    } else if (typeof payload.id === 'string') {
      const parsed = parseInt(payload.id, 10);
      if (!isNaN(parsed)) idCandidate = parsed;
    }
  }

  return {
    id: idCandidate,
    email,
    name: (payload.name as string) || email.split("@")[0] || "",
    role,
    status: (payload.status as UserStatus) || UserStatus.ACTIVE,
  } as User;
}

// Load auth from localStorage
function loadStoredAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user ?? null, token: parsed.token ?? null };
  } catch (e) {
    console.error("Failed to load stored auth", e);
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStoredAuth();
  const normalizedStoredUser = stored.user
    ? { ...stored.user, role: stringToUserRole(stored.user.role) }
    : null;

  const [user, setUser] = useState<User | null>(normalizedStoredUser);
  const [token, setToken] = useState<string | null>(stored.token);

  // Persist auth to localStorage
  useEffect(() => {
    try {
      const authData = { user, token };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authData));
      console.log("Auth persisted to localStorage:", { 
        hasUser: !!user, 
        hasToken: !!token,
        tokenLength: token?.length 
      });
    } catch (e) {
      console.error("Failed to persist auth", e);
    }
  }, [user, token]);

  // Login function
  const login = async (credentials: { email: string; password: string } | User, newToken?: string | null): Promise<User> => {
    // Legacy login with full User object
    if ((credentials as User).email && (credentials as User).role) {
      const u = credentials as User;
      const normalizedUser = { ...u, role: stringToUserRole(u.role) };
      setUser(normalizedUser);
      setToken(newToken ?? null);
      return normalizedUser;
    }

    // Normal login via backend
    try {
      const data: TokenResponse = await authService.login(credentials);
      console.log("Login response data:", data);
      
      // Data is already validated by authService.login, no need to parse again
      if (!data?.accessToken) {
        console.error("Invalid login response: missing accessToken", data);
        throw new Error("Invalid login response: missing accessToken");
      }
      
      const access = data.accessToken;
      console.log("Access token extracted, length:", access.length);
      
      // Decode JWT and build user BEFORE setting state
      const payload = parseJwt(access);
      console.log("JWT payload:", payload);
      const derivedUser = buildUserFromPayload(payload);
      console.log("Derived user:", derivedUser);
      
      // Set both token and user together to ensure consistency
      const finalUser = derivedUser ?? {
        email: credentials.email || "",
        name: "",
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
      };
      
      // Update state synchronously
      setToken(access);
      setUser(finalUser);
      
      // Also save to localStorage immediately (not wait for useEffect)
      try {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: finalUser, token: access }));
        console.log("Token saved to localStorage immediately");
      } catch (e) {
        console.error("Failed to save token immediately", e);
      }
      
      console.log("Login successful - token and user set:", {
        hasToken: !!access,
        hasUser: !!finalUser,
        userRole: finalUser.role,
        userEmail: finalUser.email
      });
      
      return finalUser;
    } catch (e) {
      console.error("Login failed:", e);
      if (e instanceof Error) {
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);
      }
      throw e;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch (e) {
      console.error("Failed to remove stored auth", e);
    }
  };

  // Update user partially
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const nextRole = updates.role !== undefined ? stringToUserRole(updates.role) : user.role;
      setUser({ ...user, ...updates, role: nextRole });
    }
  };

  // Check exact role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Check access by roles
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    return user ? requiredRoles.includes(user.role) : false;
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasRole,
    canAccess,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
