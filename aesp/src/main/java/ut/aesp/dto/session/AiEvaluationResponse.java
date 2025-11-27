package ut.aesp.dto.session;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiEvaluationResponse {
  private String transcript;
  private String feedback;
  private Integer score;
  private Rubric rubric;
  private String ttsAudioBase64;
  private Long practiceSessionId;
  private List<String> suggestedFocus;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Rubric {
    private Double pronunciation;
    private Double fluency;
    private Double grammar;
    private Double vocabulary;
  }
}

