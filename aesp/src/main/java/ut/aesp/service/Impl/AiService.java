package ut.aesp.service.Impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.session.AiEvaluationRequest;
import ut.aesp.dto.session.AiEvaluationResponse;
import ut.aesp.dto.session.AiPracticeSessionRequest;
import ut.aesp.dto.session.AiPracticeSessionResponse;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.model.LearnerProfile;
import ut.aesp.model.User;
import ut.aesp.repository.AiPracticeSessionRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.IAiService;
import ut.aesp.service.ai.GeminiHttpClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService implements IAiService {

  private final AiPracticeSessionRepository sessionRepository;
  private final LearnerProfileRepository learnerProfileRepository;
  private final UserRepository userRepository;
  private final GeminiHttpClient geminiClient;
  private final ObjectMapper objectMapper;

  @Override
  @Transactional
  public AiPracticeSessionResponse generateAndSaveSession(AiPracticeSessionRequest request) {
    LearnerProfile learner = learnerProfileRepository.findById(request.getLearnerId())
        .orElseThrow(() -> new RuntimeException("Learner not found"));

    AiPracticeSession session = new AiPracticeSession();
    session.setLearner(learner);
    session.setTopic(request.getTopic());
    session.setScenario(request.getScenario());
    session.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 1);
    session.setAudioUrl(request.getAudioUrl());
    session.setAiVersion("gemini-2.5-flash");

    // Call Gemini for evaluation
    try {
      String geminiResponse = geminiClient.evaluateSpeech(
          request.getSpeech() != null ? request.getSpeech() : "",
          request.getTopic(),
          request.getScenario(),
          "B1"); // Default level, can be passed in request

      // Parse Gemini response
      JsonNode jsonNode = objectMapper.readTree(geminiResponse);
      JsonNode rubric = jsonNode.path("rubric");
      String feedback = jsonNode.path("feedback").asText("");

      session.setPronunciationScore((float) rubric.path("pronunciation").asDouble(0));
      session.setGrammarScore((float) rubric.path("grammar").asDouble(0));
      session.setVocabularyScore((float) rubric.path("vocabulary").asDouble(0));
      session.setAiFeedback(feedback);

    } catch (Exception e) {
      log.error("Error calling Gemini", e);
      session.setAiFeedback("Error evaluating speech: " + e.getMessage());
    }

    AiPracticeSession saved = sessionRepository.save(session);
    return toResponse(saved);
  }

  /**
   * Evaluate speech and return immediate response
   */
  @Transactional
  public AiEvaluationResponse evaluateSpeech(AiEvaluationRequest request) {
    LearnerProfile learner = learnerProfileRepository.findById(request.getLearnerId())
        .orElseThrow(() -> new RuntimeException("Learner not found"));

    try {
      // Call Gemini for evaluation
      String geminiResponse = geminiClient.evaluateSpeech(
          request.getSpeechText(),
          request.getTopic(),
          request.getScenario(),
          request.getTargetLevel() != null ? request.getTargetLevel() : "B1");

      // Parse Gemini response
      JsonNode jsonNode;
      try {
        jsonNode = objectMapper.readTree(geminiResponse);
      } catch (Exception e) {
        log.error("Failed to parse Gemini JSON response: {}", geminiResponse, e);
        throw new RuntimeException("Invalid JSON response from Gemini: " + e.getMessage(), e);
      }

      JsonNode rubricNode = jsonNode.path("rubric");
      String feedback = jsonNode.path("feedback").asText("No feedback provided");

      // Build rubric with safe defaults
      AiEvaluationResponse.Rubric rubric = new AiEvaluationResponse.Rubric();
      if (rubricNode != null && !rubricNode.isMissingNode()) {
        rubric.setPronunciation(rubricNode.path("pronunciation").asDouble(0));
        rubric.setFluency(rubricNode.path("fluency").asDouble(0));
        rubric.setGrammar(rubricNode.path("grammar").asDouble(0));
        rubric.setVocabulary(rubricNode.path("vocabulary").asDouble(0));
      } else {
        // Default values if rubric is missing
        rubric.setPronunciation(0.0);
        rubric.setFluency(0.0);
        rubric.setGrammar(0.0);
        rubric.setVocabulary(0.0);
      }

      // Save to database
      AiPracticeSession session = new AiPracticeSession();
      session.setLearner(learner);
      session.setTopic(request.getTopic());
      session.setScenario(request.getScenario());
      session.setDurationMinutes(1);
      session.setPronunciationScore(rubric.getPronunciation() != null ? rubric.getPronunciation().floatValue() : 0f);
      session.setGrammarScore(rubric.getGrammar() != null ? rubric.getGrammar().floatValue() : 0f);
      session.setVocabularyScore(rubric.getVocabulary() != null ? rubric.getVocabulary().floatValue() : 0f);
      session.setAiFeedback(feedback);
      session.setAiVersion("gemini-2.5-flash");

      AiPracticeSession saved = sessionRepository.save(session);

      // Build response
      AiEvaluationResponse response = new AiEvaluationResponse();
      response.setTranscript(request.getSpeechText());
      response.setFeedback(feedback);
      // response.setScore(score);
      response.setRubric(rubric);
      response.setPracticeSessionId(saved.getId());
      // TTS audio can be added later if needed
      response.setTtsAudioBase64(null);

      return response;

    } catch (Exception e) {
      log.error("Error evaluating speech", e);
      throw new RuntimeException("Failed to evaluate speech: " + e.getMessage(), e);
    }
  }

  @Override
  public Page<AiPracticeSessionResponse> getSessionsForCurrentUser(int page, int size) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      throw new RuntimeException("User not authenticated");
    }

    String email = auth.getName();
    // Get user by email, then get learner profile
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    LearnerProfile learner = learnerProfileRepository.findByUserId(user.getId())
        .orElseThrow(() -> new RuntimeException("Learner profile not found"));

    Pageable pageable = PageRequest.of(page, size);
    Page<AiPracticeSession> sessions = sessionRepository.findAllByLearnerIdOrderByCreatedAtDesc(
        learner.getId(), pageable);

    return sessions.map(this::toResponse);
  }

  private AiPracticeSessionResponse toResponse(AiPracticeSession session) {
    AiPracticeSessionResponse response = new AiPracticeSessionResponse();
    response.setId(session.getId());
    response.setLearnerId(session.getLearner().getId());
    response.setTopic(session.getTopic());
    response.setScenario(session.getScenario());
    response.setDurationMinutes(session.getDurationMinutes());
    response.setPronunciationScore(session.getPronunciationScore());
    response.setGrammarScore(session.getGrammarScore());
    response.setVocabularyScore(session.getVocabularyScore());
    response.setAiFeedback(session.getAiFeedback());
    response.setAiVersion(session.getAiVersion());
    response.setAudioUrl(session.getAudioUrl());
    response.setCreatedAt(session.getCreatedAt());
    return response;
  }
}
