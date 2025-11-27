package ut.aesp.service.Impl;

import org.springframework.stereotype.Service;
import ut.aesp.model.LearnerProfile;
import ut.aesp.repository.LearnerProfileRepository;

@Service("securityService") // <--- quan trọng: đặt tên bean
public class SecurityService {

  private final LearnerProfileRepository learnerProfileRepository;

  public SecurityService(LearnerProfileRepository learnerProfileRepository) {
    this.learnerProfileRepository = learnerProfileRepository;
  }

  public boolean isOwnerOfLearnerProfile(Long profileId) {
    // Lấy thông tin user hiện tại từ Spring Security
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName(); // email từ token
    LearnerProfile profile = learnerProfileRepository.findById(profileId).orElse(null);
    if (profile == null)
      return false;
    return profile.getUser().getEmail().equals(email);
  }
}
