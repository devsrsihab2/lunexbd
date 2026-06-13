export function PageIntro({ title, text }: { title: string; text?: string }) {
  return (
    <header>
      <h1>{title}</h1>
      {text ? <p>{text}</p> : null}
    </header>
  );
}
