import { formatPrice } from "@/utils/formatPrice";

export function Price({ value }: { value?: string | number }) {
  return <span>{formatPrice(value)}</span>;
}
