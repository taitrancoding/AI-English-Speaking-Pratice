package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.learner.LearnerProfileRequest;
import ut.aesp.dto.learner.LearnerProfileResponse;
import ut.aesp.dto.learner.LearnerProfileUpdate;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.LearnerProfileMapper;
import ut.aesp.model.LearnerProfile;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.ILearnerProfileService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class LearnerProfileService implements ILearnerProfileService {

  private final LearnerProfileRepository repo;
  private final LearnerProfileMapper mapper;
  private final UserRepository userRepository;

  @Override
  public LearnerProfileResponse create(LearnerProfileRequest payload) {

    var user = userRepository.findById(payload.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", payload.getUserId()));
    LearnerProfile entity = mapper.toEntity(payload);
    entity.setUser(user);
    var saved = repo.save(entity);
    return mapper.toResponse(saved);
  }

  @Override
  public LearnerProfileResponse getById(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", id));
  }

  @Override
  public LearnerProfileResponse update(Long id, LearnerProfileUpdate payload) {
    var entity = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", id));
    if (payload.getEnglishLevel() != null)
      entity.setEnglishLevel(payload.getEnglishLevel());
    if (payload.getGoals() != null)
      entity.setGoals(payload.getGoals());
    if (payload.getPreferences() != null)
      entity.setPreferences(payload.getPreferences());
    if (payload.getName() != null)
      entity.setName(payload.getName());
    if (payload.getAiScore() != null)
      entity.setAiScore(payload.getAiScore());
    if (payload.getPronunciationScore() != null)
      entity.setPronunciationScore(payload.getPronunciationScore());
    if (payload.getTotalPracticeMinutes() != null)
      entity.setTotalPracticeMinutes(payload.getTotalPracticeMinutes());

    var updated = repo.save(entity);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    var entity = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", id));
    repo.delete(entity);
  }

  @Override
  public Page<LearnerProfileResponse> getAll(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }

  @Override
  public LearnerProfileResponse getByUserId(Long userId) {
    return repo.findByUserId(userId)
        .map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "userId", userId));
  }

  @Override
  public LearnerProfileResponse updateByUserId(Long userId, LearnerProfileUpdate payload) {
    var entity = repo.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "userId", userId));

    // Only update provided fields, preserve others
    if (payload.getEnglishLevel() != null)
      entity.setEnglishLevel(payload.getEnglishLevel());
    if (payload.getGoals() != null)
      entity.setGoals(payload.getGoals());
    if (payload.getPreferences() != null)
      entity.setPreferences(payload.getPreferences());
    // Preserve other fields like aiScore, pronunciationScore, totalPracticeMinutes

    var saved = repo.save(entity);
    return mapper.toResponse(saved);
  }

}
