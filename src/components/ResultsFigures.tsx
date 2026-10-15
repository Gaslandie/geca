export function ResultsFigures({ stats, countUp = false }: {
  stats: readonly { value: string; label: string }[];
  countUp?: boolean;
}) {
  return <dl className="support-stats" data-count-group={countUp ? "" : undefined}>
    {stats.map(stat => <div key={stat.label} data-reveal>
      <dt>{stat.label}</dt>
      <dd>{countUp ? <span className="stat-value">
        <span className="stat-final" aria-hidden="true">{stat.value}</span>
        <span className="sr-only">{stat.value}</span>
        <span className="stat-count" data-count={Number(stat.value.replace(/\s/g, ""))} aria-hidden="true">{stat.value}</span>
      </span> : stat.value}</dd>
    </div>)}
  </dl>;
}
