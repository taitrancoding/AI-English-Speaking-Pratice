package ut.aesp.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.LearnerPackage;
import ut.aesp.model.LearnerProfile;

@Repository
public interface LearnerPackageRepository extends JpaRepository<LearnerPackage, Long> {

  List<LearnerPackage> findAllByLearner(LearnerProfile learner);

  Page<LearnerPackage> findAllByLearnerId(Long learnerId, Pageable pageable);

  Page<LearnerPackage> findDistinctByPackageEntity_Mentors_Id(Long mentorId, Pageable pageable);
}
