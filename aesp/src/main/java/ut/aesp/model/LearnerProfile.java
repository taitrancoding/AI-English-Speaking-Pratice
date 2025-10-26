package ut.aesp.model;

import org.apache.logging.log4j.util.EnglishEnums;
import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

  @Enumerated(EnumType.STRING)
  private EnglishLevel englishLevel = EnglishLevel.BEGINNER; // beginner | intermediate | advanced

  @Lob
  private String goals;

  @Lob
  private String preferences;

  private Float aiScore;
  private Float pronunciationScore;
  private Integer totalPracticeMinutes = 0;
}
