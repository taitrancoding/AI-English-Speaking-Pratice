package ut.aesp.service;

import ut.aesp.dto.report.ReportRequest;
import ut.aesp.dto.report.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IReportService {
  ReportResponse create(ReportRequest payload);

  ReportResponse get(Long id);

  Page<ReportResponse> list(Pageable pageable);

  void delete(Long id);

  ReportResponse update(Long id, ReportRequest payload);

}
