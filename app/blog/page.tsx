import { connection } from "next/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getBlogPosts } from "@/services/api/content.api";
import { BlogList } from "./BlogList";
import styles from "./blog.module.scss";

export default async function BlogPage() {
  await connection();
  const posts = await getBlogPosts({ page: "1", per_page: "8" });

  return (
    <main className={styles.blogPage}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Lunexbd Journal</p>
        <h1 className={styles.heading}>Blog</h1>
        <p className={styles.subtitle}>Latest stories, product notes, styling ideas, and ecommerce updates from WordPress.</p>
      </section>

      {!posts.success ? (
        <ErrorState message={posts.message} retryHref="/blog" />
      ) : !posts.data.length ? (
        <EmptyState title="No posts yet" message="WordPress posts will appear here." />
      ) : (
        <BlogList initialPosts={posts} />
      )}
    </main>
  );
}
