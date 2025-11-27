package ut.aesp.service;

import ut.aesp.dto.mentor.AssessmentRequest;
import ut.aesp.dto.mentor.AssessmentResponse;

import java.util.List;

public interface IAssessmentService {
  AssessmentResponse createAssessment(Long mentorId, AssessmentRequest request);
  
  AssessmentResponse getAssessment(Long id);
  
  List<AssessmentResponse> getAssessmentsByLearner(Long learnerId);
  
  List<AssessmentResponse> getAssessmentsByMentor(Long mentorId);
  
  AssessmentResponse getLatestAssessment(Long learnerId);
}


