package ut.aesp.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import ut.aesp.model.User;
import ut.aesp.repository.UserRepository;
import org.springframework.security.core.Authentication;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  // ⚡ Gộp luôn class CustomUserDetails ở trong file này
  public static class CustomUserDetails implements UserDetails {
    private final User user;

    public CustomUserDetails(User user) {
      this.user = user;
    }

    public User getUser() {
      return this.user;
    }

    public Long getId() {
      return user.getId();
    }

    public String getEmail() {
      return user.getEmail();
    }

    public String getRole() {
      return user.getRole().name();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return List.of(() -> "ROLE_" + user.getRole().name());
    }

    @Override
    public String getPassword() {
      return user.getPassword();
    }

    @Override
    public String getUsername() {
      return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
      return true;
    }

    @Override
    public boolean isAccountNonLocked() {
      return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
      return true;
    }

    @Override
    public boolean isEnabled() {
      return true;
    }
  }

  // 🔥 Override lại để trả về CustomUserDetails
  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + email));

    return new CustomUserDetails(user);
  }

  // Hàm tiện lợi để dùng trong service khác
  public static Long getCurrentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
      return userDetails.getId();
    }
    throw new RuntimeException("Không tìm thấy người dùng đăng nhập");
  }
}
