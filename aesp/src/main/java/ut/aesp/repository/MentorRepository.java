package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.Mentor;
import ut.aesp.enums.AvailabilityStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {

  Optional<Mentor> findByUserId(Long userId);

  List<Mentor> findAllByAvailabilityStatus(AvailabilityStatus status);
}
