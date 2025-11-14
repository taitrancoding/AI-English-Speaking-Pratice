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
@Table(name = "mentor_feedbacks")
public class MentorFeedback extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "mentor_id", nullable = false)
  private Mentor mentor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id")
  private AiPracticeSession session;

  @Lob
  private String pronunciationComment;

  @Lob
  private String grammarComment;

  private Float rating;

  @Lob
  private String improvementSuggestion;
}
