package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorResourceResponse {
  private Long id;
  private Long mentorId;
  private String mentorName;
  private String title;
  private String description;
  private String resourceType;
  private String fileUrl;
  private String externalUrl;
  private String category;
  private EnglishLevel targetLevel;
  private Boolean isPublic;
  private LocalDateTime createdAt;
}


