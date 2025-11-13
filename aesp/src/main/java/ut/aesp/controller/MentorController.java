package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.mentor.*;
import ut.aesp.service.IMentorService;

@RestController
@RequestMapping("/api/v1/mentors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MentorController {
  IMentorService mentorService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> create(@RequestBody MentorRequest payload) {
    return ResponseEntity.ok(mentorService.create(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER') or @securityService.isOwnerOfMentorProfile(#id)")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(mentorService.get(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfMentorProfile(#id)")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MentorUpdate payload) {
    return ResponseEntity.ok(mentorService.update(id, payload));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    mentorService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER') or hasRole('MENTOR')")
  public ResponseEntity<?> list(Pageable pageable) {
    return ResponseEntity.ok(mentorService.list(pageable));
  }
}