package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Audited
@Entity
@Table(name = "peer_practice_sessions")
public class PeerPracticeSession extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner1_id", nullable = false)
  private LearnerProfile learner1;

  @ManyToOne
  @JoinColumn(name = "learner2_id")
  private LearnerProfile learner2;

  private String topic;
  private String scenario;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private Integer durationMinutes;

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private SessionStatus status = SessionStatus.ACTIVE; // ACTIVE, COMPLETED, CANCELLED

  @Lob
  private String aiFeedback;

  public enum SessionStatus {
    ACTIVE,
    COMPLETED,
    CANCELLED
  }
}
