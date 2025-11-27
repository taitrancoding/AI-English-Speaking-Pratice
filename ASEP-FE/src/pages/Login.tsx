import React, { useState } from "react";
import { FaGoogle, FaApple, FaFacebookF, FaTwitter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/schemas/User";
import { LoginRequest } from "@/schemas/Auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const creds: LoginRequest = { email, password };
      const loggedInUser = await auth.login(creds);

      // Use the returned user directly instead of waiting for state update
      const userRole = loggedInUser?.role;
      console.log("Navigating with user role:", userRole);
      
      if (userRole === UserRole.ADMIN) {
        navigate("/admin");
      } else if (userRole === UserRole.MENTOR) {
        navigate("/mentor");
      } else {
        navigate("/learner");
      }
    } catch (err: unknown) {
      console.error("Login failed", err);
      const axiosError = err as Record<string, unknown>;
      const errorData = (axiosError?.response as Record<string, unknown>)?.data as Record<string, unknown>;
      
      let msg = "Đăng nhập thất bại.";
      
      // Check for specific error messages
      if (errorData?.message) {
        msg = errorData.message as string;
      } else if (errorData?.error === "Unauthorized" || (axiosError?.response as Record<string, unknown>)?.status === 401) {
        msg = "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.";
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-200 to-indigo-900 font-[Poppins]">
      <div className="w-[420px] bg-white rounded-2xl shadow-2xl p-10 text-center animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8">Account Log In</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="Email"
            required
            className="w-full border border-pink-200 rounded-lg px-5 py-3 text-lg focus:outline-none focus:border-pink-400 transition"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              required
              className="w-full border border-pink-200 rounded-lg px-5 py-3 text-lg focus:outline-none focus:border-pink-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-400 transition"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-lg transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="flex justify-between text-base mt-6">
          <a href="#" className="text-pink-500 hover:underline">
            Quên mật khẩu?
          </a>
          <Link to="/register" className="text-pink-500 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </div>

        <p className="text-gray-500 mt-8 text-sm sm:text-base">Hoặc đăng nhập bằng</p>

        <div className="flex justify-center gap-6 mt-4 text-2xl text-gray-600">
          <FaGoogle className="hover:text-pink-400 hover:scale-110 transition-transform cursor-pointer" />
          <FaApple className="hover:text-pink-400 hover:scale-110 transition-transform cursor-pointer" />
          <FaFacebookF className="hover:text-pink-400 hover:scale-110 transition-transform cursor-pointer" />
          <FaTwitter className="hover:text-pink-400 hover:scale-110 transition-transform cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Login;
