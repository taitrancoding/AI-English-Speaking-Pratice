package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import ut.aesp.model.MentorFeedback;
import ut.aesp.model.Mentor;
import ut.aesp.model.LearnerProfile;

import java.util.List;

@Repository
public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, Long> {

  List<MentorFeedback> findAllByMentor(Mentor mentor);

  Page<MentorFeedback> findAllByMentor(Mentor mentor, Pageable pageable);

  List<MentorFeedback> findAllByLearner(LearnerProfile learner);

  Page<MentorFeedback> findAllByLearner(LearnerProfile learner, Pageable pageable);
}
