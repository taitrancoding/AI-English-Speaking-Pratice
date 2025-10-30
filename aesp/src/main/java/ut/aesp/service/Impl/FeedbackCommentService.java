package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.feedback.FeedbackCommentRequest;
import ut.aesp.dto.feedback.FeedbackCommentResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.FeedbackCommentMapper;
import ut.aesp.model.FeedbackComment;
import ut.aesp.repository.FeedbackCommentRepository;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.IFeedbackCommentService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class FeedbackCommentService implements IFeedbackCommentService {

  FeedbackCommentRepository repo;
  FeedbackCommentMapper mapper;
  UserRepository userRepository;

  @Override
  public FeedbackCommentResponse create(FeedbackCommentRequest payload) {
    var user = userRepository.findById(payload.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", payload.getUserId()));
    FeedbackComment c = mapper.toEntity(payload);
    c.setUser(user);
    var saved = repo.save(c);
    return mapper.toResponse(saved);
  }

  @Override
  public FeedbackCommentResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("FeedbackComment", "id", id));
  }

  @Override
  public void delete(Long id) {
    var c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("FeedbackComment", "id", id));
    repo.delete(c);
  }

  @Override
  public Page<FeedbackCommentResponse> listByUser(Long userId, Pageable pageable) {
    var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    return repo.findAllByUser(user, pageable).map(mapper::toResponse);
  }
}
