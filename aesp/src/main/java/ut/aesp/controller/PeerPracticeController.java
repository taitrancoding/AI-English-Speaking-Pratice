package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.peer.PeerPracticeRequest;
import ut.aesp.dto.peer.PeerPracticeResponse;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.service.IPeerPracticeService;
import ut.aesp.security.CustomUserDetailsService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/peer-practice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PeerPracticeController {

  private final IPeerPracticeService peerPracticeService;

  @PostMapping("/find-match")
  @PreAuthorize("hasRole('LEARNER')")
  public ResponseEntity<PeerPracticeResponse> findMatch(
      @RequestBody PeerPracticeRequest request,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long learnerId = getLearnerIdFromUser(userDetails.getId());
    return ResponseEntity.ok(peerPracticeService.findMatch(learnerId, request));
  }

  @GetMapping("/active")
  @PreAuthorize("hasRole('LEARNER')")
  public ResponseEntity<PeerPracticeResponse> getActiveSession(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long learnerId = getLearnerIdFromUser(userDetails.getId());
    return ResponseEntity.ok(peerPracticeService.getActiveSession(learnerId));
  }

  @PostMapping("/{sessionId}/end")
  @PreAuthorize("hasRole('LEARNER')")
  public ResponseEntity<Void> endSession(
      @PathVariable Long sessionId,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long learnerId = getLearnerIdFromUser(userDetails.getId());
    peerPracticeService.endSession(sessionId, learnerId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/history")
  @PreAuthorize("hasRole('LEARNER')")
  public ResponseEntity<List<PeerPracticeResponse>> getHistory(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long learnerId = getLearnerIdFromUser(userDetails.getId());
    return ResponseEntity.ok(peerPracticeService.getSessionHistory(learnerId));
  }

  private final LearnerProfileRepository learnerProfileRepository;

  private Long getLearnerIdFromUser(Long userId) {
    return learnerProfileRepository.findByUserId(userId)
        .map(ut.aesp.model.LearnerProfile::getId)
        .orElseThrow(() -> new RuntimeException("Learner profile not found for user: " + userId));
  }
}
