package ut.aesp.dto.peer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PeerPracticeResponse {
  private Long id;
  private Long learner1Id;
  private String learner1Name;
  private Long learner2Id;
  private String learner2Name;
  private String topic;
  private String scenario;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private Integer durationMinutes;
  private String status;
  private String aiFeedback;
  private String websocketUrl; // WebSocket endpoint for this session
}


