package ut.aesp.dbs.seeders;

import ut.aesp.model.SystemPolicy;
import ut.aesp.repository.SystemPolicyRepository;
import org.springframework.stereotype.Component;

@Component
public class SystemPolicySeeder {

  private final SystemPolicyRepository systemPolicyRepository;

  public SystemPolicySeeder(SystemPolicyRepository systemPolicyRepository) {
    this.systemPolicyRepository = systemPolicyRepository;
  }

  public void seed() {
    if (systemPolicyRepository.count() == 0) {
      SystemPolicy policy = new SystemPolicy();
      policy.setTitle("Số lượng gói dịch vụ miễn phí mặc định");
      policy.setContent("Tự động tạo 1 cái token mới sau 1 giờ không hoạt động.");
      systemPolicyRepository.save(policy);
      System.out.println("Đẫ tạo chính sách hệ thống");
    }
  }
}
