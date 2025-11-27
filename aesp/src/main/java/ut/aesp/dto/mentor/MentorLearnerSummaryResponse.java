package ut.aesp.dto.mentor;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorLearnerSummaryResponse {
  private Long learnerId;
  private String learnerName;
  private String learnerEmail;
  private Long packageId;
  private String packageName;
  private String packageDescription;
  private LocalDateTime purchaseDate;
  private LocalDateTime expireDate;
  private String paymentStatus;
}


