"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  deleteAddress,
  deleteAvatar,
  getAddresses,
  saveAddress,
  updateAddress,
  uploadAvatar,
} from "@/services/api/Addresses.api";
import type { SavedAddress } from "@/services/api/Addresses.api";
import {
  getMe,
  logout,
  updateMe,
  updatePassword,
} from "@/services/api/auth.api";
import { getOrder, getOrders } from "@/services/api/orders.api";
import { getWishlist } from "@/services/api/wishlist.api";
import { getUserReviews } from "@/services/api/reviews.api";
import type { UserReview } from "@/services/api/reviews.api";
import {
  bangladeshDistricts,
  getThanasByDistrict,
} from "@/data/bangladesh-locations";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import type { User } from "@/types/user.types";
import type { Wishlist } from "@/types/wishlist.types";
import { getCartItemImage } from "@/utils/cartImage";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./account.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type IconName =
  | "grid"
  | "bag"
  | "heart"
  | "map"
  | "star"
  | "settings"
  | "user"
  | "mail"
  | "phone"
  | "logout"
  | "arrow"
  | "spark"
  | "lock"
  | "plus"
  | "edit"
  | "trash"
  | "camera"
  | "home"
  | "building";

type ShellState = { user: ApiResponse<User> | null; loading: boolean };
type Message = { type: "success" | "error"; text: string } | null;

// ─── Nav ──────────────────────────────────────────────────────────────────────

const accountNav = [
  {
    href: "/account",
    label: "Dashboard",
    description: "Account overview",
    icon: "grid",
  },
  {
    href: "/account/orders",
    label: "Orders",
    description: "Track purchases",
    icon: "bag",
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    description: "Saved products",
    icon: "heart",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    description: "Saved locations",
    icon: "map",
  },
  {
    href: "/account/reviews",
    label: "Reviews",
    description: "Your reviews",
    icon: "star",
  },
  {
    href: "/account/settings",
    label: "Settings",
    description: "Profile & password",
    icon: "settings",
  },
] as const;

