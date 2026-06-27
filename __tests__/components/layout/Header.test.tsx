/**
 * Header.test.tsx
 *
 * Tests the Header layout component:
 * - Renders logo, search trigger, cart items badge count, and user actions
 * - Expands mega-menus on desktop layouts
 * - Syncs user logged-in credentials state from localStorage
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/Header";
import type { SiteSettings, MenuItem } from "@/types/content.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  usePathname: () => "/products",
}));

// Mock next/image
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock hooks
jest.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    cart: {
      items: [
        { key: "item1", productId: 1, name: "Luxury Bag", quantity: 2, price: "500", total: "1000" },
      ],
    },
  }),
}));

// Mock sub-components
jest.mock("@/components/layout/MobileMenu", () => ({
  MobileMenu: () => <div data-testid="mobile-menu-mock" />,
}));

jest.mock("@/components/layout/SearchBox", () => ({
  SearchBox: ({ id }: any) => <div data-testid={`searchbox-${id}`} />,
}));

jest.mock("@/components/layout/Header.module.scss", () => ({
  header: "header",
  desktopHeader: "desktopHeader",
  topBar: "topBar",
  mainNav: "mainNav",
  logo: "logo",
  logoImage: "logoImage",
  menu: "menu",
  menuItem: "menuItem",
  activeMenuItem: "activeMenuItem",
  menuItemHasChildren: "menuItemHasChildren",
  megaMenu: "megaMenu",
  megaMenuInner: "megaMenuInner",
  megaMenuTop: "megaMenuTop",
  megaMenuGrid: "megaMenuGrid",
  megaMenuColumn: "megaMenuColumn",
  megaMenuEmpty: "megaMenuEmpty",
  megaMenuShowAll: "megaMenuShowAll",
  chevron: "chevron",
  actions: "actions",
  actionButton: "actionButton",
  actionIcon: "actionIcon",
  badge: "badge",
  mobileHeaderWrapper: "mobileHeaderWrapper",
  mobileHeader: "mobileHeader",
}));

const mockSettings: SiteSettings = {
  siteName: "Lunex Store",
  logo: "/logo.png",
  contactPhone: "+880 1711 111111",
};

const mockMenu: MenuItem[] = [
  {
    label: "Bags",
    href: "/category/bags",
    children: [
      { label: "Backpacks", href: "/category/backpacks" },
      { label: "Handbags", href: "/category/handbags" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
  },
];

describe("Header component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("renders with fallback details and text fallback site title", () => {
    render(<Header menu={undefined} settings={null} />);
    // Fallback brand uses 'Lunex' text (in both desktop + mobile, take first)
    expect(screen.getAllByText("Lunex")[0]).toBeInTheDocument();
    
    // Fallback menu includes Home, Ladies Bag, etc.
    expect(screen.getByText("Ladies Bag")).toBeInTheDocument();
  });

  it("renders logo, call link with phone href, and cart items counter", () => {
    render(<Header menu={mockMenu} settings={mockSettings} />);

    // Logo appears in both desktop and mobile sections
    const logoImgs = screen.getAllByAltText("Lunex Store");
    expect(logoImgs[0]).toBeInTheDocument();
    expect(logoImgs[0]).toHaveAttribute("src", "/logo.png");

    // Phone number used as href on the call link (not visible text in Header)
    const callLink = screen.getByRole("link", { name: /Call/i });
    expect(callLink).toHaveAttribute("href", "tel:+8801711111111");
    // Cart badge count displays "2" (since quantity = 2)
    // Desktop badge uses <b>, mobile uses <span>; both render "2"
    expect(screen.getAllByText("2")[0]).toBeInTheDocument();
  });

  it("updates user status when access token is present", () => {
    localStorage.setItem("accessToken", "token-xyz");
    render(<Header menu={mockMenu} settings={mockSettings} />);
    // Desktop action shows 'Account' text when logged in (as opposed to 'Sign In')
    // The text is rendered inside <span> inside a <Link>, query by visible text
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("opens desktop mega menu categories column on mouse interactions", () => {
    render(<Header menu={mockMenu} settings={mockSettings} />);

    const menuLink = screen.getByRole("link", { name: "Bags" });
    
    // Open mega menu
    fireEvent.mouseEnter(menuLink);
    expect(screen.getByText("Browse all available categories")).toBeInTheDocument();
    expect(screen.getByText("Backpacks")).toBeInTheDocument();
    expect(screen.getByText("Handbags")).toBeInTheDocument();
  });
});
