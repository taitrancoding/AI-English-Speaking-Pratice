// package ut.aesp.service.Impl;

// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import ut.aesp.dto.user.CreateUserRequest;
// import ut.aesp.dto.user.UserUpdate;
// import ut.aesp.dto.user.UserResponse;
// import ut.aesp.exception.ResourceNotFoundException;
// import ut.aesp.model.User;
// import ut.aesp.repository.UserRepository;
// import ut.aesp.service.IUserService;

// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// @Transactional
// public class UserServiceImpl implements IUserService {

// private final UserRepository userRepository;

// @Override
// public UserResponse createUser(CreateUserRequest request) {
// User user = new User();
// user.setEmail(request.getEmail());
// user.setPassword(request.getPassword());
// user.setName(request.getName());
// user.setAvatarUrl(request.getAvatarUrl());
// user.setStatus("ACTIVE");
// user.setRole(request.getRole()); // hoặc set mặc định LEARNER nếu admin chưa
// chọn

// userRepository.save(user);
// return toResponse(user);
// }

// @Override
// public UserResponse updateUser(Long id, UpdateUserRequest request) {
// User user = userRepository.findById(id)
// .orElseThrow(() -> new ResourceNotFoundException("User not found"));

// if (request.getName() != null) user.setName(request.getName());
// if (request.getAvatarUrl() != null)
// user.setAvatarUrl(request.getAvatarUrl());
// if (request.getStatus() != null) user.setStatus(request.getStatus());

// userRepository.save(user);
// return toResponse(user);
// }

// @Override
// public UserResponse getUserById(Long id) {
// User user = userRepository.findById(id)
// .orElseThrow(() -> new ResourceNotFoundException("User not found"));
// return toResponse(user);
// }

// @Override
// public List<UserResponse> getAllUsers() {
// return userRepository.findAll().stream()
// .map(this::toResponse)
// .collect(Collectors.toList());
// }

// @Override
// public void deleteUser(Long id) {
// if (!userRepository.existsById(id))
// throw new ResourceNotFoundException("User not found");
// userRepository.deleteById(id);
// }

// private UserResponse toResponse(User user) {
// UserResponse res = new UserResponse();
// res.setId(user.getId());
// res.setEmail(user.getEmail());
// res.setName(user.getName());
// res.setAvatarUrl(user.getAvatarUrl());
// res.setStatus(user.getStatus());
// res.setRole(user.getRole());
// return res;
// }
// }
