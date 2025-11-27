package ut.aesp.dto.peer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PeerPracticeRequest {
  private String topic;
  private String scenario;
  private String preferredLevel; // BEGINNER, INTERMEDIATE, ADVANCED
  private Boolean enableAiFeedback = true;
}


