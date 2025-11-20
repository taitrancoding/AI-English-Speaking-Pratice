package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.session.*;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.IAiPracticeSessionService;

@RestController
@RequestMapping("/api/v1/practice-sessions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiPracticeSessionController {
  IAiPracticeSessionService aiPracticeSessionService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER')")
  public ResponseEntity<?> create(@RequestBody AiPracticeSessionRequest payload) {
    return ResponseEntity.ok(aiPracticeSessionService.create(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER') or hasRole('MENTOR')")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(aiPracticeSessionService.get(id));
  }

  @PutMapping("/{id}/scores")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR')")
  public ResponseEntity<?> updateScores(@PathVariable Long id, @RequestBody AiPracticeSessionRequest payload) {
    return ResponseEntity.ok(aiPracticeSessionService.updateScores(id, payload));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    aiPracticeSessionService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/my-sessions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER')")
  public ResponseEntity<?> listMySessions(
      Pageable pageable,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
      
    Long userId = userDetails.getId();
    
    return ResponseEntity.ok(aiPracticeSessionService.listByUser(userId, pageable));
  }
}
