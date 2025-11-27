package ut.aesp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import ut.aesp.enums.AvailabilityStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Audited
@Table(name = "mentors")
public class Mentor extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Lob
  private String bio;

  @Lob
  private String skills;

  private Float rating;
  private Integer experienceYears;
  private Integer totalStudents;

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE; // available | busy | inactive

  @JsonIgnore
  @ManyToMany(mappedBy = "mentors")
  private Set<Package> packages = new HashSet<>();
}
