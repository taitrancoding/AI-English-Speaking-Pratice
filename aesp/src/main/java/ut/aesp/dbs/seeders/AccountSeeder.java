package ut.aesp.dbs.seeders;

import ut.aesp.enums.UserRole;
import ut.aesp.model.User;
import ut.aesp.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AccountSeeder {

  private final UserRepository userRepository;

  public AccountSeeder(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public void seed() {
    try {
      String adminEmail = "admin@gmail.com";
      if (userRepository.findByEmail(adminEmail).isEmpty()) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(encoder.encode("Admin@123"));
        admin.setName("Admin");
        admin.setRole(UserRole.ADMIN);
        userRepository.saveAndFlush(admin);
        System.out.println("Đã tạo tài khoản admin");
      } else {
        System.out.println("Admin đã tồn tại, bỏ qua tạo mới.");
      }
    } catch (Exception e) {
      System.err.println("Lỗi khi chạy AccountSeeder: " + e.getMessage());
      e.printStackTrace();
    }
  }

}
