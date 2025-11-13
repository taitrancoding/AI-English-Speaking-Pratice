package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.feedback.MentorFeedbackRequest;
import ut.aesp.dto.feedback.MentorFeedbackResponse;

public interface IMentorFeedbackService {
  MentorFeedbackResponse create(MentorFeedbackRequest payload);

  MentorFeedbackResponse get(Long id);

  void delete(Long id);

  MentorFeedbackResponse update(Long id, MentorFeedbackRequest request);

  Page<MentorFeedbackResponse> listByMentor(Long mentorId, Pageable pageable);
}
