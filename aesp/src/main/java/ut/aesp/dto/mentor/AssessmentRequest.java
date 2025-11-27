package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentRequest {
  private Long learnerId;
  private EnglishLevel assessedLevel;
  private Integer speakingScore;
  private Integer listeningScore;
  private Integer readingScore;
  private Integer writingScore;
  private String strengths;
  private String weaknesses;
  private String recommendations;
}


