/**
 * Modal.test.tsx
 *
 * Tests the Modal component:
 * - Renders nothing when open is false
 * - Renders dialog wrapper, heading title, and children when open is true
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Modal } from "@/components/ui/Modal";

// Mock Button
jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe("Modal component", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal title="Auth Modal" open={false}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders overlay panel and children when open", () => {
    render(
      <Modal title="Auth Modal" open={true}>
        <p>Modal Content</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { name: "Auth Modal" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Auth Modal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });
});
