package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.PeerPracticeSession;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeerPracticeSessionRepository extends JpaRepository<PeerPracticeSession, Long> {
  List<PeerPracticeSession> findAllByLearner1IdOrLearner2Id(Long learner1Id, Long learner2Id);
  
  Optional<PeerPracticeSession> findByIdAndStatus(Long id, PeerPracticeSession.SessionStatus status);
  
  List<PeerPracticeSession> findAllByStatus(PeerPracticeSession.SessionStatus status);
}


