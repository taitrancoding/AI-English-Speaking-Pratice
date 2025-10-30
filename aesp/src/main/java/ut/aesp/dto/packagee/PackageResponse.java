package ut.aesp.dto.packagee;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PackageResponse {
  private Long id;
  private String name;
  private String description;
  private BigDecimal price;
  private Integer durationDays;
  private Boolean hasMentor;
  private String status;
}
