package ut.aesp.dto.LearnerPackage;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LearnerPackageRequest {
  private Long learnerId;
  private Integer transactionId;
  private Long packageId;
  private LocalDateTime purchaseDate;
  private BigDecimal priceAtPurchase;
  private LocalDateTime expireDate;
  private String paymentStatus;
}
