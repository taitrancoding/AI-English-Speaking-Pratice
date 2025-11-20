package ut.aesp.dto.learner;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
public class LearnerProfileUpdate {
  private EnglishLevel englishLevel;

  private String name;

  private Float aiScore;
  private Float pronunciationScore;
  private Integer totalPracticeMinutes;

  @Size(max = 500, message = "Goals must be less than 500 characters.")
  private String goals;

  @Size(max = 500, message = "Preferences must be less than 500 characters.")
  private String preferences;

 
  public EnglishLevel getEnglishLevel() {
    return this.englishLevel;
  }

  public String getGoals() {
    return this.goals;
  }

  public String getPreferences() {
    return this.preferences;
  }

  public String getName() {
    return this.name;
  }

  public Float getAiScore() {
    return this.aiScore;
  }

  public Float getPronunciationScore() {
    return this.pronunciationScore;
  }

  public Integer getTotalPracticeMinutes() {
    return this.totalPracticeMinutes;
  }
}