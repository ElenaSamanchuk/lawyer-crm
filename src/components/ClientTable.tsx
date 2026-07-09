import { useMemo, useState } from 'react';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type CaseStatus,
  type Client,
} from '../types';
import { daysSince, daysUntil, isOverdue, isStaleContact } from '../lib/dates';
import { formatPhone, formatShortDate } from '../lib/format';
import { ClientActions } from './ClientActions';
import { ClientCard } from './ClientCard';
import { StatusSelect } from './ui/StatusSelect';

type SortKey = 'name' | 'followUpDate' | 'status';

type ClientTableProps = {
  clients: Client[];
  onStatusChange: (id: string, status: CaseStatus) => void;
  onDelete: (id: string) => void;
  onMarkContact: (id: string) => void;
};

type FilterKey = CaseStatus | 'all';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  ...STATUS_ORDER.map((status) => ({ key: status, label: STATUS_LABELS[status] })),
];

export function ClientTable({
  clients,
  onStatusChange,
  onDelete,
  onMarkContact,
}: ClientTableProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('followUpDate');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: clients.length,
      new: 0,
      active: 0,
      closed: 0,
    };
    for (const client of clients) {
      base[client.status] += 1;
    }
    return base;
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients.filter((client) => {
      const matchesQuery =
        !q ||
        client.name.toLowerCase().includes(q) ||
        client.phone.includes(q) ||
        client.caseType.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortKey === 'status') {
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      }
      return a.followUpDate.localeCompare(b.followUpDate);
    });

    return list;
  }, [clients, query, sortKey, statusFilter]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand sm:text-2xl">Клиенты</h2>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} из {clients.length} в списке
            </p>
          </div>

          <div className="toolbar w-full lg:max-w-xl">
            <label className="relative block min-w-0">
              <span className="sr-only">Поиск клиентов</span>
              <input
                className="field-input pl-10"
                placeholder="Поиск по имени, телефону, делу…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m14.5 14.5-3.2-3.2m1.7-3.8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </label>

            <select
              className="field-select w-full sm:w-[11.5rem]"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Сортировка"
            >
              <option value="followUpDate">По дате контакта</option>
              <option value="name">По имени</option>
              <option value="status">По статусу</option>
            </select>
          </div>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Фильтр по статусу"
        >
          {FILTER_OPTIONS.map(({ key, label }) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`chip shrink-0 ${active ? 'chip--active' : 'chip--idle'}`}
                onClick={() => setStatusFilter(key)}
              >
                {label}
                <span className={`ml-1.5 text-xs ${active ? 'text-white/80' : 'text-muted'}`}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel-body py-16 text-center">
          <p className="font-serif text-lg text-brand">Нет клиентов по фильтру</p>
          <p className="mt-2 text-sm text-muted">
            Измените поиск или добавьте нового клиента в форме выше.
          </p>
        </div>
      ) : (
        <>
          <div className="mobile-list">
            {filtered.map((client) => {
              const overdue = isOverdue(client);
              const stale = isStaleContact(client);

              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  overdue={overdue}
                  stale={stale}
                  pendingDelete={pendingDeleteId === client.id}
                  onStatusChange={(status) => onStatusChange(client.id, status)}
                  onMarkContact={() => onMarkContact(client.id)}
                  onDeleteRequest={() => setPendingDeleteId(client.id)}
                  onDeleteConfirm={() => {
                    onDelete(client.id);
                    setPendingDeleteId(null);
                  }}
                  onDeleteCancel={() => setPendingDeleteId(null)}
                />
              );
            })}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="data-table">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Контакт</th>
                  <th>Дело</th>
                  <th>Статус</th>
                  <th>Следующий шаг</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const overdue = isOverdue(client);
                  const stale = isStaleContact(client);
                  const dueIn = daysUntil(client.followUpDate);
                  const rowClass = overdue
                    ? 'client-row client-row--overdue'
                    : stale
                      ? 'client-row client-row--stale'
                      : 'client-row';

                  return (
                    <tr key={client.id} className={rowClass}>
                      <td>
                        <p className="break-anywhere font-semibold text-ink">{client.name}</p>
                        <p className="mt-1 text-xs text-muted">
                          В базе с {formatShortDate(client.createdAt)}
                        </p>
                      </td>
                      <td>
                        <a
                          className="font-medium text-accent hover:underline"
                          href={`tel:${client.phone}`}
                        >
                          {formatPhone(client.phone)}
                        </a>
                        <p className="mt-1 text-xs text-muted">
                          {daysSince(client.lastContactAt) === 0
                            ? 'Контакт сегодня'
                            : `Без контакта ${daysSince(client.lastContactAt)} дн.`}
                        </p>
                      </td>
                      <td>
                        <span className="case-tag">{client.caseType}</span>
                      </td>
                      <td>
                        <StatusSelect
                          value={client.status}
                          label={`Статус для ${client.name}`}
                          onChange={(status) => onStatusChange(client.id, status)}
                        />
                      </td>
                      <td>
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
                      </td>
                      <td>
                        <ClientActions
                          client={client}
                          pendingDelete={pendingDeleteId === client.id}
                          menuUp
                          onMarkContact={() => onMarkContact(client.id)}
                          onDeleteRequest={() => setPendingDeleteId(client.id)}
                          onDeleteConfirm={() => {
                            onDelete(client.id);
                            setPendingDeleteId(null);
                          }}
                          onDeleteCancel={() => setPendingDeleteId(null)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
