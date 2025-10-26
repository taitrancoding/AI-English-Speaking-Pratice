package ut.aesp.dto.session;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiPracticeSessionRequest {
  private Long learnerId;
  private String topic;
  private String scenario;
  private Integer durationMinutes;
  private String audioUrl;
}
