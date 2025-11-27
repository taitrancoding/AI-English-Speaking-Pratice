import { createContext } from "react";
import type { MentorFeedbackPayload } from "@/lib/services/feedback";

export type Feedback = {
  id: number;
  mentorId: number;
  learnerId: number;
  sessionId?: number;
  rating?: number;
  pronunciationComment?: string;
  grammarComment?: string;
  improvementSuggestion?: string;
};

export type FeedbackContextType = {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  fetchFeedbacks: (mentorId: number, page?: number, size?: number) => Promise<void>;
  createFeedback: (payload: MentorFeedbackPayload) => Promise<void>;
  updateFeedback: (id: number, payload: MentorFeedbackPayload) => Promise<void>;
  deleteFeedback: (id: number) => Promise<void>;
};

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);
