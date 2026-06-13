import Link from "next/link";
import Image from "next/image";
import type { MenuItem, SiteSettings } from "@/types/content.types";
import styles from "./Footer.module.scss";

const fallbackFooter: MenuItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Order Tracking", href: "/order-tracking" },
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
        <div className={styles.footerGroup}>
          <h3>Quick links</h3>
          <nav className={styles.links} aria-label="Footer navigation">
            {menu.map((item, index) => (
              <Link key={menuKey(item, index)} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.footerGroup}>
          <h3>Contact</h3>
          <p className={styles.muted}>
            {settings?.contactEmail || "Managed from WordPress settings"}
          </p>
          <p className={styles.muted}>{settings?.contactPhone || ""}</p>
        </div>
      </div>
      {/* <div className={styles.bottom}>
        <span>{settings?.siteName || "Lunexbd"}</span>
        <span>Premium bags, easy shopping, reliable support.</span>
      </div> */}
    </footer>
  );
}
