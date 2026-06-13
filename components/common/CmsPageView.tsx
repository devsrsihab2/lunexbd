import { connection } from "next/server";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCmsPageWithFallbacks } from "@/services/api/content.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import styles from "./CmsPageView.module.scss";

export async function CmsPageView({
  slug,
  title,
  extra,
  aliases = [],
}: {
  slug: string;
  title: string;
  extra?: React.ReactNode;
  aliases?: string[];
}) {
  await connection();

  const page = await getCmsPageWithFallbacks([slug, ...aliases]);
  const displayTitle = page.success ? page.data.title : title;

  return (
    <main className={styles.cmsPage}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Lunexbd</p>
          <h1>{displayTitle}</h1>
          <p>Please review the latest information below.</p>
        </div>
        <span>{page.success ? "Official page" : "Needs attention"}</span>
      </section>

      <section className={styles.contentShell}>
        {!page.success ? (
          <ErrorState message={page.message} retryHref={`/${slug}`} />
        ) : (
          <article
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.data.content) }}
          />
        )}
      </section>

      {extra}
    </main>
  );
}
