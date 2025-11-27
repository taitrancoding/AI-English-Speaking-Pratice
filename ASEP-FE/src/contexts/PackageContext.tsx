import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import * as packageService from "@/lib/services/package";

type Package = packageService.Package;
type PackagePayload = packageService.PackagePayload;

interface PackageContextType {
  packages: Package[];
  loading: boolean;
  error: string | null;
  fetchPackages: (page?: number, size?: number) => Promise<void>;
  addPackage: (pkg: PackagePayload) => Promise<void>;
  updatePackage: (id: number, updated: PackagePayload) => Promise<void>;
  deletePackage: (id: number) => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const PackageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await packageService.listPackages(page, size);
      setPackages(response.content ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch packages";
      setError(msg);
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPackage = useCallback(async (pkg: PackagePayload) => {
    setError(null);
    try {
      const newPackage = await packageService.createPackage(pkg);
      setPackages((prev) => [...prev, newPackage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create package";
      setError(msg);
      throw err;
    }
  }, []);

  const updatePackage = useCallback(async (id: number, updated: PackagePayload) => {
    setError(null);
    try {
      const updatedPackage = await packageService.updatePackage(id, updated);
      setPackages((prev) => prev.map((p) => (p.id === id ? updatedPackage : p)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update package";
      setError(msg);
      throw err;
    }
  }, []);

  const deletePackage = useCallback(async (id: number) => {
    setError(null);
    try {
      await packageService.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete package";
      setError(msg);
      throw err;
    }
  }, []);

  return (
    <PackageContext.Provider
      value={{
        packages,
        loading,
        error,
        fetchPackages,
        addPackage,
        updatePackage,
        deletePackage,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (!context) throw new Error("usePackages must be used within a PackageProvider");
  return context;
};
