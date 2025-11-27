import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  listSystemPolicies,
  createSystemPolicy,
  updateSystemPolicy,
  deleteSystemPolicy,
  type SystemPolicy,
  type SystemPolicyPayload,
} from "@/lib/services/systemPolicy";

type PolicyContextType = {
  policies: SystemPolicy[];
  loading: boolean;
  error: string | null;
  fetchPolicies: (page?: number, size?: number) => Promise<void>;
  createPolicy: (payload: SystemPolicyPayload) => Promise<void>;
  updatePolicy: (id: number, payload: SystemPolicyPayload) => Promise<void>;
  deletePolicy: (id: number) => Promise<void>;
};

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const PolicyProvider = ({ children }: { children: ReactNode }) => {
  const [policies, setPolicies] = useState<SystemPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async (page = 0, size = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await listSystemPolicies(page, size);
      setPolicies(response.content ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách chính sách";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (payload: SystemPolicyPayload) => {
    setError(null);
    try {
      const created = await createSystemPolicy(payload);
      setPolicies((prev) => [...prev, created]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tạo chính sách";
      setError(msg);
      throw err;
    }
  }, []);

  const updatePolicy = useCallback(async (id: number, payload: SystemPolicyPayload) => {
    setError(null);
    try {
      const updated = await updateSystemPolicy(id, payload);
      setPolicies((prev) => prev.map((policy) => (policy.id === id ? updated : policy)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể cập nhật chính sách";
      setError(msg);
      throw err;
    }
  }, []);

  const deletePolicy = useCallback(async (id: number) => {
    setError(null);
    try {
      await deleteSystemPolicy(id);
      setPolicies((prev) => prev.filter((policy) => policy.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa chính sách";
      setError(msg);
      throw err;
    }
  }, []);

  return (
    <PolicyContext.Provider
      value={{
        policies,
        loading,
        error,
        fetchPolicies,
        createPolicy,
        updatePolicy,
        deletePolicy,
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error("usePolicy must be used within a PolicyProvider");
  }
  return context;
};
