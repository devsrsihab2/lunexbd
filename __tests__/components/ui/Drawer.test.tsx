/**
 * Drawer.test.tsx
 *
 * Tests the Drawer component:
 * - Renders nothing when open is false
 * - Renders title and children when open is true
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Drawer } from "@/components/ui/Drawer";

describe("Drawer component", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Drawer title="Filter Drawer" open={false}>
        <p>Drawer Content</p>
      </Drawer>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders panel and children when open", () => {
    render(
      <Drawer title="Filter Drawer" open={true}>
        <p>Drawer Content</p>
      </Drawer>
    );
    const drawer = screen.getByRole("complementary", { name: "Filter Drawer" });
    expect(drawer).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filter Drawer" })).toBeInTheDocument();
    expect(screen.getByText("Drawer Content")).toBeInTheDocument();
  });
});
