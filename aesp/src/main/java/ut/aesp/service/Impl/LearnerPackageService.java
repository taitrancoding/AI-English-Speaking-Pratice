package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.dto.LearnerPackage.LearnerPackageUpdate;
import ut.aesp.enums.PaymentStatus;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.LearnerPackageMapper;
import ut.aesp.model.LearnerPackage;
import ut.aesp.repository.LearnerPackageRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.PackageRepository;
import ut.aesp.service.ILearnerPackageService;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class LearnerPackageService implements ILearnerPackageService {

  private final LearnerPackageRepository repo;
  private final LearnerPackageMapper mapper;
  private final LearnerProfileRepository learnerProfileRepository;
  private final PackageRepository packageRepository;

  public LearnerPackageService(LearnerPackageRepository repo,
      LearnerPackageMapper mapper,
      LearnerProfileRepository learnerProfileRepository,
      PackageRepository packageRepository) {
    this.repo = repo;
    this.mapper = mapper;
    this.learnerProfileRepository = learnerProfileRepository;
    this.packageRepository = packageRepository;
  }

  @Override
  public LearnerPackageResponse purchase(LearnerPackageRequest payload, Long loggedUserId) {
    var learner = learnerProfileRepository.findByUserId(loggedUserId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", loggedUserId));

    var pkg = packageRepository.findById(payload.getPackageId())
        .orElseThrow(() -> new ResourceNotFoundException("Package", "id", payload.getPackageId()));

    var lp = mapper.toEntity(payload);
    lp.setLearner(learner);
    lp.setPackageEntity(pkg);
    lp.setPurchaseDate(LocalDateTime.now());
    lp.setPriceAtPurchase(pkg.getPrice());
    lp.setExpireDate(LocalDateTime.now().plusMonths(1)); // Tạm định 1 tháng
    lp.setPaymentStatus(PaymentStatus.PENDING);

    return mapper.toResponse(repo.save(lp));
  }

  @Override
  public LearnerPackageResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
  }

  @Override
  public LearnerPackageResponse update(Long id, LearnerPackageUpdate payload) {
    LearnerPackage entity = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
    if (payload.getExpireDate() != null) {
      entity.setExpireDate(LocalDateTime.parse(payload.getExpireDate()));
    }
    if (payload.getPriceAtPurchase() != null) {
      entity.setPriceAtPurchase(new java.math.BigDecimal(payload.getPriceAtPurchase()));
    }
    if (payload.getPaymentStatus() != null) {
      try {
        entity.setPaymentStatus(
            ut.aesp.enums.PaymentStatus.valueOf(payload.getPaymentStatus().toUpperCase()));
      } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid payment status: " + payload.getPaymentStatus());
      }
    }

    LearnerPackage updated = repo.save(entity);
    return mapper.toResponse(updated);
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

  @Override
  public Page<LearnerPackageResponse> listByUser(Long userId, Pageable pageable) {
    // tim LearnerProfile theo userId
    var learner = learnerProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "userId", userId));
    
    // dung learnerId de tim LearnerPackage
    var learnerPackages = repo.findAllByLearnerId(learner.getId(), pageable);
    return learnerPackages.map(mapper::toResponse);
  }
}