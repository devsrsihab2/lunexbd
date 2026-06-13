import { Button } from "./Button";

function buildHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ page = 1, totalPages = 1, basePath, query }: { page?: number; totalPages?: number; basePath: string; query?: Record<string, string | undefined> }) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4));
    return start + index;
  }).filter((item) => item <= totalPages);

  return (
    <nav aria-label="Pagination" style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
      <Button href={buildHref(basePath, Math.max(1, page - 1), query)} variant="secondary" disabled={page <= 1}>Previous</Button>
      {pages.map((item) => (
        <Button key={item} href={buildHref(basePath, item, query)} variant={item === page ? "primary" : "secondary"} aria-current={item === page ? "page" : undefined}>
          {item}
        </Button>
      ))}
      <Button href={buildHref(basePath, Math.min(totalPages, page + 1), query)} variant="secondary" disabled={page >= totalPages}>Next</Button>
    </nav>
  );
}
