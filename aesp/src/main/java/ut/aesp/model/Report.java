package ut.aesp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reports")
public class Report extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "admin_id", nullable = false)
  private User admin;

  @Lob
  private String fileUrl;

  private String reportType;
  private java.time.LocalDateTime generatedAt;

  @Lob
  private String dataSummary;
}
