package ut.aesp.service;

import org.springframework.data.domain.Page;
import ut.aesp.dto.session.AiEvaluationRequest;
import ut.aesp.dto.session.AiEvaluationResponse;
import ut.aesp.dto.session.AiPracticeSessionRequest;
import ut.aesp.dto.session.AiPracticeSessionResponse;

public interface IAiService {
  AiPracticeSessionResponse generateAndSaveSession(AiPracticeSessionRequest request);

  Page<AiPracticeSessionResponse> getSessionsForCurrentUser(int page, int size);

  AiEvaluationResponse evaluateSpeech(AiEvaluationRequest request);
}
