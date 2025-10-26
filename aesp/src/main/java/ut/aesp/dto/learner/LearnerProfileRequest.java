package ut.aesp.dto.learner;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
public class LearnerProfileRequest {

  @NotNull(message = "User ID is required.")
  private Long userId;

  private EnglishLevel englishLevel; // BEGINNER | INTERMEDIATE | ADVANCED

  @Size(max = 500, message = "Goals must be less than 500 characters.")
  private String goals;

  @Size(max = 500, message = "Preferences must be less than 500 characters.")
  private String preferences;
}
