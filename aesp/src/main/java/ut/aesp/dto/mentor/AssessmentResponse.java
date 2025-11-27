package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResponse {
  private Long id;
  private Long learnerId;
  private String learnerName;
  private Long mentorId;
  private String mentorName;
  private EnglishLevel assessedLevel;
  private Integer speakingScore;
  private Integer listeningScore;
  private Integer readingScore;
  private Integer writingScore;
  private String strengths;
  private String weaknesses;
  private String recommendations;
  private LocalDateTime assessmentDate;
  private LocalDateTime nextAssessmentDate;
}


