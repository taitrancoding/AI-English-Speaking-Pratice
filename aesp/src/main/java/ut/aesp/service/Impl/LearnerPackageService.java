package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.dto.LearnerPackage.LearnerPackageUpdate;
import ut.aesp.dto.mentor.MentorLearnerSummaryResponse;
import ut.aesp.enums.PaymentStatus;
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

  private final LearnerPackageRepository repo;
  private final LearnerPackageMapper mapper;
  private final LearnerProfileRepository learnerProfileRepository;
  private final PackageRepository packageRepository;

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
    // Set expire date based on package duration
    if (pkg.getDurationDays() != null && pkg.getDurationDays() > 0) {
      lp.setExpireDate(LocalDateTime.now().plusDays(pkg.getDurationDays()));
    } else {
      lp.setExpireDate(LocalDateTime.now().plusMonths(1)); // Default 1 month
    }
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
            PaymentStatus.valueOf(payload.getPaymentStatus().toUpperCase()));
      } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid payment status: " + payload.getPaymentStatus(), e);
      }
    }

    LearnerPackage updated = repo.save(entity);
    return mapper.toResponse(updated);
  }

  @Override
  public Page<MentorLearnerSummaryResponse> listByMentor(Long mentorId, Pageable pageable) {
    return repo.findDistinctByPackageEntity_Mentors_Id(mentorId, pageable)
        .map(this::toMentorLearnerSummary);
  }

  private MentorLearnerSummaryResponse toMentorLearnerSummary(LearnerPackage entity) {
    MentorLearnerSummaryResponse summary = new MentorLearnerSummaryResponse();
    if (entity.getLearner() != null) {
      summary.setLearnerId(entity.getLearner().getId());
      if (entity.getLearner().getUser() != null) {
        summary.setLearnerName(entity.getLearner().getUser().getName());
        summary.setLearnerEmail(entity.getLearner().getUser().getEmail());
      } else {
        summary.setLearnerName(entity.getLearner().getName());
      }
    }
    if (entity.getPackageEntity() != null) {
      summary.setPackageId(entity.getPackageEntity().getId());
      summary.setPackageName(entity.getPackageEntity().getName());
      summary.setPackageDescription(entity.getPackageEntity().getDescription());
    }
    summary.setPurchaseDate(entity.getPurchaseDate());
    summary.setExpireDate(entity.getExpireDate());
    summary.setPaymentStatus(
        entity.getPaymentStatus() != null ? entity.getPaymentStatus().name() : null);
    return summary;
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
  public Page<LearnerPackageResponse> listByLearner(Long learnerId, Pageable pageable) {
    var learnerPackages = repo.findAllByLearnerId(learnerId, pageable);
    return learnerPackages.map(mapper::toResponse);
  }

  @Override
  public Page<LearnerPackageResponse> listByUserId(Long userId, Pageable pageable) {
    var learner = learnerProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "userId", userId));
    var learnerPackages = repo.findAllByLearnerId(learner.getId(), pageable);
    return learnerPackages.map(mapper::toResponse);
  }

  @Override
  public LearnerPackageResponse approve(Long id) {
    LearnerPackage entity = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
    entity.setPaymentStatus(PaymentStatus.COMPLETED);
    LearnerPackage updated = repo.save(entity);
    return mapper.toResponse(updated);
  }

  @Override
  public LearnerPackageResponse reject(Long id) {
    LearnerPackage entity = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerPackage", "id", id));
    entity.setPaymentStatus(PaymentStatus.FAILED);
    LearnerPackage updated = repo.save(entity);
    return mapper.toResponse(updated);
  }

}
