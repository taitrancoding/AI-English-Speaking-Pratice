package ut.aesp.dto.report;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportResponse {
  private Long id;
  private Long adminId;
  private String reportType;
  private String fileUrl;
  private String dataSummary;
  private LocalDateTime generatedAt;
}
