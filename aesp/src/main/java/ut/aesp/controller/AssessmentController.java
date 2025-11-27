package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.mentor.AssessmentRequest;
import ut.aesp.dto.mentor.AssessmentResponse;
import ut.aesp.repository.MentorRepository;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.IAssessmentService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AssessmentController {

  private final IAssessmentService assessmentService;
  private final MentorRepository mentorRepository;

  @PostMapping
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<AssessmentResponse> createAssessment(
      @RequestBody AssessmentRequest request,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(assessmentService.createAssessment(mentorId, request));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<AssessmentResponse> getAssessment(@PathVariable Long id) {
    return ResponseEntity.ok(assessmentService.getAssessment(id));
  }

  @GetMapping("/learner/{learnerId}")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<List<AssessmentResponse>> getAssessmentsByLearner(@PathVariable Long learnerId) {
    return ResponseEntity.ok(assessmentService.getAssessmentsByLearner(learnerId));
  }

  @GetMapping("/mentor/me")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<List<AssessmentResponse>> getMyAssessments(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(assessmentService.getAssessmentsByMentor(mentorId));
  }

  @GetMapping("/learner/{learnerId}/latest")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<AssessmentResponse> getLatestAssessment(@PathVariable Long learnerId) {
    return ResponseEntity.ok(assessmentService.getLatestAssessment(learnerId));
  }

  private Long getMentorIdFromUser(Long userId) {
    return mentorRepository.findByUserId(userId)
        .map(ut.aesp.model.Mentor::getId)
        .orElseThrow(() -> new RuntimeException("Mentor profile not found for user: " + userId));
  }
}


