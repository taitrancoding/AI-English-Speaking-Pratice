package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.mentor.MentorRequest;
import ut.aesp.dto.mentor.MentorResponse;
import ut.aesp.model.Mentor;

@Mapper(componentModel = "spring")
public interface MentorMapper {
  @Mapping(target = "user.id", source = "userId")
  Mentor toEntity(MentorRequest dto);

  @Mapping(target = "userId", source = "user.id")
  MentorResponse toResponse(Mentor entity);
}
