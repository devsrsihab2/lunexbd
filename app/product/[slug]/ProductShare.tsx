"use client";

import styles from "./product-detail.module.scss";

type ProductShareProps = {
  productName: string;
  productUrl: string;
};

type ShareIcon =
  | "facebook"
  | "x"
  | "whatsapp"
  | "mail"
  | "linkedin"
  | "print";

type ShareItem = {
  label: string;
  icon: ShareIcon;
  href: string;
};

function Icon({ name }: { name: ShareIcon }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h2V5h-2c-2.6 0-4 1.5-4 4v2H8v3h2v6h3v-6h2.4l.6-3h-3V9c0-.7.3-1 1-1Z" />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.3 11 21 4h-2.8l-4.3 5.2L10.1 4H4l6.8 9.3L4.7 20h2.8l4.6-5.1 4 5.1H22L15.3 11Zm-2 2.2-.8-1.1L7.6 6.2h1.5l3.6 4.7.8 1.1 5.2 6.2h-1.5l-3.9-5Z" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a7.7 7.7 0 0 0-6.6 11.7L4.5 20l4.4-1.1A7.7 7.7 0 1 0 12 4Zm0 2a5.7 5.7 0 1 1-2.6 10.8l-.4-.2-1.7.4.4-1.6-.3-.5A5.7 5.7 0 0 1 12 6Zm-2.1 3.1c-.2 0-.5.1-.7.4-.3.3-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.5 3.9 3.3 1.9.7 2.3.4 2.7.4.4-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1a4.8 4.8 0 0 1-2.4-2.1c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5 0-.1 0-.3-.1-.5l-.7-1.6c-.2-.3-.3-.3-.5-.3h-.7Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4V6Zm2 2v.5l6 4 6-4V8H6Zm12 8v-5.1l-6 4-6-4V16h12Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.7 8.7H4V20h2.7V8.7ZM5.4 4A1.6 1.6 0 1 0 5.3 7.2 1.6 1.6 0 0 0 5.4 4Zm5 4.7H7.8V20h2.7v-5.6c0-1.5.7-2.4 1.9-2.4 1 0 1.5.7 1.5 2.1V20h2.7v-6.3c0-3.2-1.7-5-4.1-5-1.2 0-2.1.5-2.6 1.3l-.1-1.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v4H7V4Zm0 12H5a2 2 0 0 1-2-2v-3c0-1.7 1.3-3 3-3h12c1.7 0 3 1.3 3 3v3a2 2 0 0 1-2 2h-2v4H7v-4Zm2 2h6v-4H9v4Zm9-4h1v-3c0-.6-.4-1-1-1H6c-.6 0-1 .4-1 1v3h1v-2h12v2Z" />
    </svg>
  );
}

export function ProductShare({ productName, productUrl }: ProductShareProps) {
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName);
  const items: ShareItem[] = [
    {
      label: "Share on Facebook",
      icon: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Share on X",
      icon: "x",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Share on WhatsApp",
      icon: "whatsapp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Share by email",
      icon: "mail",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
    {
      label: "Share on LinkedIn",
      icon: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  function openShare(item: ShareItem) {
    if (item.icon === "mail") {
      window.open(item.href, "_self");
      return;
    }

    window.open(item.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.shareRow}>
      <strong>Share:</strong>
      <div className={styles.shareActions}>
        {items.map((item) => (
          <button
            aria-label={item.label}
            className={styles.shareButton}
            key={item.icon}
            onClick={() => openShare(item)}
            title={item.label}
            type="button"
          >
            <Icon name={item.icon} />
          </button>
        ))}
        <button
          aria-label="Print product"
          className={styles.shareButton}
          onClick={() => window.print()}
          title="Print product"
          type="button"
        >
          <Icon name="print" />
        </button>
      </div>
    </div>
  );
}
