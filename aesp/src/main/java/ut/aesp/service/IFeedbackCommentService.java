package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.feedback.FeedbackCommentRequest;
import ut.aesp.dto.feedback.FeedbackCommentResponse;

public interface IFeedbackCommentService {
  FeedbackCommentResponse create(FeedbackCommentRequest payload);

  FeedbackCommentResponse get(Long id);

  void delete(Long id);

  FeedbackCommentResponse update(Long id, FeedbackCommentRequest payload);

  Page<FeedbackCommentResponse> listByUser(Long userId, Pageable pageable);
}
