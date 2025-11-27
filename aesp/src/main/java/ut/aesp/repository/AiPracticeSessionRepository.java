package ut.aesp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.AiPracticeSession;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AiPracticeSessionRepository extends JpaRepository<AiPracticeSession, Long> {
  List<AiPracticeSession> findAllByLearnerId(Long learnerId);
  
  Page<AiPracticeSession> findAllByLearnerIdOrderByCreatedAtDesc(Long learnerId, Pageable pageable);
  
  List<AiPracticeSession> findAllByLearnerIdAndCreatedAtAfter(Long learnerId, LocalDateTime startDate);
}
