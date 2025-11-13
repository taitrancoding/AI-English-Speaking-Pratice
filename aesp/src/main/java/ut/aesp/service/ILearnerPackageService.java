package ut.aesp.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.dto.LearnerPackage.LearnerPackageUpdate;

public interface ILearnerPackageService {
  LearnerPackageResponse purchase(LearnerPackageRequest payload, Long loggedUserId);

  LearnerPackageResponse get(Long id);

  void cancel(Long id);

  Page<LearnerPackageResponse> list(Pageable pageable);

  LearnerPackageResponse update(Long id, LearnerPackageUpdate payload);

  Page<LearnerPackageResponse> listByLearner(Long learnerId, Pageable pageable);

}
