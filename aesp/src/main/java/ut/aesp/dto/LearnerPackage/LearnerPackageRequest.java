package ut.aesp.dto.LearnerPackage;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LearnerPackageRequest {
  private Long learnerId;
  private Long packageId;
  private BigDecimal priceAtPurchase;
  private String paymentStatus;
}
