package ut.aesp.dto.session;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiPracticeSessionRequest {
  private Long learnerId;
  private String topic;
  private String scenario;
  private Integer durationMinutes;
  private String audioUrl;
  private String aiVersion;
}
