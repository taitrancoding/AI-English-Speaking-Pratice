package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.session.AiPracticeSessionRequest;
import ut.aesp.dto.session.AiPracticeSessionResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.AiPracticeSessionMapper;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.repository.AiPracticeSessionRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.service.IAiPracticeSessionService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class AiPracticeSessionService implements IAiPracticeSessionService {

  private final AiPracticeSessionRepository repo;
  private final AiPracticeSessionMapper mapper;
  private final LearnerProfileRepository learnerProfileRepository;

  @Override
  public AiPracticeSessionResponse create(AiPracticeSessionRequest payload) {
    var learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id",
            payload.getLearnerId()));
    AiPracticeSession s = mapper.toEntity(payload);
    s.setLearner(learner);
    var saved = repo.save(s);
    return mapper.toResponse(saved);
  }

  @Override
  public AiPracticeSessionResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id",
            id));
  }

  @Override
  public AiPracticeSessionResponse updateScores(Long id,
      AiPracticeSessionRequest payload) {
    AiPracticeSession s = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id",
            id));
    if (payload.getDurationMinutes() != null)
      s.setDurationMinutes(payload.getDurationMinutes());
    if (payload.getAudioUrl() != null)
      s.setAudioUrl(payload.getAudioUrl());
    if (payload.getAiVersion() != null)
      s.setAiVersion(payload.getAiVersion());

    var updated = repo.save(s);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    var s = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id", id));
    repo.delete(s);
  }

  @Override
  public Page<AiPracticeSessionResponse> listByLearner(Long learnerId, Pageable pageable) {
    var learner = learnerProfileRepository.findById(learnerId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id",
            learnerId));
    return repo.findAllByLearner(learner, pageable).map(mapper::toResponse);
  }
}
