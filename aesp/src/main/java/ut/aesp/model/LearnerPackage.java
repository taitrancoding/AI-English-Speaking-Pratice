package ut.aesp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.envers.Audited;

@Getter
@Setter
@Audited
@Entity
@Table(name = "learner_packages")
public class LearnerPackage extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  @ManyToOne
  @JoinColumn(name = "package_id", nullable = false)
  private Package packageEntity;

  private Integer transactionId;
  private LocalDateTime purchaseDate;
  private BigDecimal priceAtPurchase;
  private LocalDateTime expireDate;

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private PaymentStatus paymentStatus = PaymentStatus.PENDING; // pending | completed | failed
}
