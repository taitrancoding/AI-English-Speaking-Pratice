package ut.aesp.dto.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
  private Long adminId;
  private String fileUrl;
  private String reportType;
  private String dataSummary;
}
