"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import type { MenuItem, SiteSettings } from "@/types/content.types";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import styles from "./Header.module.scss";

const DESKTOP_VISIBLE_MENU_LIMIT = 12;
const MEGA_MENU_CLOSE_DELAY = 220;

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
  name:
    | "truck"
    | "support"
    | "search"
    | "user"
    | "heart"
    | "bag"
    | "chevron"
    | "home"
    | "phone"
    | "menu";
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

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 11.2 12 4l9 7.2" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.89.66 2.78a2 2 0 0 1-.45 2.11L8.05 9.88a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45c.89.31 1.82.53 2.78.66A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M4 12h12" />
        <path d="M4 17h16" />
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

  if (!cleanPath.startsWith(categoryPrefix)) return href;

  const parts = cleanPath
    .replace(categoryPrefix, "")
    .split("/")
    .filter(Boolean);

  if (!parts.length) return href;

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

function splitIntoThreeColumns<T>(items: T[]) {
  const columns: T[][] = [[], [], []];

  items.forEach((item, index) => {
    const columnIndex = Math.floor(index / 8);

    if (columnIndex < 3) {
      columns[columnIndex].push(item);
      return;
    }

    columns[index % 3].push(item);
  });

  return columns;
}

function DesktopMegaMenu({
  item,
  parentKey,
  onClose,
}: {
  item: MenuItem;
  parentKey: string;
  onClose: () => void;
}) {
  const children = item.children || [];
  const parentHref = normalizeCategoryHref(item.href);
  const columns = splitIntoThreeColumns(children);

  return (
    <div className={styles.megaMenu}>
      <div className={styles.megaMenuInner}>
        <div className={styles.megaMenuTop}>
          <div>
            <strong>{item.label}</strong>
            <span>Browse all available categories</span>
          </div>

          <Link href={parentHref} onClick={onClose}>
            View all
          </Link>
        </div>

        <div className={styles.megaMenuGrid}>
          {columns.map((column, columnIndex) => (
            <div
              className={styles.megaMenuColumn}
              key={`${parentKey}-column-${columnIndex}`}
            >
              {column.length ? (
                column.map((child, childIndex) => {
                  const childHref = normalizeCategoryHref(child.href);

                  return (
                    <Link
                      key={menuKey(
                        child,
                        childIndex,
                        `${parentKey}-${columnIndex}`,
                      )}
                      href={childHref}
                      onClick={onClose}
                    >
                      <span>{child.label}</span>
                    </Link>
                  );
                })
              ) : (
                <span className={styles.megaMenuEmpty}>
                </span>
              )}
            </div>
          ))}
        </div>

        <Link
          className={styles.megaMenuShowAll}
          href={parentHref}
          onClick={onClose}
        >
          Show All
        </Link>
      </div>
    </div>
  );
}

