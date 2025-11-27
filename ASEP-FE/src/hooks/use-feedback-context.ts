import { useContext } from "react";
import { FeedbackContext, FeedbackContextType } from "@/contexts/FeedbackContextType";

export function useFeedbackContext(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedbackContext must be used within a FeedbackProvider");
  }
  return context;
}
