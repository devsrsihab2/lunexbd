import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main aria-label="Page is loading">
      <Skeleton variant="page" />
    </main>
  );
}
