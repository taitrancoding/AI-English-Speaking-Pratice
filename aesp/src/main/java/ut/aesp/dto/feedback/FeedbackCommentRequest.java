package ut.aesp.dto.feedback;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackCommentRequest {
  private Long userId;
  private String content;
  private String targetType;
  private Integer targetId;
  private Integer rating;
}
