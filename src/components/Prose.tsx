export function Prose({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter((paragraph) => paragraph.trim());
  return (
    <div className="prose">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
      ))}
    </div>
  );
}
