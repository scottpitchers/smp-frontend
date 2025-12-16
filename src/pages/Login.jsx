import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MonitorPlay, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call authentication
    setTimeout(() => {
      // Validate credentials
      if (email === "admin@smp.com" && password === "admin123") {
        // Create a fake token
        const token = "simulated_token_" + Math.random().toString(36).substr(2);
        localStorage.setItem("smp_token", token);

        // Also set user info for realism if needed anywhere
        localStorage.setItem(
          "smp_user",
          JSON.stringify({ email, name: "Admin User" })
        );

        setIsLoading(false);
        navigate("/");
        setEmail("");
        setPassword("");
      } else {
        setIsLoading(false);
        setError("Invalid email or password");
      }
    }, 1500); // 1.5s delay for realism
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
              <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <MonitorPlay className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-[#ff6b35] mb-1">
                SMP CMS
              </h1>
              <p className="text-blue-100 text-sm">
                Signage Management Platform
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pb-10">
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center">
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transform transition-all active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed group"
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
