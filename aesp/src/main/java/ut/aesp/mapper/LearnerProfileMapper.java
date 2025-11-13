package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import ut.aesp.dto.learner.LearnerProfileRequest;
import ut.aesp.dto.learner.LearnerProfileResponse;
import ut.aesp.model.LearnerProfile;

@Mapper(componentModel = "spring")
public interface LearnerProfileMapper {

  @Mapping(target = "user.id", source = "userId")
  @Mapping(target = "name", source = "name", defaultValue = "")
  @Mapping(target = "aiScore", source = "aiScore", defaultValue = "0.0f")
  @Mapping(target = "pronunciationScore", source = "pronunciationScore", defaultValue = "0.0f")
  @Mapping(target = "totalPracticeMinutes", source = "totalPracticeMinutes")
  LearnerProfile toEntity(LearnerProfileRequest dto);

  @Mapping(target = "userId", source = "user.id")
  LearnerProfileResponse toResponse(LearnerProfile entity);

  @Mapping(target = "user.id", source = "userId")
  void updateEntityFromDto(@MappingTarget LearnerProfile entity, LearnerProfileRequest dto);
}
