"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { MenuItem, SiteSettings } from "@/types/content.types";
import styles from "./Header.module.scss";

function menuKey(item: MenuItem, index: number, prefix = "mobile") {
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

function DrawerIcon({ index }: { index: number }) {
  const icons = [
    <path key="bag" d="M6 8h12l1 12H5L6 8Zm3 0a3 3 0 0 1 6 0" />,
    <path
      key="spark"
      d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Zm7 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"
    />,
    <path
      key="tag"
      d="M4 5v6.8L12.2 20 20 12.2 11.8 4H5a1 1 0 0 0-1 1Zm4 3h.01"
    />,
    <path key="grid" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    <path
      key="star"
      d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
    />,
  ];

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[index % icons.length]}
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={isOpen ? styles.mobileChevronOpen : undefined}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MobileMenu({
  menu,
  settings,
}: {
  menu: MenuItem[];
  settings?: SiteSettings | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const logo = settings?.logo;
  const logoIsLocal = logo?.startsWith("/");

  const siteName = settings?.siteName || "Lunex";

  const groupedMenu = useMemo(() => {
    return menu.map((item) => ({
      ...item,
      href: normalizeCategoryHref(item.href),
      children:
        item.children?.map((child) => ({
          ...child,
          href: normalizeCategoryHref(child.href),
        })) || [],
    }));
  }, [menu]);

  function closeMenu() {
    setIsOpen(false);
  }

  function toggleItem(key: string) {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className={styles.menuButton}
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span />
      </button>

      <div
        className={`${styles.mobileLayer} ${
          isOpen ? styles.mobileLayerOpen : ""
        }`}
        aria-hidden={!isOpen}
      >
        <button
          className={styles.mobileScrim}
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
        />

        <aside className={styles.mobilePanel} aria-label="Mobile navigation">
          <div className={styles.mobileHead}>
            <Link className={styles.mobileBrand} href="/" onClick={closeMenu}>
              {logo && logoIsLocal ? (
                <Image
                  className={styles.mobileLogoImage}
                  src={logo}
                  alt={siteName}
                  width={190}
                  height={64}
                  priority
                />
              ) : logo ? (
                <Image
                  className={styles.mobileLogoImage}
                  src={logo}
                  alt={siteName}
                  width={190}
                  height={64}
                  unoptimized
                  priority
                />
              ) : (
                <span>{siteName}</span>
              )}
            </Link>

            <button type="button" aria-label="Close menu" onClick={closeMenu}>
              ×
            </button>
          </div>

          <div className={styles.mobileIntro}>
            <strong>Explore categories</strong>
            <span>Find your favorite collection faster.</span>
          </div>

          <nav className={styles.mobileLinks}>
            {groupedMenu.map((item, index) => {
              const itemKey = menuKey(item, index);
              const hasChildren = Boolean(item.children?.length);
              const isOpenItem = Boolean(openItems[itemKey]);
              const isActive = isMenuActive(pathname, item.href);

              if (hasChildren) {
                return (
                  <div
                    className={`${styles.mobileMenuGroup} ${
                      isOpenItem ? styles.mobileMenuGroupOpen : ""
                    }`}
                    key={itemKey}
                  >
                    <button
                      className={`${styles.mobileParentButton} ${
                        isActive ? styles.mobileActiveLink : ""
                      }`}
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      aria-expanded={isOpenItem}
                    >
                      <span className={styles.mobileMenuIcon}>
                        <DrawerIcon index={index} />
                      </span>

                      <span className={styles.mobileMenuText}>
                        <strong>{item.label}</strong>
                        <small>{item.children?.length} items</small>
                      </span>

                      <ChevronIcon isOpen={isOpenItem} />
                    </button>

                    <div className={styles.mobileSubLinks}>
                      <Link
                        className={styles.mobileViewAll}
                        href={item.href}
                        onClick={closeMenu}
                      >
                        View all {item.label}
                      </Link>

                      {item.children?.map((child, childIndex) => (
                        <Link
                          key={menuKey(child, childIndex, itemKey)}
                          href={child.href}
                          onClick={closeMenu}
                          className={
                            isMenuActive(pathname, child.href)
                              ? styles.mobileActiveSubLink
                              : undefined
                          }
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={itemKey}
                  className={`${styles.mobileSingleLink} ${
                    isActive ? styles.mobileActiveLink : ""
                  }`}
                  href={item.href}
                  onClick={closeMenu}
                >
                  <span className={styles.mobileMenuIcon}>
                    <DrawerIcon index={index} />
                  </span>

                  <span className={styles.mobileMenuText}>
                    <strong>{item.label}</strong>
                    <small>Open page</small>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
