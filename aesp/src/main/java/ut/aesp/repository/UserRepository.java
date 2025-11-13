package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import ut.aesp.model.User;
import ut.aesp.enums.UserStatus;
import ut.aesp.enums.UserRole;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  Page<User> findAllByRole(UserRole role, Pageable pageable);

  Page<User> findAllByStatus(UserStatus status, Pageable pageable);
}
