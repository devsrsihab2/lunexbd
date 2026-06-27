/**
 * JsonLd.test.tsx
 *
 * Tests the JsonLd component:
 * - Injects the raw JSON payload correctly into script dangerouslySetInnerHTML
 */
import React from "react";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/seo/JsonLd";

describe("JsonLd component", () => {
  it("renders script tag containing correct serialized json data", () => {
    const data = { "@context": "https://schema.org", "@type": "Product", name: "Backpack" };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector("script");
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(script?.innerHTML).toBe(JSON.stringify(data));
  });
});
