/**
 * Footer.test.tsx
 *
 * Tests the Footer component:
 * - Renders fallback menu items when no custom menu is passed
 * - Displays logo or text fallback based on site settings
 * - Renders Shop links and payment badges
 * - Displays contact info when present
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import type { SiteSettings } from "@/types/content.types";

// Mock next/image
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock FooterSubscribe using full path alias
jest.mock("@/components/layout/FooterSubscribe", () => ({
  FooterSubscribe: () => <div data-testid="footer-subscribe" />,
}));

jest.mock("@/components/layout/Footer.module.scss", () => ({
  footer: "footer",
  inner: "inner",
  brandBlock: "brandBlock",
  brand: "brand",
  logoImage: "logoImage",
  footerGroup: "footerGroup",
  shopGroup: "shopGroup",
  careGroup: "careGroup",
  contactGroup: "contactGroup",
  links: "links",
  contactList: "contactList",
  socialLinks: "socialLinks",
  subscribeGroup: "subscribeGroup",
  bottomBar: "bottomBar",
  paymentBadges: "paymentBadges",
}));

const mockSettings: SiteSettings = {
  siteName: "My Custom Lunex",
  logo: "/logo.png",
  footerLogo: "/footer-logo.png",
  contactPhone: "+880 1234 5678",
  contactEmail: "support@custom.com",
  socialLinks: [{ label: "Facebook", href: "https://facebook.com" }],
};

describe("Footer component", () => {
  it("renders with fallback menu items and text brand when settings are null", () => {
    render(<Footer menu={undefined} settings={null} />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    // fallbacks to "Lunexbd" text
    expect(screen.getByText("Lunexbd")).toBeInTheDocument();
    expect(screen.getByText("Managed from WordPress settings")).toBeInTheDocument();
  });

  it("renders with custom settings details and custom menu list", () => {
    const customMenu = [{ label: "Help Center", href: "/help" }];
    render(<Footer menu={customMenu} settings={mockSettings} />);
    
    expect(screen.getByText("Help Center")).toBeInTheDocument();
    expect(screen.queryByText("Privacy Policy")).not.toBeInTheDocument();
    
    // Renders logo image
    const logoImg = screen.getByAltText("My Custom Lunex");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "/footer-logo.png");

    expect(screen.getByText("+880 1234 5678")).toBeInTheDocument();
    expect(screen.getByText("support@custom.com")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  it("renders shop links, footer subscribe, and payment badges", () => {
    render(<Footer settings={null} />);
    expect(screen.getByText("All Products")).toBeInTheDocument();
    expect(screen.getByTestId("footer-subscribe")).toBeInTheDocument();
    expect(screen.getByLabelSupportedPaymentMethods).toBeInTheDocument; // supported payment methods
  });
});
