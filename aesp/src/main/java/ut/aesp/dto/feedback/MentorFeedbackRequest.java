package ut.aesp.dto.feedback;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorFeedbackRequest {
  private Long mentorId;
  private Long learnerId;
  private Long sessionId;
  private String pronunciationComment;
  private String grammarComment;
  private Float rating;
  private String improvementSuggestion;
}
