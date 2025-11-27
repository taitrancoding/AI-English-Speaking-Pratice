package ut.aesp.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.EnglishLevel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorResourceRequest {
  private String title;
  private String description;
  private String resourceType; // DOCUMENT, VIDEO, AUDIO, LINK, EXERCISE
  private String fileUrl;
  private String externalUrl;
  private String category; // GRAMMAR, VOCABULARY, PRONUNCIATION, CONVERSATION
  private EnglishLevel targetLevel;
  private Boolean isPublic = false;
}


