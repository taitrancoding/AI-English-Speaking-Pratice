package ut.aesp.dto.learner;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
public class LearnerProfileUpdate {
  private EnglishLevel englishLevel;

  @Size(max = 500, message = "Goals must be less than 500 characters.")
  private String goals;

  @Size(max = 500, message = "Preferences must be less than 500 characters.")
  private String preferences;
}
