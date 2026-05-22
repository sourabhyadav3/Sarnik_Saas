import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./ChangePassword.css";
import axiosInstance from "../../api/axiosInstance";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Get logged-in user id from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  /* ---------------- SUBMIT HANDLER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔴 Basic validation
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 🔹 API call
      const res = await axiosInstance.put(
        `/users/change-password/${userId}`,
        {
          newPassword: newPassword,
        }
      );

      // 🔹 Success toast
      toast.success(res.data?.message || "Password changed successfully");

      // 🔹 Reset form
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      // 🔴 Error toast
      toast.error(
        err.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <ToastContainer position="top-right" />

      <div className="change-password-card">
        <h2>Change Password</h2>
        <p className="subtitle">Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="change-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
