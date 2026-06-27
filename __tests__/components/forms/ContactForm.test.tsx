/**
 * ContactForm.test.tsx
 *
 * Tests the ContactForm component:
 * - Renders all required form fields
 * - Shows a loading state while submitting
 * - Shows a success message on successful submission
 * - Shows an error message on failed submission
 * - Calls submitContact with the correct payload
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/forms/ContactForm";

// ── Mocks ─────────────────────────────────────────────────────────────────

jest.mock("@/services/api/content.api", () => ({
  submitContact: jest.fn(),
}));

jest.mock("@/components/forms/ContactForm.module.scss", () => ({}));
jest.mock("@/components/ui/Button.module.scss", () => ({}));
jest.mock("@/components/ui/Form.module.scss", () => ({}));

// Mock sub-components so we can test ContactForm in isolation
jest.mock("@/components/ui/Input", () => ({
  Input: ({ label, name, ...props }: any) => (
    <label>
      {label}
      <input name={name} aria-label={label} {...props} />
    </label>
  ),
}));

jest.mock("@/components/ui/Textarea", () => ({
  Textarea: ({ label, name, rows, ...props }: any) => (
    <label>
      {label}
      <textarea name={name} rows={rows} aria-label={label} {...props} />
    </label>
  ),
}));

jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, loading, ...props }: any) => (
    <button {...props}>{loading ? "Loading..." : children}</button>
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────

import { submitContact } from "@/services/api/content.api";
const mockSubmitContact = submitContact as jest.Mock;

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello there" } });
  fireEvent.click(screen.getByRole("button", { name: /send message/i }));
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("ContactForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("should render the submit button", () => {
    render(<ContactForm />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("should show success message after successful submission", async () => {
    mockSubmitContact.mockResolvedValueOnce({ success: true });
    render(<ContactForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
    expect(screen.getByText("Thanks, your message has been sent.")).toBeInTheDocument();
  });

  it("should show error message after failed submission", async () => {
    mockSubmitContact.mockResolvedValueOnce({
      success: false,
      message: "Something went wrong.",
    });
    render(<ContactForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("should show fallback error message when no message is returned", async () => {
    mockSubmitContact.mockResolvedValueOnce({ success: false });
    render(<ContactForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(
      screen.getByText("We could not send your message. Please try again.")
    ).toBeInTheDocument();
  });

  it("should show loading state while submitting", async () => {
    // Never resolves — simulates long in-flight request
    mockSubmitContact.mockImplementationOnce(() => new Promise(() => {}));
    render(<ContactForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /loading/i })).toBeInTheDocument();
    });
  });

  it("should call submitContact with the correct payload", async () => {
    mockSubmitContact.mockResolvedValueOnce({ success: true });
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Bob" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bob@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "01700000000" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Order query" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Where is my order?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(mockSubmitContact).toHaveBeenCalledTimes(1));
    const payload = mockSubmitContact.mock.calls[0][0];
    expect(payload.name).toBe("Bob");
    expect(payload.email).toBe("bob@example.com");
    expect(payload.phone).toBe("01700000000");
    expect(payload.message).toContain("Order query");
    expect(payload.message).toContain("Where is my order?");
  });
});
