package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.report.*;
import ut.aesp.service.IProgressReportService;
import ut.aesp.security.CustomUserDetailsService;

@RestController
@RequestMapping("/api/v1/reports/progress")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProgressReportController {
  IProgressReportService progressReportService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> create(@RequestBody ProgressReportRequest payload) {
    return ResponseEntity.ok(progressReportService.create(payload));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR') or hasRole('LEARNER') or@securityService.isOwnerOfReport(#id)")
  public ResponseEntity<?> get(@PathVariable Long id) {
    return ResponseEntity.ok(progressReportService.get(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR')")
  public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProgressReportRequest payload) {
    return ResponseEntity.ok(progressReportService.update(id, payload));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    progressReportService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/learner/{learnerId}")
  @PreAuthorize("hasRole('ADMIN') or principal.id == #learnerId or hasRole('MENTOR')")
  public ResponseEntity<?> listByLearner(@PathVariable Long learnerId, Pageable pageable) {
    return ResponseEntity.ok(progressReportService.listByLearner(learnerId, pageable));
  }

  @GetMapping("/me")
  @PreAuthorize("hasRole('LEARNER') or hasRole('ADMIN')")
  public ResponseEntity<?> listMyReports(
      @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails,
      Pageable pageable) {
    return ResponseEntity.ok(progressReportService.listByUser(userDetails.getId(), pageable));
  }
}
