"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import type { User } from "@/types/user.types";
import type { Wishlist } from "@/types/wishlist.types";
import { getMe, logout, updateMe, updatePassword } from "@/services/api/auth.api";
import { getOrder, getOrders, trackOrder } from "@/services/api/orders.api";
import { getWishlist } from "@/services/api/wishlist.api";
import { getCartItemImage } from "@/utils/cartImage";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./account.module.scss";

type IconName = "grid" | "bag" | "heart" | "route" | "settings" | "user" | "mail" | "phone" | "logout" | "arrow" | "spark" | "lock";
type ShellState = { user: ApiResponse<User> | null; loading: boolean };
type Message = { type: "success" | "error"; text: string } | null;

const accountNav = [
  { href: "/account", label: "Dashboard", description: "Account overview", icon: "grid" },
  { href: "/account/orders", label: "Orders", description: "Track purchases", icon: "bag" },
  { href: "/wishlist", label: "Wishlist", description: "Saved products", icon: "heart" },
  { href: "/order-tracking", label: "Order Tracking", description: "Find an order", icon: "route" },
  { href: "/account/settings", label: "Settings", description: "Profile and password", icon: "settings" },
] as const;

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
    bag: <><path d="M6.5 8h11l1 12h-13l1-12Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    heart: <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />,
    route: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6h4a3.5 3.5 0 0 1 0 7h-1a3.5 3.5 0 0 0 0 7H15.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.1L14 3h-4l-.4 2.8a7 7 0 0 0-2 1.1l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.1L10 21h4l.4-2.8a7 7 0 0 0 2-1.1l2.4 1 2-3.4-2-1.5c.1-.4.2-.8.2-1.2Z" /></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
    mail: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m5 8 7 5 7-5" /></>,
    phone: <path d="M8 5 6 7c.4 5.3 5.7 10.6 11 11l2-2-3-3-2 1c-1.8-.9-3.1-2.2-4-4l1-2-3-3Z" />,
    logout: <><path d="M10 5H5v14h5" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    arrow: <path d="M9 6l6 6-6 6" />,
    spark: <><path d="m12 3 1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z" /><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function displayName(user: User) {
  return user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

function initials(user?: User | null) {
  const source = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.displayName || user.email : "Guest";
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function statusLabel(status: Order["status"]) {
  return status.replace("-", " ");
}

function orderTotal(order: Order) {
  return formatPrice(order.total);
}

function orderQuantity(order: Order) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function firstOrderItem(order: Order) {
  return order.items[0];
}

function trackingStepIndex(status: Order["status"]) {
  if (["cancelled", "refunded", "failed"].includes(status)) return -1;
  if (status === "completed") return 3;
  if (status === "processing") return 1;
  if (status === "on-hold") return 1;
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

function AccountShell({
  eyebrow,
  title,
  description,
  children,
  requireAuth = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: (ctx: { user: User | null; reloadUser: () => Promise<void> }) => React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ShellState>({ user: null, loading: true });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function loadUser() {
    const user = await getMe();
    setState({ user, loading: false });
  }

  useEffect(() => {
    let active = true;
    getMe().then((user) => {
      if (active) setState({ user, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);

  const user = state.user?.success ? state.user.data : null;

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    clearStoredSession();
    setIsLoggingOut(false);
    router.push("/login?redirect=/account");
    router.refresh();
  }

  if (!state.loading && requireAuth && !user) {
    return (
      <main className={styles.accountShell}>
        <section className={styles.guestPanel}>
          <span className={styles.guestIcon}><Icon name="user" /></span>
          <p className={styles.kicker}>Account access</p>
          <h1>Sign in to view your account</h1>
          <p>{state.user?.message || "Login is required to view customer data."}</p>
          <div className={styles.guestActions}>
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Login</Link>
            <Link href={`/register?redirect=${encodeURIComponent(pathname)}`}>Create account</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.accountShell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {user ? (
          <button className={styles.logoutButton} type="button" onClick={handleLogout} disabled={isLoggingOut}>
            <Icon name="logout" />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        ) : null}
      </section>

      <section className={styles.dashboardGrid} aria-label="Account area">
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <span className={styles.avatar}>{initials(user)}</span>
            <div>
              <h2>{user ? displayName(user) : "Account"}</h2>
              <p>{user?.email || "Customer center"}</p>
            </div>
          </div>

          <nav className={styles.accountNav} aria-label="Account navigation">
            {accountNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link key={item.href} className={active ? `${styles.navItem} ${styles.active}` : styles.navItem} href={item.href} aria-current={active ? "page" : undefined}>
                  <span className={styles.navIcon}><Icon name={item.icon} /></span>
                  <span><strong>{item.label}</strong><small>{item.description}</small></span>
                  <Icon name="arrow" />
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className={styles.content}>
          {state.loading && requireAuth ? <ContentSkeleton /> : children({ user, reloadUser: loadUser })}
        </div>
      </section>
    </main>
  );
}

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

function InlineState({ title, message, href, label }: { title: string; message: string; href?: string; label?: string }) {
  return (
    <div className={styles.inlineState}>
      <strong>{title}</strong>
      <p>{message}</p>
      {href && label ? <Link href={href}>{label}</Link> : null}
    </div>
  );
}

function OrderRows({ orders }: { orders: Order[] }) {
  return (
    <div className={styles.orderList}>
      {orders.map((order) => {
        const firstItem = firstOrderItem(order);
        const image = firstItem ? getCartItemImage(firstItem) : undefined;
        const remainingItems = Math.max(0, order.items.length - 1);

        return (
          <article className={styles.orderRow} key={order.id}>
            <Link className={styles.orderMain} href={`/account/orders/${order.id}`}>
              <span className={styles.orderThumb}>
                {image?.src ? <img src={image.src} alt={image.alt || firstItem?.name || `Order ${order.number}`} loading="lazy" decoding="async" /> : <b>{firstItem?.name?.slice(0, 1) || "L"}</b>}
              </span>
              <span className={styles.orderCopy}>
                <strong>Order #{order.number}</strong>
                <small>{formatDate(order.dateCreated)} · {orderQuantity(order)} item{orderQuantity(order) === 1 ? "" : "s"}</small>
                {firstItem ? <em>{firstItem.name}{remainingItems ? ` + ${remainingItems} more` : ""}</em> : null}
              </span>
            </Link>
            <span className={styles.statusPill}>{statusLabel(order.status)}</span>
            <span className={styles.orderTotal}>{orderTotal(order)}</span>
            <Link className={styles.trackLink} href={`/account/orders/${order.id}`}>Track order</Link>
          </article>
        );
      })}
    </div>
  );
}

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
          <h2>{isException ? "Order needs attention" : `Your order is ${statusLabel(order.status)}`}</h2>
          <p>{isException ? "This order is not currently moving through the standard fulfillment flow." : "Track every important update for your Lunex purchase here."}</p>
        </div>
        <span className={styles.statusPill}>{statusLabel(order.status)}</span>
      </div>

      <div className={styles.timeline} aria-label="Order tracking timeline">
        {steps.map((step, index) => {
          const active = !isException && index <= activeStep;
          const current = !isException && index === activeStep;
          return (
            <div className={active ? `${styles.timelineStep} ${styles.timelineActive}` : styles.timelineStep} key={step.label}>
              <span>{active ? "✓" : index + 1}</span>
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
          <div className={styles.sectionHeader}><div><p className={styles.kicker}>Products</p><h2>Items in this order</h2></div></div>
          <div className={styles.trackItemList}>
            {order.items.map((item) => {
              const image = getCartItemImage(item);
              return (
                <article className={styles.trackItem} key={item.key}>
                  <span className={styles.trackThumb}>
                    {image?.src ? <img src={image.src} alt={image.alt || item.name} loading="lazy" decoding="async" /> : <b>{item.name.slice(0, 1)}</b>}
                  </span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>Qty {item.quantity} · Product #{item.productId}</p>
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
            <div><dt>Order number</dt><dd>#{order.number}</dd></div>
            <div><dt>Placed on</dt><dd>{formatDate(order.dateCreated)}</dd></div>
            <div><dt>Payment</dt><dd>{order.paymentMethodTitle || "Not available"}</dd></div>
            <div><dt>Items</dt><dd>{orderQuantity(order)}</dd></div>
            <div><dt>Total</dt><dd>{orderTotal(order)}</dd></div>
          </dl>
          <Link href="/account/orders">Back to orders</Link>
        </aside>
      </div>
    </div>
  );
}

export function AccountDashboard() {
  const [orders, setOrders] = useState<ApiResponse<Order[]> | null>(null);
  const [wishlist, setWishlist] = useState<ApiResponse<Wishlist> | null>(null);

  useEffect(() => {
    getOrders().then(setOrders);
    getWishlist().then(setWishlist);
  }, []);

  return (
    <AccountShell eyebrow="My Account" title="Account dashboard" description="Manage your profile, orders, saved products, and account activity from one premium dashboard.">
      {({ user }) => {
        const orderItems = orders?.success ? orders.data : [];
        const wishlistItems = wishlist?.success ? wishlist.data.items : [];
        const latestOrder = orderItems[0];
        const activeOrders = orderItems.filter((order) => !["completed", "cancelled", "refunded", "failed"].includes(order.status)).length;

        return (
          <>
            <div className={styles.statsGrid}>
              <article className={styles.statCard}><span>Total orders</span><strong>{orders?.success ? orderItems.length : "-"}</strong><p>{orders ? "From your account history" : "Loading order history"}</p></article>
              <article className={styles.statCard}><span>Active orders</span><strong>{orders?.success ? activeOrders : "-"}</strong><p>Processing, pending, or on hold</p></article>
              <article className={styles.statCard}><span>Saved products</span><strong>{wishlist?.success ? wishlistItems.length : "-"}</strong><p>{wishlist ? "Products in your wishlist" : "Loading wishlist"}</p></article>
              <article className={styles.statCard}><span>Latest order</span><strong>{latestOrder ? `#${latestOrder.number}` : "-"}</strong><p>{latestOrder ? formatDate(latestOrder.dateCreated) : "No order found"}</p></article>
            </div>

            <section className={styles.panel}>
              <div className={styles.sectionHeader}><div><p className={styles.kicker}>Profile</p><h2>Account details</h2></div><span className={styles.softBadge}><Icon name="spark" /> Customer profile</span></div>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span><Icon name="mail" /></span><div><small>Email</small><strong>{user?.email}</strong></div></div>
                <div className={styles.detailItem}><span><Icon name="phone" /></span><div><small>Phone</small><strong>{user?.phone || "Not added yet"}</strong></div></div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.sectionHeader}><div><p className={styles.kicker}>Orders</p><h2>Recent activity</h2></div><Link className={styles.textLink} href="/account/orders">View orders</Link></div>
              {!orders ? <ContentSkeleton /> : !orders.success ? <InlineState title="Order history could not be loaded" message={orders.message || "Please try again."} /> : !orderItems.length ? <InlineState title="No orders yet" message="Your WooCommerce orders will appear here once you place an order." href="/products" label="Start shopping" /> : <OrderRows orders={orderItems.slice(0, 3)} />}
            </section>

            <section className={styles.panel}>
              <div className={styles.sectionHeader}><div><p className={styles.kicker}>Wishlist</p><h2>Saved products</h2></div><Link className={styles.textLink} href="/wishlist">View wishlist</Link></div>
              {!wishlist ? <ContentSkeleton /> : !wishlist.success ? <InlineState title="Wishlist unavailable" message={wishlist.message || "Please try again."} href="/wishlist" label="Open wishlist" /> : !wishlistItems.length ? <InlineState title="No saved products yet" message="Tap the heart icon on any product and it will appear here." href="/products" label="Browse products" /> : <ProductGrid products={wishlistItems.slice(0, 4) as Product[]} />}
            </section>
          </>
        );
      }}
    </AccountShell>
  );
}

export function AccountOrdersView() {
  const [orders, setOrders] = useState<ApiResponse<Order[]> | null>(null);
  useEffect(() => { getOrders().then(setOrders); }, []);

  return (
    <AccountShell eyebrow="Orders" title="Order history" description="Review purchases, statuses, and order details from your account.">
      {() => (
        <section className={styles.panel}>
          <div className={styles.sectionHeader}><div><p className={styles.kicker}>Purchases</p><h2>Your orders</h2></div></div>
          {!orders ? <ContentSkeleton /> : !orders.success ? <InlineState title="Orders unavailable" message={orders.message || "Please try again."} /> : !orders.data.length ? <InlineState title="No orders yet" message="Your orders will appear here after checkout." href="/products" label="Shop now" /> : <OrderRows orders={orders.data} />}
        </section>
      )}
    </AccountShell>
  );
}

export function AccountOrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<ApiResponse<Order> | null>(null);
  useEffect(() => { getOrder(id).then(setOrder); }, [id]);

  return (
    <AccountShell eyebrow="Order Tracking" title={`Track order #${order?.success ? order.data.number : id}`} description="See product status, order progress, payment information, and purchased items in one place.">
      {() => (
        <section className={styles.panel}>
          {!order ? <ContentSkeleton /> : !order.success ? <InlineState title="Order unavailable" message={order.message || "Please try again."} href="/account/orders" label="Back to orders" /> : (
            <OrderTracker order={order.data} />
          )}
        </section>
      )}
    </AccountShell>
  );
}

export function AccountWishlistView() {
  const [wishlist, setWishlist] = useState<ApiResponse<Wishlist> | null>(null);
  useEffect(() => { getWishlist().then(setWishlist); }, []);

  return (
    <AccountShell eyebrow="Wishlist" title="Saved products" description="Keep your favorite products in one place and return to them anytime.">
      {() => (
        <section className={styles.panel}>
          {!wishlist ? <ContentSkeleton /> : !wishlist.success ? <InlineState title="Wishlist unavailable" message={wishlist.message || "Please login to use wishlist."} href="/login?redirect=/wishlist" label="Login" /> : !wishlist.data.items.length ? <InlineState title="Wishlist is empty" message="Save products and they will appear here." href="/products" label="Browse products" /> : <ProductGrid products={wishlist.data.items as Product[]} />}
        </section>
      )}
    </AccountShell>
  );
}

export function AccountSettingsView() {
  const [profileMessage, setProfileMessage] = useState<Message>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  return (
    <AccountShell eyebrow="Settings" title="Account settings" description="Update your basic information and password securely.">
      {({ user, reloadUser }) => (
        <div className={styles.formGrid}>
          <form className={styles.panel} onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setSavingProfile(true);
            const result = await updateMe({
              firstName: String(form.get("firstName") || ""),
              lastName: String(form.get("lastName") || ""),
              email: String(form.get("email") || ""),
              phone: String(form.get("phone") || ""),
            });
            setSavingProfile(false);
            setProfileMessage(result.success ? { type: "success", text: "Profile updated successfully." } : { type: "error", text: result.message || "Profile update failed." });
            if (result.success) await reloadUser();
          }}>
            <div className={styles.sectionHeader}><div><p className={styles.kicker}>Basic info</p><h2>Profile details</h2></div></div>
            <div className={styles.formFields}>
              <label><span>First name</span><input name="firstName" defaultValue={user?.firstName || ""} /></label>
              <label><span>Last name</span><input name="lastName" defaultValue={user?.lastName || ""} /></label>
              <label><span>Email address</span><input name="email" type="email" defaultValue={user?.email || ""} required /></label>
              <label><span>Phone number</span><input name="phone" type="tel" defaultValue={user?.phone || ""} /></label>
            </div>
            {profileMessage ? <p className={profileMessage.type === "success" ? styles.successMessage : styles.errorMessage}>{profileMessage.text}</p> : null}
            <button className={styles.primaryAction} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save changes"}</button>
          </form>

          <form className={styles.panel} onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setSavingPassword(true);
            const result = await updatePassword({
              currentPassword: String(form.get("currentPassword") || ""),
              password: String(form.get("password") || ""),
              confirmPassword: String(form.get("confirmPassword") || ""),
            });
            setSavingPassword(false);
            setPasswordMessage(result.success ? { type: "success", text: "Password updated successfully." } : { type: "error", text: result.message || "Password update failed." });
            if (result.success) event.currentTarget.reset();
          }}>
            <div className={styles.sectionHeader}><div><p className={styles.kicker}>Security</p><h2>Password update</h2></div><span className={styles.softBadge}><Icon name="lock" /> Secure</span></div>
            <div className={styles.formFields}>
              <label><span>Current password</span><input name="currentPassword" type="password" required /></label>
              <label><span>New password</span><input name="password" type="password" minLength={6} required /></label>
              <label><span>Confirm new password</span><input name="confirmPassword" type="password" minLength={6} required /></label>
            </div>
            {passwordMessage ? <p className={passwordMessage.type === "success" ? styles.successMessage : styles.errorMessage}>{passwordMessage.text}</p> : null}
            <button className={styles.primaryAction} disabled={savingPassword}>{savingPassword ? "Updating..." : "Update password"}</button>
          </form>
        </div>
      )}
    </AccountShell>
  );
}

export function OrderTrackingView() {
  const [result, setResult] = useState<ApiResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AccountShell eyebrow="Order Tracking" title="Track an order" description="Use your order ID with billing email or order key to check the latest status." requireAuth={false}>
      {() => (
        <section className={styles.panel}>
          <form className={styles.trackingForm} onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setLoading(true);
            const response = await trackOrder({ orderId: String(form.get("orderId") || ""), email: String(form.get("email") || "") });
            setLoading(false);
            setResult(response);
          }}>
            <label><span>Order ID</span><input name="orderId" inputMode="numeric" required /></label>
            <label><span>Email or order key</span><input name="email" required /></label>
            <button className={styles.primaryAction} disabled={loading}>{loading ? "Tracking..." : "Track order"}</button>
          </form>

          {result ? (
            result.success ? <div className={styles.trackingResult}><strong>Order #{result.data.number}</strong><span className={styles.statusPill}>{result.data.status}</span><p>Total: {result.data.total}</p><p>Date: {formatDate(result.data.dateCreated)}</p></div> : <p className={styles.errorMessage}>{result.message || "Could not track this order."}</p>
          ) : null}
        </section>
      )}
    </AccountShell>
  );
}
