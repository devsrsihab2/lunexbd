import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ErrorState } from "@/components/ui/ErrorState";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { getBlogPost, getBlogPosts } from "@/services/api/content.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { BlogCard } from "../BlogList";
import styles from "../blog.module.scss";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post.success && post.message?.toLowerCase().includes("not found")) notFound();
  if (!post.success) return <div className={styles.blogPage}><ErrorState message={post.message} retryHref={`/blog/${slug}`} /></div>;
  const relatedResponse = await getBlogPosts({ page: "1", per_page: "5" });
  const relatedPosts = relatedResponse.success
    ? relatedResponse.data.filter((item) => item.slug !== post.data.slug).slice(0, 4)
    : [];

  const dateLabel = post.data.date
    ? new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.data.date))
    : "";

  return (
    <article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.data.title, datePublished: post.data.date }} />
      <section className={styles.detailHero}>
        {post.data.featuredImage ? (
          <div className={styles.detailImage}>
            <ResponsiveImage src={post.data.featuredImage} alt={post.data.title} aspect="16 / 9" sizes="100vw" priority />
          </div>
        ) : (
          <div className={styles.detailFallback} aria-hidden="true" />
        )}
        <div className={styles.detailOverlay} aria-hidden="true" />
        <div className={styles.detailInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{post.data.title}</span>
          </nav>
          <h1 className={styles.detailTitle}>{post.data.title}</h1>
          <div className={styles.detailMeta}>
            {dateLabel ? <span>{dateLabel}</span> : null}
            {post.data.author ? <span>{post.data.author}</span> : null}
          </div>
        </div>
      </section>
      <div className={styles.contentWrap}>
        <div className={styles.detailLayout}>
          <div className={styles.contentShell}>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.data.content) }} />
          </div>
          {relatedPosts.length ? (
            <aside className={styles.relatedAside} aria-label="Related blog posts">
              <div className={styles.relatedSticky}>
                <p className={styles.eyebrow}>Related</p>
                <h2>More from the journal</h2>
                <div className={styles.relatedList}>
                  {relatedPosts.map((item) => (
                    <BlogCard post={item} compact key={item.id} />
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </article>
  );
}
