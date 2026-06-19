"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { login, register } from "@/services/api/auth.api";
import styles from "./auth.module.scss";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
  redirectTo?: string;
};

type TokenPayload = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: unknown;
};

type SocialProvider = "google" | "facebook";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7h10" />
      <path d="M7 12h7" />
      <path d="M7 17h5" />
      <rect x="4" y="3" width="16" height="18" rx="2" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.googleIcon}>
      <path d="M21.6 12.23c0-.76-.07-1.49-.2-2.19H12v4.15h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.49Z" />
      <path d="M12 22c2.7 0 4.96-.89 6.62-2.28l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
      <path d="M6.41 14.04A6.02 6.02 0 0 1 6.1 12c0-.71.11-1.39.31-2.04V7.37H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.63l3.34-2.59Z" />
      <path d="M12 5.84c1.47 0 2.78.5 3.82 1.49l2.87-2.87C16.95 2.85 14.69 2 12 2a10 10 0 0 0-8.93 5.37l3.34 2.59C7.2 7.6 9.4 5.84 12 5.84Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.facebookIcon}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.84c0-2.52 1.5-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function readToken(data: unknown) {
  if (!data || typeof data !== "object") return "";

  const payload = data as TokenPayload;

  return payload.accessToken || payload.access_token || payload.token || "";
}

function safeRedirectPath(path?: string | null) {
  if (!path) return "/account";

  try {
    const decoded = decodeURIComponent(path);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/account";
    }

    return decoded;
  } catch {
    return "/account";
  }
}

function saveSession(data: unknown) {
  const token = readToken(data);

  if (token) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("token", token);
  }

  if (data && typeof data === "object") {
    localStorage.setItem("lunex_user", JSON.stringify(data));
  }

  window.dispatchEvent(new Event("lunex-auth-change"));
}

function saveSocialSessionFromUrl(searchParams: URLSearchParams) {
  const token =
    searchParams.get("accessToken") ||
    searchParams.get("access_token") ||
    searchParams.get("token");

  if (!token) return false;

  const userParam = searchParams.get("user");
  let user: unknown = null;

  if (userParam) {
    try {
      user = JSON.parse(decodeURIComponent(userParam));
    } catch {
      user = null;
    }
  }

  saveSession({
    accessToken: token,
    token,
    user,
  });

  return true;
}

function getSocialHref(
  provider: SocialProvider,
  redirectTo: string,
  mode: Mode,
) {
  const params = new URLSearchParams({
    redirect: redirectTo,
    mode,
  });

  return `/api/storefront/auth/${provider}?${params.toString()}`;
}

export function AuthForm({ mode, redirectTo = "/account" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";
  const urlMessage =
    searchParams.get("error") || searchParams.get("message") || "";

  const safeRedirectTo = useMemo(
    () => safeRedirectPath(redirectTo),
    [redirectTo],
  );

  useEffect(() => {
    if (urlMessage) {
      return;
    }

    const hasSocialSession = saveSocialSessionFromUrl(searchParams);

    if (hasSocialSession) {
      router.replace(safeRedirectTo);
      router.refresh();
      return;
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      router.replace(safeRedirectTo);
    }
  }, [router, safeRedirectTo, searchParams, urlMessage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (isRegister && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const result = isRegister
      ? await register({
          firstName: String(form.get("firstName") || "").trim(),
          lastName: String(form.get("lastName") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          password,
          confirmPassword,
        })
      : await login({
          username: String(form.get("username") || "").trim(),
          password,
          remember: form.get("remember") === "on",
        });

    setIsSubmitting(false);

    if (!result.success) {
      setMessage(result.message || "Unable to complete your request.");
      return;
    }

    saveSession(result.data);
    router.push(safeRedirectTo);
    router.refresh();
  }

  const switchHref = isRegister
    ? `/login?redirect=${encodeURIComponent(safeRedirectTo)}`
    : `/register?redirect=${encodeURIComponent(safeRedirectTo)}`;

  return (
    <section className={styles.authShell} aria-labelledby={`${mode}-title`}>
      <div className={styles.authPanel}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}>
            {isRegister ? <BadgeIcon /> : <UserIcon />}
          </span>

          <div>
            <h1 id={`${mode}-title`}>
              {isRegister ? "Create Account" : "Sign in"}
            </h1>
            <p>
              {isRegister
                ? "Register quickly and continue shopping"
                : "Access your account securely"}
            </p>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2>
            {isRegister
              ? "Register With Credentials"
              : "Login With Credentials"}
          </h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {isRegister ? (
              <div className={styles.nameGrid}>
                <label className={styles.field}>
                  <span>First name</span>
                  <span className={styles.inputWrap}>
                    <UserIcon />
                    <input
                      name="firstName"
                      autoComplete="given-name"
                      required
                      placeholder="First name"
                    />
                  </span>
                </label>

                <label className={styles.field}>
                  <span>Last name</span>
                  <span className={styles.inputWrap}>
                    <UserIcon />
                    <input
                      name="lastName"
                      autoComplete="family-name"
                      required
                      placeholder="Last name"
                    />
                  </span>
                </label>
              </div>
            ) : null}

            {isRegister ? (
              <>
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

                <label className={styles.field}>
                  <span>Phone number</span>
                  <span className={styles.inputWrap}>
                    <UserIcon />
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone number"
                    />
                  </span>
                </label>
              </>
            ) : (
              <label className={styles.field}>
                <span>Email or phone number</span>
                <span className={styles.inputWrap}>
                  <UserIcon />
                  <input
                    name="username"
                    autoComplete="username"
                    required
                    placeholder="Email or phone number"
                  />
                </span>
              </label>
            )}

            <label className={styles.field}>
              <span>Password</span>
              <span className={styles.inputWrap}>
                <LockIcon />
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  required
                  placeholder="Password"
                />
              </span>
            </label>

            {isRegister ? (
              <label className={styles.field}>
                <span>Confirm password</span>
                <span className={styles.inputWrap}>
                  <LockIcon />
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Confirm password"
                  />
                </span>
              </label>
            ) : (
              <div className={styles.formMeta}>
                <label className={styles.remember}>
                  <input type="checkbox" name="remember" />
                  <span>Remember me</span>
                </label>

                <Link href="/forgot-password">Forgotten password?</Link>
              </div>
            )}

            {message || urlMessage ? (
              <p className={styles.alert}>{message || urlMessage}</p>
            ) : null}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : isRegister
                  ? "Register"
                  : "Login"}
            </button>
          </form>
        </div>

        <div className={styles.divider}>
          <span>{isRegister ? "or register with" : "or sign in with"}</span>
        </div>

        <div
          className={styles.socialRow}
          aria-label={isRegister ? "Social registrations" : "Social login"}
        >
          <a
            href={getSocialHref("google", safeRedirectTo, mode)}
            aria-label={`${isRegister ? "Register" : "Login"} with Google`}
          >
            <GoogleIcon />
          </a>

          <a
            href={getSocialHref("facebook", safeRedirectTo, mode)}
            aria-label={`${isRegister ? "Register" : "Login"} with Facebook`}
          >
            <FacebookIcon />
          </a>
        </div>

        <p className={styles.switchText}>
          {isRegister ? "Already have an account?" : "Don't have any account?"}{" "}
          <Link href={switchHref}>{isRegister ? "Login" : "Register"}</Link>
        </p>
      </div>
    </section>
  );
}
