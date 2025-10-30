package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ut.aesp.dto.user.CreateUserRequest;
import ut.aesp.dto.user.UserResponse;
import ut.aesp.dto.user.UserUpdate;
import ut.aesp.enums.UserRole;
import ut.aesp.enums.UserStatus;

public interface IUserService {
  UserResponse createUser(CreateUserRequest payload);

  UserResponse getUser(Long id);

  UserResponse updateUser(Long id, UserUpdate payload);

  void deleteUser(Long id);

  Page<UserResponse> getAllUsers(Pageable pageable);

  Page<UserResponse> getAllByRole(UserRole role, Pageable pageable);

  Page<UserResponse> getAllByStatus(UserStatus status, Pageable pageable);
}
