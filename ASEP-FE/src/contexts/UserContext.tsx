import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import * as userService from "@/lib/services/user";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
};

type UserContextType = {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (page?: number, size?: number) => Promise<void>;
  createUser: (payload: { email: string; name: string; password: string; role?: string }) => Promise<void>;
  updateUser: (id: number, payload: { name?: string; avatarUrl?: string }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      console.log("[UserContext] Fetching users from API...");
      const response = await userService.listUsers(page, size);
      console.log("[UserContext] API response:", response);
      setUsers(
        response.content.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          avatarUrl: u.avatarUrl,
        }))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users";
      setError(msg);
      console.error("[UserContext] Failed to fetch users:", err, "Message:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (payload: { email: string; name: string; password: string; role?: string }) => {
    setError(null);
    try {
      const newUser = await userService.createUser(payload);
      setUsers((prev) => [
        ...prev,
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          avatarUrl: newUser.avatarUrl,
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user";
      setError(msg);
      throw err;
    }
  }, []);

  const updateUser = useCallback(
    async (
      id: number,
      payload: { name?: string; avatarUrl?: string; password?: string; role?: string; status?: string }
    ) => {
      setError(null);
      try {
        const updated = await userService.updateUser(id, {
          ...payload,
          role: payload.role as "ADMIN" | "MENTOR" | "LEARNER" | undefined,
          status: payload.status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DISABLED" | undefined,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  name: updated.name ?? u.name,
                  avatarUrl: updated.avatarUrl ?? u.avatarUrl,
                  role: updated.role ?? u.role,
                  status: updated.status ?? u.status,
                }
              : u
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update user";
        setError(msg);
        throw err;
      }
    },
    []
  );

  const deleteUser = useCallback(async (id: number) => {
    setError(null);
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      setError(msg);
      throw err;
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within a UserProvider");
  return context;
};
