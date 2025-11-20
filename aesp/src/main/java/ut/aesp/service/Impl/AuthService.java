package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;
import java.util.Collections;
import java.util.UUID;
import java.time.LocalDateTime;

import io.jsonwebtoken.io.IOException;
import ut.aesp.dto.auth.LoginRequest;
import ut.aesp.dto.auth.RegisterRequest;
import ut.aesp.dto.auth.TokenReponse;
import ut.aesp.enums.UserRole;
import ut.aesp.enums.UserStatus;
import ut.aesp.exception.APIException;
import ut.aesp.model.User;
import ut.aesp.model.LearnerProfile;
import ut.aesp.repository.UserRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.security.JwtTokenProvider;
import ut.aesp.service.IAuthService;

import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class AuthService implements IAuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final String googleClientId;
  private final LearnerProfileRepository learnerProfileRepository;

  // lưu danh sách token đã logout (blacklist)
  static Set<String> blacklistedTokens = new HashSet<>();

  @Override
  public User register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new APIException("Email đã tồn tại", HttpStatus.BAD_REQUEST);
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setName(request.getName());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(UserRole.LEARNER);
    user.setStatus(UserStatus.ACTIVE);
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());

    User savedUser = userRepository.save(user);

    LearnerProfile profile = new LearnerProfile();
    profile.setUser(savedUser);
    profile.setName(savedUser.getName());
    learnerProfileRepository.save(profile);

    return savedUser;
  }

  @Override
  
  public TokenReponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new APIException("Email không tồn tại", HttpStatus.UNAUTHORIZED));

    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new APIException("Tài khoản đã bị xóa ", HttpStatus.UNAUTHORIZED);
    }
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new APIException("Mật khẩu không đúng", HttpStatus.UNAUTHORIZED);
    }

    String accessToken = jwtTokenProvider.generateAccessToken(user);
    String refreshToken = jwtTokenProvider.generateRefreshToken(user);

    
    return new TokenReponse(accessToken, refreshToken);
    
  }
  

  @Override
  @Transactional
  public TokenReponse loginWithGoogle(String idTokenString) {
    try {
      final NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
      final JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();

      GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
          .setAudience(Collections.singletonList(googleClientId))
          .build();

      GoogleIdToken idToken = verifier.verify(idTokenString);
      if (idToken == null) {
        throw new APIException("Token Google không hợp lệ", HttpStatus.UNAUTHORIZED);
      }

      GoogleIdToken.Payload payload = idToken.getPayload();
      String email = payload.getEmail();
      String name = (String) payload.get("name");
      String picture = (String) payload.get("picture");

      User user = userRepository.findByEmail(email).orElseGet(() -> {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setAvatarUrl(picture);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setRole(UserRole.LEARNER);
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setCreatedAt(LocalDateTime.now());
        return userRepository.save(newUser);
      });

      String accessToken = jwtTokenProvider.generateAccessToken(user);
      String refreshToken = jwtTokenProvider.generateRefreshToken(user);

      return new TokenReponse(accessToken, refreshToken);

    } catch (Exception e) {
      throw new APIException("Đăng nhập Google thất bại: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public TokenReponse refreshToken(String refreshToken) {
    if (!jwtTokenProvider.validateToken(refreshToken)) {
      throw new APIException("Refresh token không hợp lệ", HttpStatus.UNAUTHORIZED);
    }

    String email = jwtTokenProvider.getEmailFromToken(refreshToken);
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new APIException("Người dùng không tồn tại", HttpStatus.UNAUTHORIZED));

    String newAccess = jwtTokenProvider.generateAccessToken(user);
    String newRefresh = jwtTokenProvider.generateRefreshToken(user);

    return new TokenReponse(newAccess, newRefresh);
  }

  public void logout(String token) {
    blacklistedTokens.add(token);
  }

  public boolean isTokenBlacklisted(String token) {
    return blacklistedTokens.contains(token);
  }
}
