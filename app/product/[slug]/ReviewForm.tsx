"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { ReviewFormState } from "./actions";
import styles from "./product-detail.module.scss";

type ReviewFormProps = {
  action: (
    state: ReviewFormState,
    formData: FormData,
  ) => Promise<ReviewFormState>;
  loginHref: string;
};

const initialState: ReviewFormState = {
  success: false,
  message: "",
};

function getAuthToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
}

export function ReviewForm({ action, loginHref }: ReviewFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const authTokenRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (authTokenRef.current) {
      authTokenRef.current.value = getAuthToken();
    }
  }, []);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();

      if (authTokenRef.current) {
        authTokenRef.current.value = getAuthToken();
      }
    }
  }, [router, state.success]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const token = getAuthToken();

    if (!token) {
      event.preventDefault();
      router.push(loginHref);
      return;
    }

    if (authTokenRef.current) {
      authTokenRef.current.value = token;
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={styles.reviewForm}
      onSubmit={handleSubmit}
    >
      <input ref={authTokenRef} type="hidden" name="authToken" />

      <div className={styles.reviewHeading}>
        <h2>Submit Your Review</h2>
        <span aria-hidden="true" />
      </div>

      <p>Only logged-in customers can submit a review. Required fields are marked *</p>

      <label className={styles.reviewField}>
        <span>Write your opinion about the product</span>
        <textarea
          name="review"
          placeholder="Write Your Review Here..."
          rows={6}
          required
          aria-invalid={Boolean(state.errors?.review)}
        />
        {state.errors?.review ? <small>{state.errors.review}</small> : null}
      </label>

      <label className={styles.reviewField}>
        <span>Your Rating:</span>
        <select
          name="rating"
          required
          defaultValue=""
          aria-invalid={Boolean(state.errors?.rating)}
        >
          <option value="">Select One</option>
          <option value="5">Perfect</option>
          <option value="4">Good</option>
          <option value="3">Average</option>
          <option value="2">Not that bad</option>
          <option value="1">Very poor</option>
        </select>
        {state.errors?.rating ? <small>{state.errors.rating}</small> : null}
      </label>


      {state.message ? (
        <p
          className={state.success ? styles.reviewSuccess : styles.reviewError}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className={styles.submitRow}>
        <Button type="submit" loading={pending}>
          Submit Review
        </Button>
      </div>
    </form>
  );
}
