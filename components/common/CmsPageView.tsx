import { connection } from "next/server";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageBanner } from "@/components/common/PageBanner";
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
      <PageBanner
        title={displayTitle}
        text="Please review the latest information below."
        badge={page.success ? "Official page" : "Needs attention"}
        image="/lunex/landscap-2.webp"
      />

      <section className={styles.contentShell}>
        {!page.success ? (
          <ErrorState message={page.message} retryHref={`/${slug}`} />
        ) : (
          <article
            className={styles.content}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(page.data.content),
            }}
          />
        )}
      </section>

      {extra}
    </main>
  );
}