export function Header({
  menu = fallbackMenu,
  settings,
}: {
  menu?: MenuItem[];
  topMenu?: MenuItem[];
  settings?: SiteSettings | null;
}) {
  const pathname = usePathname();
  const { cart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [closingMegaMenu, setClosingMegaMenu] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cartCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const primaryMenu = menu.length ? menu : fallbackMenu;

  const { visibleMenu, overflowMenu } = useMemo(() => {
    return {
      visibleMenu: primaryMenu.slice(0, DESKTOP_VISIBLE_MENU_LIMIT),
      overflowMenu: primaryMenu.slice(DESKTOP_VISIBLE_MENU_LIMIT),
    };
  }, [primaryMenu]);

  const logoIsLocal = settings?.logo?.startsWith("/");
  const logoAlt = settings?.siteName || "Lunexbd";

  const callHref = settings?.contactPhone
    ? `tel:${settings.contactPhone.replace(/\s+/g, "")}`
    : "tel:+8801700000000";

  function clearMegaCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMegaMenu(itemKey: string) {
    clearMegaCloseTimer();
    setClosingMegaMenu(null);
    setActiveMegaMenu(itemKey);
  }

  function closeMegaMenu() {
    if (!activeMegaMenu) return;

    const currentMenu = activeMegaMenu;

    clearMegaCloseTimer();
    setActiveMegaMenu(null);
    setClosingMegaMenu(currentMenu);

    closeTimerRef.current = window.setTimeout(() => {
      setClosingMegaMenu((previousMenu) =>
        previousMenu === currentMenu ? null : previousMenu,
      );
      closeTimerRef.current = null;
    }, MEGA_MENU_CLOSE_DELAY);
  }

  function closeMegaMenuInstantly() {
    clearMegaCloseTimer();
    setActiveMegaMenu(null);
    setClosingMegaMenu(null);
  }

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

  useEffect(() => {
    closeMegaMenuInstantly();
  }, [pathname]);

  useEffect(() => {
    return () => clearMegaCloseTimer();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.desktopHeader}>
        <div className={styles.desktopMain}>
          <div className={styles.desktopInner}>
            <Link className={styles.brand} href="/">
              {settings?.logo && logoIsLocal ? (
                <Image
                  className={styles.logoImage}
                  src={settings.logo}
                  alt={logoAlt}
                  width={230}
                  height={76}
                  priority
                />
              ) : settings?.logo ? (
                <Image
                  className={styles.logoImage}
                  src={settings.logo}
                  alt={logoAlt}
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

            <div className={styles.desktopSearchWrap}>
              <SearchBox
                id="desktop-site-search"
                icon={<Icon name="search" />}
                alwaysOpen
              />
            </div>

            <nav className={styles.desktopActions} aria-label="Shop shortcuts">
              <Link className={styles.desktopAction} href="/order-tracking">
                <span className={styles.desktopActionIcon}>
                  <Icon name="truck" />
                </span>
                <span>Track Order</span>
              </Link>

              <Link
                className={styles.desktopAction}
                href={isLoggedIn ? "/account" : "/login"}
              >
                <span className={styles.desktopActionIcon}>
                  <Icon name="user" />
                </span>
                <span>{isLoggedIn ? "Account" : "Sign In"}</span>
              </Link>

              <Link className={styles.desktopAction} href="/wishlist">
                <span className={styles.desktopActionIcon}>
                  <Icon name="heart" />
                </span>
                <span>Wishlist</span>
              </Link>

              <Link
                className={`${styles.desktopAction} ${styles.desktopCart}`}
                href="/cart"
                aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
              >
                <span className={styles.desktopActionIcon}>
                  <Icon name="bag" />
                  {cartCount ? <b>{cartCount}</b> : null}
                </span>
                <span>Cart</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className={styles.desktopNavBar}>
          <nav
            className={styles.desktopNavInner}
            aria-label="Main navigation"
            onMouseLeave={closeMegaMenu}
          >
            {visibleMenu.map((item, index) => {
              const normalizedHref = normalizeCategoryHref(item.href);
              const isActive = isMenuActive(pathname, normalizedHref);
              const itemKey = menuKey(item, index, "header");
              const hasChildren = Boolean(item.children?.length);
              const isMegaOpen = activeMegaMenu === itemKey;
              const isMegaClosing = closingMegaMenu === itemKey;
              const shouldRenderMega = hasChildren && (isMegaOpen || isMegaClosing);

              return (
                <div
                  key={itemKey}
                  className={`${styles.navItem} ${
                    isMegaOpen ? styles.navItemMegaOpen : ""
                  } ${isMegaClosing ? styles.navItemMegaClosing : ""}`}
                  onMouseEnter={() => {
                    if (hasChildren) {
                      openMegaMenu(itemKey);
                      return;
                    }

                    closeMegaMenu();
                  }}
                  onFocus={() => {
                    if (hasChildren) {
                      openMegaMenu(itemKey);
                      return;
                    }

                    closeMegaMenu();
                  }}
                >
                  <Link
                    className={isActive ? styles.active : undefined}
                    href={normalizedHref}
                  >
                    <span>{item.label}</span>
                    {hasChildren ? (
                      <Icon name="chevron" className={styles.chevronIcon} />
                    ) : null}
                  </Link>

                  {shouldRenderMega ? (
                    <DesktopMegaMenu
                      item={item}
                      parentKey={`header-${index}`}
                      onClose={closeMegaMenuInstantly}
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
        </div>
      </div>

      <div className={styles.mobileTopBar}>
        <div className={styles.mobileTopInner}>
          <div className={styles.mobileTopMenuButton}>
            <MobileMenu menu={primaryMenu} />
          </div>

          <Link className={styles.mobileTopBrand} href="/">
            {settings?.logo && logoIsLocal ? (
              <Image
                className={styles.mobileTopLogoImage}
                src={settings.logo}
                alt={logoAlt}
                width={190}
                height={64}
                priority
              />
            ) : settings?.logo ? (
              <Image
                className={styles.mobileTopLogoImage}
                src={settings.logo}
                alt={logoAlt}
                width={190}
                height={64}
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

          <nav
            className={styles.mobileTopActions}
            aria-label="Mobile shortcuts"
          >
            <SearchBox
              id="mobile-top-site-search"
              icon={<Icon name="search" />}
            />

            <Link
              className={styles.mobileTopCart}
              href="/cart"
              aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <Icon name="bag" />
              {cartCount ? <span>{cartCount}</span> : null}
            </Link>
          </nav>
        </div>
      </div>

      <nav
        className={styles.mobileBottomBar}
        aria-label="Mobile bottom navigation"
      >
        <Link
          className={`${styles.mobileBottomItem} ${
            isMenuActive(pathname, "/products") ? styles.mobileBottomActive : ""
          }`}
          href="/products"
        >
          <span className={styles.mobileBottomIcon}>
            <Icon name="menu" />
          </span>
          <span>Shop</span>
        </Link>

        <a className={styles.mobileBottomItem} href={callHref}>
          <span className={styles.mobileBottomIcon}>
            <Icon name="phone" />
          </span>
          <span>Call</span>
        </a>

        <Link
          className={`${styles.mobileBottomHome} ${
            isMenuActive(pathname, "/") ? styles.mobileBottomActive : ""
          }`}
          href="/"
        >
          <span className={styles.mobileHomeIcon}>
            <Icon name="home" />
          </span>
          <span>Home</span>
        </Link>

        <Link
          className={`${styles.mobileBottomItem} ${
            isMenuActive(pathname, "/wishlist") ? styles.mobileBottomActive : ""
          }`}
          href="/wishlist"
        >
          <span className={styles.mobileBottomIcon}>
            <Icon name="heart" />
          </span>
          <span>Wishlist</span>
        </Link>

        <Link
          className={`${styles.mobileBottomItem} ${
            isMenuActive(pathname, isLoggedIn ? "/account" : "/login")
              ? styles.mobileBottomActive
              : ""
          }`}
          href={isLoggedIn ? "/account" : "/login"}
        >
          <span className={styles.mobileBottomIcon}>
            <Icon name="user" />
          </span>
          <span>Profile</span>
        </Link>
      </nav>
    </header>
  );
}
