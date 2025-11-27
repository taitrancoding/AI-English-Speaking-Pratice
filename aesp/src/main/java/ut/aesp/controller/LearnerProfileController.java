package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.learner.*;
import ut.aesp.service.ILearnerProfileService;
import ut.aesp.security.CustomUserDetailsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/learners/profile")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LearnerProfileController {
    ILearnerProfileService learnerProfileService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody LearnerProfileRequest payload) {
        return ResponseEntity.ok(learnerProfileService.create(payload));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR') or @securityService.isOwnerOfLearnerProfile(#id)")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(learnerProfileService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOfLearnerProfile(#id)")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody LearnerProfileUpdate payload) {
        return ResponseEntity.ok(learnerProfileService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        learnerProfileService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(learnerProfileService.getAll(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<?> getCurrent(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
        return ResponseEntity.ok(learnerProfileService.getByUserId(userDetails.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<?> updateCurrent(
            @RequestBody LearnerProfileUpdate payload,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails userDetails) {
        return ResponseEntity.ok(learnerProfileService.updateByUserId(userDetails.getId(), payload));
    }
}
