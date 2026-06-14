"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { submitSubscription } from "@/services/api/content.api";
import styles from "./Footer.module.scss";

export function FooterSubscribe() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setMessage("");

    const response = await submitSubscription({
      email: String(formData.get("email") || "").trim(),
      consent: formData.get("consent") === "on",
    });

    if (response.success) {
      form.reset();
      setStatus("success");
      setMessage(response.message || "Thanks for subscribing.");
      return;
    }

    setStatus("error");
    setMessage(response.message || "Subscription failed. Please try again.");
  }

  return (
    <form className={styles.subscribe} onSubmit={handleSubmit}>
      {/* <h3>Subscribe</h3>
      <p>Get updates, offers, and Lunexbd news in your inbox.</p> */}
      <div className={styles.subscribeRow}>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          required
        />
        <label className={styles.consent}>
          <input name="consent" type="checkbox" required />
          <span>I agree to receive emails.</span>
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      {message ? (
        <p
          className={
            status === "error" ? styles.subscribeError : styles.subscribeNotice
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
