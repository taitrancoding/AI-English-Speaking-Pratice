package ut.aesp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GoogleConfig {

  @Value("${GOOGLE_CLIENT_ID}")
  private String googleClientId;

  @Bean
  public String googleClientId() {
    return googleClientId;
  }
}
