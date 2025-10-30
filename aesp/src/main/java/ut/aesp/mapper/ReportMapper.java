package ut.aesp.mapper;

import ut.aesp.dto.report.ReportRequest;
import ut.aesp.model.Report;
import ut.aesp.dto.report.ReportResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReportMapper {
  @Mapping(target = "admin.id", source = "adminId")
  Report toEntity(ReportRequest dto);

  @Mapping(target = "adminId", source = "admin.id")
  ReportResponse toResponse(Report entity);

}
