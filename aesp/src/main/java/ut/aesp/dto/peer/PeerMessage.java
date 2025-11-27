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
public class PeerMessage {
  private Long sessionId;
  private Long senderId;
  private String senderName;
  private String content;
  private String type; // message, ai-feedback, system
  private LocalDateTime timestamp = LocalDateTime.now();
}


