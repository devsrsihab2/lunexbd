export function Rating({ value = "0" }: { value?: string }) {
  const rating = Number(value) || 0;

  return <span aria-label={`${rating} out of 5 rating`}>{rating ? `${rating.toFixed(1)} / 5` : "New"}</span>;
}
