package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ut.aesp.dto.report.ProgressReportRequest;
import ut.aesp.dto.report.ProgressReportResponse;

public interface IProgressReportService {
  ProgressReportResponse create(ProgressReportRequest payload);

  ProgressReportResponse get(Long id);

  ProgressReportResponse update(Long id, ProgressReportRequest payload);

  void delete(Long id);

  Page<ProgressReportResponse> listByLearner(Long learnerId, Pageable pageable);
}
