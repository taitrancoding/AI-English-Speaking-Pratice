package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.LearnerPackageMapper;
import ut.aesp.model.LearnerPackage;
import ut.aesp.repository.LearnerPackageRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.PackageRepository;
import ut.aesp.service.ILearnerPackageService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class LearnerPackageService implements ILearnerPackageService {

  LearnerPackageRepository repo;
  LearnerPackageMapper mapper;
  LearnerProfileRepository learnerProfileRepository;
  PackageRepository packageRepository;

  @Override
  public LearnerPackageResponse purchase(LearnerPackageRequest payload) {
    var learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", payload.getLearnerId()));
    var pkg = packageRepository.findById(payload.getPackageId())
        .orElseThrow(() -> new ResourceNotFoundException("Package", "id", payload.getPackageId()));
    LearnerPackage lp = mapper.toEntity(payload);
    lp.setLearner(learner);
    lp.setPackageEntity(pkg);
    var saved = repo.save(lp);
    return mapper.toResponse(saved);
  }

  @Override
  public LearnerPackageResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
  }

  @Override
  public void cancel(Long id) {
    var lp = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
    repo.delete(lp);
  }

  @Override
  public Page<LearnerPackageResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }
}
