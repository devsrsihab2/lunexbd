"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/services/api/auth.api";
import styles from "../(auth)/auth.module.scss";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const response = await requestPasswordReset({ email });

    setIsSubmitting(false);

    if (!response.success) {
      setMessage(response.message || "Unable to send password reset email.");
      return;
    }

    setSuccess(true);
    setMessage("Password reset instructions have been sent to your email.");
    event.currentTarget.reset();
  }

  return (
    <section className={styles.authShell} aria-labelledby="forgot-password-title">
      <div className={styles.authPanel}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}>
            <MailIcon />
          </span>
          <div>
            <h1 id="forgot-password-title">Forgot Password</h1>
            <p>Enter your account email and we will send a secure reset link.</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>Reset your password</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.field}>
              <span>Email address</span>
              <span className={styles.inputWrap}>
                <MailIcon />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                />
              </span>
            </label>

            {message ? (
              <p className={success ? styles.successAlert : styles.alert}>
                {message}
              </p>
            ) : null}

            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>

        <p className={styles.switchText}>
          Remember your password? <Link href="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
