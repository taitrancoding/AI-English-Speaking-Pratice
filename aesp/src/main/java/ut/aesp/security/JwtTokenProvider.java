package ut.aesp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ut.aesp.model.User;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

  private final String jwtSecret;
  private final long jwtExpirationMs;
  private final long refreshExpirationMs;

  private Key getSigningKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }

  public JwtTokenProvider(
      @Value("${app.jwt.secret}") String jwtSecret,
      @Value("${app.jwt.expirationMs}") long jwtExpirationMs,
      @Value("${app.jwt.refreshExpirationMs}") long refreshExpirationMs) {
    this.jwtSecret = jwtSecret;
    this.jwtExpirationMs = jwtExpirationMs;
    this.refreshExpirationMs = refreshExpirationMs;
    System.out.println("DEBUG JWT: Secret Key Length: " + this.jwtSecret.getBytes().length + " bytes");
  }

  public String generateAccessToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .claim("role", user.getRole().name())
        .claim("userId", user.getId())
        .claim("email", user.getEmail())
        .claim("name", user.getName())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
        .signWith(getSigningKey(), SignatureAlgorithm.HS512)
        .compact();
  }

  public String generateRefreshToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
        .signWith(getSigningKey(), SignatureAlgorithm.HS512)
        .compact();
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  public String getEmailFromToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }

  public String getRoleFromToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
    return claims.get("role", String.class);
  }

  public Long getUserIdFromToken(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
    Object userIdObj = claims.get("userId");
    if (userIdObj instanceof Number) {
      return ((Number) userIdObj).longValue();
    }
    return null;
  }
}
