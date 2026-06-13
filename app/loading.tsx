import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container page-shell">
      <Skeleton lines={6} />
    </div>
  );
}
