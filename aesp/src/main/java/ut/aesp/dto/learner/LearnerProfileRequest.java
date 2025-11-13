package ut.aesp.dto.learner;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearnerProfileRequest {

  @NotNull(message = "User ID is required.")
  private Long userId;

  private EnglishLevel englishLevel; // BEGINNER | INTERMEDIATE | ADVANCED

  private String name;

  private Float aiScore;

  private Float pronunciationScore;

  private Integer totalPracticeMinutes;

  @Size(max = 500, message = "Goals must be less than 500 characters.")
  private String goals;

  @Size(max = 500, message = "Preferences must be less than 500 characters.")
  private String preferences;
}
