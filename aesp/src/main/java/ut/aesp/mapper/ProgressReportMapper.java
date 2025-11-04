package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ut.aesp.dto.report.ProgressReportRequest;
import ut.aesp.dto.report.ProgressReportResponse;
import ut.aesp.model.ProgressReport;

@Mapper(componentModel = "spring")
public interface ProgressReportMapper {
  @Mapping(target = "learner.id", source = "learnerId")
  ProgressReport toEntity(ProgressReportRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  ProgressReportResponse toResponse(ProgressReport entity);
}
