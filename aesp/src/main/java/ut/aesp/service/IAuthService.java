package ut.aesp.service;

import ut.aesp.dto.auth.LoginRequest;
import ut.aesp.dto.auth.RegisterRequest;
import ut.aesp.dto.auth.TokenReponse;
import ut.aesp.model.User;

public interface IAuthService {
  User register(RegisterRequest request);

  TokenReponse login(LoginRequest request);

  TokenReponse loginWithGoogle(String idTokenString);
}
