package ut.aesp.dto.mentor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import ut.aesp.enums.AvailabilityStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequest {

  @NotNull(message = "UserId không được để trống")
  private Long userId;

  @NotEmpty(message = "Bio không được để trống")
  @Size(max = 1000)
  private String bio;

  @NotEmpty(message = "Kỹ năng không được để trống")
  @Size(max = 500)
  private String skills;

  private Integer experienceYears;

  private AvailabilityStatus availabilityStatus;
}
