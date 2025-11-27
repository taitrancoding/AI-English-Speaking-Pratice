import React, { createContext, useContext, useState, useCallback } from "react";
import * as mentorService from "@/lib/services/mentor";
import * as userService from "@/lib/services/user";

// ---- FIXED TYPE ----
export type Mentor = {
  id: number;
  name: string;
  email?: string;
  userId: number;
  specialization?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  rating: number;
  totalStudents: number;
  experienceYears?: number;
  skills?: string;
  availabilityStatus?: "available" | "busy" | "inactive";  // backend enum
};

type MentorContextType = {
  mentors: Mentor[];
  loading: boolean;
  error: string | null;
  fetchMentors: (page?: number, size?: number) => Promise<void>;
  addMentor: (payload: {
    name: string;
    email: string;
    password?: string;
    bio?: string;
    skills?: string;
    experienceYears?: number;
    availabilityStatus?: "available" | "busy" | "inactive";
  }) => Promise<void>;
  updateMentor: (id: number, payload: {
    name?: string;
    email?: string;
    bio?: string;
    skills?: string;
    experienceYears?: number;
    availabilityStatus?: "available" | "busy" | "inactive";
  }) => Promise<void>;
  deleteMentor: (id: number) => Promise<void>;
};

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // FETCH ALL MENTORS
  // ===========================
  const fetchMentors = useCallback(async (page = 0, size = 1000) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all mentors with large page size
      const response = await mentorService.listMentors(page, size);

      const mentorsMapped: Mentor[] = response.content.map((m: any) => ({
        id: m.id,
        name: m.name || "Unknown",
        email: m.email || "",
        userId: m.userId,
        specialization: m.specialization || "",
        bio: m.bio,
        hourlyRate: m.hourlyRate,
        rating: m.rating || 0,
        totalStudents: m.totalStudents || 0,
        experienceYears: m.experienceYears || 0,
        skills: m.skills || "",
        availabilityStatus: m.availabilityStatus || "available",
      }));

      setMentors(mentorsMapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch mentors";
      setError(msg);
      console.error("fetchMentors error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // ADD MENTOR
  // ===========================
  const addMentor = useCallback(async (payload: {
    name: string;
    email: string;
    password?: string;
    bio?: string;
    skills?: string;
    experienceYears?: number;
    availabilityStatus?: "available" | "busy" | "inactive";
  }) => {
    setError(null);

    try {
      const newUser = await userService.createUser({
        name: payload.name,
        email: payload.email,
        password: payload.password || "DefaultPass123",
        role: "MENTOR",
      });

      const newMentor = await mentorService.createMentor({
        userId: newUser.id,
        bio: payload.bio,
        specialization: payload.skills,
        hourlyRate: payload.experienceYears ? payload.experienceYears * 10 : undefined,
      });

      const mapped: Mentor = {
        id: newMentor.id,
        name: newUser.name,
        email: newUser.email,
        userId: newUser.id,
        specialization: newMentor.specialization,
        bio: newMentor.bio,
        hourlyRate: newMentor.hourlyRate,
        rating: newMentor.rating || 0,
        totalStudents: newMentor.totalStudents || 0,
        experienceYears: payload.experienceYears || 0,
        skills: payload.skills,
        availabilityStatus: payload.availabilityStatus || "available",
      };

      setMentors((prev) => [...prev, mapped]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create mentor";
      setError(msg);
      throw err;
    }
  }, []);

  // ===========================
  // UPDATE MENTOR
  // ===========================
  const updateMentor = useCallback(async (id: number, payload: {
    name?: string;
    email?: string;
    bio?: string;
    skills?: string;
    experienceYears?: number;
    availabilityStatus?: "available" | "busy" | "inactive";
  }) => {
    setError(null);

    try {
      const mentor = mentors.find((m) => m.id === id);
      if (!mentor) throw new Error("Mentor not found");

      await mentorService.updateMentor(id, {
        bio: payload.bio,
        specialization: payload.skills,
        hourlyRate: payload.experienceYears ? payload.experienceYears * 10 : undefined,
      });

      if (payload.name) {
        await userService.updateUser(mentor.userId, { name: payload.name });
      }

      // Reload data
      await fetchMentors();

      // Update FE state
      setMentors((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: payload.name || m.name,
                email: payload.email || m.email,
                bio: payload.bio || m.bio,
                specialization: payload.skills || m.specialization,
                experienceYears: payload.experienceYears || m.experienceYears,
                skills: payload.skills || m.skills,
                availabilityStatus: payload.availabilityStatus || m.availabilityStatus,
              }
            : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update mentor";
      setError(msg);
      throw err;
    }
  }, [mentors, fetchMentors]);

  // ===========================
  // DELETE
  // ===========================
  const deleteMentor = useCallback(async (id: number) => {
    setError(null);
    try {
      await mentorService.deleteMentor(id);
      setMentors((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete mentor";
      setError(msg);
      throw err;
    }
  }, []);

  return (
    <MentorContext.Provider
      value={{
        mentors,
        loading,
        error,
        fetchMentors,
        addMentor,
        updateMentor,
        deleteMentor,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};

export const useMentor = () => {
  const ctx = useContext(MentorContext);
  if (!ctx) throw new Error("useMentor must be used within MentorProvider");
  return ctx;
};
