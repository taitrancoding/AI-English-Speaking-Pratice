package ut.aesp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

import org.hibernate.envers.Audited;

@Getter
@Setter
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
  private String status = "active";
}
