package ut.aesp.service;

import ut.aesp.dto.auth.LoginRequest;
import ut.aesp.dto.auth.RegisterRequest;
import ut.aesp.dto.auth.TokenResponse;
import ut.aesp.model.User;

public interface IAuthService {
  User register(RegisterRequest request);

  TokenResponse login(LoginRequest request);

  TokenResponse loginWithGoogle(String idTokenString);

  TokenResponse refreshToken(String refreshToken);
}
