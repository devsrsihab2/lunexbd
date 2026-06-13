import { redirect } from "next/navigation";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  const search = query.search || query.q;

  if (search) params.set("search", search);

  Object.entries(query).forEach(([key, value]) => {
    if (value && key !== "q" && key !== "search") {
      params.set(key, value);
    }
  });

  redirect(`/products${params.toString() ? `?${params.toString()}` : ""}`);
}
