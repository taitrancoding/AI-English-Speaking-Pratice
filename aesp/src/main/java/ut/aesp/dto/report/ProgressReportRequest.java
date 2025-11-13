package ut.aesp.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
