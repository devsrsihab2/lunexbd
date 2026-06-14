import { PageBanner } from "@/components/common/PageBanner";
import { ContactForm } from "@/components/forms/ContactForm";
import styles from "./contact.module.scss";

export default function ContactPage() {
  return (
    <main className={styles.contactPage}>
      <PageBanner
        eyebrow="Contact"
        title="Contact"
        text="Start the conversation to establish a good relationship and business."
        image="/lunex/landscap-1.webp"
      />
      <section className={styles.contactStage}>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.person}>
            <span className={styles.plant} />
            <span className={styles.lamp} />
            <span className={styles.chair} />
            <span className={styles.head} />
            <span className={styles.body} />
            <span className={styles.laptop} />
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
