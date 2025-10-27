package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.ProgressReport;
import ut.aesp.model.LearnerProfile;

import java.util.List;

@Repository
public interface ProgressReportRepository extends JpaRepository<ProgressReport, Long> {

  List<ProgressReport> findAllByLearner(LearnerProfile learner);
}
