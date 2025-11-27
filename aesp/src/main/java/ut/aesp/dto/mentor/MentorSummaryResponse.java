package ut.aesp.dto.mentor;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorSummaryResponse {
  private Long id;
  private String name;
  private String email;
  private String skills;
  private String availabilityStatus;
}


