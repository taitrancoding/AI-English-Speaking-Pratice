package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
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
import ut.aesp.enums.UserRole;
import org.springframework.security.core.Authentication;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class UserService implements IUserService {

  private final UserMapper userMapper;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public UserResponse createUser(CreateUserRequest payload) {
    System.out.println("🚀 Bắt đầu createUser với payload: " + payload);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      System.out.println("❌ Không xác thực được người dùng");
      throw new APIException("Không xác thực được người dùng", HttpStatus.UNAUTHORIZED);
    }
    System.out.println("✅ Authentication hiện tại: " + auth.getName());

    String email = auth.getName();
    User currentUser = userRepository.findByEmail(email)
        .orElseThrow(() -> {
          System.out.println("❌ Không tìm thấy user hiện tại trong DB với email: " + email);
          return new APIException("Không tìm thấy user hiện tại", HttpStatus.UNAUTHORIZED);
        });

    // 🔒 Kiểm tra quyền
    if (currentUser.getRole() != UserRole.ADMIN) {
      System.out.println("❌ User " + currentUser.getEmail() + " không có quyền ADMIN");
      throw new APIException("Chỉ ADMIN mới có quyền tạo người dùng mới", HttpStatus.FORBIDDEN);
    }
    System.out.println("✅ User " + currentUser.getEmail() + " có quyền ADMIN");

    // 🔒 Kiểm tra email tồn tại
    if (userRepository.existsByEmail(payload.getEmail())) {
      System.out.println("Email đã tồn tại: " + payload.getEmail());
      throw new APIException("Email đã tồn tại", HttpStatus.BAD_REQUEST);
    }

    System.out.println("Email chưa tồn tại, tiến hành tạo user mới");
    User user = userMapper.createUser(payload);
    System.out.println("#####");
    user.setPassword(passwordEncoder.encode(payload.getPassword()));
    user.setName(payload.getName());
    user.setEmail(payload.getEmail());
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    user.setRole(payload.getRole() != null ? payload.getRole() : UserRole.LEARNER);
    user.setStatus(UserStatus.ACTIVE);

    User saved = userRepository.save(user);
    System.out.println("ADMIN " + currentUser.getEmail() + " vừa tạo user mới: " + saved.getEmail());

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
    u.setStatus(payload.getStatus());
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
  public Page<UserResponse> getAllUsers(UserRole role, UserStatus status, Pageable pageable) {
    if (role != null)
      return userRepository.findAllByRole(role, pageable).map(userMapper::toResponse);
    else if (status != null)
      return userRepository.findAllByStatus(status, pageable).map(userMapper::toResponse);
    else
      return userRepository.findAll(pageable).map(userMapper::toResponse);
  }

}
