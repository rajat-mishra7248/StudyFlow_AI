import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    // ----------------------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------------------

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // ----------------------------------------------------------
    // API REQUEST
    // ----------------------------------------------------------

    try {
      setLoading(true);

      const response = await forgotPassword(trimmedEmail);

      setSuccess(
        response?.message ||
        "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");

    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );

      setError(
        err?.message ||
        "Unable to send password reset email. Please try again later."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <style>{`

        /* ======================================================
           PAGE
        ====================================================== */

        .forgot-page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px 16px;

          box-sizing: border-box;

          background:
            radial-gradient(
              circle at top left,
              #dbeafe 0,
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              #e0e7ff 0,
              transparent 35%
            ),
            #f8fafc;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          position: relative;

          overflow: hidden;
        }


        /* ======================================================
           BACKGROUND DECORATION
        ====================================================== */

        .forgot-circle {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .forgot-circle-one {
          width: 300px;
          height: 300px;

          top: -120px;
          left: -100px;

          background: rgba(
            37,
            99,
            235,
            0.08
          );
        }

        .forgot-circle-two {
          width: 350px;
          height: 350px;

          bottom: -170px;
          right: -130px;

          background: rgba(
            79,
            70,
            229,
            0.07
          );
        }


        /* ======================================================
           CARD
        ====================================================== */

        .forgot-card {
          width: 100%;
          max-width: 470px;

          box-sizing: border-box;

          padding: 38px;

          background: rgba(
            255,
            255,
            255,
            0.97
          );

          border: 1px solid #e5e7eb;

          border-radius: 22px;

          box-shadow:
            0 20px 50px
            rgba(
              15,
              23,
              42,
              0.10
            );

          position: relative;

          z-index: 2;
        }


        /* ======================================================
           BRAND
        ====================================================== */

        .forgot-brand {
          display: flex;

          align-items: center;

          gap: 13px;

          margin-bottom: 32px;
        }

        .forgot-logo {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-size: 17px;

          font-weight: 800;

          box-shadow:
            0 8px 20px
            rgba(
              37,
              99,
              235,
              0.25
            );
        }

        .forgot-brand h1 {
          margin: 0;

          color: #111827;

          font-size: 20px;

          font-weight: 750;
        }

        .forgot-brand span {
          display: block;

          margin-top: 2px;

          color: #6b7280;

          font-size: 12px;
        }


        /* ======================================================
           HEADER
        ====================================================== */

        .forgot-header {
          text-align: center;

          margin-bottom: 28px;
        }

        .forgot-icon {
          width: 64px;
          height: 64px;

          margin:
            0 auto 16px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background: #eff6ff;

          font-size: 29px;
        }

        .forgot-header h2 {
          margin: 0;

          color: #111827;

          font-size: 26px;

          font-weight: 750;
        }

        .forgot-header p {
          margin:
            9px auto 0;

          max-width: 370px;

          color: #6b7280;

          font-size: 14px;

          line-height: 1.6;
        }


        /* ======================================================
           FORM
        ====================================================== */

        .forgot-form {
          display: flex;

          flex-direction: column;

          gap: 18px;
        }

        .forgot-form-group {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .forgot-form-group label {
          color: #374151;

          font-size: 14px;

          font-weight: 650;
        }

        .forgot-form-group input {
          width: 100%;

          box-sizing: border-box;

          padding: 14px 15px;

          border:
            1px solid #d1d5db;

          border-radius: 11px;

          outline: none;

          background: white;

          color: #111827;

          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .forgot-form-group input::placeholder {
          color: #9ca3af;
        }

        .forgot-form-group input:focus {
          border-color: #2563eb;

          box-shadow:
            0 0 0 4px
            rgba(
              37,
              99,
              235,
              0.10
            );
        }

        .forgot-form-group input:disabled {
          background: #f3f4f6;

          cursor: not-allowed;
        }


        /* ======================================================
           BUTTON
        ====================================================== */

        .forgot-button {
          width: 100%;

          min-height: 48px;

          border: none;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          box-shadow:
            0 8px 20px
            rgba(
              37,
              99,
              235,
              0.22
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .forgot-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:
            0 12px 25px
            rgba(
              37,
              99,
              235,
              0.28
            );
        }

        .forgot-button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .forgot-button:disabled {
          opacity: 0.7;

          cursor: not-allowed;
        }


        /* ======================================================
           SPINNER
        ====================================================== */

        .forgot-spinner {
          width: 16px;
          height: 16px;

          border:
            2px solid
            rgba(
              255,
              255,
              255,
              0.4
            );

          border-top-color: white;

          border-radius: 50%;

          animation:
            forgot-spin
            0.7s linear infinite;
        }

        @keyframes forgot-spin {

          to {
            transform:
              rotate(360deg);
          }

        }


        /* ======================================================
           SUCCESS / ERROR
        ====================================================== */

        .forgot-alert {
          display: flex;

          align-items: flex-start;

          gap: 12px;

          padding: 14px;

          margin-bottom: 20px;

          border-radius: 12px;

          font-size: 13px;

          line-height: 1.5;
        }

        .forgot-alert-icon {
          font-size: 18px;

          line-height: 1;
        }

        .forgot-alert strong {
          display: block;

          margin-bottom: 4px;

          font-size: 13px;
        }

        .forgot-alert p {
          margin: 0;
        }


        .forgot-success {
          background: #f0fdf4;

          border:
            1px solid #bbf7d0;

          color: #166534;
        }


        .forgot-error {
          background: #fef2f2;

          border:
            1px solid #fecaca;

          color: #991b1b;
        }


        /* ======================================================
           EMAIL INFORMATION
        ====================================================== */

        .forgot-info {
          display: flex;

          align-items: flex-start;

          gap: 9px;

          margin-top: 3px;

          padding: 12px 13px;

          border-radius: 10px;

          background: #f8fafc;

          color: #64748b;

          font-size: 12px;

          line-height: 1.5;
        }

        .forgot-info span {
          font-size: 15px;
        }


        /* ======================================================
           FOOTER
        ====================================================== */

        .forgot-footer {
          text-align: center;

          margin-top: 25px;

          padding-top: 20px;

          border-top:
            1px solid #f1f5f9;
        }

        .forgot-footer a {
          color: #2563eb;

          text-decoration: none;

          font-size: 14px;

          font-weight: 650;
        }

        .forgot-footer a:hover {
          text-decoration: underline;
        }


        /* ======================================================
           SECURITY
        ====================================================== */

        .forgot-security {
          display: flex;

          justify-content: center;

          align-items: center;

          gap: 7px;

          margin-top: 18px;

          color: #94a3b8;

          font-size: 11px;

          text-align: center;

          line-height: 1.4;
        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 600px) {

          .forgot-page {
            padding: 20px 14px;
          }

          .forgot-card {
            padding: 26px 20px;

            border-radius: 18px;
          }

          .forgot-brand {
            margin-bottom: 25px;
          }

          .forgot-logo {
            width: 44px;
            height: 44px;
          }

          .forgot-brand h1 {
            font-size: 18px;
          }

          .forgot-header h2 {
            font-size: 23px;
          }

          .forgot-header p {
            font-size: 13px;
          }

        }

      `}</style>


      {/* ========================================================
          PAGE
      ======================================================== */}

      <div className="forgot-page">

        <div
          className="forgot-circle forgot-circle-one"
        />

        <div
          className="forgot-circle forgot-circle-two"
        />


        {/* ======================================================
            CARD
        ====================================================== */}

        <div className="forgot-card">


          {/* ====================================================
              BRAND
          ==================================================== */}

          <div className="forgot-brand">

            <div className="forgot-logo">
              SF
            </div>

            <div>

              <h1>
                StudyFlow AI
              </h1>

              <span>
                Smart Learning Platform
              </span>

            </div>

          </div>


          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="forgot-header">

            <div className="forgot-icon">
              🔑
            </div>

            <h2>
              Forgot Password?
            </h2>

            <p>
              Don't worry. Enter your registered
              email address and we'll send you a
              secure password reset link.
            </p>

          </div>


          {/* ====================================================
              SUCCESS
          ==================================================== */}

          {success && (

            <div
              className="
                forgot-alert
                forgot-success
              "
            >

              <div className="forgot-alert-icon">
                ✓
              </div>

              <div>

                <strong>
                  Reset Link Sent
                </strong>

                <p>
                  {success}
                </p>

              </div>

            </div>

          )}


          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (

            <div
              className="
                forgot-alert
                forgot-error
              "
            >

              <div className="forgot-alert-icon">
                ⚠️
              </div>

              <div>

                <strong>
                  Unable to Send Reset Link
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* ====================================================
              FORM
          ==================================================== */}

          <form
            className="forgot-form"
            onSubmit={handleSubmit}
          >

            <div className="forgot-form-group">

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter your registered email"
                disabled={loading}
                autoComplete="email"
              />

            </div>


            {/* ==================================================
                INFO
            ================================================== */}

            <div className="forgot-info">

              <span>
                📩
              </span>

              <div>
                The password reset link will be sent
                to your registered email address.
                The link will expire in 15 minutes.
              </div>

            </div>


            {/* ==================================================
                BUTTON
            ================================================== */}

            <button
              type="submit"
              className="forgot-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="forgot-spinner" />

                  Sending Reset Link...

                </>

              ) : (

                <>
                  📩 Send Reset Link
                </>

              )}

            </button>

          </form>


          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="forgot-footer">

            <Link to="/login">
              ← Back to Login
            </Link>

          </div>


          {/* ====================================================
              SECURITY
          ==================================================== */}

          <div className="forgot-security">

            <span>
              🛡️
            </span>

            <span>
              Your account security is our priority.
            </span>

          </div>

        </div>

      </div>

    </>
  );
}

export default ForgotPassword;