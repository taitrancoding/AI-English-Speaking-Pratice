package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.MentorFeedback;

import java.util.List;

@Repository
public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, Long> {
  List<MentorFeedback> findAllByLearnerId(Long learnerId);
  
  List<MentorFeedback> findAllByMentorId(Long mentorId);
  
  List<MentorFeedback> findAllByLearnerIdAndIsImmediateTrue(Long learnerId);
}
