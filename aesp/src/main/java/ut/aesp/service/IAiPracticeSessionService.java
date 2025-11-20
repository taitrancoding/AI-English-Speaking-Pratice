package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.session.AiPracticeSessionRequest;
import ut.aesp.dto.session.AiPracticeSessionResponse;

public interface IAiPracticeSessionService {
  AiPracticeSessionResponse create(AiPracticeSessionRequest payload);

  AiPracticeSessionResponse get(Long id);

  AiPracticeSessionResponse updateScores(Long id, AiPracticeSessionRequest payload);

  void delete(Long id);

  Page<AiPracticeSessionResponse> listByUser(Long UserId, Pageable pageable);

}
