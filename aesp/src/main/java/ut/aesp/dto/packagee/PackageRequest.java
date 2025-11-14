package ut.aesp.dto.packagee;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PackageRequest {
  @NotBlank(message = "không được để trống tên gói")
  @Size(max = 100)
  private String name;

  @Size(max = 1000)
  private String description;

  @Positive(message = "phải nhập số dương")
  private BigDecimal price;

  @Positive(message = "phải nhập số dương")
  private Integer durationDays;

  private Boolean hasMentor;

  private String status;
}
