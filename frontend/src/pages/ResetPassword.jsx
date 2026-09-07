import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // GET TOKEN FROM URL
  // ============================================================

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(
        token,
        newPassword
      );

      setSuccess(
        response?.message ||
        "Password reset successfully."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);

      setError(
        err?.message ||
        "Unable to reset password. The reset link may have expired."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="reset-page">

      {/* Background decoration */}

      <div className="reset-bg-circle reset-circle-one"></div>
      <div className="reset-bg-circle reset-circle-two"></div>


      {/* Main Card */}

      <div className="reset-card">

        {/* Logo / Brand */}

        <div className="reset-brand">

          <div className="reset-logo">
            SF
          </div>

          <div>
            <h1>StudyFlow AI</h1>
            <span>Smart Learning Platform</span>
          </div>

        </div>


        {/* Header */}

        <div className="reset-header">

          <div className="reset-icon">
            🔐
          </div>

          <h2>Reset Your Password</h2>

          <p>
            Create a new password for your
            StudyFlow AI account.
          </p>

        </div>


        {/* Missing Token */}

        {!token && (
          <div className="reset-alert error-alert">
            <span>⚠️</span>

            <div>
              <strong>Invalid Reset Link</strong>

              <p>
                This password reset link is missing
                or invalid.
              </p>
            </div>
          </div>
        )}


        {/* Success */}

        {success && (
          <div className="reset-alert success-alert">
            <span>✓</span>

            <div>
              <strong>Password Reset Successful</strong>

              <p>{success}</p>

              <small>
                Redirecting you to login...
              </small>
            </div>
          </div>
        )}


        {/* Error */}

        {error && token && (
          <div className="reset-alert error-alert">
            <span>⚠️</span>

            <div>
              <strong>Unable to Reset Password</strong>

              <p>{error}</p>
            </div>
          </div>
        )}


        {/* Form */}

        {token && !success && (
          <form
            className="reset-form"
            onSubmit={handleSubmit}
          >

            {/* New Password */}

            <div className="reset-form-group">

              <label htmlFor="new-password">
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                disabled={loading}
                autoComplete="new-password"
              />

            </div>


            {/* Confirm Password */}

            <div className="reset-form-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your new password"
                disabled={loading}
                autoComplete="new-password"
              />

            </div>


            {/* Password requirement */}

            <div className="password-hint">
              <span>✓</span>
              Password must contain at least 6 characters.
            </div>


            {/* Submit */}

            <button
              type="submit"
              className="reset-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  🔒 Reset Password
                </>
              )}

            </button>

          </form>
        )}


        {/* Back Login */}

        <div className="reset-footer">

          <Link to="/login">
            ← Back to Login
          </Link>

        </div>


        {/* Security message */}

        <div className="security-note">

          <span>🛡️</span>

          <p>
            Your password reset link is secure and
            expires after 15 minutes.
          </p>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;