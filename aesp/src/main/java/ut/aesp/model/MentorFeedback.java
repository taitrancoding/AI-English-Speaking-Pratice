package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Audited
@Entity
@Table(name = "mentor_feedbacks")
public class MentorFeedback extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "learner_id", nullable = false)
  private LearnerProfile learner;

  @ManyToOne
  @JoinColumn(name = "mentor_id", nullable = false)
  private Mentor mentor;

  @ManyToOne
  @JoinColumn(name = "practice_session_id")
  @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
  private AiPracticeSession practiceSession; // Link to practice session if applicable

  @Lob
  private String pronunciationErrors; // Lỗi phát âm

  @Lob
  private String grammarErrors; // Lỗi ngữ pháp

  @Lob
  private String vocabularyIssues; // Vấn đề về từ vựng, cách dùng từ không tự nhiên

  @Lob
  private String clarityGuidance; // Hướng dẫn diễn đạt rõ ràng và tự tin

  @Lob
  private String conversationTopics; // Chủ đề và tình huống hội thoại thực tế

  @Lob
  private String vocabularySuggestions; // Đề xuất học từ vựng, collocation, idioms

  @Lob
  private String nativeSpeakerTips; // Kinh nghiệm giao tiếp với người bản xứ

  @Lob
  private String overallFeedback; // Feedback tổng thể

  private LocalDateTime feedbackDate;
  private Boolean isImmediate = true; // Feedback ngay lập tức sau practice
}
