package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.SystemPolicy;

@Repository
public interface SystemPolicyRepository extends JpaRepository<SystemPolicy, Long> {
}
