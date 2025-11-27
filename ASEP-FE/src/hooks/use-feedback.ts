import { useContext } from "react";
import { FeedbackContext } from "@/contexts/FeedbackContextType";

export function useFeedbackContext() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedbackContext must be used inside FeedbackProvider");
  return context;
}
