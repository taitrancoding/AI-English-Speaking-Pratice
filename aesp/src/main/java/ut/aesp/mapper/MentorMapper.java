package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.mentor.MentorRequest;
import ut.aesp.dto.mentor.MentorResponse;
import ut.aesp.model.Mentor;

@Mapper(componentModel = "spring")
public interface MentorMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "packages", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "rating", ignore = true)
  @Mapping(target = "totalStudents", ignore = true)
  @Mapping(target = "availabilityStatus", source = "availabilityStatus")
  @Mapping(target = "user.id", source = "userId")
  Mentor toEntity(MentorRequest dto);

  @Mapping(target = "id", source = "id")
  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "name", expression = "java(entity.getUser() != null ? entity.getUser().getName() : null)")
  @Mapping(target = "email", expression = "java(entity.getUser() != null ? entity.getUser().getEmail() : null)")
  @Mapping(target = "bio", source = "bio")
  @Mapping(target = "skills", source = "skills")
  @Mapping(target = "experienceYears", source = "experienceYears")
  @Mapping(target = "rating", source = "rating")
  @Mapping(target = "totalStudents", source = "totalStudents")
  @Mapping(target = "availabilityStatus", expression = "java(entity.getAvailabilityStatus() != null ? entity.getAvailabilityStatus().name() : null)")
  MentorResponse toResponse(Mentor entity);
}
