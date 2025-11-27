package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.service.Impl.LeaderboardService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeaderboardController {
  LeaderboardService leaderboardService;

  @GetMapping
  @PreAuthorize("hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<?> getLeaderboard(
      @RequestParam(defaultValue = "all") String filter,
      @RequestParam(defaultValue = "10") int limit) {
    List<Map<String, Object>> leaderboard = leaderboardService.getLeaderboard(filter, limit);
    return ResponseEntity.ok(leaderboard);
  }
}


