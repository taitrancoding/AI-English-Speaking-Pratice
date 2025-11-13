package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.feedback.*;
import ut.aesp.service.IFeedbackCommentService;

@RestController
@RequestMapping("/api/v1/feedback-comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackCommentController {
  IFeedbackCommentService feedbackCommentService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER') or hasRole('MENTOR')")
  public ResponseEntity<?> create(@RequestBody FeedbackCommentRequest payload) {
    return ResponseEntity.ok(feedbackCommentService.create(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER') or hasRole('MENTOR')")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(feedbackCommentService.get(id));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfFeedbackComment(#id)")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    feedbackCommentService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/user/{userId}")
  @PreAuthorize("hasRole('ADMIN') or principal.id == #userId")
  public ResponseEntity<?> listByUser(@PathVariable Long userId, Pageable pageable) {
    return ResponseEntity.ok(feedbackCommentService.listByUser(userId, pageable));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfFeedbackComment(#id)")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FeedbackCommentRequest payload) {
    return ResponseEntity.ok(feedbackCommentService.update(id, payload));
  }

}
