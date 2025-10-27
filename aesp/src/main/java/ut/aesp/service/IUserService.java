package ut.aesp.service;

import ut.aesp.dto.user.CreateUserRequest;
import ut.aesp.dto.user.UserUpdate;
import ut.aesp.dto.user.UserResponse;
import java.util.List;

public interface IUserService {
  UserResponse createUser(CreateUserRequest request);

  UserResponse updateUser(Long id, UserUpdate request);

  UserResponse getUserById(Long id);

  List<UserResponse> getAllUsers();

  void deleteUser(Long id);
}
