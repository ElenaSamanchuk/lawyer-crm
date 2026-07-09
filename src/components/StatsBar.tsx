import type { CaseStatus } from '../types';
import { STATUS_LABELS, STATUS_ORDER } from '../types';

type StatsBarProps = {
  totals: Record<'all' | CaseStatus, number>;
  overdueCount: number;
};

export function StatsBar({ totals, overdueCount }: StatsBarProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      aria-label="Счётчики по статусам"
    >
      <article className="rounded-xl border border-line bg-white p-4 shadow-panel">
        <p className="text-3xl font-bold text-brand">{totals.all}</p>
        <p className="mt-1 text-sm text-muted">Всего клиентов</p>
      </article>

      {STATUS_ORDER.map((status) => (
        <article
          key={status}
          className="rounded-xl border border-line bg-white p-4 shadow-panel"
        >
          <p className="text-3xl font-bold text-brand">{totals[status]}</p>
          <p className="mt-1 text-sm text-muted">{STATUS_LABELS[status]}</p>
        </article>
      ))}

      {overdueCount > 0 ? (
        <article className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-panel sm:col-span-2 lg:col-span-1">
          <p className="text-3xl font-bold text-red-700">{overdueCount}</p>
          <p className="mt-1 text-sm font-medium text-red-700">Просрочен контакт</p>
        </article>
      ) : null}
    </section>
  );
}
