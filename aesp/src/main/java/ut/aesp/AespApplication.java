package ut.aesp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.mybatis.spring.annotation.MapperScan;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = "ut.aesp")
// @MapperScan("ut.aesp.mapper")
public class AespApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().load();

        System.setProperty("SPRING_DATASOURCE_URL", dotenv.get("SPRING_DATASOURCE_URL"));
        System.setProperty("SPRING_DATASOURCE_USERNAME", dotenv.get("SPRING_DATASOURCE_USERNAME"));
        System.setProperty("SPRING_DATASOURCE_PASSWORD", dotenv.get("SPRING_DATASOURCE_PASSWORD"));

        SpringApplication.run(AespApplication.class, args);
    }
}
