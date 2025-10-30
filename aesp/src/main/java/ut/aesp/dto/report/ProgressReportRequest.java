package ut.aesp.dto.report;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProgressReportRequest {
  private Long learnerId;
  private LocalDate weekStart;
  private LocalDate weekEnd;
  private Integer totalSessions;
  private Float avgPronunciation;
  private Float avgGrammar;
  private Float avgVocabulary;
  private String improvementNotes;
}
