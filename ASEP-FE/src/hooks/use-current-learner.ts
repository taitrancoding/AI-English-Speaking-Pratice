import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Learner } from "@/contexts/LearnerContext";
import { getMyLearnerProfile, type LearnerProfileResponse } from "@/lib/services/learner";

function mapToLearner(response: LearnerProfileResponse, fallback: { email?: string }): Learner {
  return {
    id: response.id,
    userId: response.userId,
    name: response.name || fallback.email?.split("@")[0] || "Learner",
    email: fallback.email,
    proficiencyLevel: response.proficiencyLevel || response.englishLevel,
    learningGoal: response.learningGoal || response.goals,
    preferredLearningStyle: response.preferredLearningStyle || response.preferences,
    totalPracticeSessions: response.totalPracticeSessions,
    totalPracticeMinutes: response.totalPracticeMinutes,
    totalScore: response.totalScore,
    progress: Math.round(((response.aiScore || 0) / 100) * 100),
    englishLevel: response.englishLevel || response.proficiencyLevel || undefined,
    goals: response.goals || response.learningGoal || "",
    preferences: response.preferences || response.preferredLearningStyle || "",
    aiScore: response.aiScore || undefined,
    package: "Standard",
  };
}

export function useCurrentLearnerProfile() {
  const { user } = useAuth();
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getMyLearnerProfile();
      setLearner(mapToLearner(response, { email: user.email }));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Không thể tải hồ sơ học viên";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    learner,
    isLoading: loading,
    error,
    refresh: fetchProfile,
  };
}

