package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorFeedbackResponse {
  private Long id;
  private Long learnerId;
  private String learnerName;
  private Long mentorId;
  private String mentorName;
  private Long practiceSessionId;
  private String pronunciationErrors;
  private String grammarErrors;
  private String vocabularyIssues;
  private String clarityGuidance;
  private String conversationTopics;
  private String vocabularySuggestions;
  private String nativeSpeakerTips;
  private String overallFeedback;
  private LocalDateTime feedbackDate;
  private Boolean isImmediate;
}


