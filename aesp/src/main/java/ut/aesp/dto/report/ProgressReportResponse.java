package ut.aesp.dto.report;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProgressReportResponse {
  private Long id;
  private Long learnerId;
  private LocalDate weekStart;
  private LocalDate weekEnd;
  private Integer totalSessions;
  private Float avgPronunciation;
  private Float avgGrammar;
  private Float avgVocabulary;
  private LocalDateTime generatedAt;
  private String improvementNotes;
}
