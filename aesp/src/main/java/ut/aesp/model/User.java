package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.UserRole;
import ut.aesp.enums.UserStatus;

import java.time.LocalDateTime;
import org.hibernate.envers.Audited;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Audited
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email")
})
public class User extends Auditable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 100)
  private String email;

  @Column(nullable = false, length = 255)
  private String password;

  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UserRole role = UserRole.LEARNER; // admin | mentor | learner

  private String avatarUrl;

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private UserStatus status = UserStatus.ACTIVE; // active | disabled

  private LocalDateTime deletedAt;

}