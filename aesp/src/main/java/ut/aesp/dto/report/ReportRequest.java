package ut.aesp.dto.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequest {
  private Long adminId;
  private String fileUrl;
  private String reportType;
  private String dataSummary;
}