// ─── Icon ─────────────────────────────────────────────────────────────────────

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
    bag: (
      <>
        <path d="M6.5 8h11l1 12h-13l1-12Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
    heart: (
      <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />
    ),
    map: (
      <>
        <path d="M12 21C12 21 5 14.5 5 9a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    star: (
      <path d="m12 2 3.1 6.3L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2Z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.1L14 3h-4l-.4 2.8a7 7 0 0 0-2 1.1l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.1L10 21h4l.4-2.8a7 7 0 0 0 2-1.1l2.4 1 2-3.4-2-1.5c.1-.4.2-.8.2-1.2Z" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    mail: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    phone: (
      <path d="M8 5 6 7c.4 5.3 5.7 10.6 11 11l2-2-3-3-2 1c-1.8-.9-3.1-2.2-4-4l1-2-3-3Z" />
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
    arrow: <path d="M9 6l6 6-6 6" />,
    spark: (
      <>
        <path d="m12 3 1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z" />
        <path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 15h10l1-15" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    home: (
      <>
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z" />
        <path d="M9 21V12h6v9" />
      </>
    ),
    building: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M3 9h6" />
        <path d="M3 15h6" />
        <path d="M13 7h4" />
        <path d="M13 11h4" />
        <path d="M13 15h4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayName(user: User) {
  return (
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email
  );
}

function initials(user?: User | null) {
  const source = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.displayName ||
      user.email
    : "Guest";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function statusLabel(status: Order["status"]) {
  return status.replace("-", " ");
}
function orderTotal(order: Order) {
  return formatPrice(order.total);
}
function orderQuantity(order: Order) {
  return order.items.reduce((t, i) => t + i.quantity, 0);
}
function firstOrderItem(order: Order) {
  return order.items[0];
}

function trackingStepIndex(status: Order["status"]) {
  if (["cancelled", "refunded", "failed"].includes(status)) return -1;
  if (status === "completed") return 3;
  if (status === "processing" || status === "on-hold") return 1;
  return 0;
}

function clearStoredSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("lunex_user");
  window.dispatchEvent(new Event("lunex-auth-change"));
}

function isActivePath(pathname: string, href: string) {
  if (href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function AccountShell({
  eyebrow,
  title,
  description,
  children,
  requireAuth = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: (ctx: {
    user: User | null;
    reloadUser: () => Promise<void>;
  }) => React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ShellState>({ user: null, loading: true });
  const [isLoggingOut, setLoggingOut] = useState(false);

  async function loadUser() {
    const user = await getMe();
    setState({ user, loading: false });
  }

  useEffect(() => {
    let active = true;
    getMe().then((u) => {
      if (active) setState({ user: u, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  const user = state.user?.success ? state.user.data : null;

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    clearStoredSession();
    setLoggingOut(false);
    router.push("/login?redirect=/account");
    router.refresh();
  }

  if (!state.loading && requireAuth && !user) {
    return (
      <main className={styles.accountShell}>
        <section className={styles.guestPanel}>
          <span className={styles.guestIcon}>
            <Icon name="user" />
          </span>
          <p className={styles.kicker}>Account access</p>
          <h1>Sign in to view your account</h1>
          <p>
            {state.user?.message || "Login is required to view customer data."}
          </p>
          <div className={styles.guestActions}>
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
              Login
            </Link>
            <Link href={`/register?redirect=${encodeURIComponent(pathname)}`}>
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.accountShell}>
      <section className={styles.dashboardGrid} aria-label="Account area">
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <AvatarBubble user={user} size={48} />
            <div>
              <h2>{user ? displayName(user) : "Account"}</h2>
              <p>{user?.email || "Customer center"}</p>
            </div>
          </div>

          <nav className={styles.accountNav} aria-label="Account navigation">
            {accountNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  className={
                    active
                      ? `${styles.navItem} ${styles.active}`
                      : styles.navItem
                  }
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={styles.navIcon}>
                    <Icon name={item.icon as IconName} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <Icon name="arrow" />
                </Link>
              );
            })}

            {user ? (
              <button
                className={`${styles.navItem} ${styles.logoutSidebarBtn}`}
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span className={styles.navIcon}>
                  <Icon name="logout" />
                </span>
                <span>
                  <strong>Logout</strong>
                </span>
              </button>
            ) : null}
          </nav>
        </aside>

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <p className={styles.kicker}>{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>

          {state.loading && requireAuth ? (
            <ContentSkeleton />
          ) : (
            children({ user, reloadUser: loadUser })
          )}
        </div>
      </section>
    </main>
  );
}

// ─── Avatar bubble (reusable) ─────────────────────────────────────────────────

function AvatarBubble({
  user,
  size = 40,
}: {
  user: User | null;
  size?: number;
}) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={displayName(user)}
        className={styles.avatar}
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          borderRadius: "50%",
        }}
      />
    );
  }
  return <span className={styles.avatar}>{initials(user)}</span>;
}

// ─── Skeletons / inline states ────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <div className={styles.contentSkeleton} aria-live="polite" aria-busy="true">
      <div className={styles.skeletonStats}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.skeletonPanel}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.skeletonPanel}>
        <span />
        <span />
      </div>
    </div>
  );
}

function InlineState({
  title,
  message,
  href,
  label,
}: {
  title: string;
  message: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className={styles.inlineState}>
      <strong>{title}</strong>
      <p>{message}</p>
      {href && label ? <Link href={href}>{label}</Link> : null}
    </div>
  );
}

// ─── Order rows ───────────────────────────────────────────────────────────────

