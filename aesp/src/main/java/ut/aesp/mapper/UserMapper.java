package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import ut.aesp.dto.user.CreateUserRequest;
import ut.aesp.dto.user.UserResponse;
import ut.aesp.dto.user.UserUpdate;
import ut.aesp.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
  User toEntity(CreateUserRequest dto);

  void updateEntity(@MappingTarget User entity, UserUpdate dto);

  @Mapping(target = "createdAt", source = "createdAt")
  @Mapping(target = "updatedAt", source = "updatedAt")
  UserResponse toResponse(User entity);
}
