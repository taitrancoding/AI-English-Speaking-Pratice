package ut.aesp.dto.feedback;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorFeedbackRequest {
  private Long mentorId;
  private Long learnerId;
  private Long sessionId;
  private String pronunciationComment;
  private String grammarComment;
  private Float rating;
  private String improvementSuggestion;
}
