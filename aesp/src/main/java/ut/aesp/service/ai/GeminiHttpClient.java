package ut.aesp.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import ut.aesp.dto.session.AiEvaluationResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class GeminiHttpClient {

  private final HttpClient httpClient;
  private final String apiKey;
  private final String model;
  private final ObjectMapper objectMapper;

  public GeminiHttpClient(
      @Value("${gemini.api.key}") String apiKey,
      @Value("${gemini.model:gemini-1.5-flash}") String model) {
    if (apiKey == null || apiKey.isEmpty() || apiKey.equals("${GEMINI_API_KEY}")) {
      log.error("[Gemini] API key is not set! Please set GEMINI_API_KEY environment variable.");
      throw new IllegalStateException("Gemini API key is not configured");
    }
    this.apiKey = apiKey;
    this.model = model;
    this.httpClient = HttpClient.newHttpClient();
    this.objectMapper = new ObjectMapper();
    log.info("[Gemini] Initialized with model: {}", model);
  }

  public String generate(String prompt, String audioUrl, String model) {
    try {
      String body = """
          {
            "model": "%s",
            "input": "%s",
            "audioUrl": "%s"
          }
          """.formatted(model, prompt, audioUrl);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(
              "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(body))
          .build();

      log.info("[Gemini] Sending prompt: {}", prompt);

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      log.info("[Gemini] Response: {}", response.body());

      return response.body();

    } catch (Exception e) {
      log.error("[Gemini] Error generating content", e);
      throw new RuntimeException(e);
    }
  }

  /**
   * Evaluate speech text using Gemini API
   * 
   * @param speechText  The transcript from learner
   * @param topic       The topic of conversation
   * @param scenario    The scenario/context
   * @param targetLevel Target CEFR level (A1-C2)
   * @return JSON string with evaluation results
   */
  public String evaluateSpeech(String speechText, String topic, String scenario, String targetLevel) {
    try {
      // Build evaluation prompt
      String prompt = buildEvaluationPrompt(speechText, topic, scenario, targetLevel);

      // Build request body for Gemini API
      Map<String, Object> requestBody = new HashMap<>();
      Map<String, Object> contents = new HashMap<>();
      Map<String, Object> part = new HashMap<>();
      part.put("text", prompt);
      contents.put("parts", new Object[] { part });
      requestBody.put("contents", new Object[] { contents });

      // Generation config
      Map<String, Object> generationConfig = new HashMap<>();
      generationConfig.put("temperature", 0.7);
      generationConfig.put("topK", 40);
      generationConfig.put("topP", 0.95);
      generationConfig.put("maxOutputTokens", 3000);
      requestBody.put("generationConfig", generationConfig);

      String bodyJson = objectMapper.writeValueAsString(requestBody);

      String url = String.format(
          "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
          model, apiKey);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
          .build();

      log.info("[Gemini] Evaluating speech for topic: {}, level: {}", topic, targetLevel);
      log.debug("[Gemini] Request URL: {}", url);
      log.debug("[Gemini] Request body: {}", bodyJson);

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      log.info("[Gemini] Response status: {}", response.statusCode());

      if (response.statusCode() != 200) {
        String errorBody = response.body();
        log.error("[Gemini] Error response ({}): {}", response.statusCode(), errorBody);

        // Try to parse error message from response
        try {
          JsonNode errorNode = objectMapper.readTree(errorBody);
          String errorMessage = errorNode.path("error").path("message").asText("Unknown error");
          log.error("[Gemini] Error message: {}", errorMessage);
          throw new RuntimeException("Gemini API error (" + response.statusCode() + "): " + errorMessage);
        } catch (Exception e) {
          throw new RuntimeException("Gemini API error (" + response.statusCode() + "): " + errorBody);
        }
      }

      String responseBody = response.body();
      log.debug("[Gemini] Raw response: {}", responseBody);

      // Parse response and extract text
      JsonNode jsonNode = objectMapper.readTree(responseBody);

      // Check if response has candidates
      if (!jsonNode.has("candidates") || jsonNode.get("candidates").size() == 0) {
        log.error("[Gemini] No candidates in response: {}", responseBody);
        throw new RuntimeException("Invalid Gemini response: no candidates");
      }

      JsonNode candidate = jsonNode.get("candidates").get(0);
      if (!candidate.has("content") || !candidate.get("content").has("parts")) {
        log.error("[Gemini] Invalid candidate structure: {}", responseBody);
        throw new RuntimeException("Invalid Gemini response: invalid candidate structure");
      }

      JsonNode parts = candidate.get("content").get("parts");
      if (parts.size() == 0 || !parts.get(0).has("text")) {
        log.error("[Gemini] No text in parts: {}", responseBody);
        throw new RuntimeException("Invalid Gemini response: no text in parts");
      }

      String rawText = parts.get(0).get("text").asText().trim();

      // Loại bỏ ```json ở đầu nếu có
      if (rawText.startsWith("```json")) {
        rawText = rawText.substring(7).trim();
      }

      // Loại bỏ ``` ở cuối nếu có
      if (rawText.endsWith("```")) {
        rawText = rawText.substring(0, rawText.length() - 3).trim();
      }

      // Parse vào AiEvaluationResponse
      AiEvaluationResponse evaluationResponse = objectMapper.readValue(rawText, AiEvaluationResponse.class);

      log.info("[Gemini] Evaluation completed");
      return rawText;

    } catch (Exception e) {
      log.error("[Gemini] Error evaluating speech", e);
      throw new RuntimeException("Failed to evaluate speech with Gemini", e);
    }
  }

  private String buildEvaluationPrompt(String speechText, String topic, String scenario, String targetLevel) {
    return String.format("""
        You are a CEFR speaking examiner evaluating a learner's English speaking performance.

        Target Level: %s
        Topic: %s
        Scenario: %s

        Learner's transcript:
        "%s"

        Please evaluate the learner's speech on the following criteria (0-10 scale):
        1. Pronunciation: clarity, accuracy, and naturalness
        2. Fluency: smoothness, pace, and flow
        3. Grammar: correctness and complexity
        4. Vocabulary: range, appropriateness, and accuracy

        Respond ONLY with valid JSON in this exact format:
        {
          "score": <overall score 0-100>,
          "rubric": {
            "pronunciation": <0-10>,
            "fluency": <0-10>,
            "grammar": <0-10>,
            "vocabulary": <0-10>
          },
          "feedback": "<detailed feedback in Vietnamese, explaining strengths and areas for improvement>",
          "suggestedFocus": ["<area 1>", "<area 2>"]
        }

        Important: Respond ONLY with the JSON object, no additional text or explanation.
        """, targetLevel, topic, scenario, speechText);
  }

  public HttpClient getClient() {
    return httpClient;
  }

  public String getApiKey() {
    return apiKey;
  }
}
