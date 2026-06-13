export function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  return (
    <div>
      <div role="tablist" aria-label="Content tabs" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {tabs.map((tab, index) => (
          <a key={tab.label} href={`#tab-${index}`} role="tab">
            {tab.label}
          </a>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <section key={tab.label} id={`tab-${index}`} role="tabpanel">
          {tab.content}
        </section>
      ))}
    </div>
  );
}
