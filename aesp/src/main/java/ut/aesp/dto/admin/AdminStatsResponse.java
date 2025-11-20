package ut.aesp.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long activeMentors;
    private long totalPackages;
    private long totalFeedbacks;
}