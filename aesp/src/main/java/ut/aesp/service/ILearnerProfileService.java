package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.learner.LearnerProfileRequest;
import ut.aesp.dto.learner.LearnerProfileResponse;

public interface ILearnerProfileService {
  LearnerProfileResponse create(LearnerProfileRequest payload);

  LearnerProfileResponse getById(Long id);

  LearnerProfileResponse update(Long id, LearnerProfileRequest payload);

  void delete(Long id);

  Page<LearnerProfileResponse> listAll(Pageable pageable);
}
