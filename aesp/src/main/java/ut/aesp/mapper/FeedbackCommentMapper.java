package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.feedback.FeedbackCommentRequest;
import ut.aesp.dto.feedback.FeedbackCommentResponse;
import ut.aesp.model.FeedbackComment;

@Mapper(componentModel = "spring")
public interface FeedbackCommentMapper {
  @Mapping(target = "user.id", source = "userId")
  FeedbackComment toEntity(FeedbackCommentRequest dto);

  @Mapping(target = "userId", source = "user.id")
  FeedbackCommentResponse toResponse(FeedbackComment entity);

}
