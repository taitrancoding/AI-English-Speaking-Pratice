package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.stereotype.Service;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.model.LearnerProfile;
import ut.aesp.repository.AiPracticeSessionRepository;
import ut.aesp.repository.LearnerProfileRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeaderboardService {
  private final LearnerProfileRepository learnerProfileRepository;
  private final AiPracticeSessionRepository sessionRepository;

  public List<Map<String, Object>> getLeaderboard(String filter, int limit) {
    List<LearnerProfile> allLearners = learnerProfileRepository.findAll();
    
    LocalDateTime startDate = getStartDate(filter);
    
    List<Map<String, Object>> leaderboard = allLearners.stream()
        .map(learner -> {
          List<AiPracticeSession> sessions = startDate != null
              ? sessionRepository.findAllByLearnerIdAndCreatedAtAfter(learner.getId(), startDate)
              : sessionRepository.findAllByLearnerId(learner.getId());
          
          int streak = calculateStreak(sessions);
          
          Map<String, Object> entry = new HashMap<>();
          entry.put("learnerId", learner.getId());
          entry.put("learnerName", learner.getUser() != null ? learner.getUser().getName() : learner.getName());
          entry.put("aiScore", learner.getAiScore() != null ? learner.getAiScore() : 0.0f);
          entry.put("totalSessions", sessions.size());
          entry.put("streak", streak);
          
          return entry;
        })
        .sorted((a, b) -> {
          Float scoreA = ((Float) a.get("aiScore"));
          Float scoreB = ((Float) b.get("aiScore"));
          return Float.compare(scoreB, scoreA);
        })
        .limit(limit)
        .collect(Collectors.toList());
    
    // Add rank
    for (int i = 0; i < leaderboard.size(); i++) {
      leaderboard.get(i).put("rank", i + 1);
    }
    
    return leaderboard;
  }

  private LocalDateTime getStartDate(String filter) {
    switch (filter.toLowerCase()) {
      case "weekly":
        return LocalDateTime.now().minusWeeks(1);
      case "monthly":
        return LocalDateTime.now().minusMonths(1);
      default:
        return null; // All time
    }
  }

  private int calculateStreak(List<AiPracticeSession> sessions) {
    if (sessions.isEmpty()) return 0;
    
    // Sort by date descending
    List<AiPracticeSession> sorted = sessions.stream()
        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
        .collect(Collectors.toList());
    
    int streak = 0;
    LocalDateTime lastDate = null;
    
    for (AiPracticeSession session : sorted) {
      LocalDateTime sessionDate = session.getCreatedAt().toLocalDate().atStartOfDay();
      
      if (lastDate == null) {
        lastDate = sessionDate;
        streak = 1;
      } else {
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(sessionDate, lastDate);
        if (daysBetween == 1) {
          streak++;
          lastDate = sessionDate;
        } else if (daysBetween > 1) {
          break;
        }
      }
    }
    
    return streak;
  }
}


