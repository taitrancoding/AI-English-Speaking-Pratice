package ut.aesp.dto.learner;

import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
public class LearnerProfileReponse {
  private Long id;
  private Long userId;
  private String name;
  private EnglishLevel englishLevel;
  private String goals;
  private String preferences;
  private Float aiScore;
  private Float pronunciationScore;
  private Integer totalPracticeMinutes;
}
