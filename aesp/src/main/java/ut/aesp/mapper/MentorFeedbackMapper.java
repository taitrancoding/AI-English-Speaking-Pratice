package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.mentor.MentorFeedbackRequest;
import ut.aesp.dto.mentor.MentorFeedbackResponse;
import ut.aesp.model.MentorFeedback;

@Mapper(componentModel = "spring")
public interface MentorFeedbackMapper {
  @Mapping(target = "learner", ignore = true)
  @Mapping(target = "mentor", ignore = true)
  @Mapping(target = "practiceSession", ignore = true)
  @Mapping(target = "feedbackDate", ignore = true)
  MentorFeedback toEntity(MentorFeedbackRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  @Mapping(target = "learnerName", expression = "java(entity.getLearner().getUser() != null ? entity.getLearner().getUser().getName() : entity.getLearner().getName())")
  @Mapping(target = "mentorId", source = "mentor.id")
  @Mapping(target = "mentorName", expression = "java(entity.getMentor().getUser() != null ? entity.getMentor().getUser().getName() : null)")
  @Mapping(target = "practiceSessionId", expression = "java(entity.getPracticeSession() != null ? entity.getPracticeSession().getId() : null)")
  MentorFeedbackResponse toResponse(MentorFeedback entity);
}
