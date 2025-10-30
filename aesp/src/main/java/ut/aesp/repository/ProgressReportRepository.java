package ut.aesp.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.ProgressReport;
import org.springframework.data.domain.Page;
import ut.aesp.model.LearnerProfile;

@Repository
public interface ProgressReportRepository extends JpaRepository<ProgressReport, Long> {

  Page<ProgressReport> findAllByLearner(LearnerProfile learner, Pageable pageable);
}