function OrderRows({ orders }: { orders: Order[] }) {
  return (
    <div className={styles.orderList}>
      {orders.map((order) => {
        const firstItem = firstOrderItem(order);
        const image = firstItem ? getCartItemImage(firstItem) : undefined;
        const remaining = Math.max(0, order.items.length - 1);
        return (
          <article className={styles.orderRow} key={order.id}>
            <Link
              className={styles.orderMain}
              href={`/account/orders/${order.id}`}
            >
              <span className={styles.orderThumb}>
                {image?.src ? (
                  <img
                    src={image.src}
                    alt={
                      image.alt || firstItem?.name || `Order ${order.number}`
                    }
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <b>{firstItem?.name?.slice(0, 1) || "L"}</b>
                )}
              </span>
              <span className={styles.orderCopy}>
                <strong>Order #{order.number}</strong>
                <small>
                  {formatDate(order.dateCreated)} · {orderQuantity(order)} item
                  {orderQuantity(order) === 1 ? "" : "s"}
                </small>
                {firstItem ? (
                  <em>
                    {firstItem.name}
                    {remaining ? ` + ${remaining} more` : ""}
                  </em>
                ) : null}
              </span>
            </Link>
            <span className={styles.statusPill}>
              {statusLabel(order.status)}
            </span>
            <span className={styles.orderTotal}>{orderTotal(order)}</span>
            <Link
              className={styles.trackLink}
              href={`/account/orders/${order.id}`}
            >
              Track order
            </Link>
          </article>
        );
      })}
    </div>
  );
}

// ─── Order tracker ────────────────────────────────────────────────────────────

