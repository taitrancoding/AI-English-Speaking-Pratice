package ut.aesp.dto.session;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiEvaluationRequest {
  private Long learnerId;
  private String topic;
  private String scenario;
  private String targetLevel;
  private String speechText;
}


