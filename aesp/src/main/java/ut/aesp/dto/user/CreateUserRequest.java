package ut.aesp.dto.user;

import org.hibernate.validator.constraints.Length;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ut.aesp.enums.UserRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

  @NotEmpty(message = "Email không được để trống")
  @Email(message = "email không hợp lệ")
  private String email;

  @NotEmpty(message = "Tên không được để trống")
  @Length(min = 8, max = 20, message = "tên người dùng phải dài từ 8 đến 20 ký tự")
  private String name;

  @NotEmpty(message = "mật khẩu không được để trống")
  @Length(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
  @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).+$", message = "Mật khẩu phải chứa ít nhất một chữ hoa và một ký tự đặc biệt")
  private String password;

  @NotNull(message = "Vai trò không được để trống")
  private UserRole role;
}
