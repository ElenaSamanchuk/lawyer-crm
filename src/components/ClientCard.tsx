import type { Client } from '../types';
import { daysSince, daysUntil } from '../lib/dates';
import { formatPhone, formatShortDate } from '../lib/format';
import { ClientActions } from './ClientActions';
import { StatusSelect } from './ui/StatusSelect';
import type { CaseStatus } from '../types';

type ClientCardProps = {
  client: Client;
  overdue: boolean;
  stale: boolean;
  pendingDelete: boolean;
  onStatusChange: (status: CaseStatus) => void;
  onMarkContact: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
};

export function ClientCard({
  client,
  overdue,
  stale,
  pendingDelete,
  onStatusChange,
  onMarkContact,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: ClientCardProps) {
  const dueIn = daysUntil(client.followUpDate);

  return (
    <article
      className={`client-card ${overdue ? 'client-card--overdue' : stale ? 'client-card--stale' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-anywhere font-semibold text-ink">{client.name}</h3>
          <a className="mt-1 inline-block text-sm font-medium text-accent" href={`tel:${client.phone}`}>
            {formatPhone(client.phone)}
          </a>
        </div>
        <span className="case-tag shrink-0">{client.caseType}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Статус</dt>
          <dd className="mt-1.5">
            <StatusSelect
              value={client.status}
              label={`Статус для ${client.name}`}
              onChange={onStatusChange}
              compact
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Следующий шаг</dt>
          <dd className="mt-1.5">
            <p className="font-semibold text-ink">{formatShortDate(client.followUpDate)}</p>
            {overdue ? (
              <p className="mt-1 text-xs font-semibold text-danger">
                Просрочено {Math.abs(dueIn)} дн.
              </p>
            ) : dueIn === 0 ? (
              <p className="mt-1 text-xs font-semibold text-warning">Сегодня</p>
            ) : (
              <p className="mt-1 text-xs text-muted">Через {dueIn} дн.</p>
            )}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Последний контакт</dt>
          <dd className="mt-1 text-muted">
            {daysSince(client.lastContactAt) === 0
              ? 'Сегодня'
              : `${daysSince(client.lastContactAt)} дн. назад`}
            <span className="text-line"> · </span>
            в базе с {formatShortDate(client.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-line pt-4">
        <ClientActions
          client={client}
          pendingDelete={pendingDelete}
          onMarkContact={onMarkContact}
          onDeleteRequest={onDeleteRequest}
          onDeleteConfirm={onDeleteConfirm}
          onDeleteCancel={onDeleteCancel}
        />
      </div>
    </article>
  );
}
