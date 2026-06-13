export function formatPrice(value?: string | number, currency = "BDT") {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (currency === "BDT") {
    return `৳ ${new Intl.NumberFormat("en-BD", {
      maximumFractionDigits: 0,
    }).format(safeAmount)}`;
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}
