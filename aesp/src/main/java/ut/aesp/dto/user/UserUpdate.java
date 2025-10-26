package ut.aesp.dto.user;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdate {
  @NotEmpty(message = "Tên không được để trống")
  @Length(min = 8, max = 20, message = "tên người dùng phải dài từ 8 đến 20 ký tự")
  private String name;

  @Length(max = 255, message = "Đường dẫn ảnh không hợp lệ")
  private String avatarUrl;

  @Length(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
  @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).+$", message = "Mật khẩu phải chứa ít nhất một chữ hoa và một ký tự đặc biệt")
  private String password;
}
