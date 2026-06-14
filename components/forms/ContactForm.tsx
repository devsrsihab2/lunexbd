"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitContact } from "@/services/api/content.api";
import styles from "./ContactForm.module.scss";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: [
        String(formData.get("subject") || "").trim()
          ? `Subject: ${String(formData.get("subject") || "").trim()}`
          : "",
        String(formData.get("message") || "").trim(),
      ].filter(Boolean).join("\n\n"),
    };

    setStatus("loading");
    setMessage("");

    const response = await submitContact(payload);
    if (response.success) {
      form.reset();
      setStatus("success");
      setMessage("Thanks, your message has been sent.");
      return;
    }

    setStatus("error");
    setMessage(response.message || "We could not send your message. Please try again.");
  }

  return (
    <form className={styles.formShell} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>Send us a message</h2>
        <p className={styles.text}>We are here to help. Send your question or comment and our team will respond promptly.</p>
      </div>

      <div className={styles.grid}>
        <Input label="Name" name="name" autoComplete="name" required />
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" />
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input label="Subject" name="subject" />
        <div className={styles.full}>
          <Textarea label="Message" name="message" rows={5} required />
        </div>
      </div>

      {message ? (
        <div className={status === "error" ? styles.error : styles.notice} role={status === "error" ? "alert" : "status"}>
          {message}
        </div>
      ) : null}

      <Button className={styles.submit} type="submit" loading={status === "loading"}>
        Send message
      </Button>
    </form>
  );
}
