package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.report.ReportRequest;
import ut.aesp.dto.report.ReportResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.ReportMapper;
import ut.aesp.model.Report;
import ut.aesp.repository.ReportRepository;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.IReportService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ReportService implements IReportService {

  ReportRepository repo;
  ReportMapper mapper;
  UserRepository userRepository;

  @Override
  public ReportResponse create(ReportRequest payload) {
    var admin = userRepository.findById(payload.getAdminId())
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", payload.getAdminId()));
    Report r = mapper.toEntity(payload);
    r.setAdmin(admin);
    r.setGeneratedAt(java.time.LocalDateTime.now());
    var saved = repo.save(r);
    return mapper.toResponse(saved);
  }

  @Override
  public ReportResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
  }

  @Override
  public Page<ReportResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }
}
