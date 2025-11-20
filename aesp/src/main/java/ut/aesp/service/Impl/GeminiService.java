package ut.aesp.service.Impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // URL gọi API của Google
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();

    public String chatWithGemini(String topic, String scenario) {
        try {
            String finalUrl = GEMINI_URL + apiKey;

            // Câu lệnh (Prompt) gửi cho AI
            String prompt = "You are an English teacher. Start a conversation with a student about the topic: '" 
                            + topic + "' in the scenario: '" + scenario + "'. "
                            + "Keep it short (under 50 words) and ask a question to start.";

            // Cấu trúc JSON gửi đi
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> body = new HashMap<>();
            body.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // Gọi API
            ResponseEntity<Map> response = restTemplate.postForEntity(finalUrl, entity, Map.class);

            // Lấy câu trả lời từ JSON trả về
            if (response.getBody() != null) {
                Map<String, Object> respBody = response.getBody();
                if (respBody.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) respBody.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> contentResp = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            return "Hello! I am ready to practice English with you.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, AI is currently unavailable. (Error: " + e.getMessage() + ")";
        }
    }
}