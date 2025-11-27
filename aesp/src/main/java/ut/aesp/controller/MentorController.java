package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.mentor.*;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.model.Mentor;
import ut.aesp.repository.MentorRepository;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.ILearnerPackageService;
import ut.aesp.service.IMentorService;

@RestController
@RequestMapping("/api/v1/mentors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MentorController {
  IMentorService mentorService;
  ILearnerPackageService learnerPackageService;
  MentorRepository mentorRepository;

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

  @GetMapping("/me")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<MentorResponse> getMyProfile(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    return ResponseEntity.ok(mentorService.getByUserId(userDetails.getId()));
  }

  @PutMapping("/me")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<MentorResponse> updateMyProfile(
      @RequestBody MentorUpdate payload,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = mentorRepository.findByUserId(userDetails.getId())
        .map(Mentor::getId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "userId", userDetails.getId()));
    return ResponseEntity.ok(mentorService.update(mentorId, payload));
  }

  @GetMapping("/me/learners")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<Page<MentorLearnerSummaryResponse>> getMyLearners(
      Pageable pageable,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = mentorRepository.findByUserId(userDetails.getId())
        .map(Mentor::getId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "userId", userDetails.getId()));
    return ResponseEntity.ok(learnerPackageService.listByMentor(mentorId, pageable));
  }
}