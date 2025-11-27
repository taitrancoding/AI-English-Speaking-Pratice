import React, { useState, ReactNode, useCallback } from "react";
import * as feedbackService from "@/lib/services/feedback";
import { FeedbackContext, FeedbackContextType, Feedback } from "./FeedbackContextType";

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentMentorId, setCurrentMentorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async (mentorId: number, page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    setCurrentMentorId(mentorId);
    try {
      const response = await feedbackService.listMentorFeedbacks(mentorId, page, size);
      setFeedbacks(
        response.content.map((f) => ({
          id: f.id,
          mentorId: f.mentorId,
          learnerId: f.learnerId,
          sessionId: f.sessionId ?? undefined,
          rating: f.rating ?? undefined,
          pronunciationComment: f.pronunciationComment ?? undefined,
          grammarComment: f.grammarComment ?? undefined,
          improvementSuggestion: f.improvementSuggestion ?? undefined,
        }))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch feedbacks";
      setError(msg);
      console.error("Failed to fetch feedbacks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFeedback = useCallback(
    async (payload: feedbackService.MentorFeedbackPayload) => {
      setError(null);
      try {
        const created = await feedbackService.createMentorFeedback(payload);
        setFeedbacks((prev) => {
          if (currentMentorId === created.mentorId) {
            return [
              ...prev,
              {
                id: created.id,
                mentorId: created.mentorId,
                learnerId: created.learnerId,
                sessionId: created.sessionId ?? undefined,
                rating: created.rating ?? undefined,
                pronunciationComment: created.pronunciationComment ?? undefined,
                grammarComment: created.grammarComment ?? undefined,
                improvementSuggestion: created.improvementSuggestion ?? undefined,
              },
            ];
          }
          return prev;
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create feedback";
        setError(msg);
        throw err;
      }
    },
    [currentMentorId]
  );

  const updateFeedback = useCallback(
    async (id: number, payload: feedbackService.MentorFeedbackPayload) => {
      setError(null);
      try {
        const updated = await feedbackService.updateMentorFeedback(id, payload);
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  id: updated.id,
                  mentorId: updated.mentorId,
                  learnerId: updated.learnerId,
                  sessionId: updated.sessionId ?? undefined,
                  rating: updated.rating ?? undefined,
                  pronunciationComment: updated.pronunciationComment ?? undefined,
                  grammarComment: updated.grammarComment ?? undefined,
                  improvementSuggestion: updated.improvementSuggestion ?? undefined,
                }
              : f
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update feedback";
        setError(msg);
        throw err;
      }
    },
    []
  );

  const deleteFeedback = useCallback(async (id: number) => {
    setError(null);
    try {
      await feedbackService.deleteMentorFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete feedback";
      setError(msg);
      throw err;
    }
  }, []);

  const value: FeedbackContextType = {
    feedbacks,
    loading,
    error,
    fetchFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
