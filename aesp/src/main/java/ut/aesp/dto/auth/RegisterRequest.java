package ut.aesp.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import org.hibernate.validator.constraints.Length;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
  @NotEmpty(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  private String email;

  @NotEmpty(message = "Tên không được để trống")
  @Length(min = 8, max = 20, message = "tên người dùng phải dài từ 8 đến 20 ký tự")
  private String name;

  @NotEmpty(message = "Mật khẩu không được để trống")
  @Length(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
  @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).+$", message = "Mật khẩu phải chứa ít nhất một chữ hoa và một ký tự đặc biệt")
  private String password;

}
