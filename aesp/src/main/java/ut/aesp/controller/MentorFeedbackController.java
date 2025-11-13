package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.feedback.*;
import ut.aesp.service.IMentorFeedbackService;

@RestController
@RequestMapping("/api/v1/mentor-feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MentorFeedbackController {
  private final IMentorFeedbackService mentorFeedbackService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER')")
  public ResponseEntity<?> create(@RequestBody MentorFeedbackRequest payload) {
    return ResponseEntity.ok(mentorFeedbackService.create(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfMentorFeedback(#id) or @securityService.isLearnerInMentorFeedback(#id)")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(mentorFeedbackService.get(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfMentorFeedback(#id)")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MentorFeedbackRequest request) {
    return ResponseEntity.ok(mentorFeedbackService.update(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfMentorFeedback(#id)")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    mentorFeedbackService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/mentor/{mentorId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR') or hasRole('LEARNER')")
  public ResponseEntity<?> listByMentor(@PathVariable Long mentorId, Pageable pageable) {
    return ResponseEntity.ok(mentorFeedbackService.listByMentor(mentorId, pageable));
  }
}
