export function ResultsFigures({ stats }: { stats: readonly { value: string; label: string }[] }) {
  return <dl className="support-stats">
    {stats.map(stat => <div key={stat.label} data-reveal>
      <dt>{stat.label}</dt><dd>{stat.value}</dd>
    </div>)}
  </dl>;
}
