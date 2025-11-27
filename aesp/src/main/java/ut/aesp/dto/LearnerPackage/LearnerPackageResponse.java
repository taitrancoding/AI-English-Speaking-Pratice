package ut.aesp.dto.LearnerPackage;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LearnerPackageResponse {
  private Long id;
  private Long learnerId;
  private String learnerName;
  private Long packageId;
  private String packageName;
  private String packageDescription;
  private Integer packageDurationDays;
  private Integer transactionId;
  private BigDecimal priceAtPurchase;
  private LocalDateTime purchaseDate;
  private LocalDateTime expireDate;
  private String paymentStatus;
}
