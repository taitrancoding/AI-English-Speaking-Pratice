package ut.aesp.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.aesp.dto.session.AiEvaluationRequest;
import ut.aesp.dto.session.AiEvaluationResponse;
import ut.aesp.dto.session.AiPracticeSessionResponse;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.service.IAiService;
import ut.aesp.service.Impl.AiPracticeSessionService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AiPracticeSessionController {

  private final AiPracticeSessionService service;
  private final IAiService aiService;

  public AiPracticeSessionController(AiPracticeSessionService service, IAiService aiService) {
    this.service = service;
    this.aiService = aiService;
  }

  @GetMapping("/ai-practice-sessions")
  public List<AiPracticeSession> getAll() {
    return service.findAll();
  }

  @GetMapping("/ai-practice-sessions/learner/{learnerId}")
  public List<AiPracticeSession> getByLearner(@PathVariable Long learnerId) {
    return service.findByLearner(learnerId);
  }

  @PostMapping("/ai-practice-sessions")
  public AiPracticeSession create(@RequestBody AiPracticeSession session) {
    // TODO: Call Gemini AI here to fill aiFeedback
    session.setAiFeedback("Sample feedback from Gemini"); // placeholder
    return service.save(session);
  }

  /**
   * Evaluate speech text using Gemini AI and return immediate response
   * POST /api/v1/ai/evaluation
   */
  @PostMapping("/ai/evaluation")
  public ResponseEntity<?> evaluateSpeech(@RequestBody AiEvaluationRequest request) {
    try {
      AiEvaluationResponse response = aiService.evaluateSpeech(request);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      // Log error for debugging
      System.err.println("Error in /ai/evaluation: " + e.getMessage());
      e.printStackTrace();
      
      // Return error message in response
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("error", e.getMessage());
      errorResponse.put("message", "Failed to evaluate speech: " + e.getMessage());
      
      return ResponseEntity.status(500).body(errorResponse);
    }
  }

  /**
   * Get practice sessions for current authenticated learner
   * GET /api/v1/ai/practice/me?page=0&size=10
   */
  @GetMapping("/ai/practice/me")
  public ResponseEntity<Page<AiPracticeSessionResponse>> getMySessions(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    try {
      Page<AiPracticeSessionResponse> sessions = aiService.getSessionsForCurrentUser(page, size);
      return ResponseEntity.ok(sessions);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
