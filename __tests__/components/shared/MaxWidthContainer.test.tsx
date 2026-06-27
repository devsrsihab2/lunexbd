/**
 * MaxWidthContainer.test.tsx
 *
 * Tests the MaxWidthContainer component:
 * - Renders children correctly
 * - Adds container / containerFluid class names conditionally
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import MaxWidthContainer from "@/components/shared/MaxWidthContainer";

jest.mock("@/components/shared/MaxWidthContainer.module.scss", () => ({
  container: "container",
  containerFluid: "containerFluid",
}));

describe("MaxWidthContainer component", () => {
  it("renders container children and applies standard class when fluid is false", () => {
    render(
      <MaxWidthContainer>
        <span data-testid="inner">Test child</span>
      </MaxWidthContainer>
    );

    const child = screen.getByTestId("inner");
    expect(child).toBeInTheDocument();
    
    const wrapper = child.parentElement;
    expect(wrapper).toHaveClass("container");
  });

  it("applies containerFluid class when fluid is true", () => {
    const { container } = render(
      <MaxWidthContainer fluid>
        <div>Fluid</div>
      </MaxWidthContainer>
    );

    expect(container.firstChild).toHaveClass("containerFluid");
  });
});
