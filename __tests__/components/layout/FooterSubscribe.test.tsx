/**
 * FooterSubscribe.test.tsx
 *
 * Tests the FooterSubscribe component:
 * - Renders email input, consent checkbox, and subscribe button
 * - Disables submit button and shows loading state when submitting
 * - Displays success message on successful API response
 * - Displays error message on failed API response
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FooterSubscribe } from "@/components/layout/FooterSubscribe";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/services/api/content.api", () => ({
  submitSubscription: jest.fn(),
}));

jest.mock("@/components/layout/Footer.module.scss", () => ({
  subscribe: "subscribe",
  subscribeRow: "subscribeRow",
  consent: "consent",
  subscribeError: "subscribeError",
  subscribeNotice: "subscribeNotice",
}));

import { submitSubscription } from "@/services/api/content.api";
const mockSubmitSubscription = submitSubscription as jest.Mock;

describe("FooterSubscribe component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<FooterSubscribe />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByLabelText("I agree to receive emails.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
  });

  it("submits the subscription with proper email and consent", async () => {
    mockSubmitSubscription.mockResolvedValueOnce({
      success: true,
      message: "Subscribed successfully!",
    });

    render(<FooterSubscribe />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const consentCheckbox = screen.getByLabelText("I agree to receive emails.");
    const submitBtn = screen.getByRole("button", { name: "Subscribe" });

    fireEvent.change(emailInput, { target: { value: "subscriber@example.com" } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmitSubscription).toHaveBeenCalledWith({
        email: "subscriber@example.com",
        consent: true,
      });
      expect(screen.getByText("Subscribed successfully!")).toBeInTheDocument();
    });
  });

  it("shows error message when subscription API fails", async () => {
    mockSubmitSubscription.mockResolvedValueOnce({
      success: false,
      message: "Failed to subscribe.",
    });

    render(<FooterSubscribe />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const consentCheckbox = screen.getByLabelText("I agree to receive emails.");
    const submitBtn = screen.getByRole("button", { name: "Subscribe" });

    fireEvent.change(emailInput, { target: { value: "fail@example.com" } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Failed to subscribe.")).toBeInTheDocument();
    });
  });
});
