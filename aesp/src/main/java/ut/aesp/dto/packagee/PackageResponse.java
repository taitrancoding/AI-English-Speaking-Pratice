package ut.aesp.dto.packagee;

import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.dto.mentor.MentorSummaryResponse;

@Getter
@Setter
public class PackageResponse {
  private Long id;
  private String name;
  private String description;
  private BigDecimal price;
  private Integer durationDays;
  private Boolean hasMentor;
  private String status;
  private List<MentorSummaryResponse> mentors;
}
