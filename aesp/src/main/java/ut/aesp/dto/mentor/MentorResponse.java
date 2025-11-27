package ut.aesp.dto.mentor;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorResponse {
  private Long id;
  private Long userId;
  private String name;
  private String email;
  private String bio;
  private String skills;
  private Float rating;
  private Integer experienceYears;
  private Integer totalStudents;
  private String availabilityStatus;
}
