package ut.aesp.dto.policy;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class SystemPolicyResponse {
  private Long id;
  private String title;
  private String content;
  private LocalDateTime createdAt;

}
