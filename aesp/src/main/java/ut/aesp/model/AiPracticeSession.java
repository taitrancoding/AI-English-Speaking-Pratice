package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_practice_sessions")
public class AiPracticeSession extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  private String topic;
  private String scenario;
  private Integer durationMinutes;

  private Float pronunciationScore;
  private Float grammarScore;
  private Float vocabularyScore;

  @Lob
  private String aiFeedback;

  @Column(nullable = true, length = 500)
  private String audioUrl;

  private String aiVersion;
}
