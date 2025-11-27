package ut.aesp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import ut.aesp.enums.PackageStatus;

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

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "package_mentors",
      joinColumns = @JoinColumn(name = "package_id"),
      inverseJoinColumns = @JoinColumn(name = "mentor_id"))
  private Set<Mentor> mentors = new HashSet<>();
}
