package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ut.aesp.dto.admin.AdminStatsResponse;
import ut.aesp.enums.UserRole;
import ut.aesp.repository.FeedbackCommentRepository;
import ut.aesp.repository.PackageRepository;
import ut.aesp.repository.UserRepository;
import org.springframework.data.domain.Pageable; // Cần thiết để count

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final FeedbackCommentRepository feedbackCommentRepository;

    public AdminStatsResponse getOverallStats() {
        // lay tong so user
        long totalUsers = userRepository.count();

        // lay tong so mentor dang hoat dong
        long activeMentors = userRepository.findAllByRole(UserRole.MENTOR, Pageable.unpaged()).getTotalElements();

        // lay tong so package
        long totalPackages = packageRepository.count();

        // lay tong so feedback
        long totalFeedbacks = feedbackCommentRepository.count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeMentors(activeMentors)
                .totalPackages(totalPackages)
                .totalFeedbacks(totalFeedbacks)
                .build();
    }
}