/**
 * ui-atoms.test.tsx
 *
 * Tests all small UI atom components:
 * Badge, Rating, SectionHeader, ErrorState, Tabs, Select, Textarea, Checkbox, Radio
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// ── CSS Module mocks ───────────────────────────────────────────────────────
jest.mock("@/components/ui/Badge.module.scss", () => ({ badge: "badge" }));
jest.mock("@/components/ui/Feedback.module.scss", () => ({}));
jest.mock("@/components/ui/Button.module.scss", () => ({}));
jest.mock("@/components/ui/Form.module.scss", () => ({}));
jest.mock("@/components/ui/SectionHeader.module.scss", () => ({}));

// ── Imports ────────────────────────────────────────────────────────────────
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";

// ── Badge ──────────────────────────────────────────────────────────────────
describe("Badge component", () => {
  it("should render children inside a span", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render any ReactNode children", () => {
    render(<Badge><strong>Hot</strong></Badge>);
    expect(screen.getByText("Hot")).toBeInTheDocument();
  });
});

// ── Rating ─────────────────────────────────────────────────────────────────
describe("Rating component", () => {
  it("should render 'New' when value is 0", () => {
    render(<Rating value="0" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render 'New' when value is omitted", () => {
    render(<Rating />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render formatted rating for a valid value", () => {
    render(<Rating value="4.5" />);
    expect(screen.getByText("4.5 / 5")).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    render(<Rating value="3" />);
    expect(screen.getByLabelText("3 out of 5 rating")).toBeInTheDocument();
  });

  it("should handle non-numeric strings gracefully", () => {
    render(<Rating value="abc" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

// ── SectionHeader ──────────────────────────────────────────────────────────
describe("SectionHeader component", () => {
  it("should render the title", () => {
    render(<SectionHeader title="Our Products" />);
    expect(screen.getByText("Our Products")).toBeInTheDocument();
  });

  it("should render subtitle text when provided", () => {
    render(<SectionHeader title="Title" text="Description here" />);
    expect(screen.getByText("Description here")).toBeInTheDocument();
  });

  it("should NOT render subtitle when text is omitted", () => {
    const { container } = render(<SectionHeader title="Title" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("should render action slot when provided", () => {
    render(<SectionHeader title="Title" action={<button>See All</button>} />);
    expect(screen.getByRole("button", { name: "See All" })).toBeInTheDocument();
  });
});

// ── ErrorState ─────────────────────────────────────────────────────────────
describe("ErrorState component", () => {
  it("should render with role=alert", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should render the default message when none provided", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("should render a custom message", () => {
    render(<ErrorState message="Network error." />);
    expect(screen.getByText("Network error.")).toBeInTheDocument();
  });

  it("should render a Retry link when retryHref is provided", () => {
    render(<ErrorState retryHref="/contact" />);
    expect(screen.getByRole("link", { name: "Retry" })).toBeInTheDocument();
  });

  it("should NOT render a Retry link when retryHref is omitted", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

// ── Tabs ───────────────────────────────────────────────────────────────────
describe("Tabs component", () => {
  const tabs = [
    { label: "Description", content: <p>Product description</p> },
    { label: "Reviews", content: <p>Customer reviews</p> },
  ];

  it("should render a tablist with correct number of tabs", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("should render each tab label", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  it("should render tab panel content", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText("Product description")).toBeInTheDocument();
    expect(screen.getByText("Customer reviews")).toBeInTheDocument();
  });

  it("should render correct number of tabpanels", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getAllByRole("tabpanel")).toHaveLength(2);
  });
});

// ── Select ─────────────────────────────────────────────────────────────────
describe("Select component", () => {
  const options = [
    { label: "Choose...", value: "" },
    { label: "Small", value: "s" },
    { label: "Medium", value: "m" },
  ];

  it("should render all options", () => {
    render(<Select label="Size" options={options} name="size" />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("should associate label with select", () => {
    render(<Select label="Size" options={options} name="size" />);
    expect(screen.getByLabelText("Size")).toBeInTheDocument();
  });

  it("should render error text when error prop is provided", () => {
    render(<Select label="Size" options={options} name="size" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("should set aria-invalid when error is present", () => {
    render(
      <Select label="Size" options={options} name="size" error="Required" />
    );
    expect(
      screen.getByLabelText("Size", { exact: false })
    ).toHaveAttribute("aria-invalid", "true");
  });
});

// ── Textarea ───────────────────────────────────────────────────────────────
describe("Textarea component", () => {
  it("should render a textarea element", () => {
    render(<Textarea label="Message" name="message" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should associate label with textarea", () => {
    render(<Textarea label="Message" name="message" />);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("should render error text when error prop is provided", () => {
    render(<Textarea label="Message" name="message" error="Too short" />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });

  it("should set aria-invalid when error is present", () => {
    render(
      <Textarea label="Message" name="message" error="Required" />
    );
    expect(
      screen.getByLabelText("Message", { exact: false })
    ).toHaveAttribute("aria-invalid", "true");
  });

  it("should forward rows prop", () => {
    render(<Textarea label="Message" name="message" rows={5} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
  });
});

// ── Checkbox ───────────────────────────────────────────────────────────────
describe("Checkbox component", () => {
  it("should render a checkbox input", () => {
    render(<Checkbox label="I agree" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should render the label text", () => {
    render(<Checkbox label="I agree" />);
    expect(screen.getByText("I agree")).toBeInTheDocument();
  });

  it("should forward the checked prop", () => {
    render(<Checkbox label="I agree" checked readOnly />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("should forward the disabled prop", () => {
    render(<Checkbox label="I agree" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

// ── Radio ──────────────────────────────────────────────────────────────────
describe("Radio component", () => {
  it("should render a radio input", () => {
    render(<Radio label="Yes" name="choice" value="yes" />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("should render the label text", () => {
    render(<Radio label="Yes" name="choice" value="yes" />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("should forward checked and disabled props", () => {
    render(<Radio label="No" name="choice" value="no" checked readOnly disabled />);
    expect(screen.getByRole("radio")).toBeChecked();
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});
