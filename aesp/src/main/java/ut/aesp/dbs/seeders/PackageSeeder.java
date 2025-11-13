package ut.aesp.dbs.seeders;

import ut.aesp.model.Package;
import ut.aesp.repository.PackageRepository;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class PackageSeeder {

  private final PackageRepository packageRepository;

  public PackageSeeder(PackageRepository packageRepository) {
    this.packageRepository = packageRepository;
  }

  public void seed() {
    if (packageRepository.count() == 0) {
      Package basic = new Package();
      basic.setName("Basic Package");
      basic.setPrice(new BigDecimal(0.00));
      basic.setDescription("Default free package");
      packageRepository.save(basic);
      System.out.println("✅ Default package created.");
    }
  }
}
