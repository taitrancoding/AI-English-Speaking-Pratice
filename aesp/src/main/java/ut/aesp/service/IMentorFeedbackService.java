package ut.aesp.service;

import ut.aesp.dto.mentor.MentorFeedbackRequest;
import ut.aesp.dto.mentor.MentorFeedbackResponse;

import java.util.List;

public interface IMentorFeedbackService {
  MentorFeedbackResponse createFeedback(Long mentorId, MentorFeedbackRequest request);
  
  MentorFeedbackResponse getFeedback(Long id);
  
  List<MentorFeedbackResponse> getFeedbacksByLearner(Long learnerId);
  
  List<MentorFeedbackResponse> getFeedbacksByMentor(Long mentorId);
  
  List<MentorFeedbackResponse> getImmediateFeedbacks(Long learnerId);
}
