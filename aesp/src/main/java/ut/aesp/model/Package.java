package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.PackageStatus;

import java.math.BigDecimal;

import org.hibernate.envers.Audited;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Audited
@Table(name = "packages")
public class Package extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  @Lob
  private String description;
  private BigDecimal price;
  private Integer durationDays;
  private Boolean hasMentor;

  @Enumerated(EnumType.STRING)
  private PackageStatus status = PackageStatus.ACTIVE;
}
