package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;

public interface ILearnerPackageService {
  LearnerPackageResponse purchase(LearnerPackageRequest payload);

  LearnerPackageResponse get(Long id);

  void cancel(Long id);

  Page<LearnerPackageResponse> list(Pageable pageable);

}
