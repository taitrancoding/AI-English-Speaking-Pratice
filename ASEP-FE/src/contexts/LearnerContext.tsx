import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import * as learnerService from "@/lib/services/learner";
import * as userService from "@/lib/services/user";

export interface Learner {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: number;
  name?: string;
  email?: string;
  userId: number;
  proficiencyLevel?: string | null;
  learningGoal?: string | null;
  preferredLearningStyle?: string | null;
  totalPracticeSessions?: number;
  totalPracticeMinutes?: number;
  totalScore?: number;
  progress?: number;
  englishLevel?: string;
  goals?: string;
  preferences?: string;
  aiScore?: number;
  package?: string;
}

interface LearnerContextType {
  learners: Learner[];
  loading: boolean;
  error: string | null;
  fetchLearners: (page?: number, size?: number) => Promise<void>;
  addLearner: (payload: {
    name: string;
    email: string;
    password?: string;
    englishLevel?: string;
    goals?: string;
    preferences?: string;
  }) => Promise<void>;

  updateLearner: (id: number, payload: {
    name?: string;
    email?: string;
    password?: string;
    englishLevel?: string;
    goals?: string;
    preferences?: string;
  }) => Promise<void>;
  removeLearner: (id: number) => Promise<void>;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearners = useCallback(async (page = 0, size = 1000) => {
  setLoading(true);
  setError(null);
  try {
    // Fetch all learners with large page size
    const response = await learnerService.listLearnerProfiles(page, size);

    // Backend now returns name and email in response, no need to fetch separately
    const learnersWithUsers = response.content.map((l: any) => ({
      id: l.id,
      name: l.name || "Unknown",
      email: l.email || "",
      userId: l.userId,
      proficiencyLevel: l.englishLevel || l.proficiencyLevel, // Backend returns englishLevel
      learningGoal: l.goals || l.learningGoal, // Backend returns goals
      preferredLearningStyle: l.preferences || l.preferredLearningStyle, // Backend returns preferences
      totalPracticeSessions: l.totalPracticeSessions || 0,
      totalScore: l.totalScore || 0,
      progress: Math.round(((l.aiScore || 0) / 100) * 100),
      englishLevel: l.englishLevel || l.proficiencyLevel,
      goals: l.goals || l.learningGoal,
      preferences: l.preferences || l.preferredLearningStyle,
      aiScore: l.aiScore || 0,
      package: "Standard",
      totalPracticeMinutes: l.totalPracticeMinutes || 0,
    }));

    // 🔥 KHÔI PHỤC DÒNG NÀY
    setLearners(learnersWithUsers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch learners";
    setError(msg);
  } finally {
    setLoading(false);
  }
}, []);


  const addLearner = useCallback(async (payload: {
    name: string;
    email: string;
    password?: string;
    englishLevel?: string;
    goals?: string;
    preferences?: string;
  }) => {
    setError(null);
    try {
      // First, create user with LEARNER role
      const userData = await userService.createUser({
        name: payload.name,
        email: payload.email,
        password: payload.password || "DefaultPass123",
        role: "LEARNER",
      });

      // Then create learner profile
      const newLearner = await learnerService.createLearnerProfile({
        userId: userData.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proficiencyLevel: payload.englishLevel?.toUpperCase() as any,
        learningGoal: payload.goals,
        preferredLearningStyle: payload.preferences,
      });

    setLearners((prev) => [
  ...prev,
  {
    id: newLearner.id,
    name: userData.name,
    email: userData.email,
    userId: userData.id,
    proficiencyLevel: newLearner.proficiencyLevel,
    learningGoal: newLearner.learningGoal,
    preferredLearningStyle: newLearner.preferredLearningStyle,
    totalPracticeSessions: newLearner.totalPracticeSessions || 0,
    totalScore: newLearner.totalScore || 0,
    progress: 0,
    englishLevel: payload.englishLevel,
    goals: payload.goals,
    preferences: payload.preferences,
    aiScore: 0,
    package: "Standard",
    totalPracticeMinutes: 0,
  },
]);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create learner";
      setError(msg);
      throw err;
    }
  }, []);

  // Update learner
const updateLearner = useCallback(async (id: number, payload: {
  name?: string;
  email?: string;
  englishLevel?: string;
  goals?: string;
  preferences?: string;
}) => {
  setError(null);
  try {
    const learner = learners.find(l => l.id === id);
    if (!learner) throw new Error("Learner not found");

    // Update learner profile
    const updated = await learnerService.updateLearnerProfile(id, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      proficiencyLevel: payload.englishLevel?.toUpperCase() as any,
      learningGoal: payload.goals,
      preferredLearningStyle: payload.preferences,
    });

    // Update user name if provided
    if (payload.name && learner.userId) {
      try {
        await userService.updateUser(learner.userId, { name: payload.name });
      } catch (err) {
        console.warn("Failed to update user name:", err);
      }
    }

    // Refresh learners list to get updated data
    await fetchLearners();

    // Cập nhật state với các trường mới
    setLearners((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              name: payload.name || l.name,
              email: payload.email || l.email,
              proficiencyLevel: updated.proficiencyLevel,
              learningGoal: updated.learningGoal,
              preferredLearningStyle: updated.preferredLearningStyle,
              englishLevel: payload.englishLevel || l.englishLevel,
              goals: payload.goals || l.goals,
              preferences: payload.preferences || l.preferences,
            }
          : l
      )
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update learner";
    setError(msg);
    throw err;
  }
}, [learners, fetchLearners]);

// Delete learner
const removeLearner = useCallback(async (id: number) => {
  setError(null);
  try {
    // Gọi API đúng endpoint DELETE /learners/profile/{id}
    await learnerService.deleteLearnerProfile(id);

    // Xóa khỏi state
    setLearners((prev) => prev.filter((l) => l.id !== id));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete learner";
    setError(msg);
    throw err;
  }
}, []);


  return (
    <LearnerContext.Provider
      value={{
        learners,
        loading,
        error,
        fetchLearners,
        addLearner,
        updateLearner,
        removeLearner,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearners = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error("useLearners must be used within a LearnerProvider");
  }
  return context;
};
