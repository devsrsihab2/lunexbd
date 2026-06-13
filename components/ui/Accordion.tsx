export function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}
