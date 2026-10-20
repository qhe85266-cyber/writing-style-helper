import type { LogItem } from '../types';

export function DecisionLog({ items }: { items: LogItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="log" aria-label="决策记录">
      <div className="section-head">
        <p className="kicker">可追溯</p>
        <h2>决策记录</h2>
      </div>
      <ol>
        {items.map((item) => (
          <li key={item.id} data-tone={item.tone}>
            <span className="log-title">{item.title}</span>
            <span className="log-detail">{item.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
