"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import type { MenuItem, SiteSettings } from "@/types/content.types";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import styles from "./Header.module.scss";

const DESKTOP_VISIBLE_MENU_LIMIT = 8;

const fallbackMenu: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Ladies Bag", href: "/category/ladies-bag" },
  { label: "Men Bag", href: "/category/men-bag" },
  { label: "Wallet", href: "/category/wallet" },
  { label: "Accessories", href: "/products" },
  { label: "Sale", href: "/products?sort=price_asc" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Icon({
  name,
  className,
}: {
  name: "truck" | "support" | "search" | "user" | "heart" | "bag" | "chevron";
  className?: string;
}) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (name === "truck") {
    return (
      <svg {...common}>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <path d="M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "support") {
    return (
      <svg {...common}>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <path d="M5 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
        <path d="M19 13h-3v6h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="10.8" cy="10.8" r="7.2" />
        <path d="m16.1 16.1 4.4 4.4" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 4.5 6 7.5l3-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function menuKey(item: MenuItem, index: number, prefix = "menu") {
  return `${prefix}-${item.label}-${item.href}-${index}`;
}

function normalizeCategoryHref(href: string) {
  if (!href) return href;

  const isExternal = /^https?:\/\//i.test(href);
  if (isExternal) return href;

  const [pathWithHash, query = ""] = href.split("?");
  const [path, hash = ""] = pathWithHash.split("#");

  const cleanPath = path.replace(/\/+$/, "");
  const categoryPrefix = "/category/";

  if (!cleanPath.startsWith(categoryPrefix)) {
    return href;
  }

  const parts = cleanPath
    .replace(categoryPrefix, "")
    .split("/")
    .filter(Boolean);

  if (!parts.length) {
    return href;
  }

  const lastSlug = parts[parts.length - 1];
  let normalizedHref = `${categoryPrefix}${lastSlug}`;

  if (hash) normalizedHref += `#${hash}`;
  if (query) normalizedHref += `?${query}`;

  return normalizedHref;
}

function isMenuActive(pathname: string | null, href: string) {
  const hrefPath = href.split("?")[0].split("#")[0];

  if (hrefPath === "/") return pathname === "/";
  return Boolean(pathname?.startsWith(hrefPath));
}

function DesktopDropdownLinks({
  items,
  parentKey,
}: {
  items: MenuItem[];
  parentKey: string;
}) {
  return (
    <div className={styles.dropdown}>
      {items.map((child, childIndex) => {
        const childHref = normalizeCategoryHref(child.href);

        return (
          <Link key={menuKey(child, childIndex, parentKey)} href={childHref}>
            {child.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Header({
  menu = fallbackMenu,
  topMenu = [],
  settings,
}: {
  menu?: MenuItem[];
  topMenu?: MenuItem[];
  settings?: SiteSettings | null;
}) {
  const pathname = usePathname();
  const { cart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const cartCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const primaryMenu = menu.length ? menu : fallbackMenu;

  const { visibleMenu, overflowMenu } = useMemo(() => {
    return {
      visibleMenu: primaryMenu.slice(0, DESKTOP_VISIBLE_MENU_LIMIT),
      overflowMenu: primaryMenu.slice(DESKTOP_VISIBLE_MENU_LIMIT),
    };
  }, [primaryMenu]);

  const dealLink =
    settings?.deals?.href ||
    settings?.topBanner?.href ||
    topMenu[0]?.href ||
    "/products";

  const dealLabel =
    settings?.deals?.label ||
    settings?.topBanner?.badge ||
    topMenu[0]?.label ||
    "Deals";

  const deliveryText =
    settings?.serviceBar?.deliveryText || "Free Delivery on all orders";
  const deliveryHref = settings?.serviceBar?.deliveryHref || "/products";

  const returnsText =
    settings?.serviceBar?.returnsText || "Easy Returns within 7 days";
  const returnsHref = settings?.serviceBar?.returnsHref || "/terms-conditions";

  const supportText =
    settings?.contactPhone ||
    settings?.serviceBar?.supportText ||
    "Help & Support";

  const supportHref = settings?.serviceBar?.supportHref || "/contact";
  const logoIsLocal = settings?.logo?.startsWith("/");

  useEffect(() => {
    function syncAuth() {
      setIsLoggedIn(
        Boolean(
          localStorage.getItem("accessToken") || localStorage.getItem("token"),
        ),
      );
    }

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("lunex-auth-change", syncAuth);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("lunex-auth-change", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.serviceBar}>
        <div className={styles.serviceInner}>
          <div className={styles.serviceLeft}>
            <Link href={deliveryHref}>
              <Icon name="truck" /> <strong>{deliveryText}</strong>
            </Link>

            <i aria-hidden="true" />

            <Link href={returnsHref}>
              <strong>{returnsText}</strong>
            </Link>

            <i aria-hidden="true" />

            <Link className={styles.dealLink} href={dealLink}>
              <strong>{dealLabel}</strong>
            </Link>
          </div>

          <Link href={supportHref}>
            <Icon name="support" /> {supportText}
          </Link>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={styles.inner}>
          <MobileMenu menu={primaryMenu} />

          <Link className={styles.brand} href="/">
            {settings?.logo && logoIsLocal ? (
              <Image
                className={styles.logoImage}
                src={settings.logo}
                alt={settings.siteName || "Lunexbd"}
                width={230}
                height={76}
                priority
              />
            ) : settings?.logo ? (
              <Image
                className={styles.logoImage}
                src={settings.logo}
                alt={settings.siteName || "Lunexbd"}
                width={230}
                height={76}
                unoptimized
                priority
              />
            ) : (
              <>
                <span className={styles.mark}>L</span>
                <span className={styles.wordmark}>
                  <strong>Lunex</strong>
                  <small>All Bags. Every You.</small>
                </span>
              </>
            )}
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {visibleMenu.map((item, index) => {
              const normalizedHref = normalizeCategoryHref(item.href);
              const isActive = isMenuActive(pathname, normalizedHref);

              return (
                <div
                  key={menuKey(item, index, "header")}
                  className={styles.navItem}
                >
                  <Link
                    className={isActive ? styles.active : undefined}
                    href={normalizedHref}
                  >
                    <span>{item.label}</span>
                    {item.children?.length ? (
                      <Icon name="chevron" className={styles.chevronIcon} />
                    ) : null}
                  </Link>

                  {item.children?.length ? (
                    <DesktopDropdownLinks
                      items={item.children}
                      parentKey={`header-${index}`}
                    />
                  ) : null}
                </div>
              );
            })}

            {overflowMenu.length ? (
              <div className={`${styles.navItem} ${styles.moreNavItem}`}>
                <button className={styles.moreButton} type="button">
                  <span>More</span>
                  <Icon name="chevron" className={styles.chevronIcon} />
                </button>

                <div className={`${styles.dropdown} ${styles.moreDropdown}`}>
                  {overflowMenu.map((item, index) => {
                    const normalizedHref = normalizeCategoryHref(item.href);

                    return (
                      <div
                        className={styles.moreGroup}
                        key={menuKey(item, index, "more")}
                      >
                        <Link
                          className={
                            isMenuActive(pathname, normalizedHref)
                              ? styles.active
                              : undefined
                          }
                          href={normalizedHref}
                        >
                          {item.label}
                        </Link>

                        {item.children?.length ? (
                          <div className={styles.moreChildren}>
                            {item.children.map((child, childIndex) => {
                              const childHref = normalizeCategoryHref(
                                child.href,
                              );

                              return (
                                <Link
                                  key={menuKey(
                                    child,
                                    childIndex,
                                    `more-${index}`,
                                  )}
                                  href={childHref}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </nav>

          <nav className={styles.actions} aria-label="Shop shortcuts">
            <SearchBox id="desktop-site-search" icon={<Icon name="search" />} />

            <Link href="/wishlist" aria-label="Wishlist">
              <Icon name="heart" />
            </Link>

            <Link
              href={isLoggedIn ? "/account" : "/login"}
              aria-label={isLoggedIn ? "Account" : "Login"}
            >
              <Icon name="user" />
            </Link>

            <Link
              className={styles.cart}
              href="/cart"
              aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <Icon name="bag" />
              {cartCount ? <span>{cartCount}</span> : null}
            </Link>
          </nav>
        </div>

        <SearchBox id="site-search" mobile icon={<Icon name="search" />} />
      </div>
    </header>
  );
}
