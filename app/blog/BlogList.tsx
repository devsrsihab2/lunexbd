"use client";

import Link from "next/link";
import { useState } from "react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { getBlogPosts } from "@/services/api/content.api";
import type { ApiResponse } from "@/types/api.types";
import type { BlogPost } from "@/types/content.types";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import styles from "./blog.module.scss";

const POSTS_PER_PAGE = 8;

export function BlogList({ initialPosts }: { initialPosts: ApiResponse<BlogPost[]> }) {
  const [posts, setPosts] = useState(initialPosts.success ? initialPosts.data : []);
  const [page, setPage] = useState(initialPosts.pagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialPosts.pagination?.totalPages || 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialPosts.success ? "" : initialPosts.message);

  async function loadMore() {
    if (loading) return;

    setLoading(true);
    setMessage("");

    const response = await getBlogPosts({
      page: String(page + 1),
      per_page: String(POSTS_PER_PAGE),
    });

    setLoading(false);

    if (!response.success) {
      setMessage(response.message || "Unable to load more posts.");
      return;
    }

    setPosts((current) => [...current, ...response.data]);
    setPage(response.pagination?.page || page + 1);
    setTotalPages(response.pagination?.totalPages || totalPages);
  }

  return (
    <>
      <section className={styles.grid} aria-label="Blog posts">
        {posts.map((post) => (
          <BlogCard post={post} key={post.id} />
        ))}
      </section>

      <div className={styles.blogLoadMore}>
        {message ? <p role="alert">{message}</p> : null}
        {page < totalPages ? (
          <button type="button" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </button>
        ) : posts.length ? (
          <span>You have viewed all posts.</span>
        ) : null}
      </div>
    </>
  );
}

export function BlogCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return (
    <article className={compact ? styles.relatedCard : styles.card}>
      <div className={compact ? styles.relatedImage : styles.image}>
        <ResponsiveImage
          src={post.featuredImage}
          alt={post.title}
          aspect={compact ? "1 / 1" : "4 / 3"}
          sizes={compact ? "88px" : "(min-width: 1500px) 16vw, (min-width: 1180px) 22vw, (min-width: 820px) 30vw, 100vw"}
        />
      </div>
      <div className={compact ? styles.relatedBody : styles.cardBody}>
        <p className={styles.meta}>{formatPostDate(post.date)}</p>
        <h2 className={compact ? styles.relatedTitle : styles.cardTitle}>{post.title}</h2>
        {!compact && post.excerpt ? (
          <div
            className={styles.excerpt}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.excerpt) }}
          />
        ) : null}
        <Link className={styles.readLink} href={`/blog/${post.slug}`}>
          Read post
        </Link>
      </div>
    </article>
  );
}

function formatPostDate(date?: string) {
  return date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "Blog";
}
