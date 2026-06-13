import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUSES } from "@/utils/constants";
import type { OrderStatus } from "@/types/order.types";

export function OrderTimeline({ status }: { status?: OrderStatus }) {
  const activeIndex = ORDER_STATUSES.indexOf(status || "pending");

  return (
    <ol className="stack">
      {ORDER_STATUSES.map((item, index) => (
        <li key={item}>
          <Badge>{index <= activeIndex ? "Current" : "Pending"}</Badge> {item.replace("-", " ")}
        </li>
      ))}
    </ol>
  );
}
