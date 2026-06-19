import { RouteSkeleton } from "@/components/ui/RouteSkeleton";
import styles from "./account.module.scss";

export default function Loading() {
  return (
    <main className={styles.accountShell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Account</p>
          <h1>Loading account</h1>
          <p>Preparing your dashboard...</p>
        </div>
      </section>
      <RouteSkeleton />
    </main>
  );
}
