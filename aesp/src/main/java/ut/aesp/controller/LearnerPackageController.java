package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.LearnerPackage.*;
import ut.aesp.security.CustomUserDetailsService;
import ut.aesp.service.ILearnerPackageService;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/learner-packages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LearnerPackageController {
  ILearnerPackageService learnerPackageService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER')")
  public ResponseEntity<?> purchase(
      @RequestBody LearnerPackageRequest request,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
    Long userId = userDetails.getId();
    return ResponseEntity.ok(learnerPackageService.purchase(request, userId));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.canAccessLearnerPackage(#id, principal)")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(learnerPackageService.get(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody LearnerPackageUpdate payload) {
    return ResponseEntity.ok(learnerPackageService.update(id, payload));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or @securityService.canAccessLearnerPackage(#id, principal)")
  public ResponseEntity<?> cancel(@PathVariable Long id) {
    learnerPackageService.cancel(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('LEARNER')")
  public ResponseEntity<?> list(Pageable pageable,
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {

    Long userId = userDetails.getId();
    if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
      return ResponseEntity.ok(learnerPackageService.list(pageable));
    }
    // For LEARNER, find learnerId from userId
    return ResponseEntity.ok(learnerPackageService.listByUserId(userId, pageable));
  }

  @GetMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> listAllForAdmin(Pageable pageable) {
    return ResponseEntity.ok(learnerPackageService.list(pageable));
  }

  @PutMapping("/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> approve(@PathVariable Long id) {
    return ResponseEntity.ok(learnerPackageService.approve(id));
  }

  @PutMapping("/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> reject(@PathVariable Long id) {
    return ResponseEntity.ok(learnerPackageService.reject(id));
  }
}

// note