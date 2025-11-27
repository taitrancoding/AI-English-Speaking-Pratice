package ut.aesp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Audited
@Entity
@Table(name = "mentor_resources")
public class MentorResource extends Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "mentor_id", nullable = false)
  private Mentor mentor;

  private String title;
  
  @Lob
  private String description;

  private String resourceType; // DOCUMENT, VIDEO, AUDIO, LINK, EXERCISE

  private String fileUrl; // URL to file if uploaded
  private String externalUrl; // External link

  private String category; // GRAMMAR, VOCABULARY, PRONUNCIATION, CONVERSATION, etc.

  @Enumerated(EnumType.STRING)
  private EnglishLevel targetLevel; // BEGINNER, INTERMEDIATE, ADVANCED

  private Boolean isPublic = false; // Public to all learners or private
}

