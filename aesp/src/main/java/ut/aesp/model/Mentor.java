package ut.aesp.model;

import org.hibernate.envers.Audited;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ut.aesp.enums.AvailabilityStatus;

@Getter
@Setter
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
}
