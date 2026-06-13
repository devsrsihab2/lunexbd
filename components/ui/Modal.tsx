import { Button } from "./Button";

export function Modal({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      <Button type="button" variant="ghost">Close</Button>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
