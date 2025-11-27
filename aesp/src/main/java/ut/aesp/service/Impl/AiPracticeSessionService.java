package ut.aesp.service.Impl;

import org.springframework.stereotype.Service;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.repository.AiPracticeSessionRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AiPracticeSessionService {

  private final AiPracticeSessionRepository repository;

  public AiPracticeSessionService(AiPracticeSessionRepository repository) {
    this.repository = repository;
  }

  public AiPracticeSession save(AiPracticeSession session) {
    return repository.save(session);
  }

  public List<AiPracticeSession> findAll() {
    return repository.findAll();
  }

  public Optional<AiPracticeSession> findById(Long id) {
    return repository.findById(id);
  }

  public List<AiPracticeSession> findByLearner(Long learnerId) {
    return repository.findAllByLearnerId(learnerId);
  }
}
