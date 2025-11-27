package ut.aesp.service;

import ut.aesp.dto.mentor.MentorResourceRequest;
import ut.aesp.dto.mentor.MentorResourceResponse;
import ut.aesp.enums.EnglishLevel;

import java.util.List;

public interface IMentorResourceService {
  MentorResourceResponse createResource(Long mentorId, MentorResourceRequest request);
  
  MentorResourceResponse getResource(Long id);
  
  List<MentorResourceResponse> getResourcesByMentor(Long mentorId);
  
  List<MentorResourceResponse> getPublicResources();
  
  List<MentorResourceResponse> getResourcesByCategoryAndLevel(String category, EnglishLevel level);
  
  void deleteResource(Long id, Long mentorId);
}
