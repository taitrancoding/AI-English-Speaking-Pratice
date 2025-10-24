package ut.aesp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import org.hibernate.envers.Audited;

@Getter
@Setter
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

  @Column(nullable = false, length = 20)
  private String role; // admin | mentor | learner

  private String avatarUrl;

  @Column(length = 20)
  private String status = "active"; // active | disabled

  private LocalDateTime deletedAt;
}
