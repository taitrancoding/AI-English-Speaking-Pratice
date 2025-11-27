package ut.aesp.config;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class GeminiConfig {

  private final WebClient webClient;

  public GeminiConfig() {
    this.webClient = WebClient.builder()
        .baseUrl("https://api.generativeai.googleapis.com/v1")
        .defaultHeader("Authorization", "Bearer YOUR_GEMINI_API_KEY")
        .build();
  }

  public String getAiFeedback(String speechText) {
    // Gửi speechText đến Gemini và nhận feedback
    return webClient.post()
        .uri("/models/gemini-2.5-flash:generateMessage")
        .bodyValue("{\"prompt\":\"" + speechText + "\"}")
        .retrieve()
        .bodyToMono(String.class)
        .block();
  }
}
