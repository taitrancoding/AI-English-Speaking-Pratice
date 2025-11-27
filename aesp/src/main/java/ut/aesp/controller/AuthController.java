package ut.aesp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import ut.aesp.dto.auth.GoogleLoginRequest;
import ut.aesp.dto.auth.LoginRequest;
import ut.aesp.dto.auth.RegisterRequest;
import ut.aesp.dto.auth.TokenResponse;
import ut.aesp.model.User;
import ut.aesp.service.Impl.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/google")
  public ResponseEntity<TokenResponse> loginWithGoogle(@RequestParam String idToken) {
    return ResponseEntity.ok(authService.loginWithGoogle(idToken));
  }

  @PostMapping("/refresh")
  public ResponseEntity<TokenResponse> refresh(@RequestParam String refreshToken) {
    return ResponseEntity.ok(authService.refreshToken(refreshToken));
  }

  @PostMapping("/logout")
  public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
    token = token.replace("Bearer ", "");
    authService.logout(token);
    return ResponseEntity.ok("Đăng xuất thành công");
  }
}
