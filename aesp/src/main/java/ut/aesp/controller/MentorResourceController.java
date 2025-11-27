package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.mentor.MentorResourceRequest;
import ut.aesp.dto.mentor.MentorResourceResponse;
import ut.aesp.enums.EnglishLevel;
import ut.aesp.repository.MentorRepository;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.IMentorResourceService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mentor-resources")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MentorResourceController {

  private final IMentorResourceService resourceService;
  private final MentorRepository mentorRepository;

  @PostMapping
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<MentorResourceResponse> createResource(
      @RequestBody MentorResourceRequest request,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(resourceService.createResource(mentorId, request));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('MENTOR') or hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<MentorResourceResponse> getResource(@PathVariable Long id) {
    return ResponseEntity.ok(resourceService.getResource(id));
  }

  @GetMapping("/mentor/me")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<List<MentorResourceResponse>> getMyResources(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    return ResponseEntity.ok(resourceService.getResourcesByMentor(mentorId));
  }

  @GetMapping("/public")
  @PreAuthorize("hasRole('LEARNER') or hasRole('MENTOR') or hasRole('ADMIN')")
  public ResponseEntity<List<MentorResourceResponse>> getPublicResources() {
    return ResponseEntity.ok(resourceService.getPublicResources());
  }

  @GetMapping("/category/{category}/level/{level}")
  @PreAuthorize("hasRole('LEARNER') or hasRole('MENTOR') or hasRole('ADMIN')")
  public ResponseEntity<List<MentorResourceResponse>> getResourcesByCategoryAndLevel(
      @PathVariable String category,
      @PathVariable EnglishLevel level) {
    return ResponseEntity.ok(resourceService.getResourcesByCategoryAndLevel(category, level));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('MENTOR')")
  public ResponseEntity<Void> deleteResource(
      @PathVariable Long id,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long mentorId = getMentorIdFromUser(userDetails.getId());
    resourceService.deleteResource(id, mentorId);
    return ResponseEntity.noContent().build();
  }

  private Long getMentorIdFromUser(Long userId) {
    return mentorRepository.findByUserId(userId)
        .map(ut.aesp.model.Mentor::getId)
        .orElseThrow(() -> new RuntimeException("Mentor profile not found for user: " + userId));
  }
}


