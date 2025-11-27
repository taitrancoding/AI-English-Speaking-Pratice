package ut.aesp.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ut.aesp.dto.peer.PeerMessage;
import ut.aesp.service.Impl.PeerPracticeService;
import ut.aesp.service.ai.GeminiHttpClient;

@Slf4j
@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PeerPracticeWebSocketController {

  private final SimpMessagingTemplate messagingTemplate;
  private final GeminiHttpClient geminiClient;

  @MessageMapping("/peer-practice/{sessionId}/message")
  @SendTo("/topic/peer-practice/{sessionId}")
  public PeerMessage handleMessage(@Payload PeerMessage message) {
    log.info("Received message in session {}: {}", message.getSessionId(), message.getContent());
    return message;
  }

  @MessageMapping("/peer-practice/{sessionId}/ai-feedback")
  public void handleAiFeedbackRequest(@Payload PeerMessage message) {
    log.info("AI feedback requested for session {}: {}", message.getSessionId(), message.getContent());
    
    try {
      // Call Gemini API for real-time feedback
      String geminiResponse = geminiClient.evaluateSpeech(
          message.getContent(),
          "Peer Practice",
          "Real-time conversation",
          "B1"
      );
      
      // Parse Gemini response and extract feedback
      String feedbackText = extractFeedbackFromGeminiResponse(geminiResponse);
      
      PeerMessage feedback = new PeerMessage();
      feedback.setSessionId(message.getSessionId());
      feedback.setSenderId(0L); // AI sender
      feedback.setSenderName("AI Assistant");
      feedback.setContent(feedbackText);
      feedback.setType("ai-feedback");
      
      messagingTemplate.convertAndSend("/topic/peer-practice/" + message.getSessionId() + "/ai", feedback);
    } catch (Exception e) {
      log.error("Error getting AI feedback", e);
      PeerMessage errorFeedback = new PeerMessage();
      errorFeedback.setSessionId(message.getSessionId());
      errorFeedback.setSenderId(0L);
      errorFeedback.setSenderName("AI Assistant");
      errorFeedback.setContent("AI feedback temporarily unavailable. Please try again.");
      errorFeedback.setType("ai-feedback");
      messagingTemplate.convertAndSend("/topic/peer-practice/" + message.getSessionId() + "/ai", errorFeedback);
    }
  }

  private String extractFeedbackFromGeminiResponse(String geminiResponse) {
    // Try to extract feedback from Gemini JSON response
    try {
      // If response is JSON, parse it
      if (geminiResponse.contains("\"feedback\"")) {
        // Simple extraction - in production, use proper JSON parsing
        int feedbackStart = geminiResponse.indexOf("\"feedback\"");
        if (feedbackStart > 0) {
          int valueStart = geminiResponse.indexOf(":", feedbackStart) + 1;
          int valueEnd = geminiResponse.indexOf(",", valueStart);
          if (valueEnd < 0) valueEnd = geminiResponse.indexOf("}", valueStart);
          if (valueEnd > valueStart) {
            String feedback = geminiResponse.substring(valueStart, valueEnd).trim();
            return feedback.replace("\"", "").replace("\\n", "\n");
          }
        }
      }
      // If not JSON, return first 200 characters
      return geminiResponse.length() > 200 
          ? geminiResponse.substring(0, 200) + "..."
          : geminiResponse;
    } catch (Exception e) {
      log.warn("Failed to parse Gemini response, using raw text", e);
      return geminiResponse.length() > 200 
          ? geminiResponse.substring(0, 200) + "..."
          : geminiResponse;
    }
  }
}

