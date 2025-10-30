package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.reportt.ProgressReportRequest;
import ut.aesp.dto.reportt.ProgressReportResponse;
import ut.aesp.model.ProgressReport;

@Mapper(componentModel = "spring")
public interface ProgressReportMapper {
  @Mapping(target = "learner.id", source = "learnerId")
  ProgressReport toEntity(ProgressReportRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  ProgressReportResponse toResponse(ProgressReport entity);
}
