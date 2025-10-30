package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ut.aesp.dto.user.CreateUserRequest;
import ut.aesp.dto.user.UserResponse;
import ut.aesp.dto.user.UserUpdate;
import ut.aesp.enums.UserStatus;
import ut.aesp.exception.APIException;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.UserMapper;
import ut.aesp.model.User;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.IUserService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class UserService implements IUserService {

  UserRepository userRepository;
  UserMapper userMapper;
  PasswordEncoder passwordEncoder;

  @Override
  public UserResponse createUser(CreateUserRequest payload) {
    if (userRepository.existsByEmail(payload.getEmail())) {
      throw new APIException("Email đã tồn tại", HttpStatus.BAD_REQUEST);
    }
    User user = userMapper.toEntity(payload);
    user.setPassword(passwordEncoder.encode(payload.getPassword()));
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    user.setStatus(UserStatus.ACTIVE);

    User saved = userRepository.save(user);
    return userMapper.toResponse(saved);
  }

  @Override
  public UserResponse getUser(Long id) {
    User u = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    return userMapper.toResponse(u);
  }

  @Override
  public UserResponse updateUser(Long id, UserUpdate payload) {
    User u = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

    u.setName(payload.getName());
    u.setAvatarUrl(payload.getAvatarUrl());

    if (payload.getPassword() != null && !payload.getPassword().isEmpty()) {
      u.setPassword(passwordEncoder.encode(payload.getPassword()));
    }
    u.setUpdatedAt(LocalDateTime.now());
    if (payload.getRole() != null)
      u.setRole(payload.getRole());
    User updated = userRepository.save(u);
    return userMapper.toResponse(updated);
  }

  @Override
  public void deleteUser(Long id) {
    User u = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

    u.setDeletedAt(LocalDateTime.now());
    u.setStatus(UserStatus.DISABLED);

    userRepository.save(u);
  }

  @Override
  public Page<UserResponse> getAllUsers(Pageable pageable) {
    return userRepository.findAll(pageable).map(userMapper::toResponse);
  }

  @Override
  public Page<UserResponse> getAllByRole(ut.aesp.enums.UserRole role, Pageable pageable) {
    return userRepository.findAllByRole(role, pageable).map(userMapper::toResponse);
  }

  @Override
  public Page<UserResponse> getAllByStatus(ut.aesp.enums.UserStatus status, Pageable pageable) {
    return userRepository.findAllByStatus(status, pageable).map(userMapper::toResponse);
  }
}
