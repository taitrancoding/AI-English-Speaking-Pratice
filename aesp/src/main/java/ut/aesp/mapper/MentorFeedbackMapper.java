package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.feedback.MentorFeedbackRequest;
import ut.aesp.dto.feedback.MentorFeedbackResponse;
import ut.aesp.model.MentorFeedback;

@Mapper(componentModel = "spring")
public interface MentorFeedbackMapper {
  // @Mapping(target = "mentor.id", source = "mentorId")
  // @Mapping(target = "learner.id", source = "learnerId")
  // @Mapping(target = "session.id", source = "sessionId")
  MentorFeedback toEntity(MentorFeedbackRequest dto);

  @Mapping(target = "mentorId", source = "mentor.id")
  @Mapping(target = "learnerId", source = "learner.id")
  @Mapping(target = "sessionId", source = "session.id")
  MentorFeedbackResponse toResponse(MentorFeedback entity);

}
