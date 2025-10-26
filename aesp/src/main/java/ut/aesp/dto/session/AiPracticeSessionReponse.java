package ut.aesp.dto.session;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiPracticeSessionReponse {
  private Long id;
  private Long learnerId;
  private String topic;
  private String scenario;
  private Integer durationMinutes;
  private Float pronunciationScore;
  private Float grammarScore;
  private Float vocabularyScore;
  private String aiFeedback;
  private String aiVersion;
}
