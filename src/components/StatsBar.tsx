import type { CaseStatus } from '../types';
import { STATUS_LABELS, STATUS_ORDER } from '../types';

type StatsBarProps = {
  totals: Record<'all' | CaseStatus, number>;
  overdueCount: number;
};

export function StatsBar({ totals, overdueCount }: StatsBarProps) {
  const metrics = [
    { key: 'all', label: 'Всего', value: totals.all, tone: 'default' as const },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      label: STATUS_LABELS[status],
      value: totals[status],
      tone: 'default' as const,
    })),
    ...(overdueCount > 0
      ? [{ key: 'overdue', label: 'Просрочено', value: overdueCount, tone: 'danger' as const }]
      : []),
  ];

  return (
    <section className="panel overflow-hidden" aria-label="Счётчики по статусам">
      <div className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {metrics.map((metric, index) => (
          <article
            key={metric.key}
            className={`metric-cell shrink-0 sm:shrink sm:flex-1 ${
              index > 0 ? 'border-l border-line' : ''
            } ${metric.tone === 'danger' ? 'bg-danger/[0.03]' : ''}`}
          >
            <p
              className={`metric-value ${metric.tone === 'danger' ? 'text-danger' : 'text-brand'}`}
            >
              {metric.value}
            </p>
            <p
              className={`metric-label ${metric.tone === 'danger' ? 'text-danger/80' : ''}`}
            >
              {metric.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
