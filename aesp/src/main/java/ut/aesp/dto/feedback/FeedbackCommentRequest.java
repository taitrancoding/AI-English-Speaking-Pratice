package ut.aesp.dto.feedback;

import lombok.Getter;
import lombok.Setter;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackCommentRequest {
  private String content;
  private String userName;
  private String targetType;
  private Integer targetId;
  private Integer rating;
}
