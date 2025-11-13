package ut.aesp.dbs.seeders;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

  private final AccountSeeder accountSeeder;
  private final PackageSeeder packageSeeder;
  private final SystemPolicySeeder systemPolicySeeder;

  public DataSeeder(AccountSeeder accountSeeder,
      PackageSeeder packageSeeder,
      SystemPolicySeeder systemPolicySeeder) {
    this.accountSeeder = accountSeeder;
    this.packageSeeder = packageSeeder;
    this.systemPolicySeeder = systemPolicySeeder;
  }

  @Bean
  CommandLineRunner runSeeders() {
    return args -> {
      System.out.println("Bắt đầu chạy seeder...");
      accountSeeder.seed();
      packageSeeder.seed();
      systemPolicySeeder.seed();
      System.out.println("Seeder chạy xong!");
    };
  }
}
