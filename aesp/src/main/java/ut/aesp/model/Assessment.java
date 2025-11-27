package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import ut.aesp.enums.EnglishLevel;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Audited
@Entity
@Table(name = "assessments")
public class Assessment extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  @ManyToOne
  @JoinColumn(name = "mentor_id", nullable = false)
  private Mentor mentor;

  @Enumerated(EnumType.STRING)
  private EnglishLevel assessedLevel; // Level được đánh giá

  private Integer speakingScore; // 0-100
  private Integer listeningScore; // 0-100
  private Integer readingScore; // 0-100
  private Integer writingScore; // 0-100

  @Lob
  private String strengths; // Điểm mạnh

  @Lob
  private String weaknesses; // Điểm yếu

  @Lob
  private String recommendations; // Đề xuất

  private LocalDateTime assessmentDate;
  private LocalDateTime nextAssessmentDate; // Ngày đánh giá tiếp theo
}


