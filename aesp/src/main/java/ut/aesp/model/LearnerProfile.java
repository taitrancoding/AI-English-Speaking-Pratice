package ut.aesp.model;

import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Audited
@Entity
@Table(name = "learner_profiles")
public class LearnerProfile extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  private String englishLevel; // beginner | intermediate | advanced

  @Lob
  private String goals;

  @Lob
  private String preferences;

  private Float aiScore;
  private Float pronunciationScore;
  private Integer totalPracticeMinutes = 0;
}
