package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
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
import org.springframework.security.core.Authentication;
import ut.aesp.model.User;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class FeedbackCommentService implements IFeedbackCommentService {

  private final FeedbackCommentRepository repo;
  private final FeedbackCommentMapper mapper;
  private final UserRepository userRepository;

  @Override
  public FeedbackCommentResponse create(FeedbackCommentRequest dto) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName();

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    FeedbackComment feedback = new FeedbackComment();
    feedback.setUser(user);
    feedback.setContent(dto.getContent());
    feedback.setTargetType(dto.getTargetType());
    feedback.setTargetId(dto.getTargetId());
    feedback.setRating(dto.getRating());
    feedback.setCreatedAt(LocalDateTime.now());

    repo.save(feedback);

    return mapper.toResponse(feedback);
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
  public FeedbackCommentResponse update(Long id, FeedbackCommentRequest payload) {
    FeedbackComment entity = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Feedback comment not found"));

    mapper.updateEntityFromDto(payload, entity);
    repo.save(entity);

    return mapper.toResponse(entity);
  }

  @Override
  public Page<FeedbackCommentResponse> listByUser(Long userId, Pageable pageable) {
    var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    return repo.findAllByUser(user, pageable).map(mapper::toResponse);
  }

  @Override
  public Page<FeedbackCommentResponse> getAll(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }
}
