package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.user.*;
import ut.aesp.enums.UserRole;
import ut.aesp.enums.UserStatus;
import ut.aesp.service.IUserService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
  IUserService userService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> createUser(@RequestBody CreateUserRequest payload) {
    return ResponseEntity.ok(userService.createUser(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR') or principal.id == #id")
  public ResponseEntity<?> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUser(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or principal.id == #id")
  public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdate payload) {
    return ResponseEntity.ok(userService.updateUser(id, payload));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> getAllUsers(
      @RequestParam(required = false) UserRole role,
      @RequestParam(required = false) UserStatus status,
      Pageable pageable) {
    return ResponseEntity.ok(userService.getAllUsers(role, status, pageable));
  }
}
