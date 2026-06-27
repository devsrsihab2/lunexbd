/**
 * OrderTimeline.test.tsx
 *
 * Tests the OrderTimeline component:
 * - Highlights the current active status correctly based on status index in ORDER_STATUSES
 * - Renders all statuses defined in ORDER_STATUSES
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderTimeline } from "@/components/account/OrderTimeline";

// Mock Badge component
jest.mock("@/components/ui/Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

describe("OrderTimeline component", () => {
  it("renders order statuses and highlights current status", () => {
    // Render with "on-hold" status
    render(<OrderTimeline status="on-hold" />);

    // ORDER_STATUSES includes: pending (index 0), processing (1), on-hold (2), completed (3), etc.
    const badges = screen.getAllByTestId("badge");
    
    // index 0 ("pending"), 1 ("processing"), and 2 ("on-hold") should be marked as "Current"
    expect(badges[0]).toHaveTextContent("Current");
    expect(badges[1]).toHaveTextContent("Current");
    expect(badges[2]).toHaveTextContent("Current");

    // index 3 ("completed") and onwards should be "Pending"
    expect(badges[3]).toHaveTextContent("Pending");
  });

  it("defaults to pending status index when status is undefined/unknown", () => {
    render(<OrderTimeline status={undefined} />);
    const badges = screen.getAllByTestId("badge");
    // Only first status (pending) is highlighted as "Current"
    expect(badges[0]).toHaveTextContent("Current");
    expect(badges[1]).toHaveTextContent("Pending");
  });
});
