import Link from "next/link";

export function Breadcrumb({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: "flex", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, index) => (
          <li key={item.href}>
            {index > 0 ? <span aria-hidden="true">/ </span> : null}
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
