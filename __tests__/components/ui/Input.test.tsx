/**
 * Input.test.tsx
 *
 * Tests the Input component:
 * - Renders a label wrapping the input
 * - Associates the label text with the input via htmlFor/id
 * - Renders helpText when provided
 * - Renders error text when provided
 * - Sets aria-invalid when error is present
 * - Forwards all standard HTML input props (placeholder, type, required…)
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

// Mock CSS module
jest.mock("@/components/ui/Form.module.scss", () => ({}));

describe("Input component", () => {
  it("should render a label with the given label text", () => {
    render(<Input label="Full Name" name="fullName" />);
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
  });

  it("should use the name prop as the input id when no id is provided", () => {
    render(<Input label="Email" name="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
  });

  it("should use the provided id prop over name", () => {
    render(<Input label="Email" name="email" id="custom-id" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("should render helpText when provided", () => {
    render(<Input label="Password" name="password" helpText="At least 8 characters" />);
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });

  it("should render error text when provided", () => {
    render(<Input label="Phone" name="phone" error="Invalid phone number" />);
    expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
  });

  it("should set aria-invalid when an error is present", () => {
    render(<Input label="Phone" name="phone" error="Required" />);
    // The label element also contains the error span, so full text is "Phone Required";
    // use exact:false so the query still resolves to the correct input.
    expect(screen.getByLabelText("Phone", { exact: false })).toHaveAttribute("aria-invalid", "true");
  });

  it("should NOT set aria-invalid when no error is present", () => {
    render(<Input label="Phone" name="phone" />);
    expect(screen.getByLabelText("Phone")).toHaveAttribute("aria-invalid", "false");
  });

  it("should forward additional props like type, placeholder, and required", () => {
    render(
      <Input
        label="Website"
        name="website"
        type="url"
        placeholder="https://example.com"
        required
      />
    );
    const input = screen.getByLabelText("Website");
    expect(input).toHaveAttribute("type", "url");
    expect(input).toHaveAttribute("placeholder", "https://example.com");
    expect(input).toBeRequired();
  });
});
