import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MonitorPlay,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem("smp_token", data.token);

        // Store user info if returned
        if (data.user) {
          localStorage.setItem("smp_user", JSON.stringify(data.user));
        } else {
          localStorage.setItem(
            "smp_user",
            JSON.stringify({ email, name: "Admin User" })
          );
        }

        navigate("/");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1128]">
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 p-4">
        <div className="bg-[#0F1A3D] border border-[#1E3A8A]/30 rounded-2xl shadow-2xl w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header Section */}
          <div className="bg-[#0F1A3D] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[#0F1A3D]  z-0"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#0F1A3D] border border-[#1E3A8A]/30 rounded-2xl shadow-2xl opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#0F1A3D] border border-[#1E3A8A]/30 rounded-2xl shadow-2xl opacity-10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-transparent border-4 border-[#FF6B35] rounded-xl shadow-lg flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <MonitorPlay className="w-8 h-8 text-[#FF6B35]" />
              </div>
              <h1 className="text-3xl font-bold text-[#ff6b35] mb-1">
                SMP CMS
              </h1>
              {/* <p className="text-blue-100 text-sm">
                Signage Management Platform
              </p> */}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pb-10">
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                Welcome Back
              </h2>
              {/* <div className="text-sm text-gray-500 mt-1">
              Use{" "}
              <span className="font-mono bg-gray-100 px-1 rounded text-red-500">
                admin@smp.com
              </span>{" "}
              /{" "}
              <span className="font-mono bg-gray-100 px-1 rounded text-red-500">
                admin123
              </span>
            </div> */}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="">
                <label className="text-sm block mb-1 font-medium text-[#d1d5db] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                  </div>
                  <input
                    type="email"
                    className="block bg-[#0A1128] border border-[#1E3A8A]/50 text-white rounded-lg w-full pl-10 pr-3 py-3  focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent placeholder-gray-500"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm block mb-1 font-medium text-[#d1d5db] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      )}
                    </button>
                    {/* <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" /> */}
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block bg-[#0A1128] border border-[#1E3A8A]/50 text-white rounded-lg w-full pl-10 pr-3 py-3  focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent placeholder-gray-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600 group-hover:text-gray-800">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div> */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-lg hover:opacity-90 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B35]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
