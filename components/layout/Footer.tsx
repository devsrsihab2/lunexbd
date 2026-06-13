import Link from "next/link";
import Image from "next/image";
import type { MenuItem, SiteSettings } from "@/types/content.types";
import styles from "./Footer.module.scss";

const fallbackFooter: MenuItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Order Tracking", href: "/order-tracking" },
];

const shopLinks: MenuItem[] = [
  { label: "All Products", href: "/products" },
  { label: "Latest Products", href: "/products?sort=latest" },
  { label: "Best Selling", href: "/products?sort=best_selling" },
  { label: "My Wishlist", href: "/wishlist" },
];

function menuKey(item: MenuItem, index: number) {
  return `footer-${item.label}-${item.href}-${index}`;
}

export function Footer({
  menu = fallbackFooter,
  settings,
}: {
  menu?: MenuItem[];
  settings?: SiteSettings | null;
}) {
  const logo = settings?.footerLogo || settings?.logo;
  const logoIsLocal = logo?.startsWith("/");

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link className={styles.brand} href="/">
            {logo && logoIsLocal ? (
              <Image
                className={styles.logoImage}
                src={logo}
                alt={settings?.siteName || "Lunexbd"}
                width={210}
                height={70}
              />
            ) : logo ? (
              <Image
                className={styles.logoImage}
                src={logo}
                alt={settings?.siteName || "Lunexbd"}
                width={210}
                height={70}
                unoptimized
              />
            ) : (
              <>
                <span>L</span>
                <strong>{settings?.siteName || "Lunexbd"}</strong>
              </>
            )}
          </Link>
          <p className={styles.muted}>
            {settings?.address ||
              "Customer-first commerce powered by WordPress and WooCommerce."}
          </p>
        </div>
        <div className={`${styles.footerGroup} ${styles.shopGroup}`}>
          <h3>Shop</h3>
          <nav className={styles.links} aria-label="Footer shop navigation">
            {shopLinks.map((item, index) => (
              <Link key={menuKey(item, index)} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={`${styles.footerGroup} ${styles.careGroup}`}>
          <h3>Customer care</h3>
          <nav className={styles.links} aria-label="Footer navigation">
            {menu.map((item, index) => (
              <Link key={menuKey(item, index)} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={`${styles.footerGroup} ${styles.contactGroup}`}>
          <h3>Contact</h3>
          <div className={styles.contactList}>
            {settings?.contactPhone ? (
              <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}>
                {settings.contactPhone}
              </a>
            ) : null}
            {settings?.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            ) : (
              <span>Managed from WordPress settings</span>
            )}
          </div>
          {settings?.socialLinks?.length ? (
            <div className={styles.socialLinks} aria-label="Social links">
              {settings.socialLinks.map((item, index) => (
                <a key={menuKey(item, index)} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
