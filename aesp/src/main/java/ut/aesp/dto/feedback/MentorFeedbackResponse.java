package ut.aesp.dto.feedback;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorFeedbackResponse {
  private Long id;
  private Long mentorId;
  private Long learnerId;
  private Long sessionId;
  private Float rating;
  private String pronunciationComment;
  private String grammarComment;
  private String improvementSuggestion;
}
