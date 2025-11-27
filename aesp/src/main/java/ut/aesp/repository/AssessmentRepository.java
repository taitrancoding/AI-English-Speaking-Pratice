package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.Assessment;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
  List<Assessment> findAllByLearnerId(Long learnerId);
  
  List<Assessment> findAllByMentorId(Long mentorId);
  
  Optional<Assessment> findFirstByLearnerIdOrderByAssessmentDateDesc(Long learnerId);
}


