package ut.aesp.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.MappingTarget;

// import jakarta.persistence.MappedSuperclass;
import ut.aesp.dto.feedback.FeedbackCommentRequest;
import ut.aesp.dto.feedback.FeedbackCommentResponse;
import ut.aesp.model.FeedbackComment;

@Mapper(componentModel = "spring")
public interface FeedbackCommentMapper {

  // @Mapping(target = "user.id", source = "userId")
  FeedbackComment toEntity(FeedbackCommentRequest dto);

  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "userName", source = "user.name")
  FeedbackCommentResponse toResponse(FeedbackComment entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(FeedbackCommentRequest dto, @MappingTarget FeedbackComment entity);
}
