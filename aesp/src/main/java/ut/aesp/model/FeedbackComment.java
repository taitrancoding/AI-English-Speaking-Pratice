package ut.aesp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "feedback_comments")
public class FeedbackComment extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Lob
  private String content;

  private String targetType; // app | mentor | package | session
  private Integer targetId;
  private Integer rating;
}
