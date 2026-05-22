import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "../api/axiosInstance";
import { setAuthSession, getDashboardPathByRole } from "../utils/auth";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- LOGIN SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Call login API
      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      const { token, refreshToken, role, data, message } = res.data;

      setAuthSession({ token, refreshToken, role, user: data });

      toast.success(message || "Login successful");

      setTimeout(() => {
        navigate(getDashboardPathByRole(role));
      }, 800);

    } catch (err) {
      // 🔴 Error handling
      toast.error(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DEMO LOGIN ---------------- */
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        email: demoEmail,
        password: demoPassword,
      });

      const { token, refreshToken, role, data, message } = res.data;
      setAuthSession({ token, refreshToken, role, user: data });
      toast.success(message || "Demo login successful");


      setTimeout(() => {
        navigate(getDashboardPathByRole(role));
      }, 800);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Demo login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <ToastContainer position="top-right" />

      {/* Banner */}
      <div className="login-banner">
        <div>
          <h1>Project Management</h1>
          <p>Plan, track & deliver projects efficiently</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <h4>User Login</h4>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group password-group">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="demo-login-section">
            <div className="demo-divider">
              <span>Demo Quick Login</span>
            </div>
            <div className="demo-grid">
              <button
                type="button"
                className="demo-badge superadmin"
                onClick={() => handleDemoLogin("superadmin@sarnik.com", "SuperAdmin@123")}
                disabled={loading}
              >
                <span className="role-dot superadmin-dot"></span>
                <span className="demo-label">Super Admin</span>
              </button>
              <button
                type="button"
                className="demo-badge admin"
                onClick={() => handleDemoLogin("admin@gmail.com", "123456")}
                disabled={loading}
              >
                <span className="role-dot admin-dot"></span>
                <span className="demo-label">Admin</span>
              </button>
              <button
                type="button"
                className="demo-badge production"
                onClick={() => handleDemoLogin("production@gmail.com", "123456")}
                disabled={loading}
              >
                <span className="role-dot production-dot"></span>
                <span className="demo-label">Production</span>
              </button>
              <button
                type="button"
                className="demo-badge employee"
                onClick={() => handleDemoLogin("employee@gmail.com", "123456")}
                disabled={loading}
              >
                <span className="role-dot employee-dot"></span>
                <span className="demo-label">Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
