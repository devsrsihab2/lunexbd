import type { HomeBanner, MenuItem } from "@/types/content.types";
import { BannerSlider } from "./BannerSlider";
import styles from "./HeroBanner.module.scss";
import Link from "next/link";

const fallbackBanner: HomeBanner = {
  title: "Made for every moment",
  subtitle: "Premium quality. Timeless style. Bags for every occasion.",
  image: "/lunex/hero-products.png",
  href: "/products",
  buttonText: "Shop Now",
  scriptText: "Designed for You,",
  badgeText: "Timeless Design Endless Elegance",
};

function LineIcon({
  name,
}: {
  name: "quality" | "return" | "payment" | "star" | "leaf" | "heart" | "gift";
}) {
  const common = {
    width: 34,
    height: 34,
    viewBox: "0 0 34 34",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths = {
    quality: (
      <>
        <path d="m17 3 4 4 5.7.8.8 5.7 4 4-4 4-.8 5.7-5.7.8-4 4-4-4-5.7-.8-.8-5.7-4-4 4-4 .8-5.7L13 7l4-4Z" />
        <path d="m12 17 3 3 7-7" />
      </>
    ),
    return: (
      <>
        <path d="M9 13a9 9 0 1 1 2 12" />
        <path d="M9 13H4V8" />
        <path d="m21 12-9 8" />
        <path d="m12 12 9 8" />
      </>
    ),
    payment: (
      <>
        <rect x="4" y="8" width="26" height="18" rx="2" />
        <path d="M4 14h26" />
        <path d="M9 21h4" />
        <path d="M22 21h4" />
      </>
    ),
    star: (
      <path d="m17 3 4.2 9 9.8 1.1-7.2 6.8 1.9 9.7L17 24.8l-8.7 4.8 1.9-9.7L3 13.1 12.8 12 17 3Z" />
    ),
    leaf: (
      <>
        <path d="M27 5C12 5 7 13 7 29c13 0 21-8 20-24Z" />
        <path d="M7 29c5-9 11-14 20-24" />
      </>
    ),
    heart: (
      <path d="M28.5 7.6a7.1 7.1 0 0 0-10 0L17 9.1l-1.5-1.5a7.1 7.1 0 0 0-10 10L17 29l11.5-11.4a7.1 7.1 0 0 0 0-10Z" />
    ),
    gift: (
      <>
        <path d="M5 14h24v16H5z" />
        <path d="M5 14h24v-5H5z" />
        <path d="M17 9v21" />
        <path d="M17 9c-5 0-7-6-3-6 3 0 3 6 3 6Z" />
        <path d="M17 9c5 0 7-6 3-6-3 0-3 6-3 6Z" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export function HeroBanner({
  banners,
}: {
  banners?: HomeBanner[];
  menu?: MenuItem[];
}) {
  const slides = banners?.length ? banners : [fallbackBanner];
  const featured = slides[0] || fallbackBanner;
  return (
    <section className={styles.heroWrap} aria-label="Lunex featured bags">
      <div className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.script}>
            {featured.scriptText || fallbackBanner.scriptText}
          </p>
          <h1>{featured.title || fallbackBanner.title}</h1>
          <div className={styles.divider}>
            <span />
            <b>*</b>
            <span />
          </div>
          <p className={styles.lead}>
            {featured.subtitle || fallbackBanner.subtitle}
          </p>
          <Link className={styles.cta} href={featured.href || "/products"}>
            {featured.buttonText || fallbackBanner.buttonText}{" "}
            <span aria-hidden="true">-&gt;</span>
          </Link>

          <div className={styles.assurance} aria-label="Shopping benefits">
            <div>
              <LineIcon name="quality" />
              <span>
                <strong>Premium Quality</strong>
                <small>100% Authentic</small>
              </span>
            </div>
            <div>
              <LineIcon name="return" />
              <span>
                <strong>Easy Returns</strong>
                <small>7 Days Return</small>
              </span>
            </div>
            <div>
              <LineIcon name="payment" />
              <span>
                <strong>Secure Payment</strong>
                <small>Safe & Secure Checkout</small>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.art}>
          <div className={styles.archOne} aria-hidden="true" />
          <div className={styles.archTwo} aria-hidden="true" />
          <BannerSlider banners={slides} />
        </div>
      </div>
    </section>
  );
}
