package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.learner.LearnerProfileRequest;
import ut.aesp.dto.learner.LearnerProfileResponse;
import ut.aesp.model.LearnerProfile;

@Mapper(componentModel = "spring")
public interface LearnerProfileMapper {
  @Mapping(target = "user.id", source = "userId")
  LearnerProfile toEntity(LearnerProfileRequest dto);

  @Mapping(target = "userId", source = "user.id")
  LearnerProfileResponse toResponse(LearnerProfile entity);
}
