package ut.aesp.dto.user;

import java.time.LocalDateTime;

import lombok.Setter;
import lombok.Getter;
import ut.aesp.enums.UserRole;
import ut.aesp.enums.UserStatus;

@Getter
@Setter
public class UserResponse {
  private Long id;
  private String email;
  private String name;
  private String avatarUrl;
  private UserRole role;
  private UserStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
