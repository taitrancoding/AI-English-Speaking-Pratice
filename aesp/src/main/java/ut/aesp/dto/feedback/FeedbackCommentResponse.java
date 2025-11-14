package ut.aesp.dto.feedback;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackCommentResponse {
  private Long id;
  private Long userId;
  private String userName;
  private String content;
  private String targetType;
  private Integer targetId;
  private Integer rating;
}
