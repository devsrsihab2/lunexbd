"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "@/types/content.types";
import styles from "./Header.module.scss";

function menuKey(item: MenuItem, index: number, prefix = "mobile") {
  return `${prefix}-${item.label}-${item.href}-${index}`;
}

export function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={styles.menuButton} type="button" aria-label="Open menu" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
        <span />
        <span />
        <span />
      </button>
      <div className={`${styles.mobileLayer} ${isOpen ? styles.mobileLayerOpen : ""}`} aria-hidden={!isOpen}>
        <button className={styles.mobileScrim} type="button" aria-label="Close menu" onClick={() => setIsOpen(false)} />
        <aside className={styles.mobilePanel} aria-label="Mobile navigation">
          <div className={styles.mobileHead}>
            <strong>Lunex</strong>
            <button type="button" aria-label="Close menu" onClick={() => setIsOpen(false)}>x</button>
          </div>
          <nav className={styles.mobileLinks}>
            {menu.map((item, index) => (
              <div key={menuKey(item, index)}>
                <Link href={item.href} onClick={() => setIsOpen(false)}>{item.label}</Link>
                {item.children?.length ? (
                  <div className={styles.mobileSubLinks}>
                    {item.children.map((child, childIndex) => (
                      <Link key={menuKey(child, childIndex, `mobile-${index}`)} href={child.href} onClick={() => setIsOpen(false)}>{child.label}</Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
