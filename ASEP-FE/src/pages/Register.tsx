import React, { useState } from "react";
import { FaGoogle, FaApple, FaFacebookF, FaTwitter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import * as authService from "@/lib/services/auth";
import { RegisterRequest } from "@/schemas/Auth";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    if (!email.includes("@")) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = { email, name, password };
      await authService.register(payload);
      setSuccess("Đăng ký thành công. Hãy đăng nhập!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("Register failed", err);
      const axiosError = err as Record<string, unknown>;
      const errorData = (axiosError?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      
      let msg = "Đăng ký thất bại";
      if (errorData?.message) {
        msg = errorData.message as string;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Tạo Tài Khoản</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" style={{ color: "#dc2626", backgroundColor: "#fee2e2", borderColor: "#fca5a5" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm" style={{ color: "#166534", backgroundColor: "#dcfce7", borderColor: "#86efac" }}>
            {success}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Họ và Tên"
            required
            style={{ fontFamily: "Poppins, sans-serif" }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
            style={{ fontFamily: "Poppins, sans-serif" }}
          />
          <div style={{ position: "relative", width: "100%" }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              required
              style={{ fontFamily: "Poppins, sans-serif", width: "100%" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </button>
          </div>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={showConfirm ? "text" : "password"}
              placeholder="Xác Nhận Mật Khẩu"
              required
              style={{ fontFamily: "Poppins, sans-serif", width: "100%" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </button>
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? "Đang tạo..." : "Đăng Ký"}
          </button>
        </form>

        <div className="register-footer">
          Đã có tài khoản?{" "}
          <span className="login-text" onClick={() => navigate("/login")}>
            Đăng nhập
          </span>
        </div>

        <p className="more-methods">Hoặc đăng ký bằng</p>

        <div className="social-icons">
          <FaGoogle className="icon" />
          <FaApple className="icon" />
          <FaFacebookF className="icon" />
          <FaTwitter className="icon" />
        </div>

        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            height: 100%;
            width: 100%;
            font-family: 'Poppins', sans-serif;
            background: url('../images/Speaking-Practice.jpg') no-repeat center center;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .register-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100vh;
          }

          .register-card {
            width: 420px;
            background: #fff;
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            text-align: center;
            animation: fadeIn 0.6s ease;
          }

          .register-title {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            margin-bottom: 30px;
          }

          .register-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .register-form input {
            width: 100%;
            padding: 16px 18px;
            font-size: 18px;
            border: 1.5px solid #f2d3d3;
            border-radius: 8px;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }

          .register-form input:focus {
            border-color: #e67aa7;
          }

          .register-btn {
            margin-top: 10px;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            background: #e67aa7;
            cursor: pointer;
            transition: background 0.2s;
          }

          .register-btn:hover {
            background: #d35499;
          }

          .register-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .register-footer {
            margin-top: 25px;
            font-size: 16px;
            color: #555;
          }

          .login-text {
            color: #e67aa7;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            margin-left: 6px;
            transition: color 0.2s;
          }

          .login-text:hover {
            color: #d35499;
          }

          .more-methods {
            margin-top: 30px;
            font-size: 16px;
            color: #777;
          }

          .social-icons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
          }

          .icon {
            font-size: 28px;
            color: #444;
            cursor: pointer;
            transition: transform 0.2s, color 0.2s;
          }

          .icon:hover {
            color: #e67aa7;
            transform: scale(1.2);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);} 
            to { opacity: 1; transform: translateY(0);} 
          }

          @media (max-width: 480px) {
            .register-card {
              width: 90%;
              padding: 30px 20px;
            }

            .register-title {
              font-size: 24px;
            }

            .register-form input {
              font-size: 16px;
              padding: 14px 16px;
            }

            .register-btn {
              font-size: 16px;
              padding: 14px;
            }

            .register-footer {
              font-size: 14px;
            }

            .more-methods {
              font-size: 14px;
            }

            .icon {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Register;
