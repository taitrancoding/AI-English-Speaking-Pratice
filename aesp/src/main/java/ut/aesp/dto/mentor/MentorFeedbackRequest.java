package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorFeedbackRequest {
  private Long learnerId;
  private Long practiceSessionId; // Optional
  private String pronunciationErrors;
  private String grammarErrors;
  private String vocabularyIssues;
  private String clarityGuidance;
  private String conversationTopics;
  private String vocabularySuggestions;
  private String nativeSpeakerTips;
  private String overallFeedback;
  private Boolean isImmediate = true;
}


