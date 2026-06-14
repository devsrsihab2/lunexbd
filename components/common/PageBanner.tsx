import Image from "next/image";
import styles from "./PageBanner.module.scss";

type PageBannerProps = {
  title: string;
  text?: string;
  eyebrow?: string;
  badge?: string;
  image?: string;
};

export function PageBanner({
  title,
  text,
  eyebrow = "Lunexbd",
  badge,
  image,
}: PageBannerProps) {
  return (
    <section className={styles.banner}>
      <div className={styles.pattern} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.contentBox}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowDot} />
              <p className={styles.eyebrow}>{eyebrow}</p>
            </div>

            <h1 className={styles.title}>{title}</h1>

            {text ? <p className={styles.text}>{text}</p> : null}

            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </div>
        </div>

        {image ? (
          <div className={styles.media} aria-hidden="true">
            <div className={styles.imageShape}>
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 48vw"
              />
            </div>

            <span className={styles.glassCircleOne} />
            <span className={styles.glassCircleTwo} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