function OrderTracker({ order }: { order: Order }) {
  const steps = [
    { label: "Order placed", note: "We received your order." },
    { label: "Processing", note: "Your product is being prepared." },
    { label: "Ready to ship", note: "Packing and handover stage." },
    { label: "Completed", note: "Order fulfilled successfully." },
  ];
  const activeStep = trackingStepIndex(order.status);
  const isException = activeStep < 0;

  return (
    <div className={styles.tracker}>
      <div className={styles.trackerHero}>
        <div>
          <p className={styles.kicker}>Current status</p>
          <h2>
            {isException
              ? "Order needs attention"
              : `Your order is ${statusLabel(order.status)}`}
          </h2>
          <p>
            {isException
              ? "This order is not currently moving through the standard fulfillment flow."
              : "Track every important update for your Lunex purchase here."}
          </p>
        </div>
        <span className={styles.statusPill}>{statusLabel(order.status)}</span>
      </div>

      <div className={styles.timeline} aria-label="Order tracking timeline">
        {steps.map((step, i) => {
          const active = !isException && i <= activeStep;
          const current = !isException && i === activeStep;
          return (
            <div
              className={
                active
                  ? `${styles.timelineStep} ${styles.timelineActive}`
                  : styles.timelineStep
              }
              key={step.label}
            >
              <span>{active ? "✓" : i + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <small>{current ? `Now: ${step.note}` : step.note}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.trackGrid}>
        <div className={styles.trackProducts}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Products</p>
              <h2>Items in this order</h2>
            </div>
          </div>
          <div className={styles.trackItemList}>
            {order.items.map((item) => {
              const image = getCartItemImage(item);
              return (
                <article className={styles.trackItem} key={item.key}>
                  <span className={styles.trackThumb}>
                    {image?.src ? (
                      <img
                        src={image.src}
                        alt={image.alt || item.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <b>{item.name.slice(0, 1)}</b>
                    )}
                  </span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      Qty {item.quantity} · Product #{item.productId}
                    </p>
                  </div>
                  <strong>{formatPrice(item.total)}</strong>
                </article>
              );
            })}
          </div>
        </div>
        <aside className={styles.trackSummary}>
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>Order number</dt>
              <dd>#{order.number}</dd>
            </div>
            <div>
              <dt>Placed on</dt> <dd>{formatDate(order.dateCreated)}</dd>
            </div>
            <div>
              <dt>Payment</dt>{" "}
              <dd>{order.paymentMethodTitle || "Not available"}</dd>
            </div>
            <div>
              <dt>Items</dt> <dd>{orderQuantity(order)}</dd>
            </div>
            <div>
              <dt>Total</dt> <dd>{orderTotal(order)}</dd>
            </div>
          </dl>
          <Link href="/account/orders">Back to orders</Link>
        </aside>
      </div>
    </div>
  );
}

// ─── Address card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
  isDeleting,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const typeClass =
    address.type === "home" ? styles.addressCardHome : styles.addressCardOffice;
  return (
    <article className={`${styles.addressCard} ${typeClass}`}>
      <div className={styles.addressCardInner}>
        <div className={styles.addressCardHead}>
          <span
            className={`${styles.addressIcon} ${address.type === "home" ? styles.addressIconHome : styles.addressIconOffice}`}
          >
            <Icon name={address.type === "home" ? "home" : "building"} />
          </span>
          <strong>{address.label}</strong>
          <div className={styles.addressActions}>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${address.label}`}
            >
              <Icon name="edit" /> Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className={styles.deleteBtn}
              aria-label={`Delete ${address.label}`}
            >
              <Icon name="trash" /> {isDeleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
        <div className={styles.addressCardBody}>
          <div className={styles.addressRow}>
            <span>Address line</span>
            <span>{address.addressLine}</span>
          </div>
          {address.district ? (
            <div className={styles.addressRow}>
              <span>District/City</span>
              <span>{address.district}</span>
            </div>
          ) : null}
          {address.thana ? (
            <div className={styles.addressRow}>
              <span>Thana/Upazila</span>
              <span>{address.thana}</span>
            </div>
          ) : null}
          {address.postalCode ? (
            <div className={styles.addressRow}>
              <span>Postal code</span>
              <span>{address.postalCode}</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ─── Address form modal ───────────────────────────────────────────────────────

function AddressModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: SavedAddress | null;
  onSave: (data: Omit<SavedAddress, "label">) => Promise<void>;
  onClose: () => void;
}) {
  const [type, setType] = useState<"home" | "office">(initial?.type ?? "home");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [thana, setThana] = useState(initial?.thana ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const thanas = getThanasByDistrict(district);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const addressLine = String(fd.get("addressLine") || "").trim();
    const postalCode = String(fd.get("postalCode") || "").trim();
    if (!addressLine) {
      setError("Address line is required.");
      return;
    }
    if (!district) {
      setError("District is required.");
      return;
    }
    setSaving(true);
    setError("");
    await onSave({
      type,
      addressLine,
      district,
      thana,
      postalCode,
      country: "BD",
    });
    setSaving(false);
  }

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "Edit address" : "Add new address"}
    >
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <h2>{initial ? "Edit address" : "Add new address"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formFields}>
          {/* Address type */}
          <label>
            <span>Address type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "home" | "office")}
              disabled={!!initial}
            >
              <option value="home">Home Address</option>
              <option value="office">Office Address</option>
            </select>
          </label>

          {/* Address line */}
          <label>
            <span>Address line</span>
            <input
              name="addressLine"
              placeholder="House / building / street / area"
              defaultValue={initial?.addressLine ?? ""}
              required
            />
          </label>

          {/* District */}
          <label>
            <span>District / City</span>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setThana("");
              }}
              required
            >
              <option value="">Select District</option>
              {bangladeshDistricts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          {/* Thana */}
          <label>
            <span>Thana / Upazila</span>
            <select
              value={thana}
              onChange={(e) => setThana(e.target.value)}
              disabled={!district}
            >
              <option value="">
                {district ? "Select Thana (optional)" : "Select district first"}
              </option>
              {thanas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {/* Postal code */}
          <label>
            <span>Postal code</span>
            <input
              name="postalCode"
              placeholder="ex: 1000"
              defaultValue={initial?.postalCode ?? ""}
            />
          </label>

          {error ? <p className={styles.errorMessage}>{error}</p> : null}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryAction}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Profile avatar uploader ──────────────────────────────────────────────────

function AvatarUploader({
  user,
  onReload,
}: {
  user: User;
  onReload: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const res = await uploadAvatar(file);
    setUploading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Photo updated." });
      await onReload();
    } else {
      setMessage({ type: "error", text: res.message || "Upload failed." });
    }
    // reset input so same file can be reselected
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    if (!confirm("Remove your profile photo?")) return;
    setDeleting(true);
    const res = await deleteAvatar();
    setDeleting(false);
    if (res.success) {
      setMessage({ type: "success", text: "Photo removed." });
      await onReload();
    } else {
      setMessage({
        type: "error",
        text: res.message || "Could not remove photo.",
      });
    }
  }

  return (
    <div className={styles.avatarUploader}>
      <div className={styles.avatarPreview}>
        <AvatarBubble user={user} size={80} />
        <button
          type="button"
          className={styles.cameraButton}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload new photo"
        >
          <Icon name="camera" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.hiddenFileInput}
        onChange={handleFileChange}
        aria-label="Choose profile photo"
      />

      <div className={styles.avatarMeta}>
        <strong>{user.firstName || user.displayName || "Your photo"}</strong>
        <p>{uploading ? "Uploading…" : "JPG, PNG or WebP · max 2 MB"}</p>
        {user.avatarUrl ? (
          <button
            type="button"
            className={styles.removeAvatarBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Removing…" : "Remove photo"}
          </button>
        ) : null}
        {message ? (
          <p
            className={
              message.type === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED VIEW COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function AccountDashboard() {
  const [orders, setOrders] = useState<ApiResponse<Order[]> | null>(null);
  const [wishlist, setWishlist] = useState<ApiResponse<Wishlist> | null>(null);

  useEffect(() => {
    getOrders().then(setOrders);
    getWishlist().then(setWishlist);
  }, []);

  return (
    <AccountShell
      eyebrow="My Account"
      title="Account dashboard"
      description="Manage your profile, orders, saved products, and account activity from one premium dashboard."
    >
      {({ user }) => {
        const orderItems = orders?.success ? orders.data : [];
        const wishlistItems = wishlist?.success ? wishlist.data.items : [];
        const latestOrder = orderItems[0];
        const activeOrders = orderItems.filter(
          (o) =>
            !["completed", "cancelled", "refunded", "failed"].includes(
              o.status,
            ),
        ).length;
        const addressCount = user?.addresses?.length ?? 0;

        return (
          <>
            <div className={styles.statsGrid}>
              <article className={styles.statCard}>
                <span>Total orders</span>
                <strong>{orders?.success ? orderItems.length : "—"}</strong>
                <p>
                  {orders
                    ? "From your account history"
                    : "Loading order history"}
                </p>
              </article>
              <article className={styles.statCard}>
                <span>Active orders</span>
                <strong>{orders?.success ? activeOrders : "—"}</strong>
                <p>Processing, pending, or on hold</p>
              </article>
              <article className={styles.statCard}>
                <span>Saved products</span>
                <strong>
                  {wishlist?.success ? wishlistItems.length : "—"}
                </strong>
                <p>
                  {wishlist ? "Products in your wishlist" : "Loading wishlist"}
                </p>
              </article>
              <article className={styles.statCard}>
                <span>Latest order</span>
                <strong>{latestOrder ? `#${latestOrder.number}` : "—"}</strong>
                <p>
                  {latestOrder
                    ? formatDate(latestOrder.dateCreated)
                    : "No order found"}
                </p>
              </article>
            </div>

            {/* Profile */}
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Profile</p>
                  <h2>Account details</h2>
                </div>
                <span className={styles.softBadge}>
                  <Icon name="spark" /> Customer profile
                </span>
              </div>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>
                    <Icon name="mail" />
                  </span>
                  <div>
                    <small>Email</small>
                    <strong>{user?.email}</strong>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <span>
                    <Icon name="phone" />
                  </span>
                  <div>
                    <small>Phone</small>
                    <strong>{user?.phone || "Not added yet"}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Addresses summary */}
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Addresses</p>
                  <h2>Saved locations</h2>
                </div>
                <Link className={styles.textLink} href="/account/addresses">
                  Manage
                </Link>
              </div>
              {addressCount === 0 ? (
                <InlineState
                  title="No saved addresses"
                  message="Save a Home or Office address to speed up checkout."
                  href="/account/addresses"
                  label="Add address"
                />
              ) : (
                <div className={styles.addressMini}>
                  {user!.addresses.map((a) => (
                    <div key={a.type} className={styles.addressMiniCard}>
                      <strong>{a.label}</strong>
                      <p>
                        {a.addressLine}, {a.district}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Orders */}
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Orders</p>
                  <h2>Recent activity</h2>
                </div>
                <Link className={styles.textLink} href="/account/orders">
                  View orders
                </Link>
              </div>
              {!orders ? (
                <ContentSkeleton />
              ) : !orders.success ? (
                <InlineState
                  title="Order history could not be loaded"
                  message={orders.message || "Please try again."}
                />
              ) : !orderItems.length ? (
                <InlineState
                  title="No orders yet"
                  message="Your orders will appear here once you place an order."
                  href="/products"
                  label="Start shopping"
                />
              ) : (
                <OrderRows orders={orderItems.slice(0, 3)} />
              )}
            </section>

            {/* Wishlist */}
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.kicker}>Wishlist</p>
                  <h2>Saved products</h2>
                </div>
                <Link className={styles.textLink} href="/wishlist">
                  View wishlist
                </Link>
              </div>
              {!wishlist ? (
                <ContentSkeleton />
              ) : !wishlist.success ? (
                <InlineState
                  title="Wishlist unavailable"
                  message={wishlist.message || "Please try again."}
                  href="/wishlist"
                  label="Open wishlist"
                />
              ) : !wishlistItems.length ? (
                <InlineState
                  title="No saved products yet"
                  message="Tap the heart icon on any product and it will appear here."
                  href="/products"
                  label="Browse products"
                />
              ) : (
                <ProductGrid
                  products={wishlistItems.slice(0, 4) as Product[]}
                />
              )}
            </section>
          </>
        );
      }}
    </AccountShell>
  );
}

// ─── Orders list ──────────────────────────────────────────────────────────────

export function AccountOrdersView() {
  const [orders, setOrders] = useState<ApiResponse<Order[]> | null>(null);
  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  return (
    <AccountShell
      eyebrow="Orders"
      title="Order history"
      description="Review purchases, statuses, and order details from your account."
    >
      {() => (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Purchases</p>
              <h2>Your orders</h2>
            </div>
          </div>
          {!orders ? (
            <ContentSkeleton />
          ) : !orders.success ? (
            <InlineState
              title="Orders unavailable"
              message={orders.message || "Please try again."}
            />
          ) : !orders.data.length ? (
            <InlineState
              title="No orders yet"
              message="Your orders will appear here after checkout."
              href="/products"
              label="Shop now"
            />
          ) : (
            <OrderRows orders={orders.data} />
          )}
        </section>
      )}
    </AccountShell>
  );
}

// ─── Order detail ─────────────────────────────────────────────────────────────

export function AccountOrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<ApiResponse<Order> | null>(null);
  useEffect(() => {
    getOrder(id).then(setOrder);
  }, [id]);

  return (
    <AccountShell
      eyebrow="Order Tracking"
      title={`Track order #${order?.success ? order.data.number : id}`}
      description="See product status, order progress, payment information, and purchased items in one place."
    >
      {() => (
        <section className={styles.panel}>
          {!order ? (
            <ContentSkeleton />
          ) : !order.success ? (
            <InlineState
              title="Order unavailable"
              message={order.message || "Please try again."}
              href="/account/orders"
              label="Back to orders"
            />
          ) : (
            <OrderTracker order={order.data} />
          )}
        </section>
      )}
    </AccountShell>
  );
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function AccountWishlistView() {
  const [wishlist, setWishlist] = useState<ApiResponse<Wishlist> | null>(null);
  useEffect(() => {
    getWishlist().then(setWishlist);
  }, []);

  return (
    <AccountShell
      eyebrow="Wishlist"
      title="Saved products"
      description="Keep your favorite products in one place and return to them anytime."
    >
      {() => (
        <section className={styles.panel}>
          {!wishlist ? (
            <ContentSkeleton />
          ) : !wishlist.success ? (
            <InlineState
              title="Wishlist unavailable"
              message={wishlist.message || "Please login to use wishlist."}
              href="/login?redirect=/wishlist"
              label="Login"
            />
          ) : !wishlist.data.items.length ? (
            <InlineState
              title="Wishlist is empty"
              message="Save products and they will appear here."
              href="/products"
              label="Browse products"
            />
          ) : (
            <ProductGrid products={wishlist.data.items as Product[]} />
          )}
        </section>
      )}
    </AccountShell>
  );
}

// ─── Addresses page ───────────────────────────────────────────────────────────

export function AccountAddressesView() {
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [modal, setModal] = useState<"add" | SavedAddress | null>(null);
  const [deletingType, setDeletingType] = useState<string>("");
  const [message, setMessage] = useState<Message>(null);

  async function reload() {
    const res = await getAddresses();
    if (res.success) setAddresses(res.data);
  }

  useEffect(() => {
    reload();
  }, []);

  // Which types are already saved
  const existingTypes = (addresses ?? []).map((a) => a.type);
  const canAddHome = !existingTypes.includes("home");
  const canAddOffice = !existingTypes.includes("office");
  const canAdd = canAddHome || canAddOffice;

  async function handleSave(data: Omit<SavedAddress, "label">) {
    const editing = modal !== "add" && modal !== null;
    const res = editing
      ? await updateAddress(data.type, data)
      : await saveAddress(data);
    if (res.success) {
      setAddresses(res.data);
      setModal(null);
      setMessage({
        type: "success",
        text: editing ? "Address updated." : "Address saved.",
      });
    } else {
      setMessage({
        type: "error",
        text: res.message || "Could not save address.",
      });
    }
  }

  async function handleDelete(type: "home" | "office") {
    if (!confirm(`Delete your ${type} address?`)) return;
    setDeletingType(type);
    const res = await deleteAddress(type);
    setDeletingType("");
    if (res.success) {
      setAddresses(res.data);
      setMessage({ type: "success", text: "Address deleted." });
    } else {
      setMessage({
        type: "error",
        text: res.message || "Could not delete address.",
      });
    }
  }

  return (
    <AccountShell
      eyebrow="Addresses"
      title="Saved addresses"
      description="Manage your Home and Office addresses for faster checkout."
    >
      {() => (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Locations</p>
              <h2>Your addresses</h2>
            </div>
            {canAdd ? (
              <button
                type="button"
                className={styles.addButton}
                onClick={() => setModal("add")}
              >
                <Icon name="plus" /> Add new address
              </button>
            ) : null}
          </div>

          {message ? (
            <p
              className={
                message.type === "success"
                  ? styles.successMessage
                  : styles.errorMessage
              }
              role="status"
            >
              {message.text}
            </p>
          ) : null}

          {addresses === null ? (
            <ContentSkeleton />
          ) : addresses.length === 0 ? (
            <InlineState
              title="No saved addresses"
              message="Add a Home or Office address to pre-fill your shipping details at checkout."
            />
          ) : (
            <div className={styles.addressGrid}>
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.type}
                  address={addr}
                  onEdit={() => setModal(addr)}
                  onDelete={() => handleDelete(addr.type)}
                  isDeleting={deletingType === addr.type}
                />
              ))}
            </div>
          )}

          {modal !== null ? (
            <AddressModal
              initial={modal === "add" ? null : modal}
              onSave={handleSave}
              onClose={() => setModal(null)}
            />
          ) : null}
        </section>
      )}
    </AccountShell>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function AccountReviewsView() {
  const [reviews, setReviews] = useState<UserReview[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";
    if (!token) {
      setLoading(false);
      return;
    }
    getUserReviews(token)
      .then((res) => setReviews(res.success ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountShell
      eyebrow="Reviews"
      title="Your reviews"
      description="Manage reviews you've written for products you purchased."
    >
      {() => (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Feedback</p>
              <h2>Product reviews</h2>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: "1rem 0", color: "var(--color-muted, #888)" }}>
              Loading your reviews…
            </p>
          ) : reviews && reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((rev) => (
                <div key={rev.id} className={styles.reviewItem}>
                  {rev.product && (
                    <Link
                      href={`/product/${rev.product.slug}`}
                      className={styles.reviewProductLink}
                    >
                      {rev.product.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.product.image.src}
                          alt={rev.product.image.alt}
                          className={styles.reviewProductImg}
                        />
                      )}
                      <span>{rev.product.name}</span>
                    </Link>
                  )}
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          style={{ color: i < rev.rating ? "#c0956b" : "#ddd" }}
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ marginLeft: 4 }}>{rev.rating}/5</span>
                    </span>
                    {rev.dateCreated && (
                      <span className={styles.reviewDate}>
                        {new Date(rev.dateCreated).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p className={styles.reviewText}>{rev.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <InlineState
              title="No reviews yet"
              message="After purchasing a product, you can leave a review from the product page."
              href="/products"
              label="Browse products"
            />
          )}
        </section>
      )}
    </AccountShell>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function AccountSettingsView() {
  const [profileMessage, setProfileMessage] = useState<Message>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  return (
    <AccountShell
      eyebrow="Settings"
      title="Account settings"
      description="Update your profile photo, basic information, and password securely."
    >
      {({ user, reloadUser }) => (
        <div className={styles.formGrid}>
          {/* Profile section */}
          <form
            className={styles.panel}
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSavingProfile(true);
              const res = await updateMe({
                firstName: String(fd.get("firstName") || ""),
                lastName: String(fd.get("lastName") || ""),
                email: String(fd.get("email") || ""),
                phone: String(fd.get("phone") || ""),
              });
              setSavingProfile(false);
              setProfileMessage(
                res.success
                  ? { type: "success", text: "Profile updated successfully." }
                  : {
                      type: "error",
                      text: res.message || "Profile update failed.",
                    },
              );
              if (res.success) await reloadUser();
            }}
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.kicker}>Profile</p>
                <h2>Manage profile</h2>
              </div>
            </div>

            {/* Avatar uploader */}
            {user ? <AvatarUploader user={user} onReload={reloadUser} /> : null}

            <div className={styles.formFields}>
              <label>
                <span>First name</span>
                <input name="firstName" defaultValue={user?.firstName || ""} />
              </label>
              <label>
                <span>Last name</span>{" "}
                <input name="lastName" defaultValue={user?.lastName || ""} />
              </label>
              <label>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  required
                />
              </label>
              <label>
                <span>Phone number</span>{" "}
                <input
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone || ""}
                />
              </label>
            </div>

            {profileMessage ? (
              <p
                className={
                  profileMessage.type === "success"
                    ? styles.successMessage
                    : styles.errorMessage
                }
              >
                {profileMessage.text}
              </p>
            ) : null}
            <button className={styles.primaryAction} disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>

          {/* Password section */}
          <form
            className={styles.panel}
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSavingPassword(true);
              const res = await updatePassword({
                currentPassword: String(fd.get("currentPassword") || ""),
                password: String(fd.get("password") || ""),
                confirmPassword: String(fd.get("confirmPassword") || ""),
              });
              setSavingPassword(false);
              setPasswordMessage(
                res.success
                  ? { type: "success", text: "Password updated successfully." }
                  : {
                      type: "error",
                      text: res.message || "Password update failed.",
                    },
              );
              if (res.success) e.currentTarget.reset();
            }}
          >
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.kicker}>Security</p>
                <h2>Password update</h2>
              </div>
              <span className={styles.softBadge}>
                <Icon name="lock" /> Secure
              </span>
            </div>
            <div className={styles.formFields}>
              <label>
                <span>Current password</span>{" "}
                <input name="currentPassword" type="password" required />
              </label>
              <label>
                <span>New password</span>{" "}
                <input name="password" type="password" minLength={6} required />
              </label>
              <label>
                <span>Confirm new password</span>{" "}
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  required
                />
              </label>
            </div>
            {passwordMessage ? (
              <p
                className={
                  passwordMessage.type === "success"
                    ? styles.successMessage
                    : styles.errorMessage
                }
              >
                {passwordMessage.text}
              </p>
            ) : null}
            <button className={styles.primaryAction} disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      )}
    </AccountShell>
  );
}
