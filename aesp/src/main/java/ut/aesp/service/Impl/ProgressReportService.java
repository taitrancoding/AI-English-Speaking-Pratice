package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.aesp.dto.report.ProgressReportRequest;
import ut.aesp.dto.report.ProgressReportResponse;
import ut.aesp.repository.ProgressReportRepository;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.ProgressReportMapper;
import ut.aesp.model.ProgressReport;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.service.IProgressReportService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ProgressReportService implements IProgressReportService {

  ProgressReportRepository repo;
  ProgressReportMapper mapper;
  LearnerProfileRepository learnerProfileRepository;

  @Override
  public ProgressReportResponse create(ProgressReportRequest payload) {
    var learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", payload.getLearnerId()));
    ProgressReport pr = mapper.toEntity(payload);
    pr.setLearner(learner);
    pr.setGeneratedAt(java.time.LocalDateTime.now());
    var saved = repo.save(pr);
    return mapper.toResponse(saved);
  }

  @Override
  public ProgressReportResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("ProgressReport", "id", id));
  }

  @Override
  public ProgressReportResponse update(Long id, ProgressReportRequest payload) {
    ProgressReport report = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("ProgressReport", "id", id));

    var learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", payload.getLearnerId()));

    report.setLearner(learner);
    report.setWeekStart(payload.getWeekStart());
    report.setWeekEnd(payload.getWeekEnd());
    report.setTotalSessions(payload.getTotalSessions());
    report.setAvgPronunciation(payload.getAvgPronunciation());
    report.setAvgGrammar(payload.getAvgGrammar());
    report.setAvgVocabulary(payload.getAvgVocabulary());
    report.setImprovementNotes(payload.getImprovementNotes());

    var updated = repo.save(report);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    ProgressReport report = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("ProgressReport", "id", id));
    repo.delete(report);
  }

  @Override
  public Page<ProgressReportResponse> listByLearner(Long learnerId, Pageable pageable) {
    var learner = learnerProfileRepository.findById(learnerId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", learnerId));
    return repo.findAllByLearner(learner, pageable).map(mapper::toResponse);
  }

  @Override
  public Page<ProgressReportResponse> listByUser(Long userId, Pageable pageable) {
    var learner = learnerProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "userId", userId));
    return repo.findAllByLearner(learner, pageable).map(mapper::toResponse);
  }
}
