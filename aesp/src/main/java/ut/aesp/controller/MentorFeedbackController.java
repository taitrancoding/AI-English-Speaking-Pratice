package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.mentor.MentorFeedbackRequest;
import ut.aesp.dto.mentor.MentorFeedbackResponse;
import ut.aesp.repository.MentorRepository;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.IMentorFeedbackService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mentor-feedback")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MentorFeedbackController {

  private final IMentorFeedbackService feedbackService;
  private final MentorRepository mentorRepository;

  @PostMapping
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<MentorFeedbackResponse> createFeedback(
      @RequestBody MentorFeedbackRequest request,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(feedbackService.createFeedback(mentorId, request));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<MentorFeedbackResponse> getFeedback(@PathVariable Long id) {
    return ResponseEntity.ok(feedbackService.getFeedback(id));
  }

  @GetMapping("/learner/{learnerId}")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<List<MentorFeedbackResponse>> getFeedbacksByLearner(@PathVariable Long learnerId) {
    return ResponseEntity.ok(feedbackService.getFeedbacksByLearner(learnerId));
  }

  @GetMapping("/mentor/me")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<List<MentorFeedbackResponse>> getMyFeedbacks(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(feedbackService.getFeedbacksByMentor(mentorId));
  }

  @GetMapping("/learner/{learnerId}/immediate")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<List<MentorFeedbackResponse>> getImmediateFeedbacks(@PathVariable Long learnerId) {
    return ResponseEntity.ok(feedbackService.getImmediateFeedbacks(learnerId));
  }

  private Long getMentorIdFromUser(Long userId) {
    return mentorRepository.findByUserId(userId)
        .map(ut.aesp.model.Mentor::getId)
        .orElseThrow(() -> new RuntimeException("Mentor profile not found for user: " + userId));
  }
}
