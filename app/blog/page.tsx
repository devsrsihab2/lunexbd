import { connection } from "next/server";
import { PageBanner } from "@/components/common/PageBanner";
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
      <PageBanner
        eyebrow="Lunexbd Journal"
        title="Blog"
        text="Latest stories, product notes, styling ideas, and ecommerce updates from WordPress."
        image="/lunex/landscap-3.webp"
      />

      {!posts.success ? (
        <ErrorState message={posts.message} retryHref="/blog" />
      ) : !posts.data.length ? (
        <EmptyState
          title="No posts yet"
          message="WordPress posts will appear here."
        />
      ) : (
        <BlogList initialPosts={posts} />
      )}
    </main>
  );
}
