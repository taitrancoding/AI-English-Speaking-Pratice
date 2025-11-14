package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "progress_reports")
public class ProgressReport extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  private LocalDate weekStart;
  private LocalDate weekEnd;
  private Integer totalSessions;
  private Float avgPronunciation;
  private Float avgGrammar;
  private Float avgVocabulary;
  private LocalDateTime generatedAt;

  @Lob
  private String improvementNotes;
}
