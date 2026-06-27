/**
 * MobileMenu.test.tsx
 *
 * Tests the MobileMenu component:
 * - Toggles side navigation drawer visibility
 * - Renders parent links and toggles sub-menus on click
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import type { MenuItem } from "@/types/content.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  usePathname: () => "/category/bags",
}));

// Mock next/image
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("@/components/layout/Header.module.scss", () => ({
  menuButton: "menuButton",
  mobileLayer: "mobileLayer",
  mobileLayerOpen: "mobileLayerOpen",
  mobileScrim: "mobileScrim",
  mobilePanel: "mobilePanel",
  mobileHead: "mobileHead",
  mobileBrand: "mobileBrand",
  mobileLogoImage: "mobileLogoImage",
  mobileIntro: "mobileIntro",
  mobileLinks: "mobileLinks",
  mobileMenuGroup: "mobileMenuGroup",
  mobileMenuGroupOpen: "mobileMenuGroupOpen",
  mobileParentButton: "mobileParentButton",
  mobileActiveLink: "mobileActiveLink",
  mobileMenuIcon: "mobileMenuIcon",
  mobileMenuText: "mobileMenuText",
  mobileChevronOpen: "mobileChevronOpen",
  mobileSubLinks: "mobileSubLinks",
  mobileViewAll: "mobileViewAll",
  mobileActiveSubLink: "mobileActiveSubLink",
  mobileSingleLink: "mobileSingleLink",
}));

const mockMenu: MenuItem[] = [
  {
    label: "Bags",
    href: "/category/bags",
    children: [{ label: "Backpacks", href: "/category/backpacks" }],
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

describe("MobileMenu component", () => {
  it("renders closed menu trigger", () => {
    render(<MobileMenu menu={mockMenu} settings={null} />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens navigation drawer when trigger is clicked", () => {
    render(<MobileMenu menu={mockMenu} settings={null} />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Drawer is now open, displays brand logo name, section title, and links
    expect(screen.getByText("Explore categories")).toBeInTheDocument();
    expect(screen.getByText("Bags")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("toggles sub-link dropdown menu when parent option clicked", () => {
    render(<MobileMenu menu={mockMenu} settings={null} />);
    
    // Open drawer
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    // Click parent dropdown trigger button
    const parentBtn = screen.getByRole("button", { name: /Bags/ });
    expect(parentBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(parentBtn);
    expect(parentBtn).toHaveAttribute("aria-expanded", "true");

    // Sub-links are now visible
    expect(screen.getByText("View all Bags")).toBeInTheDocument();
    expect(screen.getByText("Backpacks")).toBeInTheDocument();
  });
});
