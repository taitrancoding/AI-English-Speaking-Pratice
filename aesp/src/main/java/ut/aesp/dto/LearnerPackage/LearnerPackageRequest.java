package ut.aesp.dto.LearnerPackage;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearnerPackageRequest {

  private Integer transactionId;
  private Long packageId;
  // private LocalDateTime purchaseDate;
  // private BigDecimal priceAtPurchase;
  // private LocalDateTime expireDate;
  // private String paymentStatus;
}
