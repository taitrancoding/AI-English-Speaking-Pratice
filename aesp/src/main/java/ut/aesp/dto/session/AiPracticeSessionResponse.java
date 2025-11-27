package ut.aesp.dto.session;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AiPracticeSessionResponse {
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
  private String audioUrl;
  private LocalDateTime createdAt;
}
